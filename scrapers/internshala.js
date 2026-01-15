/**
 * Internshala Job Scraper
 * Uses Playwright for dynamic content scraping
 * Popular for internships and entry-level jobs in India
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

const SCRAPER_NAME = 'Internshala';
const BASE_URL = 'https://internshala.com';

/**
 * Scrape jobs from Internshala
 * @param {Object} options - Scraping options
 * @param {number} options.maxPages - Maximum pages to scrape (default: 2)
 * @param {string} options.keyword - Search keyword (default: 'software developer')
 * @param {string} options.location - Location filter (default: 'India')
 * @returns {Promise<Array>} Array of normalized job objects
 */
export async function scrapeInternshala(options = {}) {
  const {
    maxPages = 2,
    keyword = 'software developer',
    location = 'India',
  } = options;

  log(SCRAPER_NAME, `Starting scraper with keyword: "${keyword}", location: "${location}"`);

  let browser;
  const allJobs = [];

  try {
    // Launch browser with stealth settings
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
        const cleanKeyword = keyword.toLowerCase().replace(/\s+/g, '-');
        const searchUrl = `${BASE_URL}/jobs/${cleanKeyword}-jobs/page-${pageNum}`;
        
        log(SCRAPER_NAME, `Navigating to: ${searchUrl}`);

        // Navigate
        await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 45000 });
        await page.waitForTimeout(4000);

        // Scroll to load more content
        await page.evaluate(() => window.scrollBy(0, 800));
        await page.waitForTimeout(2000);

        // Extract job data
        const pageJobs = await page.evaluate(() => {
          const jobs = [];
          
          // Internshala uses specific class for job containers
          const jobCards = document.querySelectorAll('.individual_internship, .internship_meta, [id*="internship_"]');

          jobCards.forEach((card) => {
            try {
              const titleElement = card.querySelector('.job-internship-name, .profile, h3 a, .heading_4_5');
              const companyElement = card.querySelector('.company-name, .company_name, .link_display_like_text');
              const locationElement = card.querySelector('.location_link, [id*="location"]');
              const salaryElement = card.querySelector('.stipend, [class*="stipend"]');
              const durationElement = card.querySelector('.duration_container, [class*="duration"]');
              const descElement = card.querySelector('.internship_other_details_container, .job_description');
              const linkElement = card.querySelector('a[href*="/internship/"], a[href*="/job/"]');

              const title = titleElement?.textContent?.trim() || '';
              const company = companyElement?.textContent?.trim() || '';
              const location = locationElement?.textContent?.trim() || '';
              
              if (title && company) {
                jobs.push({
                  title,
                  company,
                  location: location || 'Remote',
                  salary: salaryElement?.textContent?.trim() || 'Not disclosed',
                  experience: durationElement?.textContent?.trim() || 'Fresher',
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
              jobType: job.title.toLowerCase().includes('internship') ? 'Internship' : 'Full-time',
              applyLink: job.applyLink.startsWith('http') 
                ? job.applyLink 
                : `${BASE_URL}${job.applyLink}`,
              description: cleanText(job.description),
              postedDate: new Date().toISOString().split('T')[0],
            },
            'Internshala'
          );

          if (isValidJob(normalizedJob)) {
            allJobs.push(normalizedJob);
          }
        }

        // Small delay between pages
        if (pageNum < maxPages) {
          await page.waitForTimeout(3000);
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
export async function scrapeInternshalaWithRetry(options = {}) {
  return retryWithBackoff(
    () => scrapeInternshala(options),
    3,
    `${SCRAPER_NAME} scraping`
  );
}

const internalhalaScraper = {
  scrapeInternshala,
  scrapeInternshalaWithRetry,
};

export default internalhalaScraper;
