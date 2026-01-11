'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Bookmark, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface JobActionsProps {
  jobId: string;
  applyLink: string;
  source: string;
}

export default function JobActions({ jobId, applyLink, source }: JobActionsProps) {
  const { data: session } = useSession();
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchJobStatus();
    }
  }, [session, jobId]);

  const fetchJobStatus = async () => {
    try {
      const res = await fetch(`/api/user/jobs/status?jobId=${jobId}`);
      if (res.ok) {
        const data = await res.json();
        setSaved(data.saved);
        setApplied(data.applied);
      }
    } catch (error) {
      console.error('Error fetching job status:', error);
    }
  };

  const handleSave = async () => {
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
        body: JSON.stringify({ jobId }),
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

  const handleApply = async () => {
    if (!session?.user) {
      window.location.href = '/auth/signin';
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/user/jobs/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });

      if (res.ok) {
        setApplied(true);
        // Open apply link in new tab
        window.open(applyLink, '_blank');
      }
    } catch (error) {
      console.error('Error marking as applied:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <a
          href={applyLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            if (session?.user && !applied) {
              e.preventDefault();
              handleApply();
            }
          }}
          className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-600 text-white px-8 py-3 rounded-xl text-base font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex-1"
        >
          {applied ? (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Applied on {source}
            </>
          ) : (
            <>
              Apply on {source}
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </>
          )}
        </a>
        
        <Button
          onClick={handleSave}
          disabled={loading}
          variant="outline"
          size="lg"
          className={`px-8 ${saved ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700' : ''}`}
        >
          <Bookmark className={`w-5 h-5 mr-2 ${saved ? 'fill-current' : ''}`} />
          {saved ? 'Saved' : 'Save Job'}
        </Button>
      </div>
      
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
        {applied 
          ? `You've marked this job as applied. Track your application progress in your profile.`
          : `You will be redirected to ${source} to complete your application.`
        }
      </p>
    </div>
  );
}
