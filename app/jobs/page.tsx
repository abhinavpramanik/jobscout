'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import JobCard from '@/components/JobCard';
import Filters, { FilterState } from '@/components/Filters';
import Pagination from '@/components/Pagination';
import { Job, JobsResponse } from '@/types/job';
import { Sparkles, Briefcase, User, LogOut } from 'lucide-react';
import { calculateSkillMatch } from '@/lib/skillMatcher';
import { extractSkillsFromText } from '@/lib/skillsDatabase';

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    location: '',
    jobType: '',
    source: '',
  });

  const [userSkills, setUserSkills] = useState<string[]>([]);

  // Fetch user skills from profile
  const fetchUserSkills = async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        setUserSkills(data.user?.skills || []);
      }
    } catch (error) {
      // Silent error handling
    }
  };

  // Calculate match score for a job
  const calculateJobMatchScore = (job: Job): number => {
    if (!userSkills || userSkills.length === 0) return 0;
    
    // Extract skills from job title and description
    const jobText = `${job.title} ${job.description} ${job.experience}`;
    const jobSkills = extractSkillsFromText(jobText);
    
    if (jobSkills.length === 0) return 0;
    
    // Calculate match
    const matchResult = calculateSkillMatch(userSkills, jobSkills);
    return matchResult.matchScore;
  };

  const fetchJobs = async (page: number, currentFilters: FilterState) => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (currentFilters.search) params.append('search', currentFilters.search);
      if (currentFilters.location) params.append('location', currentFilters.location);
      if (currentFilters.jobType) params.append('jobType', currentFilters.jobType);
      if (currentFilters.source) params.append('source', currentFilters.source);

      const response = await fetch(`/api/jobs?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      const data: JobsResponse = await response.json();
      
      if (data.success) {
        // Calculate match scores for each job
        const jobsWithScores = data.data.map(job => {
          if (!session?.user || userSkills.length === 0) {
            return { ...job };
          }

          const jobText = `${job.title} ${job.description} ${job.experience}`;
          const jobSkills = extractSkillsFromText(jobText);
          const matchResult = calculateSkillMatch(userSkills, jobSkills);

          return {
            ...job,
            matchScore: matchResult.matchScore,
            requiredSkills: jobSkills,
            matchedSkills: matchResult.matchedSkills,
            missingSkills: matchResult.missingSkills,
          };
        });

        // Sort by match score if user is logged in and has skills
        if (session?.user && userSkills.length > 0) {
          jobsWithScores.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        }

        setJobs(jobsWithScores);
        setPagination(data.pagination);
      } else {
        setError('Failed to load jobs');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const { data: session } = useSession();

  // Fetch user skills when logged in
  useEffect(() => {
    if (session?.user) {
      fetchUserSkills();
    }
  }, [session]);

  useEffect(() => {
    fetchJobs(currentPage, filters);
  }, [currentPage, userSkills]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
    fetchJobs(1, newFilters);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 dark:opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 dark:opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-300 dark:bg-pink-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 dark:opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="container mx-auto px-6 md:px-10 py-5">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                JobScout
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {session ? (
                <>
                  <Link href="/profile">
                    <Button variant="ghost" className="text-slate-700 dark:text-slate-300">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    className="text-slate-700 dark:text-slate-300"
                    onClick={() => signOut({ callbackUrl: '/' })}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/signin">
                    <Button variant="ghost" className="text-slate-700 dark:text-slate-300">Sign In</Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-600 text-white">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="relative backdrop-blur-md bg-white/30 dark:bg-slate-900/30 border-b border-white/20 dark:border-slate-700/20 shadow-lg">
        <div className="container mx-auto px-6 md:px-10 py-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent animate-gradient">
              Browse Jobs
            </h1>
            <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
          </div>
          <p className="text-gray-700 dark:text-gray-300 mt-2 font-medium">
            Find your dream job across multiple platforms
            {session && userSkills.length > 0 && (
              <span className="ml-2 text-sm text-blue-600 dark:text-blue-400">
                • {userSkills.length} skills detected from your resume
              </span>
            )}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative container mx-auto px-6 md:px-10 py-10">
        {/* Filters */}
        <Filters onFilterChange={handleFilterChange} isLoading={loading} />

        {/* Stats */}
        <div className="mb-6">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Showing {jobs.length} of {pagination.total} jobs
            {filters.search && ` for "${filters.search}"`}
            {filters.location && ` in ${filters.location}`}
            {session && userSkills.length > 0 && (
              <span className="text-blue-600 dark:text-blue-400"> (sorted by match score)</span>
            )}
          </p>
          {filters.location?.toLowerCase().includes('india') && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">
              💡 Note: Many employers in India don't disclose salary information in job postings. Check the job description for details.
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="relative inline-flex">
              <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-600 dark:border-r-purple-400 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1s'}}></div>
            </div>
            <p className="mt-4 text-gray-700 dark:text-gray-300 font-medium animate-pulse">Loading amazing opportunities...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-6 py-4 rounded-xl shadow-lg">
            <p className="font-semibold text-lg">Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && jobs.length === 0 && (
          <div className="text-center py-16 backdrop-blur-md bg-white/60 dark:bg-slate-900/60 rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">No jobs found</h3>
            <p className="text-slate-600 dark:text-slate-400">Try adjusting your search filters or check back later</p>
          </div>
        )}

        {/* Job Listings */}
        {!loading && !error && jobs.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              hasNextPage={pagination.hasNextPage}
              hasPrevPage={pagination.hasPrevPage}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="relative mt-12 backdrop-blur-md bg-gradient-to-r from-gray-900/90 via-blue-900/90 to-purple-900/90 text-white border-t border-slate-700/50">
        <div className="container mx-auto px-6 md:px-10 py-10 text-center">
          <p className="font-semibold">&copy; 2026 JobScout - Job Aggregation Platform</p>
          <p className="text-sm text-gray-300 mt-2">Created with ❤️ by Abhinav Pramanik</p>
        </div>
      </footer>
    </div>
  );
}
