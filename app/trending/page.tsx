'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { TrendingUp, Briefcase, Building2, MapPin, User, LogOut, Loader2 } from 'lucide-react';
import MobileNav from '@/components/MobileNav';

interface TrendingDomain {
  domain: string;
  count: number;
  percentage: number;
  jobs: Array<{
    _id: string;
    title: string;
    company: string;
    location: string;
    salary: string;
  }>;
}

export default function TrendingPage() {
  const { data: session } = useSession();
  const [trending, setTrending] = useState<TrendingDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTrendingJobs();
  }, []);

  const fetchTrendingJobs = async () => {
    try {
      const response = await fetch('/api/trending');
      const data = await response.json();
      
      if (data.success) {
        setTrending(data.data);
      } else {
        setError('Failed to load trending jobs');
      }
    } catch (err) {
      setError('An error occurred while fetching trending jobs');
    } finally {
      setLoading(false);
    }
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
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4 sm:space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <Briefcase className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600 dark:text-blue-400" />
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  JobScout
                </span>
              </Link>
              <div className="hidden md:flex space-x-6">
                <Link href="/jobs" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Jobs
                </Link>
                <Link href="/trending" className="text-blue-600 dark:text-blue-400 font-medium">
                  Trending
                </Link>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <ThemeToggle />
              {session ? (
                <>
                  <Link href="/profile">
                    <Button variant="outline" size="sm">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href="/auth/signin">
                  <Button size="sm">Sign In</Button>
                </Link>
              )}
            </div>

            {/* Mobile Navigation */}
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
              <MobileNav />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative container mx-auto px-4 sm:px-6 md:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Trending Job Domains
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Discover the most in-demand job categories based on current listings
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-10">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Trending Domains */}
        {!loading && !error && (
          <div className="space-y-6">
            {trending.map((domain, index) => (
              <Card key={index} className="backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-bold">
                        {index + 1}
                      </span>
                      {domain.domain}
                    </CardTitle>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {domain.count}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          jobs available
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {domain.percentage}%
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          of total
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                      Top Jobs in {domain.domain}:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {domain.jobs.slice(0, 4).map((job) => (
                        <Link
                          key={job._id}
                          href={`/jobs/${job._id}`}
                          className="group p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-md"
                        >
                          <div className="flex items-start gap-2">
                            <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                                {job.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-xs text-slate-600 dark:text-slate-400">
                                <Building2 className="w-3 h-3" />
                                <span className="truncate">{job.company}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-xs text-slate-600 dark:text-slate-400">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{job.location}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    {domain.jobs.length > 4 && (
                      <Link href={`/jobs?search=${encodeURIComponent(domain.domain)}`}>
                        <Button variant="outline" size="sm" className="w-full mt-3">
                          View All {domain.count} {domain.domain} Jobs →
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && !error && trending.length === 0 && (
          <div className="text-center py-20">
            <TrendingUp className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">No trending data available yet</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative mt-12 backdrop-blur-md bg-gradient-to-r from-slate-900/90 via-blue-900/90 to-indigo-900/90 dark:from-slate-950/90 dark:via-blue-950/90 dark:to-indigo-950/90 text-white border-t border-slate-700/50">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-8 text-center">
          <p className="font-semibold">&copy; 2026 JobScout - Job Aggregation Platform</p>
          <p className="text-sm text-slate-300 dark:text-slate-400 mt-2">Created with ❤️ by Abhinav Pramanik</p>
        </div>
      </footer>
    </div>
  );
}
