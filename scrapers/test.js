/**
 * Test Script for Web Scrapers
 * Run this to test individual scrapers locally
 * 
 * Usage: node scrapers/test.js
 */

import { scrapeIndeedWithRetry } from './indeed.js';
import { scrapeInternshalaWithRetry } from './internshala.js';
import { scrapeTimesJobsWithRetry } from './timesjobs.js';
import { runAllScrapers } from './index.js';

/**
 * Test individual scraper
 */
async function testIndividualScraper() {
  console.log('\n========== Testing Individual Scraper ==========\n');

  try {
    console.log('Testing Naukri scraper...\n');
    
    const jobs = await scrapeNaukriWithRetry({
      maxPages: 1,
      keyword: 'javascript developer',
      location: 'Bangalore',
    });

    console.log(`\n✅ Scraped ${jobs.length} jobs from Naukri`);
    
    if (jobs.length > 0) {
      console.log('\nSample job:');
      console.log(JSON.stringify(jobs[0], null, 2));
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

/**
 * Test all scrapers in parallel
 */
async function testAllScrapers() {
  console.log('\n========== Testing All Scrapers ==========\n');

  try {
    const results = await runAllScrapers({
      maxPages: 1,
      keyword: 'software engineer',
      location: 'India',
      enabledScrapers: ['indeed', 'internshala', 'timesjobs'],
    });

    console.log('\n✅ All scrapers completed\n');
    console.log('Summary:', JSON.stringify(results.summary, null, 2));
    
    if (Object.keys(results.errors).length > 0) {
      console.log('\n⚠️  Errors:', results.errors);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

/**
 * Main test runner
 */
async function main() {
  console.log('Web Scraper Test Suite');
  console.log('======================\n');

  // Run all scrapers test
  await testAllScrapers();

  console.log('\n========== Tests Complete ==========\n');
}

// Run tests
main().catch(console.error);
