'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import FileUpload from '@/components/FileUpload';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Bookmark, 
  CheckCircle, 
  Loader2,
  User,
  FileText,
  Settings,
  Upload,
  Camera,
  Download,
  Trash2,
  Edit,
  X,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  postedDate: string;
  description: string;
  source: string;
}

interface UserProfile {
  name: string;
  email: string;
  profilePicUrl?: string;
  resumeUrl?: string;
  savedJobsCount: number;
  appliedJobsCount: number;
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<Job[]>([]);
  const [activeTab, setActiveTab] = useState<'saved' | 'applied'>('saved');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('');
  const [showProfilePicModal, setShowProfilePicModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [parsing, setParsing] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchUserData();
    }
  }, [session]);

  const fetchUserData = async () => {
    try {
      const [jobsRes, profileRes] = await Promise.all([
        fetch('/api/user/jobs'),
        fetch('/api/user/profile')
      ]);

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setSavedJobs(jobsData.savedJobs || []);
        setAppliedJobs(jobsData.appliedJobs || []);
      }

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData.user);
        setName(profileData.user.name);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        await update({ name });
        setEditMode(false);
        fetchUserData();
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUploadSuccess = (url: string, type: 'profilePic' | 'resume') => {
    // Refresh user data to get updated URLs
    fetchUserData();
  };

  const handleFileDelete = (type: 'profilePic' | 'resume') => {
    // Refresh user data after deletion
    fetchUserData();
  };

  const handleResumeDownload = async () => {
    if (!profile?.resumeUrl) return;
    
    try {
      const response = await fetch(profile.resumeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${profile.name.replace(/\s+/g, '_')}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading resume:', error);
    }
  };

  const handleResumePreview = () => {
    if (profile?.resumeUrl) {
      window.open(profile.resumeUrl, '_blank');
    }
  };

  const handleManualParsing = async () => {
    if (!profile?.resumeUrl) {
      return;
    }

    setParsing(true);
    try {
      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeUrl: profile.resumeUrl }),
      });

      if (response.ok) {
        fetchUserData();
      }
    } catch (error) {
      // Silent error handling
    } finally {
      setParsing(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-80 min-h-screen border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="p-6 sticky top-0">
            {/* Profile Picture */}
            <div className="relative mb-6">
              <div className="w-32 h-32 mx-auto relative">
                {profile?.profilePicUrl ? (
                  <Image
                    src={profile.profilePicUrl}
                    alt={name}
                    fill
                    className="rounded-full object-cover border-4 border-blue-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center border-4 border-blue-500">
                    <span className="text-4xl font-bold text-white">
                      {name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => setShowProfilePicModal(true)}
                  className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Profile Info */}
            <div className="text-center mb-6">
              {editMode ? (
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mb-2 text-center font-semibold"
                />
              ) : (
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  {name}
                </h2>
              )}
              <p className="text-sm text-slate-600 dark:text-slate-400">{session.user?.email}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{savedJobs.length}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Saved</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{appliedJobs.length}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Applied</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2 mb-6">
              <button
                onClick={() => setActiveTab('saved')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'saved'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Bookmark className="w-5 h-5" />
                <span className="font-medium">Saved Jobs</span>
              </button>
              <button
                onClick={() => setActiveTab('applied')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'applied'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Applied Jobs</span>
              </button>
            </nav>

            {/* Resume Section */}
            <Card className="mb-6 bg-white/80 dark:bg-slate-900/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Resume
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {profile?.resumeUrl ? (
                  <div className="space-y-3">
                    {/* Resume Preview Card */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg p-4 border-2 border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-center mb-4">
                        <div className="bg-blue-100 dark:bg-blue-900/50 p-4 rounded-full">
                          <FileText className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <p className="text-center text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
                        Resume Available
                      </p>
                      
                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 border-blue-300 dark:border-blue-700"
                          onClick={handleResumeDownload}
                        >
                          <Eye className="w-4 h-4 mr-0" />
                          Preview
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className=" h-10 bg-white dark:bg-slate-800 hover:bg-green-50 dark:hover:bg-green-900/30 border-green-300 dark:border-green-700 "
                          onClick={handleResumeDownload}
                        >
                          <Download className="w-4 h-4 mr-0" />
                          Download
                        </Button>
                      </div>

                      {/* Parse Resume Button */}
                      <Button
                        onClick={handleManualParsing}
                        disabled={parsing}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white mt-2"
                        size="sm"
                      >
                        {parsing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Parsing...
                          </>
                        ) : (
                          <>
                            <Settings className="w-4 h-4 mr-2" />
                            Extract Skills
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {/* Update Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-10 border-dashed border-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      onClick={() => setShowResumeModal(true)}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Update Resume
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="flex items-center justify-center mb-4">
                      <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full">
                        <FileText className="w-10 h-10 text-slate-400" />
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                      No resume uploaded yet
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-indigo-600 hover:to-purple-600 border-0"
                      onClick={() => setShowResumeModal(true)}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Resume
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-2">
              {editMode ? (
                <>
                  <Button
                    onClick={handleProfileUpdate}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
                    disabled={loading}
                  >
                    Save Changes
                  </Button>
                  <Button
                    onClick={() => {
                      setEditMode(false);
                      setName(profile?.name || '');
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setEditMode(true)}
                  variant="outline"
                  className="w-full"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
              <Link href="/jobs" className="block">
                <Button variant="outline" className="w-full">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Browse Jobs
                </Button>
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {activeTab === 'saved' ? 'Saved Jobs' : 'Applied Jobs'}
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {activeTab === 'saved' 
                  ? 'Jobs you\'ve bookmarked for later'
                  : 'Track your job applications'
                }
              </p>
            </div>

            {/* Jobs Grid */}
            {activeTab === 'saved' && (
              savedJobs.length === 0 ? (
                <Card className="backdrop-blur-sm bg-white/90 dark:bg-slate-900/90">
                  <CardContent className="py-16 text-center">
                    <Bookmark className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      No saved jobs yet
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      Start browsing and save jobs you`re interested in
                    </p>
                    <Link href="/jobs">
                      <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                        Browse Jobs
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {savedJobs.map((job) => (
                    <Card key={job._id} className="backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 hover:scale-105 transition-transform">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg line-clamp-2">{job.title}</CardTitle>
                          <Badge className="bg-gradient-to-r from-blue-500 to-purple-500">
                            {job.source}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
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
              )
            )}

            {activeTab === 'applied' && (
              appliedJobs.length === 0 ? (
                <Card className="backdrop-blur-sm bg-white/90 dark:bg-slate-900/90">
                  <CardContent className="py-16 text-center">
                    <CheckCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      No applications yet
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      Start applying to jobs and track them here
                    </p>
                    <Link href="/jobs">
                      <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                        Start Applying
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {appliedJobs.map((job) => (
                    <Card key={job._id} className="backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 hover:scale-105 transition-transform border-l-4 border-green-500">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg line-clamp-2">{job.title}</CardTitle>
                          <Badge className="bg-gradient-to-r from-green-600 to-emerald-600">
                            Applied
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
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
              )
            )}
          </div>
        </main>
      </div>

      {/* Profile Picture Upload Modal */}
      {showProfilePicModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Upload Profile Picture
              </h2>
              <button
                onClick={() => setShowProfilePicModal(false)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <FileUpload
                type="profilePic"
                currentUrl={profile?.profilePicUrl}
                onUploadSuccess={(url) => handleFileUploadSuccess(url, 'profilePic')}
                onDelete={() => handleFileDelete('profilePic')}
              />
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-700">
              <Button
                onClick={() => setShowProfilePicModal(false)}
                variant="outline"
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Resume Upload Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Upload Resume
              </h2>
              <button
                onClick={() => setShowResumeModal(false)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <FileUpload
                type="resume"
                currentUrl={profile?.resumeUrl}
                onUploadSuccess={(url) => handleFileUploadSuccess(url, 'resume')}
                onDelete={() => handleFileDelete('resume')}
              />
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-700">
              <Button
                onClick={() => setShowResumeModal(false)}
                variant="outline"
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
