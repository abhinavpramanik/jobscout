import axios from 'axios';
import { NormalizedJob, ApiResponse } from './types';

const RAPID_API_KEY = process.env.RAPID_API_KEY || '';
const JSEARCH_BASE_URL = 'https://jsearch.p.rapidapi.com/search';

interface JSearchJob {
  job_id: string;
  job_title: string;
  employer_name: string;
  job_city?: string;
  job_state?: string;
  job_country?: string;
  job_employment_type?: string;
  job_min_salary?: number;
  job_max_salary?: number;
  job_salary_currency?: string;
  job_required_experience?: {
    required_experience_in_months?: number;
  };
  job_description: string;
  job_apply_link: string;
  job_posted_at_datetime_utc: string;
}

interface JSearchResponse {
  status: string;
  data: JSearchJob[];
  request_id: string;
}

/**
 * Normalize job type from JSearch employment type
 */
function normalizeJobType(employmentType?: string): string {
  if (!employmentType) return 'Full-time';
  
  const type = employmentType.toLowerCase();
  if (type.includes('fulltime') || type.includes('full_time')) return 'Full-time';
  if (type.includes('parttime') || type.includes('part_time')) return 'Part-time';
  if (type.includes('contract')) return 'Contract';
  if (type.includes('intern')) return 'Internship';
  if (type.includes('temporary')) return 'Temporary';
  if (type.includes('freelance')) return 'Freelance';
  
  return 'Full-time';
}

/**
 * Format location from JSearch data
 */
function formatLocation(city?: string, state?: string, country?: string): string {
  const parts = [city, state, country].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Location not specified';
}

/**
 * Format salary from JSearch data
 */
function formatSalary(
  salaryMin?: number,
  salaryMax?: number,
  currency: string = 'USD'
): string {
  if (!salaryMin && !salaryMax) return 'Not disclosed';
  
  const symbol = currency === 'USD' ? '$' : currency;
  
  if (salaryMin && salaryMax) {
    return `${symbol}${salaryMin.toLocaleString()} - ${symbol}${salaryMax.toLocaleString()}`;
  }
  
  if (salaryMin) {
    return `From ${symbol}${salaryMin.toLocaleString()}`;
  }
  
  if (salaryMax) {
    return `Up to ${symbol}${salaryMax.toLocaleString()}`;
  }
  
  return 'Not disclosed';
}

/**
 * Format experience from required months
 */
function formatExperience(months?: number): string {
  if (!months || months === 0) return 'Not specified';
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (years === 0) return `${remainingMonths} months`;
  if (remainingMonths === 0) return `${years} ${years === 1 ? 'year' : 'years'}`;
  
  return `${years}-${years + 1} years`;
}

/**
 * Format posted date to YYYY-MM-DD
 */
function formatPostedDate(datetime: string): string {
  try {
    const date = new Date(datetime);
    return date.toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Fetch jobs from JSearch API (via RapidAPI)
 * @param query - Search query (job title, skills, etc.)
 * @param location - Location (e.g., "United States", "India")
 * @param page - Page number (default: 1)
 * @param numPages - Number of pages (default: 1, max: 20)
 */
export async function fetchJSearchJobs(
  query: string = 'software developer',
  location: string = 'United States',
  page: number = 1,
  numPages: number = 1
): Promise<ApiResponse> {
  if (!RAPID_API_KEY) {
    console.warn('RapidAPI key not configured');
    return { jobs: [], total: 0, source: 'JSearch' };
  }

  try {
    const response = await axios.get<JSearchResponse>(JSEARCH_BASE_URL, {
      params: {
        query: `${query} in ${location}`,
        page: page.toString(),
        num_pages: numPages.toString(),
      },
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
      },
      timeout: 15000,
    });

    if (response.data.status !== 'OK' || !response.data.data) {
      console.warn('JSearch API returned non-OK status');
      return { jobs: [], total: 0, source: 'JSearch' };
    }

    const normalizedJobs: NormalizedJob[] = response.data.data.map((job) => ({
      title: job.job_title,
      company: job.employer_name || 'Company not listed',
      location: formatLocation(job.job_city, job.job_state, job.job_country),
      salary: formatSalary(
        job.job_min_salary,
        job.job_max_salary,
        job.job_salary_currency
      ),
      experience: formatExperience(
        job.job_required_experience?.required_experience_in_months
      ),
      jobType: normalizeJobType(job.job_employment_type),
      source: 'JSearch',
      applyLink: job.job_apply_link,
      description: job.job_description || '',
      postedDate: formatPostedDate(job.job_posted_at_datetime_utc),
    }));

    return {
      jobs: normalizedJobs,
      total: normalizedJobs.length,
      source: 'JSearch',
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('JSearch API Error:', error.response?.data || error.message);
    } else {
      console.error('JSearch API Error:', error);
    }
    return { jobs: [], total: 0, source: 'JSearch' };
  }
}
