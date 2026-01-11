import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Job, JobResponse } from '@/types/job';
import JobActions from '@/components/JobActions';

async function getJob(id: string): Promise<Job | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/jobs/${id}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const data: JobResponse = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching job:', error);
    return null;
  }
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getJob(id);

  if (!job) {
    notFound();
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
