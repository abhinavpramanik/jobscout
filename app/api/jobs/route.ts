import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Job from '@/models/Job';
import { fetchAllJobs } from '@/lib/jobApis';
// @ts-ignore - JavaScript module in TypeScript project
import { runAllScrapers } from '@/scrapers/index.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 1 minute for search queries

/**
 * Calculate matching score for a job based on search query
 */
import { Job as JobType } from '@/types/job';
import mongoose from 'mongoose';

function calculateMatchScore(job: JobType, searchQuery: string): number {
  if (!searchQuery) return 0;
  
  const query = searchQuery.toLowerCase();
  const title = (job.title || '').toLowerCase();
  const description = (job.description || '').toLowerCase();
  const company = (job.company || '').toLowerCase();
  
  let score = 0;
  
  // Title match (highest weight)
  if (title.includes(query)) score += 50;
  else {
    // Partial word matches in title
    const queryWords = query.split(' ');
    queryWords.forEach(word => {
      if (word.length > 2 && title.includes(word)) score += 15;
    });
  }
  
  // Company match
  if (company.includes(query)) score += 20;
  
  // Description match
  if (description.includes(query)) score += 15;
  else {
    // Partial word matches in description
    const queryWords = query.split(' ');
    queryWords.forEach(word => {
      if (word.length > 2 && description.includes(word)) score += 5;
    });
  }
  
  // Recency boost (newer jobs get higher score)
  const daysOld = job.createdAt ? 
    Math.floor((Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 30;
  if (daysOld < 7) score += 10;
  else if (daysOld < 14) score += 5;
  
  return Math.min(score, 100); // Cap at 100
}

/**
 * GET /api/jobs
 * Enhanced job search with live API fetching and matching scores
 * Query params:
 * - search: text search across title, company, location, description
 * - location: filter by location
 * - company: filter by company
 * - jobType: filter by job type
 * - source: filter by source
 * - page: page number (default: 1)
 * - limit: items per page (default: 20, max: 100)
 * - sort: sort field (default: -createdAt)
 * - fetchLive: fetch from APIs when DB results are low (default: true)
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;

    // Live fetching option
    const fetchLive = searchParams.get('fetchLive') !== 'false'; // Default true

    // Build filter query
    const filter: Record<string, unknown> = {};

    // Text search
    const search = searchParams.get('search');
    if (search) {
      // Use regex for more flexible matching
      const searchRegex = { $regex: search, $options: 'i' };
      filter.$or = [
        { title: searchRegex },
        { company: searchRegex },
        { description: searchRegex },
        { location: searchRegex },
      ];
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
    let sort: Record<string, 1 | -1> = {};
    
    if (sortParam.startsWith('-')) {
      sort[sortParam.substring(1)] = -1;
    } else {
      sort[sortParam] = 1;
    }

    // Check if any filters are applied
    const hasFilters = search || location || company || jobType || source || minSalary;

    // Execute query
    let jobs;
    if (!hasFilters) {
      // No filters applied - prioritize India-based jobs
      const [indiaJobs, otherJobs] = await Promise.all([
        Job.find({ ...filter, location: { $regex: 'India', $options: 'i' } })
          .sort(sort)
          .limit(limit)
          .select('-__v')
          .lean(),
        Job.find({ ...filter, location: { $not: { $regex: 'India', $options: 'i' } } })
          .sort(sort)
          .limit(Math.max(0, limit - (await Job.countDocuments({ ...filter, location: { $regex: 'India', $options: 'i' } }))))
          .select('-__v')
          .lean()
      ]);
      
      // Combine India jobs first, then others
      jobs = [...indiaJobs, ...otherJobs].slice(skip, skip + limit);
    } else {
      // Filters applied - normal query
      jobs = await Job.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-__v')
        .lean();
    }

    let total = await Job.countDocuments(filter);

    // If search query exists and results are low, fetch from live APIs
    let liveJobsFetched = 0;
    let scrapedJobsFetched = 0;
    if (fetchLive && search && total < 10 && page === 1) {
      console.log(`Low results (${total}) for search "${search}" - fetching from live sources...`);
      
      try {
        // Fetch from APIs
        const apiLocation = location || 'India';
        const { jobs: apiJobs } = await fetchAllJobs({
          query: search,
          location: apiLocation,
        });

        // Save API jobs to database
        for (const jobData of apiJobs) {
          try {
            const newJob = await Job.create(jobData);
            jobs.push(newJob.toObject());
            liveJobsFetched++;
          } catch (error: unknown) {
            if (error && typeof error === 'object' && 'code' in error && error.code !== 11000) { // Ignore duplicates
              console.error('Error saving live job:', error instanceof Error ? error.message : 'Unknown error');
            }
          }
        }

        // Also try web scraping if we still have few results (but don't wait too long)
        if (jobs.length < 15) {
          try {
            const scrapingPromise = runAllScrapers({
              maxPages: 1,
              keyword: search,
              location: apiLocation,
              enabledScrapers: ['indeed', 'internshala'],
            });

            // Set timeout for scraping (max 20 seconds)
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Scraping timeout')), 20000)
            );

            const scrapingResults = await Promise.race([scrapingPromise, timeoutPromise]) as Record<string, unknown>;
            
            // Save scraped jobs with proper type checking
            const allScrapedJobs: unknown[] = [];
            if (Array.isArray(scrapingResults.indeed)) allScrapedJobs.push(...scrapingResults.indeed);
            if (Array.isArray(scrapingResults.internshala)) allScrapedJobs.push(...scrapingResults.internshala);
            if (Array.isArray(scrapingResults.timesjobs)) allScrapedJobs.push(...scrapingResults.timesjobs);

            for (const jobData of allScrapedJobs.slice(0, 10)) { // Limit to 10 scraped jobs
              try {
                const newJob = await Job.create(jobData as Record<string, unknown>);
                jobs.push(newJob.toObject() as any);
                scrapedJobsFetched++;
              } catch (error: unknown) {
                if (error && typeof error === 'object' && 'code' in error && error.code !== 11000) {
                  console.error('Error saving scraped job:', error instanceof Error ? error.message : 'Unknown error');
                }
              }
            }
          } catch (scrapingError) {
            console.log('Scraping skipped or timed out:', scrapingError);
          }
        }

        // Update total count
        total = jobs.length;
        console.log(`Added ${liveJobsFetched} API jobs and ${scrapedJobsFetched} scraped jobs`);
      } catch (apiError) {
        console.error('Error fetching live jobs:', apiError);
      }
    }

    // Calculate match scores for search results
    if (search) {
      jobs = jobs.map(job => {
        const jobObject = job.toObject ? job.toObject() : job;
        return {
          ...jobObject,
          _id: jobObject._id.toString(),
          matchScore: calculateMatchScore({
            ...jobObject,
            _id: jobObject._id.toString()
          } as JobType, search),
        };
      });

      // Sort by match score if searching
      jobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    } else {
      // Convert _id to string for consistency
      jobs = jobs.map(job => {
        const jobObject = job.toObject ? job.toObject() : job;
        return {
          ...jobObject,
          _id: jobObject._id.toString()
        };
      });
    }

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
      meta: {
        liveJobsFetched,
        scrapedJobsFetched,
        sources: [...new Set(jobs.map((j) => j.source))],
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
