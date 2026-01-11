import Link from 'next/link';
import { Job } from '@/types/job';
import { MapPin, DollarSign, Briefcase, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 backdrop-blur-sm bg-white/80 border-white/20 hover:scale-105 hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <Link 
              href={`/jobs/${job._id}`}
              className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
            >
              {job.title}
            </Link>
            <p className="text-gray-700 font-semibold mt-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></span>
              {job.company}
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 shadow-lg">
            {job.source}
          </Badge>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-gray-600 text-sm group-hover:text-blue-600 transition-colors">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{job.location}</span>
          </div>

          <div className="flex items-center text-gray-600 text-sm group-hover:text-purple-600 transition-colors">
            <DollarSign className="w-4 h-4 mr-2" />
            <span>{job.salary}</span>
          </div>

          <div className="flex items-center text-gray-600 text-sm group-hover:text-pink-600 transition-colors">
            <Briefcase className="w-4 h-4 mr-2" />
            <span>{job.jobType} • {job.experience}</span>
          </div>
        </div>

        {job.description && (
          <p className="text-gray-600 text-sm mb-5 line-clamp-2">
            {job.description.replace(/<[^>]*>/g, '').substring(0, 150)}...
          </p>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="w-3 h-3 mr-1" />
            <span>{new Date(job.postedDate).toLocaleDateString()}</span>
          </div>
          <Link
            href={`/jobs/${job._id}`}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-pink-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-md hover:shadow-xl"
          >
            View Details
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
