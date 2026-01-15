/**
 * TimesJobs Scraper
 * Popular job portal in India by Times Group
 * Uses Playwright for dynamic content scraping
 */

import { chromium } from 'playwright';
import {
  log,
  normalizeJobData,
  cleanText,
  isValidJob,
  getBrowserOptions,
  getContextOptions,
  retryWithBackoff,
} from './utils.js';

const SCRAPER_NAME = 'TimesJobs';
const BASE_URL = 'https://www.timesjobs.com';

/**
 * Scrape jobs from TimesJobs
 * @param {Object} options - Scraping options
 * @param {number} options.maxPages - Maximum pages to scrape (default: 2)
 * @param {string} options.keyword - Search keyword (default: 'software developer')
 * @param {string} options.location - Location filter (default: 'India')
 * @returns {Promise<Array>} Array of normalized job objects
 */
export async function scrapeTimesJobs(options = {}) {
  const {
    maxPages = 2,
    keyword = 'software developer',
    location = 'India',
  } = options;

  log(SCRAPER_NAME, `Starting scraper with keyword: "${keyword}", location: "${location}"`);

  let browser;
  const allJobs = [];

  try {
    // Launch browser with maximum stealth
    browser = await chromium.launch({
      ...getBrowserOptions(),
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
      ],
    });
    
    const context = await browser.newContext({
      ...getContextOptions(),
      locale: 'en-IN',
      extraHTTPHeaders: {
        'Accept-Language': 'en-IN,en-US;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
    });
    
    const page = await context.newPage();

    // Anti-detection
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      window.chrome = { runtime: {} };
    });

    // Scrape multiple pages
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      log(SCRAPER_NAME, `Scraping page ${pageNum}/${maxPages}`);

      try {
        // Construct search URL
        const sequence = (pageNum - 1) * 20; // TimesJobs uses sequence parameter
        const searchUrl = `${BASE_URL}/candidate/job-search.html?searchType=personalizedSearch&from=submit&txtKeywords=${encodeURIComponent(keyword)}&txtLocation=${encodeURIComponent(location)}&sequence=${sequence}`;
        
        log(SCRAPER_NAME, `Navigating to: ${searchUrl}`);

        // Navigate with load strategy (networkidle might be too slow)
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await page.waitForTimeout(6000);

        // Scroll to trigger lazy loading
        await page.evaluate(() => window.scrollBy(0, 1000));
        await page.waitForTimeout(3000);

        // Extract job data
        const pageJobs = await page.evaluate(() => {
          const jobs = [];
          
          // TimesJobs uses list items for job cards
          const jobCards = document.querySelectorAll('li[class*="clearfix job-bx"], .job-bx, [class*="srp-job"]');

          jobCards.forEach((card) => {
            try {
              const titleElement = card.querySelector('h2 a, .heading, [class*="job-title"]');
              const companyElement = card.querySelector('h3.joblist-comp-name, .company-name, [class*="comp-name"]');
              const locationElement = card.querySelector('.location, [class*="loc"]');
              const salaryElement = card.querySelector('.salary, [class*="sal"]');
              const experienceElement = card.querySelector('.experience li, [class*="exp"]');
              const descElement = card.querySelector('.job-description, .list-job-dtl, .desc');
              const linkElement = titleElement;

              const title = titleElement?.textContent?.trim() || titleElement?.getAttribute('title') || '';
              const company = companyElement?.textContent?.trim() || '';
              const location = locationElement?.textContent?.trim() || '';
              
              if (title && company) {
                jobs.push({
                  title,
                  company,
                  location: location || 'India',
                  salary: salaryElement?.textContent?.trim() || 'Not disclosed',
                  experience: experienceElement?.textContent?.trim() || '',
                  description: descElement?.textContent?.trim()?.substring(0, 200) || '',
                  applyLink: linkElement?.href || '',
                });
              }
            } catch (err) {
              console.error('Error parsing job card:', err.message);
            }
          });

          return jobs;
        });

        log(SCRAPER_NAME, `Extracted ${pageJobs.length} jobs from page ${pageNum}`);

        // Normalize and validate jobs
        for (const job of pageJobs) {
          const normalizedJob = normalizeJobData(
            {
              title: cleanText(job.title),
              company: cleanText(job.company),
              location: cleanText(job.location),
              salary: cleanText(job.salary),
              experience: cleanText(job.experience),
              jobType: 'Full-time',
              applyLink: job.applyLink.startsWith('http') 
                ? job.applyLink 
                : `${BASE_URL}${job.applyLink}`,
              description: cleanText(job.description),
              postedDate: new Date().toISOString().split('T')[0],
            },
            'TimesJobs'
          );

          if (isValidJob(normalizedJob)) {
            allJobs.push(normalizedJob);
          }
        }

        // Delay between pages
        if (pageNum < maxPages) {
          await page.waitForTimeout(4000);
        }
      } catch (pageError) {
        log(SCRAPER_NAME, `Error scraping page ${pageNum}: ${pageError.message}`, 'error');
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
export async function scrapeTimesJobsWithRetry(options = {}) {
  return retryWithBackoff(
    () => scrapeTimesJobs(options),
    3,
    `${SCRAPER_NAME} scraping`
  );
}

const timesJobsScraper = {
  scrapeTimesJobs,
  scrapeTimesJobsWithRetry,
};

export default timesJobsScraper;
