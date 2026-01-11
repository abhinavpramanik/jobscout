'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, MapPin, DollarSign, Bookmark, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  postedDate: string;
  description: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<Job[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchUserJobs();
    }
  }, [session]);

  const fetchUserJobs = async () => {
    try {
      const res = await fetch('/api/user/jobs');
      if (res.ok) {
        const data = await res.json();
        setSavedJobs(data.savedJobs || []);
        setAppliedJobs(data.appliedJobs || []);
      }
    } catch (error) {
      console.error('Failed to fetch user jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header */}
        <Card className="mb-8 backdrop-blur-sm bg-white/90 dark:bg-slate-900/90">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {session.user?.name?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  {session.user?.name}
                </CardTitle>
                <p className="text-slate-600 dark:text-slate-400">{session.user?.email}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="backdrop-blur-sm bg-white/90 dark:bg-slate-900/90">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-blue-600" />
                <CardTitle>Saved Jobs</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-blue-600">{savedJobs.length}</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/90 dark:bg-slate-900/90">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <CardTitle>Applied Jobs</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-600">{appliedJobs.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Saved Jobs */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Saved Jobs</h2>
          {savedJobs.length === 0 ? (
            <Card className="backdrop-blur-sm bg-white/90 dark:bg-slate-900/90">
              <CardContent className="py-12 text-center">
                <Bookmark className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400 mb-4">No saved jobs yet</p>
                <Link href="/jobs">
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                    Browse Jobs
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedJobs.map((job) => (
                <Card key={job._id} className="backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 hover:scale-105 transition-transform">
                  <CardHeader>
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Briefcase className="w-4 h-4" />
                      {job.company}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </div>
                    {job.salary && (
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <DollarSign className="w-4 h-4" />
                        {job.salary}
                      </div>
                    )}
                    <Link href={`/jobs/${job._id}`}>
                      <Button variant="outline" className="w-full mt-4">
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Applied Jobs */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Applied Jobs</h2>
          {appliedJobs.length === 0 ? (
            <Card className="backdrop-blur-sm bg-white/90 dark:bg-slate-900/90">
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400 mb-4">No applications yet</p>
                <Link href="/jobs">
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                    Start Applying
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {appliedJobs.map((job) => (
                <Card key={job._id} className="backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 hover:scale-105 transition-transform">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <Badge className="bg-gradient-to-r from-green-600 to-emerald-600">
                        Applied
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Briefcase className="w-4 h-4" />
                      {job.company}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </div>
                    {job.salary && (
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <DollarSign className="w-4 h-4" />
                        {job.salary}
                      </div>
                    )}
                    <Link href={`/jobs/${job._id}`}>
                      <Button variant="outline" className="w-full mt-4">
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
