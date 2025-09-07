export type Project = {
  id: string;
  project_name: string;
  packages?: Package[];
};

export type Report = {
  id: string;
  name: string;
  description: string;
  package_id: string;
};

export type Package = {
  id: string;
  name: string;
  description: string;
  project_id: string;
  reports?: Report[];
};

export type Payload = {
  project: Project;
  packages: Package[];
  reports: Report[];
};

export type ProjectData = Project;
