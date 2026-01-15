/**
 * Indeed.com Job Scraper
 * Uses Playwright for dynamic content scraping
 * Scrapes Indeed India job listings
 */

import { chromium } from 'playwright';
import {
  log,
  randomDelay,
  normalizeJobData,
  cleanText,
  isValidJob,
  getBrowserOptions,
  getContextOptions,
  retryWithBackoff,
} from './utils.js';

const SCRAPER_NAME = 'Indeed';
const BASE_URL = 'https://in.indeed.com';

/**
 * Scrape jobs from Indeed.com
 * @param {Object} options - Scraping options
 * @param {number} options.maxPages - Maximum pages to scrape (default: 3)
 * @param {string} options.keyword - Search keyword (default: 'software developer')
 * @param {string} options.location - Location filter (default: 'India')
 * @returns {Promise<Array>} Array of normalized job objects
 */
export async function scrapeIndeed(options = {}) {
  const {
    maxPages = 3,
    keyword = 'software developer',
    location = 'India',
  } = options;

  log(SCRAPER_NAME, `Starting scraper with keyword: "${keyword}", location: "${location}"`);

  let browser;
  const allJobs = [];

  try {
    // Launch browser with maximum stealth settings
    browser = await chromium.launch({
      ...getBrowserOptions(),
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-features=IsolateOrigins,site-per-process',
      ],
    });
    
    const context = await browser.newContext({
      ...getContextOptions(),
      locale: 'en-IN',
      colorScheme: 'light',
      extraHTTPHeaders: {
        'Accept-Language': 'en-IN,en-US;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
    });
    
    const page = await context.newPage();

    // Maximum anti-detection
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      window.chrome = { runtime: {} };
    });

    // Scrape multiple pages
    for (let pageNum = 0; pageNum < maxPages; pageNum++) {
      log(SCRAPER_NAME, `Scraping page ${pageNum + 1}/${maxPages}`);

      try {
        // Construct search URL with pagination
        const start = pageNum * 10;
        const searchUrl = `${BASE_URL}/jobs?q=${encodeURIComponent(keyword)}&l=${encodeURIComponent(location)}&start=${start}`;
        
        log(SCRAPER_NAME, `Navigating to: ${searchUrl}`);

        // Navigate to search results
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await randomDelay(2000, 4000);

        // Wait for job cards to load - Indeed uses various structures
        await page.waitForSelector('div[class*="job"], article, li[class*="result"]', { timeout: 15000 });

        // Extract job data from the page
        const pageJobs = await page.evaluate(() => {
          const jobs = [];
          
          // Indeed uses different selectors, try multiple patterns
          const jobCards = document.querySelectorAll('div[class*="jobsearch-SerpJobCard"], div[class*="job_seen_beacon"], article, td[id*="job"]');

          jobCards.forEach((card) => {
            try {
              // Try to find elements with multiple selector patterns
              const titleElement = card.querySelector('h2 a, a[data-jk], h2 span[title], a[class*="jcs-JobTitle"]');
              const companyElement = card.querySelector('span[data-testid="company-name"], span[class*="companyName"], div[class*="company"]');
              const locationElement = card.querySelector('div[data-testid="text-location"], div[class*="companyLocation"], span[class*="location"]');
              const salaryElement = card.querySelector('div[class*="salary-snippet"], span[class*="salary"]');
              const descElement = card.querySelector('div[class*="job-snippet"], div[class*="jobCardShelfContainer"]');
              const linkElement = card.querySelector('h2 a, a[data-jk]');

              const job = {
                title: titleElement?.textContent?.trim() || titleElement?.getAttribute('title') || '',
                company: companyElement?.textContent?.trim() || '',
                location: locationElement?.textContent?.trim() || '',
                salary: salaryElement?.textContent?.trim() || '',
                description: descElement?.textContent?.trim() || '',
                applyLink: linkElement?.href || '',
              };

              // Only add if has minimum required data
              if (job.title && job.company) {
                jobs.push(job);
              }
            } catch (err) {
              console.error('Error parsing job card:', err.message);
            }
          });

          return jobs;
        });

        log(SCRAPER_NAME, `Extracted ${pageJobs.length} jobs from page ${pageNum + 1}`);

        // Normalize and validate jobs
        for (const job of pageJobs) {
          const normalizedJob = normalizeJobData(
            {
              title: cleanText(job.title),
              company: cleanText(job.company),
              location: cleanText(job.location),
              salary: cleanText(job.salary) || 'Not disclosed',
              experience: 'Not specified', // Indeed doesn't always show experience upfront
              jobType: 'Full-time',
              applyLink: job.applyLink.startsWith('http') 
                ? job.applyLink 
                : `${BASE_URL}${job.applyLink}`,
              description: cleanText(job.description),
              postedDate: new Date().toISOString().split('T')[0],
            },
            'Indeed'
          );

          if (isValidJob(normalizedJob)) {
            allJobs.push(normalizedJob);
          }
        }

        // Add delay between pages
        if (pageNum < maxPages - 1) {
          await randomDelay(3000, 6000);
        }
      } catch (pageError) {
        log(SCRAPER_NAME, `Error scraping page ${pageNum + 1}: ${pageError.message}`, 'error');
        // Continue to next page even if one fails
        continue;
      }
    }

    await context.close();
    log(SCRAPER_NAME, `Successfully scraped ${allJobs.length} jobs`, 'success');
  } catch (error) {
    log(SCRAPER_NAME, `Fatal error: ${error.message}`, 'error');
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return allJobs;
}

/**
 * Scrape jobs with retry mechanism
 * @param {Object} options - Scraping options
 * @returns {Promise<Array>} Array of job objects
 */
export async function scrapeIndeedWithRetry(options = {}) {
  return retryWithBackoff(
    () => scrapeIndeed(options),
    3,
    `${SCRAPER_NAME} scraping`
  );
}

const indeedScraper = {
  scrapeIndeed,
  scrapeIndeedWithRetry,
};

export default indeedScraper;
