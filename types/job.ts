export interface Job {
  _id: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface JobsResponse {
  success: boolean;
  data: Job[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface JobResponse {
  success: boolean;
  data: Job;
}
