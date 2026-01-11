import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Job from '@/models/Job';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * DELETE /api/clean-duplicates
 * Remove duplicate jobs based on (title, company, location) combination
 * Protected by CRON_SECRET
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Find duplicates using aggregation
    const duplicates = await Job.aggregate([
      {
        $group: {
          _id: {
            title: '$title',
            company: '$company',
            location: '$location',
          },
          count: { $sum: 1 },
          docs: { $push: '$_id' },
        },
      },
      {
        $match: {
          count: { $gt: 1 },
        },
      },
    ]);

    let deletedCount = 0;

    // For each duplicate group, keep the most recent one and delete others
    for (const duplicate of duplicates) {
      const docsToDelete = duplicate.docs.slice(1); // Keep first, delete rest
      await Job.deleteMany({ _id: { $in: docsToDelete } });
      deletedCount += docsToDelete.length;
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned ${deletedCount} duplicate jobs`,
      stats: {
        duplicateGroups: duplicates.length,
        deletedJobs: deletedCount,
      },
    });
  } catch (error) {
    console.error('Error cleaning duplicates:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to clean duplicates',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/clean-duplicates
 * Check for duplicates without deleting (read-only)
 */
export async function GET(request: NextRequest) {
  try {
    // Optional token check
    const token = request.nextUrl.searchParams.get('token');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && token !== cronSecret) {
      return NextResponse.json(
        { error: 'Unauthorized. Please provide valid token.' },
        { status: 401 }
      );
    }

    await dbConnect();

    const duplicates = await Job.aggregate([
      {
        $group: {
          _id: {
            title: '$title',
            company: '$company',
            location: '$location',
          },
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          count: { $gt: 1 },
        },
      },
    ]);

    const totalDuplicates = duplicates.reduce(
      (sum, group) => sum + (group.count - 1),
      0
    );

    return NextResponse.json({
      success: true,
      message: `Found ${totalDuplicates} duplicate jobs in ${duplicates.length} groups`,
      stats: {
        duplicateGroups: duplicates.length,
        totalDuplicates,
      },
      duplicates: duplicates.slice(0, 10), // Return first 10 for preview
    });
  } catch (error) {
    console.error('Error checking duplicates:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check duplicates',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
