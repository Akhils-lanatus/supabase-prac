/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import type { Project, Package, Report, Payload } from "./types";
import { useData } from "../../context/DataContext";
import { addElement } from "../../utils/indexedDB";

const AddData = ({
  dataToUpdate,
  setDataToUpdate,
  setShowAddData,
}: {
  dataToUpdate: Project | null;
  setDataToUpdate: React.Dispatch<React.SetStateAction<Project | null>>;
  setShowAddData: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [projectName, setProjectName] = useState("");
  const [project, setProject] = useState<Project[] | null>(null);

  const [packageForm, setPackageForm] = useState({ name: "", description: "" });
  const [packages, setPackages] = useState<Package[]>([]);

  const [reportForm, setReportForm] = useState({
    name: "",
    description: "",
    packageId: "",
  });
  const [reports, setReports] = useState<Report[]>([]);

  const { addData, updateData } = useData();

  const generateUUID = () => crypto.randomUUID();

  useEffect(() => {
    if (!dataToUpdate) return;
    const packagesData = dataToUpdate.packages ?? [];
    const reportsData = packagesData.flatMap((pkg) => pkg.reports ?? []);

    setProject([dataToUpdate]);
    setProjectName(dataToUpdate.project_name);
    setPackages(packagesData);
    setReports(reportsData);
  }, [dataToUpdate]);

  const handleAddProject = () => {
    if (!projectName.trim()) return;

    const newProject: Project = {
      id: generateUUID(),
      project_name: projectName,
      created_at: new Date().toISOString(),
    };

    setProject([newProject]);
    setProjectName("");
  };

  const handleAddPackage = () => {
    const { name, description } = packageForm;
    if (!name.trim() || !description.trim() || !project) return;

    const newPackage: Package = {
      id: generateUUID(),
      name,
      description,
      project_id: project[0].id,
      created_at: new Date().toISOString(),
    };

    setPackages([...packages, newPackage]);
    setPackageForm({ name: "", description: "" });
  };

  const handleAddReport = () => {
    const { name, description, packageId } = reportForm;
    if (!name.trim() || !description.trim() || !packageId) return;

    const newReport: Report = {
      id: generateUUID(),
      name,
      description,
      package_id: packageId,
      created_at: new Date().toISOString(),
    };

    setReports([...reports, newReport]);
    setReportForm({ name: "", description: "", packageId: "" });
  };

  const handleFinalSubmit = async () => {
    if (!project) return;

    const payload: Payload = {
      project,
      packages,
      reports,
    };

    const isOnline = navigator.onLine;

    if (isOnline) {
      if (dataToUpdate) await updateData(payload, dataToUpdate);
      else await addData(payload);
    } else {
      await addElement("project", project);
      if (packages.length) await addElement("packages", packages);
      if (reports.length) await addElement("reports", reports);
    }

    setProject(null);
    setPackages([]);
    setReports([]);
    setProjectName("");
    setPackageForm({ name: "", description: "" });
    setReportForm({ name: "", description: "", packageId: "" });
    setDataToUpdate(null);
    setShowAddData(false);
  };

  const handlePackageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPackageForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleReportChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setReportForm((prev) => ({ ...prev, [name]: value }));
  };

  const DataTable = <T extends Record<string, any>>({
    columns,
    data,
  }: {
    columns: string[];
    data: T[];
  }) => (
    <div className="data-table">
      <table>
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, rowIdx) => (
            <tr key={rowIdx}>
              {columns.map((col, colIdx) => {
                const key = col.toLowerCase().replace(/\s+/g, "_");
                return <td key={colIdx}>{item[key]}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="add-data-container">
      <h2>{dataToUpdate ? "Update" : "Add"} Data</h2>

      {/* === Project Section === */}
      <div className="form-section">
        <h3>Add Project</h3>
        <div className="form-row">
          <div className="input-group">
            <label htmlFor="project-name">Project Name:</label>
            <input
              id="project-name"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter Project Name"
            />
          </div>
          <button
            className={`submit-btn ${
              project ? "!cursor-not-allowed !bg-gray-500" : "!cursor-pointer"
            }`}
            onClick={handleAddProject}
            disabled={!projectName.trim() || project !== null}
          >
            {project ? "Project Added" : "Add Project"}
          </button>
        </div>

        {project && (
          <DataTable columns={["ID", "Project Name"]} data={project} />
        )}
      </div>

      {/* === Package Section === */}
      <div className="form-section">
        <h3>Add Package Data</h3>
        <div className="form-row">
          <div className="input-group">
            <label htmlFor="package-name">Package Name:</label>
            <input
              id="package-name"
              type="text"
              name="name"
              value={packageForm.name}
              onChange={handlePackageChange}
              placeholder="Enter Package Name"
            />
          </div>
          <div className="input-group">
            <label htmlFor="package-description">Package Description:</label>
            <input
              id="package-description"
              type="text"
              name="description"
              value={packageForm.description}
              onChange={handlePackageChange}
              placeholder="Enter Package Description"
            />
          </div>
          <button
            className={`submit-btn ${
              !packageForm.name.trim() ||
              !packageForm.description.trim() ||
              !project
                ? "!cursor-not-allowed"
                : "!cursor-pointer"
            }`}
            onClick={handleAddPackage}
            disabled={
              !packageForm.name.trim() ||
              !packageForm.description.trim() ||
              !project
            }
          >
            Add Package
          </button>
        </div>

        {packages.length > 0 && (
          <DataTable columns={["ID", "Name", "Description"]} data={packages} />
        )}
      </div>

      {/* === Report Section === */}
      <div className="form-section">
        <h3>Add Report Data</h3>
        <div className="form-row">
          <div className="input-group">
            <label htmlFor="report-name">Report Name:</label>
            <input
              id="report-name"
              type="text"
              name="name"
              value={reportForm.name}
              onChange={handleReportChange}
              placeholder="Enter Report Name"
            />
          </div>
          <div className="input-group">
            <label htmlFor="report-description">Report Description:</label>
            <input
              id="report-description"
              type="text"
              name="description"
              value={reportForm.description}
              onChange={handleReportChange}
              placeholder="Enter Report Description"
            />
          </div>
          <div className="input-group">
            <label htmlFor="package-select">Select Package:</label>
            <select
              id="package-select"
              name="packageId"
              value={reportForm.packageId}
              onChange={handleReportChange}
              disabled={packages.length === 0}
            >
              <option value="">
                {packages.length === 0
                  ? "Add a package first"
                  : "Select a package"}
              </option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} - {pkg.id}
                </option>
              ))}
            </select>
          </div>
          <button
            className={`submit-btn ${
              !reportForm.name.trim() ||
              !reportForm.description.trim() ||
              !reportForm.packageId
                ? "!cursor-not-allowed"
                : "!cursor-pointer"
            }`}
            onClick={handleAddReport}
            disabled={
              !reportForm.name.trim() ||
              !reportForm.description.trim() ||
              !reportForm.packageId
            }
          >
            Add Report
          </button>
        </div>

        {reports.length > 0 && (
          <DataTable
            columns={["ID", "Name", "Description", "Package ID"]}
            data={reports}
          />
        )}
      </div>

      {/* === Final Submit === */}
      <div className="form-section final-submit">
        <h3>Submit All Data</h3>
        <div className="submit-summary">
          <p>
            Project: {project ? "✓ Added" : "✗ Not Added"} | Packages:{" "}
            {packages.length} | Reports: {reports.length}
          </p>
          <button
            className="final-submit-btn"
            onClick={handleFinalSubmit}
            disabled={!project}
          >
            Submit All Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddData;
