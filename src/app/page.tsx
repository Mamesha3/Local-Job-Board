'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Briefcase, Building2, Search, Upload, Bell, MapPin, 
  User, LayoutDashboard, Plus, Users, TrendingUp, Clock,
  ChevronRight, Star
} from 'lucide-react';
import { useJobs } from '@/hooks/useJobs';
import { useApplicationsBySeeker, useCompanyApplications } from '@/hooks/useApplications';
import { useJobsByCompany } from '@/hooks/useJobs';
import { useCompanyByOwner } from '@/hooks/useCompanies';
import { JobCard } from '@/components/jobs/JobCard';
import { Navbar } from '@/components/layout/Navbar';
import { useToast } from '@/contexts/ToastContext';

// ==================== GUEST LANDING PAGE ====================
function GuestLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, -50, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -100, 0], y: [0, 100, 0], rotate: [0, -180, -360] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"
        />
      </div>

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Navigation */}
      <nav className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-xl font-bold text-white">
              Local Job Board
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm text-white/80 hover:text-white transition-colors">
                Sign in
              </Link>
              <Link
                href="/register"
                className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-8"
            >
              <Briefcase className="w-10 h-10 text-white" />
            </motion.div>
            
            <h1 className="text-5xl font-bold text-white mb-6">
              Find Local Jobs Near You
            </h1>
            <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
              Connect with local businesses - cafes, construction, retail, and more. 
              Apply with just one click using your resume.
            </p>

            {/* Role Selection Cards */}
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Link href="/register">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all">
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                      <Search className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">I&apos;m Looking for Work</h3>
                    <p className="text-white/70 mb-4">Browse local jobs and apply with 1-click using your resume</p>
                    <span className="inline-flex items-center gap-2 text-white font-medium">
                      Find Jobs <MapPin className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Link href="/register">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all">
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                      <Building2 className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">I&apos;m Hiring</h3>
                    <p className="text-white/70 mb-4">Post jobs and find local talent for your business</p>
                    <span className="inline-flex items-center gap-2 text-white font-medium">
                      Post a Job <Upload className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-20 grid md:grid-cols-3 gap-6"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Local Opportunities</h3>
              <p className="text-white/70 text-sm">Find jobs in your neighborhood from trusted local businesses.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">1-Click Apply</h3>
              <p className="text-white/70 text-sm">Upload your resume once and apply to multiple jobs instantly.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Real-time Updates</h3>
              <p className="text-white/70 text-sm">Get notified instantly when employers review your application.</p>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/10 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <p className="text-center text-white/60 text-sm">
              © 2024 Local Job Board. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

// ==================== SEEKER HOME PAGE ====================
function SeekerHome({ userId }: { userId: string }) {
  const { data: jobs, isLoading: jobsLoading } = useJobs();
  const { data: applications, isLoading: appsLoading } = useApplicationsBySeeker(userId);
  const { showToast } = useToast();

  const recentApplications = applications?.slice(0, 3);
  const featuredJobs = jobs?.filter(j => j.isFeatured).slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="seeker" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-white/80">Find your next local opportunity today.</p>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Link href="/jobs">
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Find Jobs</h3>
              <p className="text-sm text-gray-500 mt-1">Browse available positions</p>
            </motion.div>
          </Link>

          <Link href="/dashboard/seeker">
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <LayoutDashboard className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">My Applications</h3>
              <p className="text-sm text-gray-500 mt-1">
                {appsLoading ? 'Loading...' : `${applications?.length || 0} applications submitted`}
              </p>
            </motion.div>
          </Link>

          <Link href="/dashboard/seeker?tab=resume">
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">My Resume</h3>
              <p className="text-sm text-gray-500 mt-1">Update your profile</p>
            </motion.div>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Featured Jobs */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Featured Jobs</h2>
              <Link href="/jobs" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            {jobsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : featuredJobs && featuredJobs.length > 0 ? (
              <div className="space-y-4">
                {featuredJobs.map((job) => (
                  <JobCard key={job.$id} job={job} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                <p className="text-gray-500">No featured jobs available right now.</p>
                <Link href="/jobs" className="text-indigo-600 hover:text-indigo-700 mt-2 inline-block">
                  Browse all jobs
                </Link>
              </div>
            )}
          </div>

          {/* Recent Applications */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Applications</h2>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              {appsLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                </div>
              ) : recentApplications && recentApplications.length > 0 ? (
                <div className="space-y-4">
                  {recentApplications.map((app) => (
                    <div key={app.$id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="font-medium text-gray-900">Job Application</p>
                        <p className="text-sm text-gray-500">{new Date(app.$createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">No applications yet</p>
                  <Link href="/jobs" className="text-indigo-600 hover:text-indigo-700 text-sm mt-2 inline-block">
                    Start applying
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ==================== ADMIN HOME PAGE ====================
function AdminHome({ userId }: { userId: string }) {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="admin" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-8 text-white mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">
            Admin Dashboard
          </h1>
          <p className="text-white/80">
            Welcome back{profile?.fullName ? `, ${profile.fullName}` : ''}!
          </p>
          <div className="mt-4 flex gap-4">
            <Link
              href="/dashboard/admin"
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              Go to Full Admin Dashboard →
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

// ==================== COMPANY HOME PAGE ====================
function CompanyHome({ userId, profile }: { userId: string; profile?: { profilePictureId?: string; fullName?: string } }) {
  const { data: company } = useCompanyByOwner(userId);
  const { data: jobs, isLoading: jobsLoading } = useJobsByCompany(company?.$id || '');
  const activeJobs = jobs?.filter(j => j.status === 'active');
  
  // Fetch applications for all jobs to count total
  const { data: allApplications, isLoading: appsLoading } = useCompanyApplications(company?.$id || '');
  const totalApplications = allApplications?.length || 0;

  // Get profile picture URL
  const profilePictureUrl = profile?.profilePictureId 
    ? `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.replace('/v1', '')}/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${profile.profilePictureId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="company" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl p-8 text-white mb-8"
        >
          <div className="flex items-center gap-4">
            {profilePictureUrl ? (
              <img 
                src={profilePictureUrl}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border-2 border-white/30"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back{company?.name ? `, ${company.name}` : ''}!
              </h1>
              <p className="text-white/80">Manage your job postings and find great local talent.</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Jobs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {jobsLoading ? '-' : activeJobs?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appsLoading ? '-' : totalApplications || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Job Views</p>
                <p className="text-2xl font-bold text-gray-900">
                  <TrendingUp className="w-5 h-5 inline text-green-500" />
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Days Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {company ? Math.floor((Date.now() - new Date(company.$createdAt).getTime()) / (1000 * 60 * 60 * 24)) : '-'}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Link href="/dashboard/company?tab=jobs&action=post">
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Post a New Job</h3>
                  <p className="text-white/80 text-sm">Create a new job listing in minutes</p>
                </div>
              </div>
            </motion.div>
          </Link>

          <Link href="/dashboard/company?tab=applications">
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Review Applications</h3>
                  <p className="text-gray-500 text-sm">Check who applied to your jobs</p>
                </div>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Recent Jobs */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Your Recent Jobs</h2>
            <Link href="/dashboard/company" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              Manage all jobs
            </Link>
          </div>

          {jobsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : jobs && jobs.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.slice(0, 6).map((job) => (
                <motion.div
                  key={job.$id}
                  whileHover={{ y: -2 }}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{job.title}</h3>
                    {job.isFeatured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{job.location}</p>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {job.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(job.$createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">You haven&apos;t posted any jobs yet</p>
              <Link
                href="/dashboard/company?tab=jobs&action=post"
                className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Post Your First Job
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ==================== MAIN HOME COMPONENT ====================
export default function Home() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full"
        />
      </div>
    );
  }

  // Guest - show landing page
  if (!user) {
    return <GuestLanding />;
  }

  // Logged in - show role-specific home page
  if (role === 'admin') {
    return <AdminHome userId={user.$id} />;
  }

  if (role === 'company') {
    return <CompanyHome userId={user.$id} />;
  }

  // Default to seeker
  return <SeekerHome userId={user.$id} />;
}
