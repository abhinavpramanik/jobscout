import axios from 'axios';
import { NormalizedJob, ApiResponse } from './types';

const JOOBLE_API_KEY = process.env.JOOBLE_API_KEY || '';
const JOOBLE_BASE_URL = 'https://jooble.org/api';

interface JoobleJob {
  title: string;
  location: string;
  snippet: string;
  salary: string;
  company: string;
  type: string;
  link: string;
  updated: string;
}

interface JoobleResponse {
  totalCount: number;
  jobs: JoobleJob[];
}

/**
 * Normalize job type from Jooble type field
 */
function normalizeJobType(type?: string): string {
  if (!type) return 'Full-time';
  
  const jobType = type.toLowerCase();
  if (jobType.includes('full')) return 'Full-time';
  if (jobType.includes('part')) return 'Part-time';
  if (jobType.includes('contract')) return 'Contract';
  if (jobType.includes('intern')) return 'Internship';
  if (jobType.includes('temporary')) return 'Temporary';
  if (jobType.includes('freelance')) return 'Freelance';
  
  return 'Full-time';
}

/**
 * Format posted date to YYYY-MM-DD
 */
function formatPostedDate(updated: string): string {
  try {
    // Jooble returns relative dates like "2 days ago"
    // Try to parse it or use current date
    const daysMatch = updated.match(/(\d+)\s+days?\s+ago/i);
    if (daysMatch) {
      const days = parseInt(daysMatch[1]);
      const date = new Date();
      date.setDate(date.getDate() - days);
      return date.toISOString().split('T')[0];
    }
    
    const hoursMatch = updated.match(/(\d+)\s+hours?\s+ago/i);
    if (hoursMatch) {
      return new Date().toISOString().split('T')[0];
    }
    
    // Try direct date parsing
    const date = new Date(updated);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    return new Date().toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Fetch jobs from Jooble API
 * @param keywords - Search query (job title, skills, etc.)
 * @param location - Location (e.g., "New York", "London")
 * @param page - Page number (default: 1)
 */
export async function fetchJoobleJobs(
  keywords: string = 'software developer',
  location: string = 'New York',
  page: number = 1
): Promise<ApiResponse> {
  if (!JOOBLE_API_KEY) {
    console.warn('Jooble API key not configured');
    return { jobs: [], total: 0, source: 'Jooble' };
  }

  try {
    const url = `${JOOBLE_BASE_URL}/${JOOBLE_API_KEY}`;
    
    const requestBody = {
      keywords,
      location,
      page: page.toString(),
    };

    const response = await axios.post<JoobleResponse>(url, requestBody, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    if (!response.data.jobs || response.data.jobs.length === 0) {
      return { jobs: [], total: 0, source: 'Jooble' };
    }

    const normalizedJobs: NormalizedJob[] = response.data.jobs.map((job) => ({
      title: job.title,
      company: job.company || 'Company not listed',
      location: job.location || 'Location not specified',
      salary: job.salary || 'Not disclosed',
      experience: 'Not specified',
      jobType: normalizeJobType(job.type),
      source: 'Jooble',
      applyLink: job.link,
      description: job.snippet || '',
      postedDate: formatPostedDate(job.updated),
    }));

    return {
      jobs: normalizedJobs,
      total: response.data.totalCount,
      source: 'Jooble',
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Jooble API Error:', error.response?.data || error.message);
    } else {
      console.error('Jooble API Error:', error);
    }
    return { jobs: [], total: 0, source: 'Jooble' };
  }
}
