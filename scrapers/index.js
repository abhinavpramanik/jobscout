/**
 * Main Scraper Orchestrator
 * Coordinates all job scrapers and saves data to MongoDB
 * Handles duplicate prevention and error recovery
 */

import { scrapeIndeedWithRetry } from './indeed.js';
import { scrapeInternshalaWithRetry } from './internshala.js';
import { scrapeTimesJobsWithRetry } from './timesjobs.js';
import { log } from './utils.js';

const ORCHESTRATOR_NAME = 'Orchestrator';

/**
 * Run all scrapers in parallel
 * @param {Object} options - Scraping options
 * @param {number} options.maxPages - Max pages per scraper
 * @param {string} options.keyword - Search keyword
 * @param {string} options.location - Location filter
 * @param {Array} options.enabledScrapers - Array of scraper names to run
 * @returns {Promise<Object>} Results from all scrapers
 */
export async function runAllScrapers(options = {}) {
  const {
    maxPages = 3,
    keyword = 'software developer',
    location = 'India',
    enabledScrapers = ['indeed', 'internshala', 'timesjobs'],
  } = options;

  log(ORCHESTRATOR_NAME, 'Starting all scrapers...');
  log(ORCHESTRATOR_NAME, `Configuration: keyword="${keyword}", location="${location}", maxPages=${maxPages}`);

  const scraperOptions = { maxPages, keyword, location };
  const results = {
    indeed: [],
    internshala: [],
    timesjobs: [],
    errors: {},
    summary: {
      total: 0,
      bySource: {},
    },
  };

  // Run scrapers in parallel with error handling
  const scraperPromises = [];

  if (enabledScrapers.includes('indeed')) {
    scraperPromises.push(
      scrapeIndeedWithRetry(scraperOptions)
        .then((jobs) => {
          results.indeed = jobs;
          log(ORCHESTRATOR_NAME, `Indeed completed: ${jobs.length} jobs`);
        })
        .catch((error) => {
          results.errors.indeed = error.message;
          log(ORCHESTRATOR_NAME, `Indeed failed: ${error.message}`, 'error');
        })
    );
  }

  if (enabledScrapers.includes('internshala')) {
    scraperPromises.push(
      scrapeInternshalaWithRetry(scraperOptions)
        .then((jobs) => {
          results.internshala = jobs;
          log(ORCHESTRATOR_NAME, `Internshala completed: ${jobs.length} jobs`);
        })
        .catch((error) => {
          results.errors.internshala = error.message;
          log(ORCHESTRATOR_NAME, `Internshala failed: ${error.message}`, 'error');
        })
    );
  }

  if (enabledScrapers.includes('timesjobs')) {
    scraperPromises.push(
      scrapeTimesJobsWithRetry(scraperOptions)
        .then((jobs) => {
          results.timesjobs = jobs;
          log(ORCHESTRATOR_NAME, `TimesJobs completed: ${jobs.length} jobs`);
        })
        .catch((error) => {
          results.errors.timesjobs = error.message;
          log(ORCHESTRATOR_NAME, `TimesJobs failed: ${error.message}`, 'error');
        })
    );
  }

  // Wait for all scrapers to complete
  await Promise.allSettled(scraperPromises);

  // Calculate summary
  results.summary.bySource = {
    indeed: results.indeed.length,
    internshala: results.internshala.length,
    internshala: results.internshala.length,
    timesjobs: results.timesjobs.length,
  };

  results.summary.total = 
    results.indeed.length + 
    results.internshala.length + 
    results.timesjobs.length;

  log(ORCHESTRATOR_NAME, `All scrapers completed. Total jobs: ${results.summary.total}`, 'success');
  log(ORCHESTRATOR_NAME, `Breakdown: Indeed=${results.indeed.length}, Internshala=${results.internshala.length}, TimesJobs=${results.timesjobs.length}`);

  return results;
}

/**
 * Save scraped jobs to MongoDB
 * @param {Object} scrapedResults - Results from runAllScrapers
 * @param {Object} JobModel - Mongoose Job model
 * @returns {Promise<Object>} Save statistics
 */
export async function saveScrapedJobs(scrapedResults, JobModel) {
  log(ORCHESTRATOR_NAME, 'Starting to save jobs to MongoDB...');

  const stats = {
    total: 0,
    inserted: 0,
    duplicates: 0,
    errors: 0,
    bySource: {
      indeed: { inserted: 0, duplicates: 0, errors: 0 },
      internshala: { inserted: 0, duplicates: 0, errors: 0 },
      timesjobs: { inserted: 0, duplicates: 0, errors: 0 },
    },
  };

  // Combine all jobs
  const allJobs = [
    ...scrapedResults.indeed,
    ...scrapedResults.internshala,
    ...scrapedResults.timesjobs,
  ];

  stats.total = allJobs.length;
  log(ORCHESTRATOR_NAME, `Processing ${stats.total} jobs for database insertion...`);

  // Save each job individually to handle duplicates gracefully
  for (const job of allJobs) {
    try {
      await JobModel.create(job);
      stats.inserted++;
      stats.bySource[job.source.toLowerCase()].inserted++;
    } catch (error) {
      // Check if it's a duplicate key error (code 11000)
      if (error.code === 11000) {
        stats.duplicates++;
        stats.bySource[job.source.toLowerCase()].duplicates++;
        log(ORCHESTRATOR_NAME, `Duplicate job skipped: ${job.title} at ${job.company}`, 'warn');
      } else {
        stats.errors++;
        stats.bySource[job.source.toLowerCase()].errors++;
        log(ORCHESTRATOR_NAME, `Error saving job: ${error.message}`, 'error');
      }
    }
  }

  log(ORCHESTRATOR_NAME, `Database save completed!`, 'success');
  log(ORCHESTRATOR_NAME, `Total: ${stats.total}, Inserted: ${stats.inserted}, Duplicates: ${stats.duplicates}, Errors: ${stats.errors}`);

  return stats;
}

/**
 * Run complete scraping workflow: scrape + save
 * @param {Object} JobModel - Mongoose Job model
 * @param {Object} options - Scraping options
 * @returns {Promise<Object>} Complete results
 */
export async function runScrapingWorkflow(JobModel, options = {}) {
  log(ORCHESTRATOR_NAME, '========== Starting Scraping Workflow ==========');

  const startTime = Date.now();

  try {
    // Step 1: Run all scrapers
    const scrapedResults = await runAllScrapers(options);

    // Step 2: Save to MongoDB
    const saveStats = await saveScrapedJobs(scrapedResults, JobModel);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    const finalResults = {
      success: true,
      duration: `${duration}s`,
      scraping: scrapedResults.summary,
      database: saveStats,
      errors: scrapedResults.errors,
    };

    log(ORCHESTRATOR_NAME, `========== Workflow Completed in ${duration}s ==========`, 'success');

    return finalResults;
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    log(ORCHESTRATOR_NAME, `========== Workflow Failed after ${duration}s ==========`, 'error');
    log(ORCHESTRATOR_NAME, `Error: ${error.message}`, 'error');

    return {
      success: false,
      duration: `${duration}s`,
      error: error.message,
    };
  }
}

const orchestrator = {
  runAllScrapers,
  saveScrapedJobs,
  runScrapingWorkflow,
};

export default orchestrator;
