export interface NormalizedJob {
  title: string;
  company: string;
  location: string;
  salary: string;
  experience: string;
  jobType: string;
  source: string;
  applyLink: string;
  description: string;
  postedDate: string;
}

export interface ApiResponse {
  jobs: NormalizedJob[];
  total: number;
  source: string;
}
