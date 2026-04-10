'use client';

import { useJob } from '@/hooks/useJobs';
import { useCompany } from '@/hooks/useCompanies';
import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MapPin, DollarSign, Clock, Briefcase, Building, ArrowLeft, Calendar, Sparkles, Globe, Mail, BadgeCheck } from 'lucide-react';
import { ApplyButton } from '@/components/jobs/ApplyButton';
import { motion } from 'framer-motion';

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  // Determine back link based on returnTo param or user role
  const getBackLink = () => {
    if (returnTo === 'admin') return '/dashboard/admin';
    if (returnTo === 'company') return '/dashboard/company';
    if (role === 'admin') return '/dashboard/admin';
    if (role === 'company') return '/dashboard/company';
    return '/jobs';
  };

  const getBackText = () => {
    if (returnTo === 'admin' || role === 'admin') return 'Back to Admin Dashboard';
    if (returnTo === 'company' || role === 'company') return 'Back to Company Dashboard';
    return 'Back to jobs';
  };

  const { data: job, isLoading: jobLoading, error } = useJob(jobId);
  const { data: company } = useCompany(job?.companyId || '');

  if (jobLoading || authLoading) {
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

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
        <Navbar role="seeker" />
        <div className="flex justify-center py-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-10 h-10 text-red-500" />
            </div>
            <p className="text-gray-600 mb-4">Job not found</p>
            <Link 
              href="/jobs" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to jobs
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
      <Navbar role="seeker" />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link 
            href={getBackLink()}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-6 group"
          >
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="font-medium">{getBackText()}</span>
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Job Details */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-8"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{job.title}</h1>
                    {job.isFeatured && (
                      <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 text-xs px-3 py-1.5 rounded-full font-medium shadow-sm">
                        <Sparkles className="w-3 h-3" />
                        Featured
                      </span>
                    )}
                  </div>
                  {company && (
                    <div className="flex items-center gap-2 text-gray-600">
                      {company.logoId ? (
                        <img 
                          src={`${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.replace('/v1', '')}/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${company.logoId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`}
                          alt={company.name}
                          className="w-10 h-10 rounded-lg object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <Building className="w-5 h-5 text-indigo-600" />
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{company.name}</span>
                        {company.isVerified && (
                          <span className="inline-flex items-center gap-0.5 bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full font-medium">
                            <BadgeCheck className="w-3.5 h-3.5" />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-8">
                <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{job.location}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium">
                  <Briefcase className="w-4 h-4 text-gray-500" />
                  <span className="capitalize">{job.type}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="capitalize">{job.category}</span>
                </div>
                {(job.salaryMin || job.salaryMax) && (
                  <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-medium">
                    <DollarSign className="w-4 h-4" />
                    <span>
                      {job.salaryMin && `$${job.salaryMin.toLocaleString()}`}
                      {job.salaryMin && job.salaryMax && ' - '}
                      {job.salaryMax && `$${job.salaryMax.toLocaleString()}`}
                    </span>
                  </div>
                )}
                <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-500 rounded-xl text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Posted {new Date(job.$createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-indigo-500 rounded-full" />
                  Description
                </h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{job.description}</p>
              </div>

              {job.requirements && job.requirements.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-indigo-500 rounded-full" />
                    Requirements
                  </h3>
                  <ul className="space-y-3">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-600">
                        <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-medium text-indigo-600">{index + 1}</span>
                        </div>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 sticky top-24"
            >
              {user ? (
                role === 'seeker' ? (
                  <ApplyButton jobId={job.$id} />
                ) : (
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-gray-600 text-sm">
                      Employer accounts cannot apply to jobs.
                    </p>
                    <Link 
                      href="/dashboard/company" 
                      className="mt-3 inline-block text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      Go to your dashboard →
                    </Link>
                  </div>
                )
              ) : (
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-gray-600 mb-4">Sign in to apply for this job</p>
                  <Link
                    href="/login"
                    className="block w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
                  >
                    Sign in to Apply
                  </Link>
                </div>
              )}

              {company && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-500" />
                    About {company.name}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">{company.description}</p>
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      <Globe className="w-4 h-4" />
                      Visit website
                    </a>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
