'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Job } from '@/types/job';
import { MapPin, DollarSign, Briefcase, Calendar, Bookmark, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getMatchColor } from '@/lib/skillMatcher';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  const { data: session } = useSession();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchJobStatus();
    }
  }, [session, job._id]);

  const fetchJobStatus = async () => {
    try {
      const res = await fetch(`/api/user/jobs/status?jobId=${job._id}`);
      if (res.ok) {
        const data = await res.json();
        setSaved(data.saved);
      }
    } catch (error) {
      console.error('Error fetching job status:', error);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!session?.user) {
      window.location.href = '/auth/signin';
      return;
    }

    setLoading(true);
    try {
      const method = saved ? 'DELETE' : 'POST';
      const res = await fetch('/api/user/jobs/save', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job._id }),
      });

      if (res.ok) {
        setSaved(!saved);
      }
    } catch (error) {
      console.error('Error saving job:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format date as dd/mm/yyyy
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Get match badge color
  const getMatchBadgeColor = (score: number): string => {
    const color = getMatchColor(score);
    const colorMap: Record<string, string> = {
      green: 'bg-green-500',
      blue: 'bg-blue-500',
      yellow: 'bg-yellow-500',
      orange: 'bg-orange-500',
      red: 'bg-red-500',
    };
    return colorMap[color] || 'bg-gray-500';
  };

  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 border-white/20 dark:border-slate-700/50 hover:scale-105 hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <Link 
              href={`/jobs/${job._id}`}
              className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
            >
              {job.title}
            </Link>
            <p className="text-slate-700 dark:text-slate-300 font-semibold mt-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></span>
              {job.company}
            </p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 shadow-lg">
              {job.source}
            </Badge>
            {/* Match Score Badge */}
            {session && job.matchScore !== undefined && job.matchScore > 0 && (
              <Badge className={`${getMatchBadgeColor(job.matchScore)} text-white border-0 shadow-lg flex items-center gap-1`}>
                <Award className="w-3 h-3" />
                {job.matchScore}% Match
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-slate-600 dark:text-slate-400 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{job.location}</span>
          </div>

          <div className="flex items-center text-slate-600 dark:text-slate-400 text-sm group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>
              {job.salary === 'Not disclosed' ? (
                <span className="italic opacity-75">Salary not disclosed by employer</span>
              ) : (
                job.salary
              )}
            </span>
          </div>

          <div className="flex items-center text-slate-600 dark:text-slate-400 text-sm group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
            <Briefcase className="w-4 h-4 mr-2" />
            <span>{job.jobType} • {job.experience}</span>
          </div>
        </div>

        {job.description && (
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-5 line-clamp-2">
            {job.description.replace(/<[^>]*>/g, '').substring(0, 150)}...
          </p>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-slate-700">
          <div className="flex items-center text-xs text-gray-500 dark:text-slate-400">
            <Calendar className="w-3 h-3 mr-1" />
            <span>{formatDate(job.postedDate)}</span>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={loading}
              variant="outline"
              size="sm"
              className={`${saved ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700' : ''}`}
            >
              <Bookmark className={`w-3 h-3 ${saved ? 'fill-current' : ''}`} />
            </Button>
            <Link
              href={`/jobs/${job._id}`}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg inline-flex items-center gap-2"
            >
              View Details
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
