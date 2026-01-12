'use client';

import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Job } from '@/types/job';
import JobActions from '@/components/JobActions';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { calculateSkillMatch } from '@/lib/skillMatcher';
import { extractSkillsFromText } from '@/lib/skillsDatabase';

export default function JobDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [matchedSkills, setMatchedSkills] = useState<string[]>([]);
  const [missingSkills, setMissingSkills] = useState<string[]>([]);
  const [matchScore, setMatchScore] = useState<number>(0);

  useEffect(() => {
    const fetchJobAndSkills = async () => {
      try {
        // Fetch job details
        const jobResponse = await fetch(`/api/jobs/${params.id}`, {
          cache: 'no-store',
        });

        if (!jobResponse.ok) {
          notFound();
          return;
        }

        const jobData = await jobResponse.json();
        if (!jobData.success) {
          notFound();
          return;
        }

        setJob(jobData.data);

        // Extract skills from job
        const jobText = `${jobData.data.title} ${jobData.data.description} ${jobData.data.experience}`;
        const extractedSkills = extractSkillsFromText(jobText);
        setRequiredSkills(extractedSkills);

        // Fetch user skills if logged in
        if (session?.user) {
          const profileResponse = await fetch('/api/user/profile');
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            const skills = profileData.user?.skills || [];
            setUserSkills(skills);

            // Calculate match
            if (skills.length > 0 && extractedSkills.length > 0) {
              const matchResult = calculateSkillMatch(skills, extractedSkills);
              setMatchedSkills(matchResult.matchedSkills);
              setMissingSkills(matchResult.missingSkills);
              setMatchScore(matchResult.matchScore);
            }
          }
        }
      } catch (error) {
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchJobAndSkills();
  }, [params.id, session]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!job) {
    notFound();
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Header */}
      <header className="backdrop-blur-md bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white shadow-md border-b border-white/20">
        <div className="container mx-auto px-6 md:px-8 py-6">
          <Link href="/jobs" className="text-blue-100 hover:text-white mb-2 inline-block transition-colors">
            ← Back to Jobs
          </Link>
          <h1 className="text-3xl font-bold">Job Details</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 md:px-8 py-8 max-w-5xl">
        <div className="backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-xl p-6 md:p-10">
          {/* Job Header */}
          <div className="border-b border-slate-200 dark:border-slate-700 pb-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{job.title}</h1>
              <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-md">
                {job.source}
              </span>
            </div>
            <h2 className="text-xl text-slate-700 dark:text-slate-300 font-medium mb-4">{job.company}</h2>
            
            {/* Job Meta Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center text-slate-600 dark:text-slate-400">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium">Location:</span>
                <span className="ml-2">{job.location}</span>
              </div>

              <div className="flex items-center text-slate-600 dark:text-slate-400">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Salary:</span>
                <span className="ml-2">
                  {job.salary === 'Not disclosed' ? (
                    <span className="italic opacity-75">Not disclosed by employer</span>
                  ) : (
                    job.salary
                  )}
                </span>
              </div>

              <div className="flex items-center text-slate-600 dark:text-slate-400">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">Job Type:</span>
                <span className="ml-2">{job.jobType}</span>
              </div>

              <div className="flex items-center text-slate-600 dark:text-slate-400">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <span className="font-medium">Experience:</span>
                <span className="ml-2">{job.experience}</span>
              </div>

              <div className="flex items-center text-slate-600 dark:text-slate-400">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">Posted:</span>
                <span className="ml-2">{new Date(job.postedDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Job Description</h3>
            <div 
              className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: job.description || 'No description available.' 
              }}
            />
          </div>

          {/* Required Skills Section */}
          {requiredSkills.length > 0 && (
            <div className="mb-8 border-t border-slate-200 dark:border-slate-700 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Required Skills</h3>
                {session?.user && userSkills.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Your Match:</span>
                    <span className={`text-lg font-bold ${
                      matchScore >= 70 ? 'text-green-600 dark:text-green-400' :
                      matchScore >= 50 ? 'text-blue-600 dark:text-blue-400' :
                      matchScore >= 30 ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {matchScore}%
                    </span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {requiredSkills.map((skill, index) => {
                  const isMatched = matchedSkills.includes(skill);
                  const showStatus = session?.user && userSkills.length > 0;

                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                        showStatus
                          ? isMatched
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {showStatus && (
                        isMatched ? (
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                        )
                      )}
                      <span className={`text-sm font-medium ${
                        showStatus
                          ? isMatched
                            ? 'text-green-900 dark:text-green-100'
                            : 'text-red-900 dark:text-red-100'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {skill}
                      </span>
                    </div>
                  );
                })}
              </div>

              {!session?.user && (
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 italic">
                  Sign in and upload your resume to see which skills you match!
                </p>
              )}

              {session?.user && userSkills.length === 0 && (
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 italic">
                  Upload your resume in your profile to see which skills you match!
                </p>
              )}
            </div>
          )}

          {/* Apply and Save Actions */}
          <JobActions jobId={job._id} applyLink={job.applyLink} source={job.source} />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative mt-12 backdrop-blur-md bg-gradient-to-r from-slate-900/90 via-blue-900/90 to-indigo-900/90 dark:from-slate-950/90 dark:via-blue-950/90 dark:to-indigo-950/90 text-white border-t border-slate-700/50">
        <div className="container mx-auto px-6 md:px-8 py-8 text-center">
          <p className="font-semibold">&copy; 2026 JobScout - Job Aggregation Platform</p>
          <p className="text-sm text-slate-300 dark:text-slate-400 mt-2">Created with ❤️ by Abhinav Pramanik</p>
        </div>
      </footer>
    </div>
  );
}
