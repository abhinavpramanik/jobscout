'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { 
  Briefcase, 
  Search, 
  Zap, 
  Shield, 
  Globe, 
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Sparkles,
  User,
  LogOut
} from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: <Search className="w-6 h-6" />,
      title: 'Unified Search',
      description: 'Search across multiple job portals in one place - Adzuna, JSearch, and Jooble.'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Real-time Updates',
      description: 'Automated job fetching every 6 hours to keep listings fresh and relevant.'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Duplicate Free',
      description: 'Smart filtering removes duplicate listings so you see unique opportunities.'
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Global Reach',
      description: 'Access jobs from India, US, UK, Canada, Australia, and more countries.'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Advanced Filters',
      description: 'Filter by location, job type, salary, experience, and source platform.'
    },
    {
      icon: <Briefcase className="w-6 h-6" />,
      title: 'Save & Track',
      description: 'Save favorite jobs and track your applications all in one dashboard.'
    }
  ];

  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 dark:bg-indigo-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-400 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
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
                  <Link href="/jobs">
                    <Button variant="ghost" className="text-slate-700 dark:text-slate-300">
                      Browse Jobs
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

      {/* Hero Section */}
      <section className="relative container mx-auto px-6 md:px-10 py-24 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">AI-Powered Job Aggregation Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 dark:from-slate-100 dark:via-blue-200 dark:to-indigo-100 bg-clip-text text-transparent">
            Find Your Dream Job Across Multiple Platforms
          </h1>
          
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
            Search thousands of jobs from Adzuna, JSearch, and Jooble in one place. 
            Save time, find opportunities, and land your dream career.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/jobs">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-600 text-white text-base px-8 py-6 shadow-lg hover:shadow-xl transition-all">
                Browse Jobs <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="lg" variant="outline" className="text-base px-8 py-6 border-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                Sign Up Free
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Free forever</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>1000+ companies</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative container mx-auto px-6 md:px-10 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Why Choose JobScout?
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Everything you need to find your next opportunity
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-100">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative container mx-auto px-6 md:px-10 py-20">
        <Card className="backdrop-blur-md bg-gradient-to-br from-blue-600 to-indigo-600 border-0 text-white shadow-2xl">
          <CardContent className="p-12 md:p-16 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to Find Your Dream Job?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of job seekers who trust JobScout
            </p>
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary" className="text-base px-10 py-6 shadow-lg hover:shadow-xl transition-all">
                Get Started for Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="relative backdrop-blur-md bg-slate-900/90 dark:bg-slate-950/90 text-white py-10 mt-20 border-t border-slate-700/50">
        <div className="container mx-auto px-6 md:px-10 text-center">
          <p className="font-semibold">&copy; 2026 JobScout - Job Aggregation Platform</p>
          <p className="text-sm text-slate-400 mt-2">Created with ❤️ by Abhinav Pramanik</p>
        </div>
      </footer>
    </div>
  );
}
