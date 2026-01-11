import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Job from '@/models/Job';
import { fetchAllJobs } from '@/lib/jobApis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

    // Parse request body for custom query/location
    let query = 'software developer';
    let location = 'India';

    try {
      const body = await request.json();
      query = body.query || query;
      location = body.location || location;
    } catch {
      // Use default values if no body provided
    }

    console.log(`Fetching jobs: query="${query}", location="${location}"`);

    // Connect to database
    await dbConnect();

    // Fetch jobs from all APIs
    const { jobs, totalFetched, sources } = await fetchAllJobs({
      query,
      location,
    });

    if (jobs.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No jobs found from any API',
        stats: {
          fetched: 0,
          saved: 0,
          duplicates: 0,
          errors: 0,
        },
        sources,
      });
    }

    // Save jobs to database (handle duplicates)
    let savedCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;

    for (const jobData of jobs) {
      try {
        // Try to create new job (unique index will prevent duplicates)
        await Job.create(jobData);
        savedCount++;
      } catch (error: any) {
        // Duplicate key error (code 11000)
        if (error.code === 11000) {
          duplicateCount++;
        } else {
          errorCount++;
          console.error('Error saving job:', error.message);
        }
      }
    }

    console.log(`Job fetch complete: ${savedCount} saved, ${duplicateCount} duplicates, ${errorCount} errors`);

    return NextResponse.json({
      success: true,
      message: 'Jobs fetched and stored successfully',
      stats: {
        fetched: totalFetched,
        saved: savedCount,
        duplicates: duplicateCount,
        errors: errorCount,
      },
      sources,
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
