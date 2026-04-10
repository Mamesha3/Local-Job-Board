'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { NotificationBell } from '@/components/NotificationBell';
import { useJobs, useJob } from '@/hooks/useJobs';
import { useUserProfile, useUpdateUserProfile } from '@/hooks/useUsers';
import { useCompany } from '@/hooks/useCompanies';
import { useApplicationsBySeeker } from '@/hooks/useApplications';
import { useSavedJobs, useUnsaveJob } from '@/hooks/useSavedJobs';
import { useDefaultResume, useSaveDefaultResume } from '@/hooks/useResumes';
import { uploadProfilePicture } from '@/services/users';
import Link from 'next/link';
import { JobCard } from '@/components/jobs/JobCard';
import { 
  Briefcase, 
  Heart, 
  FileText, 
  Upload, 
  CheckCircle, 
  Clock, 
  XCircle,
  Loader2,
  Building,
  Sparkles,
  Download,
  Trash2,
  User,
  Mail,
  Phone,
  MapPin,
  Link as LinkIcon,
  Edit3,
  Save,
  X
} from 'lucide-react';

function ApplicationStatus({ status }: { status: string }) {
  const styles = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    reviewed: 'bg-blue-100 text-blue-700 border-blue-200',
    accepted: 'bg-green-100 text-green-700 border-green-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
  };

  const icons = {
    pending: <Clock className="w-4 h-4" />,
    reviewed: <CheckCircle className="w-4 h-4" />,
    accepted: <CheckCircle className="w-4 h-4" />,
    rejected: <XCircle className="w-4 h-4" />,
  };

  return (
    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
      {icons[status as keyof typeof icons]}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function SavedJobItem({ savedJob, seekerId }: { savedJob: { jobId: string; $id: string }; seekerId: string }) {
  const { data: job } = useJob(savedJob.jobId);
  const { data: company } = useCompany(job?.companyId || '');
  const unsaveJob = useUnsaveJob();

  if (!job) return null;

  const handleUnsave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    unsaveJob.mutate({ savedJobId: savedJob.$id, seekerId, jobId: savedJob.jobId });
  };

  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="bg-white p-5 rounded-xl border border-gray-200/60 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-3">
        <Link href={`/jobs/${job.$id}`} className="block group flex-1 min-w-0">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
              <Building className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{job.title}</h4>
              {company && (
                <p className="text-sm text-gray-500 mt-1">{company.name}</p>
              )}
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                {job.location}
              </p>
            </div>
          </div>
        </Link>
        <button
          onClick={handleUnsave}
          disabled={unsaveJob.isPending}
          className="p-2 text-pink-500 hover:bg-pink-50 rounded-lg transition-colors shrink-0"
          title="Remove from saved"
        >
          <Heart className="w-5 h-5 fill-current" />
        </button>
      </div>
    </motion.div>
  );
}

export default function SeekerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'applications' | 'saved' | 'resume' | 'profile'>('applications');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: applications, isLoading: appsLoading } = useApplicationsBySeeker(user?.$id || '');
  const { data: savedJobs, isLoading: savedLoading } = useSavedJobs(user?.$id || '');
  const { data: defaultResume, isLoading: resumeLoading } = useDefaultResume(user?.$id || '');
  const saveResume = useSaveDefaultResume();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && user) {
      await saveResume.mutateAsync({ seekerId: user.$id, file });
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
        <Navbar role="seeker" />
        <div className="flex justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
          />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
        <Navbar role="seeker" />
        <div className="flex justify-center py-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-4">Please sign in to view your dashboard</p>
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
            >
              Sign in
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
      <Navbar role="seeker" />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Dashboard</h1>
                  <p className="text-gray-500">Manage your job search and applications</p>
                </div>
              </div>
              {user && <NotificationBell userId={user.$id} />}
            </div>
          </motion.div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{applications?.length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Saved Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{savedJobs?.length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Resume Status</p>
                <p className="text-lg font-bold text-gray-900">{defaultResume ? 'Uploaded' : 'Not Set'}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Modern Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden"
        >
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {[
              { id: 'applications', label: 'My Applications', icon: Briefcase, count: applications?.length },
              { id: 'saved', label: 'Saved Jobs', icon: Heart, count: savedJobs?.length },
              { id: 'resume', label: 'My Resume', icon: FileText },
              { id: 'profile', label: 'My Profile', icon: User },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center cursor-pointer gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* Applications Tab */}
              {activeTab === 'applications' && (
                <motion.div
                  key="applications"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {appsLoading ? (
                    <div className="flex justify-center py-12">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
                      />
                    </div>
                  ) : applications?.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Briefcase className="w-10 h-10 text-gray-400" />
                      </div>
                      <p className="text-gray-600 mb-4">You haven't applied to any jobs yet</p>
                      <Link
                        href="/jobs"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-lg shadow-indigo-500/30"
                      >
                        <Sparkles className="w-4 h-4" />
                        Browse Jobs
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {applications?.map((app) => (
                        <ApplicationRow key={app.$id} application={app} />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Saved Jobs Tab */}
              {activeTab === 'saved' && (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {savedLoading ? (
                    <div className="flex justify-center py-12">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 border-4 border-pink-200 border-t-pink-600 rounded-full"
                      />
                    </div>
                  ) : savedJobs?.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-10 h-10 text-gray-400" />
                      </div>
                      <p className="text-gray-600 mb-4">No saved jobs yet</p>
                      <Link
                        href="/jobs"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-colors font-medium shadow-lg shadow-pink-500/30"
                      >
                        <Sparkles className="w-4 h-4" />
                        Browse Jobs
                      </Link>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {savedJobs?.map((savedJob) => (
                        <SavedJobItem key={savedJob.$id} savedJob={savedJob} seekerId={user.$id} />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <SeekerProfileForm userId={user.$id} />
                </motion.div>
              )}

              {/* Resume Tab */}
              {activeTab === 'resume' && (
                <motion.div
                  key="resume"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="max-w-2xl mx-auto">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      Default Resume
                    </h3>
                    
                    {resumeLoading ? (
                      <div className="flex justify-center py-8">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full"
                        />
                      </div>
                    ) : defaultResume ? (
                      <div className="flex items-center justify-between p-6 bg-green-50 rounded-xl border border-green-200">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                            <CheckCircle className="w-7 h-7 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{defaultResume.fileName}</p>
                            <p className="text-sm text-gray-500">
                              Uploaded {new Date(defaultResume.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-gray-500 cursor-pointer hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                            <Download className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={saveResume.isPending}
                            className="px-4 py-2 bg-indigo-600 cursor-pointer text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
                          >
                            Update
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Upload className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="text-gray-600 mb-2 font-medium">Upload your resume</p>
                        <p className="text-gray-400 text-sm mb-6">For 1-click job applications</p>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={saveResume.isPending}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-lg shadow-indigo-500/30 disabled:opacity-50"
                        >
                          {saveResume.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 cursor-pointer" />
                              Upload Resume
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <p className="text-xs text-gray-400 mt-6 text-center">
                      Supported formats: PDF, DOC, DOCX • Max file size: 5MB
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function ApplicationRow({ application }: { application: { jobId: string; status: string; $createdAt: string; coverLetter?: string } }) {
  const { data: job } = useJob(application.jobId);
  const { data: company } = useCompany(job?.companyId || '');

  if (!job) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-xl border border-gray-200/60 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <Link href={`/jobs/${job.$id}`} className="group">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{job.title}</h3>
          </Link>
          {company && (
            <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
              <Building className="w-4 h-4" />
              {company.name}
            </p>
          )}
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              {job.location}
            </span>
            <span>•</span>
            <span>Applied {new Date(application.$createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <ApplicationStatus status={application.status} />
      </div>
    </motion.div>
  );
}

function SeekerProfileForm({ userId }: { userId: string }) {
  const { data: profile, isLoading } = useUserProfile(userId);
  const updateProfile = useUpdateUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    bio: '',
    location: '',
    linkedIn: '',
    portfolio: '',
  });

  // Initialize form when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        email: profile.email || '',
        bio: profile.bio || '',
        location: profile.location || '',
        linkedIn: profile.linkedIn || '',
        portfolio: profile.portfolio || '',
      });
    }
  }, [profile]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Profile not found</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile.mutateAsync({ userId, data: formData });
    setIsEditing(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-600" />
          My Profile
        </h3>
        {!isEditing ? (
          <button
            onClick={() => {
              setFormData({
                fullName: profile.fullName || '',
                phone: profile.phone || '',
                email: profile.email || '',
                bio: profile.bio || '',
                location: profile.location || '',
                linkedIn: profile.linkedIn || '',
                portfolio: profile.portfolio || '',
              });
              setIsEditing(true);
            }}
            className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 font-medium text-sm"
          >
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={updateProfile.isPending}
              className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm disabled:opacity-50"
            >
              {updateProfile.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4 cursor-pointer" />
              )}
              Save
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <form className="space-y-4">
          {/* Profile Picture Upload */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center">
              {profile?.profilePictureId ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.replace('/v1', '')}/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${profile.profilePictureId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-indigo-600" />
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                id="profilePicture"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file && profile) {
                    try {
                      const uploaded = await uploadProfilePicture(file);
                      await updateProfile.mutateAsync({
                        userId: profile.$id,
                        data: { profilePictureId: uploaded.$id }
                      });
                    } catch (err) {
                      console.error('Failed to upload profile picture:', err);
                    }
                  }
                }}
              />
              <label
                htmlFor="profilePicture"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 cursor-pointer text-sm font-medium"
              >
                <Upload className="w-4 h-4 cursor-pointer" />
                Change Photo
              </label>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, Country"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio / Summary</label>
            <textarea
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell employers about yourself..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
              <input
                type="url"
                value={formData.linkedIn}
                onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio Website</label>
              <input
                type="url"
                value={formData.portfolio}
                onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            This information will be visible to companies when you apply for jobs.
          </p>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
            {(profile as unknown as { profilePictureId?: string })?.profilePictureId ? (
              <img
                src={`${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.replace('/v1', '')}/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${(profile as unknown as { profilePictureId?: string }).profilePictureId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`}
                alt={profile.fullName}
                className="w-16 h-16 rounded-full object-cover shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                <User className="w-8 h-8 text-indigo-600" />
              </div>
            )}
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-lg">{profile.fullName}</h4>
              {profile.email && (
                <p className="text-gray-600 flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4" />
                  {profile.email}
                </p>
              )}
              {profile.phone && (
                <p className="text-gray-600 flex items-center gap-2 mt-1">
                  <Phone className="w-4 h-4" />
                  {profile.phone}
                </p>
              )}
              {profile.location && (
                <p className="text-gray-600 flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4" />
                  {profile.location}
                </p>
              )}
            </div>
          </div>

          {profile.bio && (
            <div className="p-4 bg-white border border-gray-200 rounded-xl">
              <h5 className="font-medium text-gray-900 mb-2">About</h5>
              <p className="text-gray-600 text-sm leading-relaxed">{profile.bio}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {profile.linkedIn && (
              <a
                href={profile.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium"
              >
                <LinkIcon className="w-4 h-4" />
                LinkedIn
              </a>
            )}
            {profile.portfolio && (
              <a
                href={profile.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 text-sm font-medium"
              >
                <LinkIcon className="w-4 h-4" />
                Portfolio
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
