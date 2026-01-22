'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import MobileNav from '@/components/MobileNav';
import { 
  Briefcase, 
  Search, 
  Zap, 
  Globe, 
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Sparkles,
  User,
  LogOut,
  Award,
  Database,
  GitMerge,
  Brain,
  LayoutDashboard,
  GraduationCap,
  Users,
  Wifi,
  RefreshCw,
  MapPin,
  DollarSign,
  Building2,
  Github,
  Linkedin,
  Mail,
  InstagramIcon
} from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: <Search className="w-6 h-6" />,
      title: 'Unified Search',
      description: 'Aggregates job listings from multiple platforms into a single intelligent search engine.'
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'AI Skill Matching',
      description: 'Resume-based skill analysis with compatibility scoring for every job listing.'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Trending Insights',
      description: 'Real-time job market trends based on user interactions and demand.'
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Smart Location Priority',
      description: 'India-first job discovery with global coverage.'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Real-time Updates',
      description: 'Automated job fetching with cron scheduling and duplicate removal.'
    },
    {
      icon: <Briefcase className="w-6 h-6" />,
      title: 'Save & Track',
      description: 'Personalized dashboard to manage job searches and applications.'
    }
  ];

  const howItWorks = [
    {
      icon: <Database className="w-8 h-8" />,
      title: 'Job APIs & Scraping',
      description: 'Collects jobs from trusted APIs and public job boards.',
      step: '01'
    },
    {
      icon: <GitMerge className="w-8 h-8" />,
      title: 'Data Normalization',
      description: 'Converts all job listings into a unified structured format.',
      step: '02'
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'AI Processing',
      description: 'Applies resume matching and recommendation logic.',
      step: '03'
    },
    {
      icon: <LayoutDashboard className="w-8 h-8" />,
      title: 'User Dashboard',
      description: 'Displays personalized job results instantly.',
      step: '04'
    }
  ];

  const userTypes = [
    {
      icon: <GraduationCap className="w-6 h-6" />,
      title: 'Students & Freshers',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Experienced Professionals',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Wifi className="w-6 h-6" />,
      title: 'Remote Job Seekers',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: <RefreshCw className="w-6 h-6" />,
      title: 'Career Switchers',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  const techStack = [
    'Next.js', 'MongoDB', 'Node.js', 'Web Scraping', 
    'Cron Jobs', 'REST APIs', 'AI Matching', 'Cloud Hosting'
  ];

  const sampleJobs = [
    {
      title: 'Senior Full Stack Developer',
      company: 'Tech Corp',
      location: 'Bangalore, India',
      salary: '₹15-25 LPA',
      type: 'Full-time'
    },
    {
      title: 'Data Scientist',
      company: 'Analytics Inc',
      location: 'Mumbai, India',
      salary: '₹20-30 LPA',
      type: 'Full-time'
    },
    {
      title: 'Frontend Developer',
      company: 'Design Studio',
      location: 'Remote',
      salary: '₹10-18 LPA',
      type: 'Remote'
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
            <div className="hidden md:flex items-center gap-4">
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
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <MobileNav />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative container mx-auto px-6 md:px-10 py-12 md:py-16 text-center">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">AI-Powered Job Aggregation Platform</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 dark:from-slate-100 dark:via-blue-200 dark:to-indigo-100 bg-clip-text text-transparent leading-tight">
            Find Your Dream Job Across Every Platform — In One Search
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto">
            JobScout aggregates jobs from multiple job portals using AI-powered search, real-time updates, and intelligent matching — so you never miss the right opportunity.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap mb-8">
            <Link href="/jobs">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-600 text-white text-base px-8 py-6 shadow-lg hover:shadow-xl transition-all">
                Browse Jobs <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/profile">
              <Button size="lg" variant="outline" className="text-base px-8 py-6 border-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                Upload Resume
              </Button>
            </Link>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            No credit card required · Free forever · Trusted by job seekers
          </p>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="relative container mx-auto px-6 md:px-10 pb-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 rounded-xl p-4 text-center border border-slate-200/50 dark:border-slate-700/50">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Powered by</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Adzuna, JSearch, Jooble</p>
            </div>
            <div className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 rounded-xl p-4 text-center border border-slate-200/50 dark:border-slate-700/50">
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">10,000+</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Jobs indexed</p>
            </div>
            <div className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 rounded-xl p-4 text-center border border-slate-200/50 dark:border-slate-700/50">
              <p className="text-sm font-semibold text-green-600 dark:text-green-400">Every 6 hours</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Updated</p>
            </div>
            <div className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 rounded-xl p-4 text-center border border-slate-200/50 dark:border-slate-700/50">
              <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">India-first</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Job discovery</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id='features' className="relative container mx-auto px-6 md:px-10 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Why Choose JobScout?
          </h2>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300">
            Everything you need to find your next opportunity
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
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

      {/* How It Works Section */}
      <section id='how-it-works' className="relative container mx-auto px-6 md:px-10 py-12 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900/50 dark:to-blue-900/30 rounded-3xl my-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            How JobScout Works
          </h2>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300">
            From data collection to personalized results in 4 simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {howItWorks.map((step, index) => (
            <div key={index} className="relative">
              <Card className="backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl hover:border-blue-500 dark:hover:border-blue-400 hover:scale-105 transition-all duration-300 h-full">
                <CardContent className="p-6 text-center">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    {step.step}
                  </div>
                  <div className="mt-6 mb-4 flex justify-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                      {step.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-slate-100">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* Built For Section */}
      <section className="relative container mx-auto px-6 md:px-10 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Built For Every Job Seeker
          </h2>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300">
            No matter where you are in your career journey
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {userTypes.map((type, index) => (
            <Card key={index} className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 bg-gradient-to-br ${type.gradient} rounded-2xl flex items-center justify-center text-white mb-4 mx-auto`}>
                  {type.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {type.title}
                </h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id='tech' className="relative container mx-auto px-6 md:px-10 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Tech Behind JobScout
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
            Designed with scalability, performance, and real-world architecture in mind.
          </p>
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {techStack.map((tech, index) => (
              <Badge key={index} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-medium">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Jobs Preview Section */}
      <section className="relative container mx-auto px-6 md:px-10 py-12 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-3xl my-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Trending Jobs Right Now
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Hot opportunities waiting for you
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {sampleJobs.map((job, index) => (
            <Card key={index} className="backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <Badge className="mb-3 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  {job.type}
                </Badge>
                <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-slate-100">
                  {job.title}
                </h3>
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span>{job.company}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-semibold text-green-600 dark:text-green-400">{job.salary}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link href="/trending">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-600 text-white">
              All Trending Jobs <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative container mx-auto px-6 md:px-10 py-12">
        <Card className="relative backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border border-slate-200/50 dark:border-slate-700/50 text-slate-900 dark:text-white shadow-2xl overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 dark:from-blue-600/20 dark:via-purple-600/20 dark:to-pink-600/20"></div>
          <div className="absolute inset-0 opacity-20 dark:opacity-30">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-blob animation-delay-4000"></div>
          </div>
          {/* Subtle dot pattern overlay */}
          <div className="absolute inset-0 opacity-5 dark:opacity-10" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          
          <CardContent className="p-12 md:p-16 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100/80 dark:bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-blue-200/50 dark:border-white/20">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-300" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-100">Start Your Journey Today</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
              Your Job Search, Simplified
            </h2>
            <p className="text-lg md:text-xl mb-8 text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Stop jumping between job portals. Let JobScout bring every opportunity to you.
            </p>
            <Link href="/auth/signup">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-600 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white dark:from-white dark:to-white text-base px-10 py-6 shadow-lg hover:shadow-xl transition-all font-semibold">
                Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="relative backdrop-blur-md bg-slate-900/90 dark:bg-slate-950/90 text-white py-10 mt-12 border-t border-slate-700/50">
        <div className="container mx-auto px-6 md:px-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">JobScout</span>
              </div>
              <p className="text-sm text-slate-400">
                AI-powered job aggregation platform bringing opportunities from everywhere to you.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/jobs" className="hover:text-white transition-colors">Browse Jobs</Link></li>
                <li><Link href="/trending" className="hover:text-white transition-colors">Trending</Link></li>
                <li><Link href="/profile" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">About</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#tech" className="hover:text-white transition-colors">Technology</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex gap-4">
                <a href="https://github.com/abhinavpramanik" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="https://www.linkedin.com/in/abhinav-pramanik" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="mailto:abhinavatcode.com" className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors">
                  <Mail className="w-5 h-5" />
                </a>
                <a href="https://instagram.com/abhinavpramanik" target="_blank" className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors">
                  <InstagramIcon className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 text-center">
            <p className="text-sm text-slate-400">
              Built as a full-stack engineering project demonstrating real-world job aggregation architecture.
            </p>
            <p className="font-semibold mt-2">&copy; 2026 JobScout - Created with ❤️ by Abhinav Pramanik</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
