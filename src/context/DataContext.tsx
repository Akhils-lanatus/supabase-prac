/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */

import { createContext, useCallback, useContext, useState } from "react";
import supabase from "../utils/supabase";
import type { Payload, Project, ProjectData } from "../components/Todo";

type DataContext = {
  error: string;
  loading: boolean;
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
  const [data, setData] = useState<ProjectData[]>([]);
  const clearError = () => setError("");

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data: dbData, error } = await supabase.from("project").select(`
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
      `);
      if (error) throw error;
      setData(dbData || []);
    } catch (error: any) {
      setError("Error while fetching data: " + (error?.message ?? error ?? ""));
      return undefined;
    } finally {
      setLoading(false);
    }
  }, []);

  const addData = async (payload: Payload) => {
    const hasPackages = payload.packages.length > 0;
    const hasReports = payload.reports.length > 0;

    setLoading(true);

    try {
      const { error } = await supabase.from("project").insert(payload.project);
      if (error)
        throw new Error(
          "Error inserting project: " + (error?.message ?? error)
        );

      if (hasPackages) {
        for (const pkg of payload.packages) {
          const { error: packageError } = await supabase
            .from("packages")
            .insert(pkg);
          if (packageError)
            throw new Error(
              "Error inserting package: " +
                (packageError?.message ?? packageError)
            );
        }
      }

      if (hasReports) {
        for (const report of payload.reports) {
          const { error: reportError } = await supabase
            .from("reports")
            .insert(report);
          if (reportError)
            throw new Error(
              "Error inserting report: " + (reportError?.message ?? reportError)
            );
        }
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
      fetchAllData();
    }
  };

  const updateData = async (payload: Payload, oldData: Project) => {
    const hasNewPackages =
      payload.packages.length > 0 &&
      oldData.packages &&
      oldData.packages.length > 0 &&
      payload.packages.length > oldData.packages.length;

    const payloadReportsLength = payload.reports.length;
    const flatOldReports = (oldData.packages ?? []).flatMap(
      (pkg) => pkg.reports ?? []
    ).length;

    console.log({ payloadReportsLength, flatOldReports, hasNewPackages });

    const { error } = await supabase
      .from("project")
      .update(payload.project)
      .eq("id", payload.project.id);
    if (error) {
      setError("Error inserting project: " + (error?.message ?? error ?? ""));
      return;
    }
  };

  const deleteProject = async (projectId: Project["id"]) => {
    setLoading(true);
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
      fetchAllData();
    }
  };

  return (
    <DataContext.Provider
      value={{
        error,
        loading,
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
