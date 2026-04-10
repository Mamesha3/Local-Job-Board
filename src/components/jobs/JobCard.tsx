import { Job } from '@/services/jobs';
import Link from 'next/link';
import { MapPin, DollarSign, Clock, Briefcase, Sparkles, ArrowUpRight, Heart, BadgeCheck, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useIsJobSaved, useSaveJob, useUnsaveJob } from '@/hooks/useSavedJobs';
import { useCompany } from '@/hooks/useCompanies';

interface JobCardProps {
  job: Job;
}

function SaveJobButton({ jobId }: { jobId: string }) {
  const { user } = useAuth();
  const { data: savedJob } = useIsJobSaved(user?.$id || '', jobId);
  const saveJob = useSaveJob();
  const unsaveJob = useUnsaveJob();

  if (!user) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (savedJob) {
      unsaveJob.mutate({ savedJobId: savedJob.$id, seekerId: user.$id, jobId });
    } else {
      saveJob.mutate({ seekerId: user.$id, jobId });
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={saveJob.isPending || unsaveJob.isPending}
      className={`p-2 rounded-xl transition-all ${
        savedJob 
          ? 'bg-pink-100 text-pink-600 hover:bg-pink-200' 
          : 'bg-gray-100 text-gray-400 hover:bg-pink-50 hover:text-pink-500'
      }`}
    >
      <Heart className={`w-5 h-5 ${savedJob ? 'fill-current' : ''}`} />
    </button>
  );
}

function CompanyInfo({ companyId }: { companyId: string }) {
  const { data: company } = useCompany(companyId);

  if (!company) return null;

  // Get logo URL if logoId exists
  const logoUrl = company.logoId 
    ? `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.replace('/v1', '')}/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${company.logoId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`
    : null;

  return (
    <div className="flex items-center gap-2 mb-2">
      {logoUrl ? (
        <img 
          src={logoUrl} 
          alt={company.name}
          className="w-6 h-6 rounded-full object-cover"
          onError={(e) => {
            // Fallback to building icon on error
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
      ) : (
        <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
          <Building2 className="w-3.5 h-3.5 text-indigo-600" />
        </div>
      )}
      <span className="text-sm font-medium text-gray-700">{company.name}</span>
      {company.isVerified && (
        <span className="inline-flex items-center gap-0.5 bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full font-medium">
          <BadgeCheck className="w-3.5 h-3.5" />
          Verified
        </span>
      )}
    </div>
  );
}

export function JobCard({ job }: JobCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-200/60 hover:border-indigo-300/60 p-6 transition-all duration-300"
    >
      <Link href={`/jobs/${job.$id}`}>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <CompanyInfo companyId={job.companyId} />
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                {job.title}
              </h3>
              {job.isFeatured && (
                <span className="shrink-0 inline-flex items-center gap-1 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 text-xs px-2.5 py-1 rounded-full font-medium shadow-sm">
                  <Sparkles className="w-3 h-3" />
                  Featured
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{job.description}</p>
          </div>
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            whileHover={{ opacity: 1, x: 0 }}
            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-indigo-600" />
            </div>
          </motion.div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span>{job.location}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
            <Briefcase className="w-4 h-4 text-gray-500" />
            <span className="capitalize">{job.type}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="capitalize">{job.category}</span>
          </div>
          {(job.salaryMin || job.salaryMax) && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
              <DollarSign className="w-4 h-4" />
              <span>
                {job.salaryMin && `$${job.salaryMin.toLocaleString()}`}
                {job.salaryMin && job.salaryMax && ' - '}
                {job.salaryMax && `$${job.salaryMax.toLocaleString()}`}
              </span>
            </div>
          )}
        </div>

        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            Posted {new Date(job.$createdAt).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
          <span className="text-xs font-medium text-indigo-600 group-hover:text-indigo-700">
            View Details →
          </span>
        </div>
      </Link>
      
      {/* Save Button - Outside Link */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
        <SaveJobButton jobId={job.$id} />
      </div>
    </motion.div>
  );
}
