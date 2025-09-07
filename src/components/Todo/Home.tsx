import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import AddData from "./AddData";
import ProjectCard from "./ProjectCard";
import type { Project } from "./types";

const Home = () => {
  const { handleSignOut, user } = useAuth();
  const {
    fetchAllData,
    data: projects,
    loading,
    loadingMessage,
    error,
    deleteProject,
  } = useData();
  const [showAddData, setShowAddData] = useState(false);
  const [offline, setOffline] = useState<boolean>(!navigator.onLine);

  const [dataToUpdate, setDataToUpdate] = useState<Project | null>(null);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleUpdateProject = (project: Project) => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    setShowAddData(true);
    setDataToUpdate(project);
  };

  const handleDeleteProject = (project: Project) => {
    if (
      window.confirm(
        `Confirm Delete "${project.project_name}"? It will also delete all related packages and reports`
      )
    )
      deleteProject(project.id);
  };

  return (
    <div className="todo-home">
      <div className="header">
        <div>
          <h1>Coolie Power House</h1>
          <h2>{user?.email}</h2>
          {offline && (
            <div style={{ textAlign: "center", marginTop: 8 }}>
              <span className="error-text" style={{ color: "#0369a1" }}>
                You are offline. If you add data it will be stored locally and
                auto-synced once online.
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => {
            if (dataToUpdate) setDataToUpdate(null);
            setShowAddData(!showAddData);
          }}
          className="logout-btn mb-2 !bg-blue-500"
        >
          {showAddData ? "Hide Add Data" : "Show Add Data"}
        </button>
        <button onClick={handleSignOut} className="logout-btn">
          Logout
        </button>
      </div>

      {showAddData && (
        <>
          <AddData
            dataToUpdate={dataToUpdate}
            setDataToUpdate={setDataToUpdate}
            setShowAddData={setShowAddData}
          />
        </>
      )}

      <div className="projects-container">
        <h2>Projects</h2>

        {loading && (
          <div className="loading-container">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <span>{loadingMessage || "Loading..."}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message-container">
            <div className="error-message-content">
              <span className="error-icon">⚠️</span>
              <span className="error-text">{error}</span>
            </div>
          </div>
        )}

        {!loading && !error && !projects.length && (
          <div className="no-data">
            <p>No projects found. Add some projects to get started!</p>
          </div>
        )}

        {!loading &&
          !error &&
          projects.length > 0 &&
          projects.map((project) => {
            return (
              <ProjectCard
                key={project.id}
                project={project}
                onUpdate={handleUpdateProject}
                onDelete={handleDeleteProject}
                offline={offline}
              />
            );
          })}
      </div>
    </div>
  );
};

export default Home;
