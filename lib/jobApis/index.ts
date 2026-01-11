import { fetchAdzunaJobs } from './adzuna';
import { fetchJSearchJobs } from './jsearch';
import { fetchJoobleJobs } from './jooble';
import { ApiResponse, NormalizedJob } from './types';

export interface FetchAllJobsOptions {
  query?: string;
  location?: string;
  sources?: ('adzuna' | 'jsearch' | 'jooble')[];
}

/**
 * Map location names to Adzuna country codes
 */
function getAdzunaCountryCode(location: string): string {
  const locationLower = location.toLowerCase();
  
  if (locationLower.includes('india')) return 'in';
  if (locationLower.includes('united states') || locationLower.includes('usa') || locationLower.includes('us')) return 'us';
  if (locationLower.includes('united kingdom') || locationLower.includes('uk')) return 'gb';
  if (locationLower.includes('canada')) return 'ca';
  if (locationLower.includes('australia')) return 'au';
  if (locationLower.includes('germany')) return 'de';
  if (locationLower.includes('france')) return 'fr';
  if (locationLower.includes('netherlands')) return 'nl';
  if (locationLower.includes('singapore')) return 'sg';
  
  return 'in'; // Default to India
}

/**
 * Fetch jobs from all configured APIs
 * @param options - Search options (query, location, sources)
 * @returns Combined results from all APIs
 */
export async function fetchAllJobs(
  options: FetchAllJobsOptions = {}
): Promise<{
  jobs: NormalizedJob[];
  totalFetched: number;
  sources: { [key: string]: number };
}> {
  const {
    query = 'software developer',
    location = 'India',
    sources = ['adzuna', 'jsearch', 'jooble'],
  } = options;

  const results: ApiResponse[] = [];
  const errors: string[] = [];

  // Get country code for Adzuna
  const countryCode = getAdzunaCountryCode(location);

  // Fetch from Adzuna
  if (sources.includes('adzuna')) {
    try {
      const adzunaResult = await fetchAdzunaJobs(query, countryCode, 1, 50);
      results.push(adzunaResult);
      console.log(`Fetched ${adzunaResult.jobs.length} jobs from Adzuna`);
    } catch (error) {
      errors.push(`Adzuna: ${error}`);
      console.error('Failed to fetch from Adzuna:', error);
    }
  }

  // Fetch from JSearch
  if (sources.includes('jsearch')) {
    try {
      const jsearchResult = await fetchJSearchJobs(query, location, 1, 10);
      results.push(jsearchResult);
      console.log(`Fetched ${jsearchResult.jobs.length} jobs from JSearch`);
    } catch (error) {
      errors.push(`JSearch: ${error}`);
      console.error('Failed to fetch from JSearch:', error);
    }
  }

  // Fetch from Jooble
  if (sources.includes('jooble')) {
    try {
      const joobleResult = await fetchJoobleJobs(query, location, 1);
      results.push(joobleResult);
      console.log(`Fetched ${joobleResult.jobs.length} jobs from Jooble`);
    } catch (error) {
      errors.push(`Jooble: ${error}`);
      console.error('Failed to fetch from Jooble:', error);
    }
  }

  // Combine all jobs
  const allJobs = results.flatMap((result) => result.jobs);

  // Count jobs per source
  const sourceCounts: { [key: string]: number } = {};
  results.forEach((result) => {
    sourceCounts[result.source] = result.jobs.length;
  });

  return {
    jobs: allJobs,
    totalFetched: allJobs.length,
    sources: sourceCounts,
  };
}

export { fetchAdzunaJobs, fetchJSearchJobs, fetchJoobleJobs };
export type { NormalizedJob, ApiResponse };
