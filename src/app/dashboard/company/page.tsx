'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { NotificationBell } from '@/components/NotificationBell';
import { useCompanyByOwner, useUpdateCompany, useCreateCompany } from '@/hooks/useCompanies';
import { useJobsByCompany, useCreateJob, useUpdateJob } from '@/hooks/useJobs';
import { useApplicationsByJob, useUpdateApplicationStatus, useUserProfile, useResumeDownloadUrl } from '@/hooks/useApplications';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Plus, 
  Briefcase, 
  Users, 
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  MapPin,
  Globe,
  Upload,
  Sparkles,
  TrendingUp,
  Search,
  Filter,
  Star,
  MoreVertical,
  Edit3,
  Trash2,
  Eye,
  FileText,
  Download,
  ChevronDown,
  ChevronUp,
  Award,
  ChevronLeft,
  ChevronRight,
  Camera,
  Layers,
  DollarSign,
  Calendar,
  BadgeCheck,
  Bell,
  Link as LinkIcon,
} from 'lucide-react';

import { uploadLogo, getLogoUrl, deleteLogo } from '@/services/companies';

const jobTypes = ['full-time', 'part-time', 'contract', 'temporary'];
const categories = ['Retail', 'Hospitality', 'Construction', 'Healthcare', 'Office', 'Other'];

export default function CompanyDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications' | 'profile'>('jobs');
  const [showJobForm, setShowJobForm] = useState(false);

  const { data: company, isLoading: companyLoading } = useCompanyByOwner(user?.$id || '');
  const { data: jobs, isLoading: jobsLoading } = useJobsByCompany(company?.$id || '');

  if (authLoading || companyLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-violet-50/30">
        <Navbar role="company" />
        <div className="flex justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full"
          />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-violet-50/30">
        <Navbar role="company" />
        <div className="flex justify-center py-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-4">Please sign in to view your dashboard</p>
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors font-medium"
            >
              Sign in
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // If no company profile exists, show company setup form
  if (!company) {
    return <CompanySetupForm ownerId={user.$id} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-violet-50/30">
      <Navbar role="company" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Company Info Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-200/60 mb-8"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              {company.logoId ? (
                <div className="w-16 h-16 rounded-xl overflow-hidden shadow-lg shrink-0">
                  <img 
                    src={getLogoUrl(company.logoId)} 
                    alt={company.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                  {company.isVerified && (
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold border border-blue-100">
                      <BadgeCheck className="w-4 h-4" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mt-1 line-clamp-2">{company.description}</p>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {company.location}
                </span>
                {company.website && (
                  <a 
                    href={company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-violet-600 hover:text-violet-700 font-medium"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
          {/* Notification Bell */}
          {user && <NotificationBell userId={user.$id} />}
          </div>
        </motion.div>

        {/* Modern Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden"
        >
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {[
              { id: 'jobs', label: 'My Jobs', icon: Briefcase, count: jobs?.length },
              { id: 'applications', label: 'Applications', icon: Users },
              { id: 'profile', label: 'Company Profile', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center cursor-pointer gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-violet-600 text-violet-600 bg-violet-50/50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* Jobs Tab */}
              {activeTab === 'jobs' && (
                <motion.div
                  key="jobs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Posted Jobs</h2>
              <button
                onClick={() => setShowJobForm(true)}
                className="flex items-center cursor-pointer gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Post New Job
              </button>
            </div>

            {showJobForm && (
              <JobPostForm 
                companyId={company.$id} 
                onClose={() => setShowJobForm(false)} 
              />
            )}

            {jobsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : jobs?.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">You haven't posted any jobs yet</p>
                <button
                  onClick={() => setShowJobForm(true)}
                  className="inline-flex items-center cursor-pointer gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 font-medium shadow-lg shadow-violet-500/30"
                >
                  <Plus className="w-4 h-4" />
                  Post Your First Job
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {jobs?.map((job) => (
                  <JobRow key={job.$id} job={job as any} />
                ))}
              </div>
            )}
                </motion.div>
              )}

              {/* Applications Tab */}
              {activeTab === 'applications' && (
                <motion.div
                  key="applications"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <h2 className="text-lg font-semibold text-gray-900">All Applications</h2>
                  <CompanyApplications jobs={jobs || []} />
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
                  <CompanyProfileForm company={company} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function CompanySetupForm({ ownerId }: { ownerId: string }) {
  const createCompany = useCreateCompany();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    website: '',
    category: [] as string[],
  });

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let logoId = '';
    if (logoFile) {
      const uploaded = await uploadLogo(logoFile);
      logoId = uploaded.$id;
    }
    await createCompany.mutateAsync({
      ...formData,
      ownerId,
      logoId,
      lat: 0,
      lng: 0,
      isVerified: false,
      verifiedAt: '',
      createdAt: ''
    });
  }

  const steps = [
    { num: 1, title: 'Company Info', icon: Building2 },
    { num: 2, title: 'Details', icon: MapPin },
    { num: 3, title: 'Logo & Review', icon: Camera },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8 px-4 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 px-8 py-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Set Up Your Company</h1>
              <p className="text-white/80">Create your company profile to start posting jobs and finding talent</p>
            </motion.div>
          </div>

          {/* Progress Steps */}
          <div className="px-8 py-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              {steps.map((step, idx) => (
                <div key={step.num} className="flex items-center flex-1">
                  <button
                    onClick={() => setActiveStep(step.num)}
                    className={`flex flex-col items-center gap-2 transition-all ${
                      activeStep === step.num
                        ? 'text-violet-600'
                        : activeStep > step.num
                        ? 'text-green-500'
                        : 'text-gray-400'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                        activeStep === step.num
                          ? 'bg-violet-100 shadow-lg shadow-violet-200'
                          : activeStep > step.num
                          ? 'bg-green-100'
                          : 'bg-gray-100'
                      }`}
                    >
                      {activeStep > step.num ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <step.icon className="w-6 h-6" />
                      )}
                    </div>
                    <span className="text-xs font-semibold hidden sm:block">{step.title}</span>
                  </button>
                  {idx < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-4 rounded-full transition-all ${
                        activeStep > step.num ? 'bg-violet-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Basic Info */}
              {activeStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Building2 className="w-4 h-4 text-violet-500" />
                      Company Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., TechCorp Inc."
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all outline-none text-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <FileText className="w-4 h-4 text-violet-500" />
                      Description
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Tell us about your company, mission, and what makes you unique..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all outline-none resize-none"
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setActiveStep(2)}
                      className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl font-semibold hover:shadow-xl hover:shadow-violet-500/25 transition-all"
                    >
                      Continue
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Details */}
              {activeStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <MapPin className="w-4 h-4 text-violet-500" />
                      Location
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., San Francisco, CA or Remote"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Globe className="w-4 h-4 text-violet-500" />
                      Website
                    </label>
                    <input
                      type="url"
                      placeholder="https://yourcompany.com"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Layers className="w-4 h-4 text-violet-500" />
                      Industry Category
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {['Technology', 'Healthcare', 'Finance', 'Education', 'Marketing', 'Other'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            category: formData.category.includes(cat.toLowerCase())
                              ? formData.category.filter(c => c !== cat.toLowerCase())
                              : [...formData.category, cat.toLowerCase()]
                          })}
                          className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                            formData.category.includes(cat.toLowerCase())
                              ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setActiveStep(1)}
                      className="flex items-center gap-2 px-6 py-4 text-gray-600 hover:bg-gray-100 rounded-2xl font-semibold transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveStep(3)}
                      className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl font-semibold hover:shadow-xl hover:shadow-violet-500/25 transition-all"
                    >
                      Continue
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Logo & Review */}
              {activeStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Camera className="w-4 h-4 text-violet-500" />
                      Company Logo
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                        id="company-logo"
                      />
                      <label
                        htmlFor="company-logo"
                        className="flex flex-col items-center justify-center w-full h-48 border-3 border-dashed border-gray-200 rounded-3xl bg-gray-50 hover:bg-gray-100 hover:border-violet-400 cursor-pointer transition-all"
                      >
                        {logoPreview ? (
                          <div className="relative">
                            <img
                              src={logoPreview}
                              alt="Logo preview"
                              className="w-32 h-32 object-contain rounded-2xl"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setLogoFile(null);
                                setLogoPreview(null);
                              }}
                              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mb-3">
                              <Upload className="w-8 h-8 text-violet-600" />
                            </div>
                            <span className="text-gray-600 font-medium">Click to upload logo</span>
                            <span className="text-gray-400 text-sm mt-1">SVG, PNG, JPG up to 2MB</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Review Summary */}
                  <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-6 space-y-4">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-violet-500" />
                      Ready to create your company!
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-600">Company: <strong>{formData.name || 'Not set'}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-600">Location: <strong>{formData.location || 'Not set'}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className={`w-4 h-4 ${logoFile ? 'text-green-500' : 'text-gray-400'}`} />
                        <span className="text-gray-600">Logo: <strong>{logoFile ? 'Uploaded' : 'Optional'}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setActiveStep(2)}
                      className="flex items-center gap-2 px-6 py-4 text-gray-600 hover:bg-gray-100 rounded-2xl font-semibold transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={createCompany.isPending || !formData.name || !formData.location}
                      className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 text-white rounded-2xl font-semibold hover:shadow-xl hover:shadow-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {createCompany.isPending ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Create Company
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function JobPostForm({ companyId, onClose }: { companyId: string; onClose: () => void }) {
  const createJob = useCreateJob();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    type: 'full-time',
    category: '',
    salaryMin: '',
    salaryMax: '',
    requirements: [] as string[],
    expiresAt: '',
  });
  const [reqInput, setReqInput] = useState('');
  const [activeStep, setActiveStep] = useState(1);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createJob.mutateAsync({
      ...formData,
      companyId,
      lat: 0,
      lng: 0,
      salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
      salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
      status: 'active',
      isFeatured: false,
      featuredUntil: '',
      expiresAt: formData.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: ''
    });
    onClose();
  }

  function addRequirement() {
    if (reqInput.trim()) {
      setFormData({ ...formData, requirements: [...formData.requirements, reqInput.trim()] });
      setReqInput('');
    }
  }

  const steps = [
    { num: 1, title: 'Basic Info', icon: Briefcase },
    { num: 2, title: 'Details', icon: DollarSign },
    { num: 3, title: 'Requirements', icon: CheckCircle },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">Post a New Job</h2>
              <p className="text-blue-100 mt-1">Create an attractive job listing to find the perfect candidates</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-4 mt-6">
            {steps.map((step, idx) => (
              <div key={step.num} className="flex items-center">
                <button
                  onClick={() => setActiveStep(step.num)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeStep === step.num
                      ? 'bg-white text-blue-600 shadow-lg'
                      : activeStep > step.num
                      ? 'bg-white/30 text-white'
                      : 'bg-white/10 text-white/70'
                  }`}
                >
                  <step.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{step.title}</span>
                </button>
                {idx < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 ${activeStep > step.num ? 'bg-white/50' : 'bg-white/20'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-8 overflow-y-auto max-h-[60vh]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Basic Info */}
            {activeStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Briefcase className="w-4 h-4 text-blue-500" />
                      Job Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Senior Frontend Developer"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      Location
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Remote, New York, NY"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Clock className="w-4 h-4 text-blue-500" />
                      Job Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {jobTypes.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData({ ...formData, type })}
                          className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                            formData.type === type
                              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          {type.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Building2 className="w-4 h-4 text-blue-500" />
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Continue
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Details */}
            {activeStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      Minimum Salary
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        placeholder="50000"
                        value={formData.salaryMin}
                        onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                        className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      Maximum Salary
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        placeholder="100000"
                        value={formData.salaryMax}
                        onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                        className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.expiresAt.split('T')[0]}
                    onChange={(e) => setFormData({ ...formData, expiresAt: new Date(e.target.value).toISOString() })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FileText className="w-4 h-4 text-blue-500" />
                    Job Description
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none resize-none"
                  />
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveStep(1)}
                    className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-semibold transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStep(3)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Continue
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Requirements */}
            {activeStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    Requirements & Qualifications
                  </label>
                  <p className="text-sm text-gray-500">Add skills, experience, or qualifications candidates should have</p>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={reqInput}
                      onChange={(e) => setReqInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                      placeholder="e.g., 3+ years React experience"
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={addRequirement}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add
                    </button>
                  </div>
                </div>

                {formData.requirements.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700">Added Requirements:</h4>
                    <div className="flex flex-wrap gap-2">
                      {formData.requirements.map((req, index) => (
                        <motion.span
                          key={index}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-medium border border-blue-100"
                        >
                          {req}
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, requirements: formData.requirements.filter((_, i) => i !== index) })}
                            className="p-1 hover:bg-blue-200 rounded-full transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-semibold transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={createJob.isPending}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {createJob.isPending ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Post Job
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

function JobRow({ job }: { job: { $id: string; title: string; description: string; location: string; type: string; status: string; salaryMin: number | null; salaryMax: number | null; category?: string; expiresAt: string; $createdAt: string } }) {
  const { data: applications } = useApplicationsByJob(job.$id);
  const updateJob = useUpdateJob();
  const [isEditing, setIsEditing] = useState(false);

  const pendingCount = applications?.filter(a => a.status === 'pending').length || 0;
  const totalCount = applications?.length || 0;

  const statusConfig = {
    active: { label: 'Active', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
    closed: { label: 'Closed', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: XCircle },
    filled: { label: 'Filled', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle },
  };

  const currentStatus = statusConfig[job.status as keyof typeof statusConfig] || statusConfig.closed;
  const StatusIcon = currentStatus.icon;

  async function toggleStatus() {
    const newStatus = job.status === 'active' ? 'closed' : 'active';
    await updateJob.mutateAsync({ jobId: job.$id, data: { status: newStatus } });
  }

  if (isEditing) {
    return <JobEditForm job={job} onClose={() => setIsEditing(false)} />;
  }

  return (
    <motion.div 
      layout
      className="bg-white p-6 rounded-xl border border-gray-200/60 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <Link href={`/jobs/${job.$id}`} className="text-lg font-semibold text-gray-900 hover:text-violet-600 transition-colors">
              {job.title}
            </Link>
            <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${currentStatus.color}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {currentStatus.label}
            </span>
          </div>
          
          <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {job.location}
            <span className="text-gray-300">•</span>
            <Briefcase className="w-4 h-4" />
            {job.type.replace('-', ' ')}
          </p>

          {(job.salaryMin || job.salaryMax) && (
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              {job.salaryMin && `$${job.salaryMin.toLocaleString()}`} 
              {job.salaryMin && job.salaryMax && ' - '}
              {job.salaryMax && `$${job.salaryMax.toLocaleString()}`}
            </p>
          )}

          <div className="flex items-center gap-4 mt-3 text-sm">
            {totalCount > 0 ? (
              <span className="text-violet-600 font-medium">
                {totalCount} application{totalCount !== 1 ? 's' : ''}
                {pendingCount > 0 && (
                  <span className="text-amber-600 ml-1">({pendingCount} pending)</span>
                )}
              </span>
            ) : (
              <span className="text-gray-400">No applications yet</span>
            )}
            <span className="text-gray-300">•</span>
            <span className="text-gray-400">
              Posted {new Date(job.$createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleStatus}
            disabled={updateJob.isPending}
            className={`flex items-center cursor-pointer gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              job.status === 'active' 
                ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
                : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
            } disabled:opacity-50`}
          >
            {updateJob.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : job.status === 'active' ? (
              <>
                <XCircle className="w-4 h-4" />
                Close Job
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Activate
              </>
            )}
          </button>

          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center cursor-pointer gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 transition-all"
          >
            <Edit3 className="w-4 h-4" />
            Edit
          </button>

          <Link
            href={`/jobs/${job.$id}`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-violet-50 text-violet-600 hover:bg-violet-100 border border-violet-200 transition-all"
          >
            <Eye className="w-4 h-4" />
            View
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function JobEditForm({ job, onClose }: { job: { $id: string; title: string; description: string; location: string; type: string; salaryMin: number | null; salaryMax: number | null; category?: string; expiresAt: string }; onClose: () => void }) {
  const updateJob = useUpdateJob();
  const [formData, setFormData] = useState({
    title: job.title,
    description: job.description,
    location: job.location,
    type: job.type,
    category: job.category || '',
    salaryMin: job.salaryMin?.toString() || '',
    salaryMax: job.salaryMax?.toString() || '',
    expiresAt: job.expiresAt ? job.expiresAt.split('T')[0] : '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await updateJob.mutateAsync({
      jobId: job.$id,
      data: {
        ...formData,
        salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined,
      },
    });
    onClose();
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-xl border-2 border-violet-200 shadow-lg"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Edit3 className="w-5 h-5 text-violet-600" />
          Edit Job
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <XCircle className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              {jobTypes.map((type) => (
                <option key={type} value={type}>
                  {type.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat.toLowerCase()}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expires At</label>
            <input
              type="date"
              value={formData.expiresAt}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary (optional)</label>
            <input
              type="number"
              value={formData.salaryMin}
              onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary (optional)</label>
            <input
              type="number"
              value={formData.salaryMax}
              onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 cursor-pointer border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateJob.isPending}
            className="flex-1 px-4 py-2 cursor-pointer bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
          >
            {updateJob.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

function CompanyApplications({ jobs }: { jobs: Array<{ $id: string; title: string; description?: string }> }) {
  return (
    <div className="space-y-4">
      {jobs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No jobs posted yet. Post a job to start receiving applicants.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => <JobApplicationsCard key={job.$id} job={job} />)}
        </div>
      )}
    </div>
  );
}

function JobApplicationsCard({ job }: { job: { $id: string; title: string; description?: string } }) {
  const { data: applications, isLoading } = useApplicationsByJob(job.$id);
  const pendingCount = applications?.filter(a => a.status === 'pending').length || 0;

  return (
    <Link href={`/dashboard/company/applications/${job.$id}`}>
      <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer group">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
            {job.title}
          </h3>
          {pendingCount > 0 && (
            <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">
              {pendingCount} new
            </span>
          )}
        </div>
        
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{job.description || 'No description'}</p>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            {applications?.length || 0} application{applications?.length !== 1 ? 's' : ''}
          </span>
          <span className="text-indigo-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
            View 
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

function CompanyProfileForm({ company }: { company: { $id: string; name: string; description: string; location: string; website: string; logoId?: string } }) {
  const updateCompany = useUpdateCompany();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(company.logoId ? getLogoUrl(company.logoId) : null);
  const [formData, setFormData] = useState({
    name: company.name,
    description: company.description,
    location: company.location,
    website: company.website,
  });

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data: Partial<typeof formData & { logoId?: string }> = { ...formData };
    if (logoFile) {
      // Delete old logo if exists
      if (company.logoId) {
        await deleteLogo(company.logoId);
      }
      const uploaded = await uploadLogo(logoFile);
      data.logoId = uploaded.$id;
    }
    await updateCompany.mutateAsync({ companyId: company.$id, data });
    setLogoFile(null); // Clear the file after upload
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
        <div className="flex items-center gap-4">
          {logoPreview ? (
            <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
              <Building2 className="w-10 h-10 text-gray-400" />
            </div>
          )}
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
            <div className="px-4 py-2 bg-violet-50 text-violet-600 rounded-lg hover:bg-violet-100 text-sm font-medium transition-colors">
              {logoPreview ? 'Change Logo' : 'Upload Logo'}
            </div>
          </label>
          {logoPreview && (
            <button
              type="button"
              onClick={() => { setLogoFile(null); setLogoPreview(null); }}
              className="px-4 py-2 cursor-pointer text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
            >
              Remove
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">Recommended: Square image, max 2MB</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Company Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Location</label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Website</label>
        <input
          type="url"
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <button
        type="submit"
        disabled={updateCompany.isPending}
        className="w-full cursor-pointer bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {updateCompany.isPending ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}
