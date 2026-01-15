/**
 * Scraper Utility Functions
 * Provides helper functions for web scraping operations
 */

import UserAgent from 'user-agents';

/**
 * Get a random user agent string
 * Rotates user agents to avoid detection
 */
export function getRandomUserAgent() {
  const userAgent = new UserAgent();
  return userAgent.toString();
}

/**
 * Add delay between requests to avoid rate limiting
 * @param {number} ms - Milliseconds to delay
 */
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get random delay between min and max milliseconds
 * Adds variability to scraping patterns
 * @param {number} min - Minimum delay in ms
 * @param {number} max - Maximum delay in ms
 */
export function randomDelay(min = 2000, max = 5000) {
  const delayTime = Math.floor(Math.random() * (max - min + 1)) + min;
  return delay(delayTime);
}

/**
 * Normalize job data to match our schema
 * @param {Object} job - Raw job data
 * @param {string} source - Source platform name
 * @returns {Object} Normalized job object
 */
export function normalizeJobData(job, source) {
  return {
    title: job.title?.trim() || 'Not specified',
    company: job.company?.trim() || 'Not disclosed',
    location: job.location?.trim() || 'Not specified',
    salary: job.salary?.trim() || 'Not disclosed',
    experience: job.experience?.trim() || 'Not specified',
    jobType: normalizeJobType(job.jobType),
    source: source,
    applyLink: job.applyLink?.trim() || '',
    description: job.description?.trim() || '',
    postedDate: job.postedDate?.trim() || new Date().toISOString().split('T')[0],
  };
}

/**
 * Normalize job type to match our enum
 * @param {string} jobType - Raw job type string
 * @returns {string} Normalized job type
 */
export function normalizeJobType(jobType) {
  if (!jobType) return 'Full-time';
  
  const type = jobType.toLowerCase();
  
  if (type.includes('full') || type.includes('permanent')) return 'Full-time';
  if (type.includes('part')) return 'Part-time';
  if (type.includes('contract')) return 'Contract';
  if (type.includes('intern')) return 'Internship';
  if (type.includes('temporary') || type.includes('temp')) return 'Temporary';
  if (type.includes('freelance')) return 'Freelance';
  
  return 'Other';
}

/**
 * Clean and extract text from HTML elements
 * @param {string} text - Raw text with potential whitespace/formatting
 * @returns {string} Cleaned text
 */
export function cleanText(text) {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Extract salary information and normalize format
 * @param {string} salaryText - Raw salary text
 * @returns {string} Normalized salary string
 */
export function normalizeSalary(salaryText) {
  if (!salaryText) return 'Not disclosed';
  
  const cleaned = cleanText(salaryText);
  
  if (cleaned.toLowerCase().includes('not disclosed') || 
      cleaned.toLowerCase().includes('negotiable') ||
      cleaned === '') {
    return 'Not disclosed';
  }
  
  return cleaned;
}

/**
 * Extract experience requirements
 * @param {string} expText - Raw experience text
 * @returns {string} Normalized experience string
 */
export function normalizeExperience(expText) {
  if (!expText) return 'Not specified';
  
  const cleaned = cleanText(expText);
  
  if (cleaned === '' || cleaned.toLowerCase().includes('not specified')) {
    return 'Not specified';
  }
  
  return cleaned;
}

/**
 * Validate if a job object has all required fields
 * @param {Object} job - Job object to validate
 * @returns {boolean} True if valid
 */
export function isValidJob(job) {
  return !!(
    job.title &&
    job.company &&
    job.location &&
    job.applyLink &&
    job.source
  );
}

/**
 * Log scraper activity with timestamp
 * @param {string} scraperName - Name of the scraper
 * @param {string} message - Log message
 * @param {string} level - Log level (info, warn, error)
 */
export function log(scraperName, message, level = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${scraperName.toUpperCase()}]`;
  
  switch (level) {
    case 'error':
      console.error(`${prefix} ❌ ${message}`);
      break;
    case 'warn':
      console.warn(`${prefix} ⚠️  ${message}`);
      break;
    case 'success':
      console.log(`${prefix} ✅ ${message}`);
      break;
    default:
      console.log(`${prefix} ℹ️  ${message}`);
  }
}

/**
 * Create browser launch options for Playwright
 * @returns {Object} Browser launch options
 */
export function getBrowserOptions() {
  return {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920x1080',
    ],
  };
}

/**
 * Create context options for Playwright browser context
 * @returns {Object} Context options
 */
export function getContextOptions() {
  return {
    userAgent: getRandomUserAgent(),
    viewport: { width: 1920, height: 1080 },
    locale: 'en-IN',
    timezoneId: 'Asia/Kolkata',
  };
}

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {string} operationName - Name of operation for logging
 * @returns {Promise} Result of the function
 */
export async function retryWithBackoff(fn, maxRetries = 3, operationName = 'operation') {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const backoffTime = Math.pow(2, i) * 1000; // Exponential backoff
      console.warn(`${operationName} failed, retrying in ${backoffTime}ms... (Attempt ${i + 1}/${maxRetries})`);
      await delay(backoffTime);
    }
  }
}

const utils = {
  getRandomUserAgent,
  delay,
  randomDelay,
  normalizeJobData,
  normalizeJobType,
  cleanText,
  normalizeSalary,
  normalizeExperience,
  isValidJob,
  log,
  getBrowserOptions,
  getContextOptions,
  retryWithBackoff,
};

export default utils;
