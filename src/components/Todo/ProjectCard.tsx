import React from "react";
import PackageCard from "./PackageCard";
import type { Project } from "./types";

const ProjectCard: React.FC<{
  project: Project;
  onUpdate: (p: Project) => void;
  onDelete: (p: Project) => void;
  offline: boolean;
}> = ({ project, onUpdate, onDelete, offline }) => {
  return (
    <div className="project-card">
      <div className="project-header">
        <h3 className="project-title">{project.project_name}</h3>
        <span className="project-id">ID: {project.id}</span>
        <div className="flex gap-2">
          <button
            className={`update-btn ${
              offline ? "!cursor-not-allowed !bg-gray-500" : "!cursor-pointer"
            }`}
            onClick={() => onUpdate?.(project)}
            disabled={offline}
          >
            Update
          </button>
          <button
            className={`update-btn ${
              offline
                ? "!cursor-not-allowed !bg-gray-500"
                : "!cursor-pointer !bg-red-500"
            }`}
            onClick={() => onDelete?.(project)}
            disabled={offline}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="packages-container">
        {project.packages && project.packages.length > 0 ? (
          project.packages.map((packageItem) => (
            <PackageCard key={packageItem.id} package={packageItem} />
          ))
        ) : (
          <div className="no-packages">No packages in this project</div>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
