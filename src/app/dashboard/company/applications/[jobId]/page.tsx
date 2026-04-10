'use client';

import { useParams, useRouter } from 'next/navigation';
import { useJob } from '@/hooks/useJobs';
import { useApplicationsByJob, useDeleteApplication, useUpdateApplicationStatus } from '@/hooks/useApplications';
import { useUserProfile } from '@/hooks/useUsers';
import { useResumeDownloadUrl } from '@/hooks/useApplications';
import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Users, Mail, Phone, MapPin, FileText, Download, Trash2, CheckCircle, Loader2, LinkIcon } from 'lucide-react';
import { useState } from 'react';

function ApplicationDetail({ app, jobId }: { app: { $id: string; seekerId: string; resumeId: string; coverLetter?: string; status: string; $createdAt: string }; jobId: string }) {
  const { data: profile } = useUserProfile(app.seekerId);
  const { data: resumeUrl } = useResumeDownloadUrl(app.resumeId);
  const updateStatus = useUpdateApplicationStatus();
  const deleteApplication = useDeleteApplication();
  const [expanded, setExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800',
    reviewed: 'bg-blue-100 text-blue-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const handleDelete = () => {
    deleteApplication.mutate({ applicationId: app.$id, jobId });
  };

  return (
    <div className="p-4 bg-white">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            {(profile as unknown as { profilePictureId?: string })?.profilePictureId ? (
              <img
                src={`${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.replace('/v1', '')}/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${(profile as unknown as { profilePictureId?: string }).profilePictureId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`}
                alt={profile?.fullName || 'Applicant'}
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900">
                {profile?.fullName || `Applicant #${app.seekerId.slice(-6)}`}
              </p>
              <p className="text-sm text-gray-500">
                Applied {new Date(app.$createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {profile && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-3 text-sm">
                {profile.email && (
                  <a href={`mailto:${profile.email}`} className="flex items-center gap-1 text-gray-600 hover:text-indigo-600">
                    <Mail className="w-4 h-4" />
                    {profile.email}
                  </a>
                )}
                {profile.phone && (
                  <span className="flex items-center gap-1 text-gray-600">
                    <Phone className="w-4 h-4" />
                    {profile.phone}
                  </span>
                )}
                {profile.location && (
                  <span className="flex items-center gap-1 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {profile.location}
                  </span>
                )}
              </div>

              {(profile.linkedIn || profile.portfolio) && (
                <div className="flex flex-wrap gap-2">
                  {profile.linkedIn && (
                    <a
                      href={profile.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                    >
                      <LinkIcon className="w-3 h-3" />
                      LinkedIn
                    </a>
                  )}
                  {profile.portfolio && (
                    <a
                      href={profile.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded hover:bg-purple-100"
                    >
                      <LinkIcon className="w-3 h-3" />
                      Portfolio
                    </a>
                  )}
                </div>
              )}

              {profile.bio && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{profile.bio}</p>
              )}
            </div>
          )}

          {app.coverLetter && (
            <div className="mt-3">
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
              >
                <FileText className="w-4 h-4" />
                {expanded ? 'Hide Cover Letter' : 'View Cover Letter'}
              </button>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 italic"
                >
                  "{app.coverLetter}"
                </motion.div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[app.status as keyof typeof statusStyles]}`}>
            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
          </span>

          {resumeUrl && (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium mt-2"
            >
              <Download className="w-4 h-4" />
              Resume
            </a>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
        {app.status === 'pending' && (
          <button
            onClick={() => updateStatus.mutate({ applicationId: app.$id, status: 'reviewed', jobId })}
            disabled={updateStatus.isPending}
            className="text-xs px-3 py-1.5 cursor-pointer bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium"
          >
            Mark Reviewed
          </button>
        )}
        {app.status !== 'accepted' && app.status !== 'rejected' && (
          <>
            <button
              onClick={() => updateStatus.mutate({ applicationId: app.$id, status: 'accepted', jobId })}
              disabled={updateStatus.isPending}
              className="text-xs px-3 py-1.5 cursor-pointer bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium"
            >
              Accept
            </button>
            <button
              onClick={() => updateStatus.mutate({ applicationId: app.$id, status: 'rejected', jobId })}
              disabled={updateStatus.isPending}
              className="text-xs px-3 py-1.5 cursor-pointer bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium"
            >
              Reject
            </button>
          </>
        )}
        
        {/* Delete Button */}
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleteApplication.isPending}
            className="text-xs px-3 py-1.5 cursor-pointer bg-gray-100 text-gray-600 rounded-lg hover:bg-red-100 hover:text-red-600 font-medium ml-auto flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        ) : (
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="text-xs px-3 py-1.5 cursor-pointer bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteApplication.isPending}
              className="text-xs px-3 py-1.5 cursor-pointer bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium flex items-center gap-1"
            >
              {deleteApplication.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              Confirm
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function JobApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;
  const { user, role } = useAuth();

  const { data: job, isLoading: jobLoading } = useJob(jobId);
  const { data: applications, isLoading: appsLoading } = useApplicationsByJob(jobId);

  // Redirect if not company
  if (role !== 'company' && role !== 'admin') {
    router.push('/login');
    return null;
  }

  if (jobLoading || appsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar role="company" />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="company" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link 
          href="/dashboard/company"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-6 group"
        >
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="font-medium">Back to Dashboard</span>
        </Link>

        {/* Job Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{job?.title}</h1>
          <p className="text-gray-600 mb-4">{job?.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {applications?.length || 0} application{applications?.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {applications?.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No applications for this job yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-200">
                {applications?.map((app) => (
                  <ApplicationDetail key={app.$id} app={app} jobId={jobId} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
