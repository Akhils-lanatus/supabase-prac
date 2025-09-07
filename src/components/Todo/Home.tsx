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
    error,
    deleteProject,
  } = useData();
  const [showAddData, setShowAddData] = useState(false);

  const [dataToUpdate, setDataToUpdate] = useState<Project | null>(null);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

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
              <span>Loading projects...</span>
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
              />
            );
          })}
      </div>
    </div>
  );
};

export default Home;
