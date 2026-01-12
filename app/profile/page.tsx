'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import FileUpload from '@/components/FileUpload';
import { calculateSkillMatch } from '@/lib/skillMatcher';
import { extractSkillsFromText } from '@/lib/skillsDatabase';
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
  Eye,
  XCircle
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
  const [userSkills, setUserSkills] = useState<string[]>([]);

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
        setUserSkills(profileData.user?.skills || []);
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

  const handleRemoveAppliedJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/user/jobs/apply`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });

      if (response.ok) {
        setAppliedJobs(appliedJobs.filter(job => job._id !== jobId));
      }
    } catch (error) {
      // Silent error handling
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
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="hidden lg:block lg:w-80 lg:min-h-screen border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="p-4 sm:p-6 lg:sticky lg:top-0">
            {/* Profile Picture */}
            <div className="relative mb-4 sm:mb-6">
              <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto relative">
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
            <div className="text-center mb-4 sm:mb-6">
              {editMode ? (
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mb-2 text-center font-semibold text-sm sm:text-base"
                />
              ) : (
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  {name}
                </h2>
              )}
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{session.user?.email}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 sm:p-3 rounded-lg text-center">
                <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{savedJobs.length}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Saved</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-2 sm:p-3 rounded-lg text-center">
                <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{appliedJobs.length}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Applied</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2 mb-4 sm:mb-6">
              <button
                onClick={() => setActiveTab('saved')}
                className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all ${
                  activeTab === 'saved'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base font-medium">Saved Jobs</span>
              </button>
              <button
                onClick={() => setActiveTab('applied')}
                className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all ${
                  activeTab === 'applied'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base font-medium">Applied Jobs</span>
              </button>
            </nav>

            {/* Resume Section */}
            <Card className="mb-4 sm:mb-6 bg-white/80 dark:bg-slate-900/80">
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
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
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white mt-2 text-xs sm:text-sm h-8 sm:h-9"
                        size="sm"
                      >
                        {parsing ? (
                          <>
                            <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                            <span className="text-xs sm:text-sm">Parsing...</span>
                          </>
                        ) : (
                          <>
                            <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            <span className="text-xs sm:text-sm">Extract Skills</span>
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {/* Update Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-8 sm:h-10 text-xs sm:text-sm border-dashed border-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      onClick={() => setShowResumeModal(true)}
                    >
                      <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Update Resume
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <div className="flex items-center justify-center mb-3 sm:mb-4">
                      <div className="bg-slate-100 dark:bg-slate-800 p-3 sm:p-4 rounded-full">
                        <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-3 sm:mb-4">
                      No resume uploaded yet
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-8 sm:h-10 text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-indigo-600 hover:to-purple-600 border-0"
                      onClick={() => setShowResumeModal(true)}
                    >
                      <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
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
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-sm sm:text-base h-9 sm:h-10"
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
                    className="w-full text-sm sm:text-base h-9 sm:h-10"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setEditMode(true)}
                  variant="outline"
                  className="w-full text-sm sm:text-base h-9 sm:h-10"
                >
                  <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Edit Profile
                </Button>
              )}
              <Link href="/jobs" className="block">
                <Button variant="outline" className="w-full text-sm sm:text-base h-9 sm:h-10">
                  <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Browse Jobs
                </Button>
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Mobile Profile Header - Only visible on mobile */}
            <div className="lg:hidden mb-6">
              <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-16 h-16">
                      {profile?.profilePicUrl ? (
                        <Image
                          src={profile.profilePicUrl}
                          alt={name}
                          fill
                          className="rounded-full object-cover border-2 border-blue-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center border-2 border-blue-500">
                          <span className="text-xl font-bold text-white">
                            {name?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">{name}</h2>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{session.user?.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-center">
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{savedJobs.length}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Saved</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg text-center">
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">{appliedJobs.length}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Applied</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => setActiveTab('saved')}
                      className={`text-xs h-9 ${
                        activeTab === 'saved'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Bookmark className="w-3 h-3 mr-1" />
                      Saved
                    </Button>
                    <Button
                      onClick={() => setActiveTab('applied')}
                      className={`text-xs h-9 ${
                        activeTab === 'applied'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Applied
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Header */}
            <div className="mb-4 sm:mb-6 md:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-2">
                {activeTab === 'saved' ? 'Saved Jobs' : 'Applied Jobs'}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
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
                  <CardContent className="py-8 sm:py-12 md:py-16 text-center px-4">
                    <Bookmark className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      No saved jobs yet
                    </h3>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4 sm:mb-6">
                      Start browsing and save jobs you`re interested in
                    </p>
                    <Link href="/jobs">
                      <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 w-full sm:w-auto text-sm sm:text-base">
                        Browse Jobs
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {savedJobs.map((job) => {
                    // Calculate match score
                    let matchScore = 0;
                    if (userSkills.length > 0) {
                      const jobText = `${job.title} ${job.description} ${job.company}`;
                      const jobSkills = extractSkillsFromText(jobText);
                      if (jobSkills.length > 0) {
                        const matchResult = calculateSkillMatch(userSkills, jobSkills);
                        matchScore = matchResult.matchScore;
                      }
                    }
                    
                    return (
                    <Card key={job._id} className="backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 hover:scale-105 transition-transform">
                      <CardHeader className="p-4 sm:p-6">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base sm:text-lg line-clamp-2">{job.title}</CardTitle>
                          <div className="flex flex-col gap-1 items-end">
                            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-xs shrink-0">
                              {job.source}
                            </Badge>
                            {userSkills.length > 0 && matchScore > 0 && (
                              <Badge className={`text-xs shrink-0 ${
                                matchScore >= 70 ? 'bg-green-500' :
                                matchScore >= 50 ? 'bg-blue-500' :
                                matchScore >= 30 ? 'bg-yellow-500' :
                                'bg-orange-500'
                              }`}>
                                {matchScore}%
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 sm:space-y-3 p-4 sm:p-6 pt-0">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                          <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                          <span className="truncate">{job.company}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                          <span className="truncate">{job.location}</span>
                        </div>
                        {job.salary && (
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                            <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                            <span className="truncate">{job.salary}</span>
                          </div>
                        )}
                        <Link href={`/jobs/${job._id}`}>
                          <Button variant="outline" className="w-full mt-3 sm:mt-4 text-sm sm:text-base h-9 sm:h-10">
                            View Details
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                    );
                  })}
                </div>
              )
            )}

            {activeTab === 'applied' && (
              appliedJobs.length === 0 ? (
                <Card className="backdrop-blur-sm bg-white/90 dark:bg-slate-900/90">
                  <CardContent className="py-8 sm:py-12 md:py-16 text-center px-4">
                    <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      No applications yet
                    </h3>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4 sm:mb-6">
                      Start applying to jobs and track them here
                    </p>
                    <Link href="/jobs">
                      <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 w-full sm:w-auto text-sm sm:text-base">
                        Start Applying
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {appliedJobs.map((job) => (
                    <Card key={job._id} className="backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 hover:scale-105 transition-transform border-l-4 border-green-500">
                      <CardHeader className="p-4 sm:p-6">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base sm:text-lg line-clamp-2">{job.title}</CardTitle>
                          <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-xs shrink-0">
                            Applied
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 sm:space-y-3 p-4 sm:p-6 pt-0">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                          <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                          <span className="truncate">{job.company}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                          <span className="truncate">{job.location}</span>
                        </div>
                        {job.salary && (
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                            <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                            <span className="truncate">{job.salary}</span>
                          </div>
                        )}
                        <div className="flex gap-2 mt-3 sm:mt-4">
                          <Link href={`/jobs/${job._id}`} className="flex-1">
                            <Button variant="outline" className="w-full text-sm sm:text-base h-9 sm:h-10">
                              View Details
                            </Button>
                          </Link>
                          <Button 
                            variant="destructive" 
                            size="icon"
                            className="h-9 sm:h-10 w-9 sm:w-10 shrink-0"
                            onClick={() => handleRemoveAppliedJob(job._id)}
                            title="Remove from applied"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
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
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                Upload Profile Picture
              </h2>
              <button
                onClick={() => setShowProfilePicModal(false)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6">
              <FileUpload
                type="profilePic"
                currentUrl={profile?.profilePicUrl}
                onUploadSuccess={(url) => handleFileUploadSuccess(url, 'profilePic')}
                onDelete={() => handleFileDelete('profilePic')}
              />
            </div>

            <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-700">
              <Button
                onClick={() => setShowProfilePicModal(false)}
                variant="outline"
                className="w-full text-sm sm:text-base h-9 sm:h-10"
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
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                Upload Resume
              </h2>
              <button
                onClick={() => setShowResumeModal(false)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6">
              <FileUpload
                type="resume"
                currentUrl={profile?.resumeUrl}
                onUploadSuccess={(url) => handleFileUploadSuccess(url, 'resume')}
                onDelete={() => handleFileDelete('resume')}
              />
            </div>

            <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-700">
              <Button
                onClick={() => setShowResumeModal(false)}
                variant="outline"
                className="w-full text-sm sm:text-base h-9 sm:h-10"
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
