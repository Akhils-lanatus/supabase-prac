import React from "react";
import ReportCard from "./ReportCard";
import type { Package } from "./types";

const PackageCard: React.FC<{
  package: Package;
}> = ({ package: packageItem }) => {
  return (
    <div className="package-card">
      <div className="package-header">
        <h4 className="package-title">{packageItem.name}</h4>
        <span className="package-id">ID: {packageItem.id}</span>
      </div>

      <p className="package-description">{packageItem.description}</p>

      <div className="reports-container">
        <h5 className="reports-title">Reports:</h5>
        {packageItem.reports && packageItem.reports.length ? (
          packageItem.reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))
        ) : (
          <div className="no-reports">No reports in this package</div>
        )}
      </div>
    </div>
  );
};

export default PackageCard;
