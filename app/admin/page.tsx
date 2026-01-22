'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { Briefcase, Download, TrendingUp, CheckCircle, XCircle, AlertCircle, Loader2, Home, ArrowLeft } from 'lucide-react';
import MobileNav from '@/components/MobileNav';

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ 
    message?: string; 
    error?: string; 
    success?: boolean;
    stats?: {
      fetched: number;
      saved: number;
      duplicates: number;
      errors: number;
    };
    sources?: Record<string, number>;
  } | null>(null);
  const [query, setQuery] = useState('software developer');
  const [location, setLocation] = useState('India');

  const handleFetchJobs = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/fetch-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          location,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: 'Failed to fetch jobs',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
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
            <Link href="/" className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                JobScout Admin
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <ThemeToggle />
              <Link href="/jobs">
                <Button variant="outline">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Jobs
                </Button>
              </Link>
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
      <main className="relative container mx-auto px-4 sm:px-6 md:px-8 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/jobs" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </Link>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
            Admin Panel
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            Manage and fetch job listings from multiple APIs
          </p>
        </div>

        {/* Fetch Jobs Card */}
        <Card className="backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 border border-slate-200/50 dark:border-slate-700/50 shadow-xl mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Fetch Jobs from APIs
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Retrieve job listings from Adzuna, JSearch, and Jooble APIs and save them to the database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Job Query
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
                placeholder="e.g., software developer, data analyst"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-slate-900 dark:text-slate-100 transition-all"
              >
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Singapore">Singapore</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
              </select>
            </div>

            <Button
              onClick={handleFetchJobs}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-6 text-base shadow-lg hover:shadow-xl transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Fetching Jobs...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Fetch Jobs from APIs
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Card */}
        {result && (
          <Card className="backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Status:</span>
                <span className={`flex items-center gap-2 font-bold ${result.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {result.success ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Success
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" />
                      Failed
                    </>
                  )}
                </span>
              </div>

              {/* Message */}
              {result.message && (
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">Message</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">{result.message}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Statistics */}
              {result.stats && (
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Statistics</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{result.stats.fetched}</p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Fetched</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">{result.stats.saved}</p>
                      <p className="text-xs text-green-700 dark:text-green-300 font-medium">Saved</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800">
                      <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{result.stats.duplicates}</p>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">Duplicates</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800">
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">{result.stats.errors}</p>
                      <p className="text-xs text-red-700 dark:text-red-300 font-medium">Errors</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sources */}
              {result.sources && (
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Jobs per Source</h4>
                  <div className="space-y-3">
                    {Object.entries(result.sources).map(([source, count]) => (
                      <div key={source} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{source}</span>
                        <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm font-bold">
                          {count as number} jobs
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error */}
              {result.error && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">Error</p>
                      <p className="text-sm text-red-700 dark:text-red-300">{result.error}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
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
