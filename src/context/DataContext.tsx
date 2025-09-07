/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import supabase from "../utils/supabase";
import type {
  Package,
  Payload,
  Project,
  ProjectData,
  Report,
} from "../components/Todo";
import { clearAllStores, getElement } from "../utils/indexedDB";

type DataContext = {
  error: string;
  loading: boolean;
  loadingMessage: string;
  clearError: () => void;
  fetchAllData: () => void;
  addData: (payload: Payload) => Promise<void>;
  data: ProjectData[];
  updateData: (payload: Payload, oldData: Project) => Promise<void>;
  deleteProject: (projectId: Project["id"]) => void;
};

const DataContext = createContext<DataContext>({
  error: "",
  loading: false,
  loadingMessage: "",
  clearError: () => {},
  fetchAllData: async () => {},
  data: [],
  addData: async () => {},
  updateData: async () => {},
  deleteProject: async () => {},
});

export const useData = () => useContext<DataContext>(DataContext);

const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [data, setData] = useState<ProjectData[]>([]);
  const clearError = () => setError("");

  useEffect(() => {
    const handleOnlineSync = async () => {
      setLoading(true);
      setLoadingMessage("Syncing offline data...");

      const project: Project[] = await getElement("project", "all");
      const packages: Package[] = await getElement("packages", "all");
      const reports: Report[] = await getElement("reports", "all");

      if (
        project.length === 0 &&
        packages.length === 0 &&
        reports.length === 0
      ) {
        setLoading(false);
        setLoadingMessage("");
        return;
      }

      try {
        await addData({ project, packages, reports });
        await clearAllStores();
        setLoadingMessage("Offline data synced successfully!");
      } catch (error: any) {
        setError("Error while syncing data: " + error.message);
      } finally {
        setLoading(false);
        setLoadingMessage("");
      }
    };
    window.addEventListener("online", handleOnlineSync);

    return () => {
      window.removeEventListener("online", handleOnlineSync);
    };
  }, []);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setLoadingMessage("Loading projects...");
    setError("");
    try {
      const { data: dbData, error } = await supabase
        .from("project")
        .select(
          `
        id,
        project_name,
        packages(
          id,
          name,
          description,
          project_id,
          reports(
            id,
            name,
            description,
            package_id
          )
        )
      `
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      setData(dbData || []);
    } catch (error: any) {
      setError("Error while fetching data: " + (error?.message ?? error ?? ""));
      return undefined;
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  }, []);

  const addData = async (payload: Payload) => {
    const hasProjects = payload.project.length > 0;
    const hasPackages = payload.packages.length > 0;
    const hasReports = payload.reports.length > 0;

    setLoading(true);
    setLoadingMessage("Saving data...");

    try {
      if (hasProjects) {
        setLoadingMessage("Saving project...");
        const { error } = await supabase
          .from("project")
          .insert(payload.project);
        if (error) {
          throw new Error("Error inserting project: " + error.message);
        }
      }

      if (hasPackages) {
        setLoadingMessage("Saving packages...");
        const { error: packageError } = await supabase
          .from("packages")
          .insert(payload.packages);
        if (packageError) {
          throw new Error("Error inserting packages: " + packageError.message);
        }
      }

      if (hasReports) {
        setLoadingMessage("Saving reports...");
        const { error: reportError } = await supabase
          .from("reports")
          .insert(payload.reports);
        if (reportError) {
          throw new Error("Error inserting reports: " + reportError.message);
        }
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
      setLoadingMessage("");
      fetchAllData();
    }
  };

  const updateData = async (payload: Payload, oldData: Project) => {
    const alreadyAvailablePackages = new Set(
      oldData.packages?.map((pkg) => pkg.id)
    );
    const alreadyAvailableReports = new Set(
      oldData.packages?.flatMap((pkg) => pkg.reports?.map((rep) => rep.id))
    );

    const newPackages = payload.packages.filter(
      (pkg) => !alreadyAvailablePackages.has(pkg.id)
    );
    const newReports = payload.reports.filter(
      (report) => !alreadyAvailableReports.has(report.id)
    );

    if (newPackages.length === 0 && newReports.length === 0) return;

    setLoading(true);
    setLoadingMessage("Updating data...");

    try {
      if (newPackages.length > 0) {
        setLoadingMessage("Adding new packages...");
        for (const pkg of newPackages) {
          delete pkg.reports;
        }

        const { error: packageError } = await supabase
          .from("packages")
          .insert(newPackages);
        if (packageError) {
          throw new Error("Error inserting packages: " + packageError.message);
        }
      }

      if (newReports.length > 0) {
        setLoadingMessage("Adding new reports...");
        const { error: reportError } = await supabase
          .from("reports")
          .insert(newReports);
        if (reportError) {
          throw new Error("Error inserting reports: " + reportError.message);
        }
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
      setLoadingMessage("");
      fetchAllData();
    }
  };

  const deleteProject = async (projectId: Project["id"]) => {
    setLoading(true);
    setLoadingMessage("Deleting project...");
    try {
      const { error } = await supabase
        .from("project")
        .delete()
        .eq("id", projectId);
      if (error) throw error;
    } catch (error: any) {
      setError(error?.message ?? "");
    } finally {
      setLoading(false);
      setLoadingMessage("");
      fetchAllData();
    }
  };

  return (
    <DataContext.Provider
      value={{
        error,
        loading,
        loadingMessage,
        clearError,
        fetchAllData,
        data,
        addData,
        updateData,
        deleteProject,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;
