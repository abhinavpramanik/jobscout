import axios from 'axios';
import { NormalizedJob, ApiResponse } from './types';

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID || '';
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY || '';
const ADZUNA_BASE_URL = 'https://api.adzuna.com/v1/api/jobs';

interface AdzunaJob {
  id: string;
  title: string;
  company: {
    display_name: string;
  };
  location: {
    display_name: string;
    area: string[];
  };
  salary_min?: number;
  salary_max?: number;
  contract_time?: string;
  description: string;
  redirect_url: string;
  created: string;
}

interface AdzunaResponse {
  results: AdzunaJob[];
  count: number;
}

/**
 * Normalize job type from Adzuna contract_time
 */
function normalizeJobType(contractTime?: string): string {
  if (!contractTime) return 'Full-time';
  
  const type = contractTime.toLowerCase();
  if (type.includes('full')) return 'Full-time';
  if (type.includes('part')) return 'Part-time';
  if (type.includes('contract')) return 'Contract';
  if (type.includes('temporary')) return 'Temporary';
  if (type.includes('intern')) return 'Internship';
  
  return 'Full-time';
}

/**
 * Format salary from Adzuna data
 */
function formatSalary(salaryMin?: number, salaryMax?: number): string {
  if (!salaryMin && !salaryMax) return 'Not disclosed';
  
  if (salaryMin && salaryMax) {
    return `$${salaryMin.toLocaleString()} - $${salaryMax.toLocaleString()}`;
  }
  
  if (salaryMin) {
    return `From $${salaryMin.toLocaleString()}`;
  }
  
  if (salaryMax) {
    return `Up to $${salaryMax.toLocaleString()}`;
  }
  
  return 'Not disclosed';
}

/**
 * Format posted date to YYYY-MM-DD
 */
function formatPostedDate(created: string): string {
  try {
    const date = new Date(created);
    return date.toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Fetch jobs from Adzuna API
 * @param query - Search query (job title, skills, etc.)
 * @param location - Location (e.g., "us", "gb", "in")
 * @param page - Page number (default: 1)
 * @param resultsPerPage - Results per page (default: 50, max: 50)
 */
export async function fetchAdzunaJobs(
  query: string = 'software developer',
  location: string = 'us',
  page: number = 1,
  resultsPerPage: number = 50
): Promise<ApiResponse> {
  if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
    console.warn('Adzuna API credentials not configured');
    return { jobs: [], total: 0, source: 'Adzuna' };
  }

  try {
    const url = `${ADZUNA_BASE_URL}/${location}/search/${page}`;
    
    const response = await axios.get<AdzunaResponse>(url, {
      params: {
        app_id: ADZUNA_APP_ID,
        app_key: ADZUNA_APP_KEY,
        results_per_page: resultsPerPage,
        what: query,
      },
      timeout: 10000,
    });

    const normalizedJobs: NormalizedJob[] = response.data.results.map((job) => ({
      title: job.title,
      company: job.company.display_name || 'Company not listed',
      location: job.location.display_name || job.location.area?.[0] || 'Location not specified',
      salary: formatSalary(job.salary_min, job.salary_max),
      experience: 'Not specified',
      jobType: normalizeJobType(job.contract_time),
      source: 'Adzuna',
      applyLink: job.redirect_url,
      description: job.description || '',
      postedDate: formatPostedDate(job.created),
    }));

    return {
      jobs: normalizedJobs,
      total: response.data.count,
      source: 'Adzuna',
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Adzuna API Error:', error.response?.data || error.message);
    } else {
      console.error('Adzuna API Error:', error);
    }
    return { jobs: [], total: 0, source: 'Adzuna' };
  }
}
