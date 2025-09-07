export type Project = {
  id: string;
  project_name: string;
  packages?: Package[];
  created_at?: string;
};

export type Report = {
  id: string;
  name: string;
  description: string;
  package_id: string;
  created_at?: string;
};

export type Package = {
  id: string;
  name: string;
  description: string;
  project_id: string;
  created_at?: string;

  reports?: Report[];
};

export type Payload = {
  project: Project[];
  packages: Package[];
  reports: Report[];
};

export type ProjectData = Project;
