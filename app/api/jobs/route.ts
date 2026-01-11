import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Job from '@/models/Job';

export const dynamic = 'force-dynamic';

/**
 * GET /api/jobs
 * Fetch jobs with filtering, search, and pagination
 * Query params:
 * - search: text search across title, company, location, description
 * - location: filter by location
 * - company: filter by company
 * - jobType: filter by job type
 * - source: filter by source
 * - page: page number (default: 1)
 * - limit: items per page (default: 20, max: 100)
 * - sort: sort field (default: -createdAt)
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;

    // Build filter query
    const filter: any = {};

    // Text search
    const search = searchParams.get('search');
    if (search) {
      filter.$text = { $search: search };
    }

    // Location filter
    const location = searchParams.get('location');
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    // Company filter
    const company = searchParams.get('company');
    if (company) {
      filter.company = { $regex: company, $options: 'i' };
    }

    // Job type filter
    const jobType = searchParams.get('jobType');
    if (jobType) {
      filter.jobType = jobType;
    }

    // Source filter
    const source = searchParams.get('source');
    if (source) {
      filter.source = source;
    }

    // Salary filter (basic - can be enhanced)
    const minSalary = searchParams.get('minSalary');
    if (minSalary) {
      // This is a simple implementation - actual salary filtering is complex
      filter.salary = { $regex: minSalary, $options: 'i' };
    }

    // Sort
    const sortParam = searchParams.get('sort') || '-createdAt';
    let sort: any = {};
    
    if (sortParam.startsWith('-')) {
      sort[sortParam.substring(1)] = -1;
    } else {
      sort[sortParam] = 1;
    }

    // Execute query
    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-__v')
        .lean(),
      Job.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error in jobs API:', error);
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
