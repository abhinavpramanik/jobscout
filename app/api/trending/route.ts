import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Job from '@/models/Job';

export const runtime = 'nodejs';

/**
 * GET /api/trending
 * Get trending job domains/categories based on job count
 */
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Aggregate jobs by title keywords to determine domains
    const jobTitles = await Job.aggregate([
      {
        $group: {
          _id: null,
          titles: { $push: '$title' }
        }
      }
    ]);

    if (!jobTitles || jobTitles.length === 0) {
      return NextResponse.json(
        { success: true, data: [] },
        { status: 200 }
      );
    }

    // Define common job domains/categories and their keywords
    const domains = [
      { name: 'Software Development', keywords: ['software', 'developer', 'programmer', 'engineer', 'full stack', 'backend', 'frontend', 'web developer', 'mobile developer'] },
      { name: 'Data Science & Analytics', keywords: ['data scientist', 'data analyst', 'machine learning', 'ai', 'analytics', 'data engineer', 'ml engineer'] },
      { name: 'DevOps & Cloud', keywords: ['devops', 'cloud', 'aws', 'azure', 'gcp', 'kubernetes', 'docker', 'sre', 'site reliability'] },
      { name: 'Product Management', keywords: ['product manager', 'product owner', 'pm', 'product lead'] },
      { name: 'Design & UX', keywords: ['designer', 'ux', 'ui', 'graphic', 'product designer', 'visual designer'] },
      { name: 'Quality Assurance', keywords: ['qa', 'tester', 'quality', 'test engineer', 'automation'] },
      { name: 'Cybersecurity', keywords: ['security', 'cybersecurity', 'infosec', 'penetration', 'security analyst'] },
      { name: 'Marketing & Sales', keywords: ['marketing', 'sales', 'digital marketing', 'seo', 'content', 'growth'] },
      { name: 'Human Resources', keywords: ['hr', 'human resource', 'recruiter', 'talent', 'people'] },
      { name: 'Finance & Accounting', keywords: ['finance', 'accounting', 'accountant', 'financial', 'auditor'] },
      { name: 'Business Analyst', keywords: ['business analyst', 'ba', 'analyst', 'business intelligence'] },
      { name: 'Project Management', keywords: ['project manager', 'scrum master', 'agile', 'program manager'] },
      { name: 'Customer Support', keywords: ['support', 'customer service', 'help desk', 'customer success'] },
      { name: 'Operations', keywords: ['operations', 'ops manager', 'supply chain', 'logistics'] },
      { name: 'Consulting', keywords: ['consultant', 'consulting', 'advisor', 'strategy'] },
    ];

    // Get total job count
    const totalJobs = await Job.countDocuments();

    // Count jobs for each domain
    const domainCounts = await Promise.all(
      domains.map(async (domain) => {
        // Create regex pattern for all keywords
        const regexPattern = domain.keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
        const regex = new RegExp(regexPattern, 'i');

        const count = await Job.countDocuments({
          title: { $regex: regex }
        });

        // Get sample jobs
        const jobs = await Job.find({
          title: { $regex: regex }
        })
          .select('_id title company location salary')
          .limit(6)
          .lean();

        return {
          domain: domain.name,
          count,
          percentage: totalJobs > 0 ? Math.round((count / totalJobs) * 100 * 10) / 10 : 0,
          jobs
        };
      })
    );

    // Filter out domains with no jobs and sort by count
    const trendingDomains = domainCounts
      .filter(d => d.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 domains

    return NextResponse.json(
      { success: true, data: trendingDomains },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch trending jobs',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
