import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Job from '@/models/Job';
import { fetchAllJobs } from '@/lib/jobApis';
// @ts-ignore - JavaScript module in TypeScript project
import { runScrapingWorkflow } from '@/scrapers/index.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max execution time for scraping

/**
 * POST /api/fetch-jobs
 * Fetches jobs from external APIs and stores them in MongoDB
 * Protected by CRON_SECRET for automated cron jobs
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for production security (skip if CRON_SECRET not set or is placeholder)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && cronSecret !== 'your_random_secret_key_here' && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body for custom query/location and options
    let query = 'software developer';
    let location = 'India';
    let enableScraping = true; // Enable web scraping by default
    let maxPages = 2; // Default pages per scraper

    try {
      const body = await request.json();
      query = body.query || query;
      location = body.location || location;
      enableScraping = body.enableScraping !== undefined ? body.enableScraping : enableScraping;
      maxPages = body.maxPages || maxPages;
    } catch {
      // Use default values if no body provided
    }

    console.log(`Fetching jobs: query="${query}", location="${location}", scraping=${enableScraping}`);

    // Connect to database
    await dbConnect();

    // Initialize result statistics
    let apiStats = { fetched: 0, saved: 0, duplicates: 0, errors: 0, sources: {} };
    let scrapingStats = null;

    // Step 1: Fetch jobs from external APIs (Adzuna, JSearch, Jooble)
    console.log('--- Starting API job fetching ---');
    const { jobs, totalFetched, sources } = await fetchAllJobs({
      query,
      location,
    });

    // Save API jobs to database
    let savedCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;

    for (const jobData of jobs) {
      try {
        await Job.create(jobData);
        savedCount++;
      } catch (error: any) {
        if (error.code === 11000) {
          duplicateCount++;
        } else {
          errorCount++;
          console.error('Error saving API job:', error.message);
        }
      }
    }

    apiStats = {
      fetched: totalFetched,
      saved: savedCount,
      duplicates: duplicateCount,
      errors: errorCount,
      sources,
    };

    console.log(`API jobs: ${savedCount} saved, ${duplicateCount} duplicates, ${errorCount} errors`);

    // Step 2: Run web scrapers if enabled
    if (enableScraping) {
      console.log('--- Starting web scraping ---');
      
      try {
        const scrapingResults = await runScrapingWorkflow(Job, {
          keyword: query,
          location,
          maxPages,
          enabledScrapers: ['indeed', 'internshala', 'timesjobs'],
        });

        scrapingStats = scrapingResults;
        console.log('Web scraping completed:', scrapingResults);
      } catch (scrapingError) {
        console.error('Web scraping failed:', scrapingError);
        scrapingStats = {
          success: false,
          error: scrapingError instanceof Error ? scrapingError.message : 'Unknown scraping error',
        };
      }
    } else {
      console.log('Web scraping disabled');
    }

    // Prepare final response
    const totalSaved = apiStats.saved + (scrapingStats?.database?.inserted || 0);
    const totalDuplicates = apiStats.duplicates + (scrapingStats?.database?.duplicates || 0);

    return NextResponse.json({
      success: true,
      message: 'Job fetching completed',
      api: apiStats,
      scraping: scrapingStats,
      summary: {
        totalSaved,
        totalDuplicates,
        totalFetched: apiStats.fetched + (scrapingStats?.scraping?.total || 0),
      },
    });
  } catch (error) {
    console.error('Error in fetch-jobs API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch jobs',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/fetch-jobs
 * Allows manual triggering via browser for testing
 */
export async function GET(request: NextRequest) {
  // Check for simple auth token in development (skip if CRON_SECRET not set or is placeholder)
  const token = request.nextUrl.searchParams.get('token');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && cronSecret !== 'your_random_secret_key_here' && token !== cronSecret) {
    return NextResponse.json(
      { error: 'Unauthorized. Please provide valid token.' },
      { status: 401 }
    );
  }

  // Forward to POST handler
  return POST(request);
}
