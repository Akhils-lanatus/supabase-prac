import React from "react";
import type { Report } from "./types";

const ReportCard: React.FC<{ report: Report }> = ({ report }) => {
  return (
    <div className="report-card">
      <div className="report-header">
        <h5 className="report-title">{report.name}</h5>
        <span className="report-id">ID: {report.id}</span>
      </div>

      <p className="report-description">{report.description}</p>
    </div>
  );
};

export default ReportCard;
