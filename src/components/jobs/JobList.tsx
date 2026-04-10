'use client';

import { useState, useMemo } from 'react';
import { useJobs } from '@/hooks/useJobs';
import { JobCard } from './JobCard';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setCategory, setJobType, setLocation, setDatePosted, resetFilters } from '@/store/slices/filtersSlice';
import { Search, Filter, X, SlidersHorizontal, Briefcase, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const categories = ['Retail', 'Hospitality', 'Construction', 'Healthcare', 'Office', 'Other'];
const jobTypes = ['full-time', 'part-time', 'contract', 'temporary'];
const dateOptions = [
  { value: '', label: 'Any time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Last 7 days' },
  { value: 'month', label: 'Last 30 days' },
];
const JOBS_PER_PAGE = 9;

export function JobList() {
  const filters = useAppSelector((state) => state.filters);
  const dispatch = useAppDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  
  const { data: jobs, isLoading, error } = useJobs({
    category: filters.category || undefined,
    type: filters.jobType || undefined,
    location: filters.location || undefined,
    datePosted: filters.datePosted || undefined,
  });

  // Reset to first page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [filters.category, filters.jobType, filters.location, filters.datePosted]);

  // Pagination logic
  const totalJobs = jobs?.length || 0;
  const totalPages = Math.ceil(totalJobs / JOBS_PER_PAGE);
  const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
  const endIndex = startIndex + JOBS_PER_PAGE;
  const paginatedJobs = jobs?.slice(startIndex, endIndex) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-10 h-10 text-red-500" />
        </div>
        <p className="text-gray-600 mb-4">Failed to load jobs. Please try again.</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          Retry
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Modern Filters Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-white to-gray-50/80 rounded-3xl shadow-xl shadow-indigo-100/50 border border-gray-100 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <SlidersHorizontal className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm sm:text-base">Find Your Perfect Job</h3>
                <p className="text-indigo-100 text-xs sm:text-sm">Refine results with smart filters</p>
              </div>
            </div>
            {(filters.category || filters.jobType || filters.location || filters.datePosted) && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => dispatch(resetFilters())}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white text-sm transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Category */}
            <div className="relative group">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                Category
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                  <Filter className="w-4 h-4 text-indigo-600" />
                </div>
                <select
                  value={filters.category}
                  onChange={(e) => dispatch(setCategory(e.target.value))}
                  className="w-full pl-12 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-indigo-300 transition-all appearance-none cursor-pointer text-sm font-medium text-gray-700 shadow-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat.toLowerCase()}>
                      {cat}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
                </div>
              </div>
            </div>

            {/* Job Type */}
            <div className="relative group">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                Job Type
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                  <Briefcase className="w-4 h-4 text-purple-600" />
                </div>
                <select
                  value={filters.jobType}
                  onChange={(e) => dispatch(setJobType(e.target.value))}
                  className="w-full pl-12 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 hover:border-purple-300 transition-all appearance-none cursor-pointer text-sm font-medium text-gray-700 shadow-sm"
                >
                  <option value="">All Types</option>
                  {jobTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="relative group">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                Location
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <Search className="w-4 h-4 text-emerald-600" />
                </div>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => dispatch(setLocation(e.target.value))}
                  placeholder="Search city..."
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 hover:border-emerald-300 transition-all text-sm font-medium text-gray-700 placeholder:text-gray-400 shadow-sm"
                />
              </div>
            </div>

            {/* Date Posted */}
            <div className="relative group">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                Date Posted
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                  <Calendar className="w-4 h-4 text-amber-600" />
                </div>
                <select
                  value={filters.datePosted}
                  onChange={(e) => dispatch(setDatePosted(e.target.value))}
                  className="w-full pl-12 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 hover:border-amber-300 transition-all appearance-none cursor-pointer text-sm font-medium text-gray-700 shadow-sm"
                >
                  {dateOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
                </div>
              </div>
            </div>
          </div>

          {/* Active Filters Pills */}
          {(filters.category || filters.jobType || filters.location || filters.datePosted) && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-gray-100"
            >
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider py-1">Active:</span>
              {filters.category && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                  {categories.find(c => c.toLowerCase() === filters.category) || filters.category}
                </span>
              )}
              {filters.jobType && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                  {filters.jobType.replace('-', ' ')}
                </span>
              )}
              {filters.location && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                  <Search className="w-3 h-3" />
                  {filters.location}
                </span>
              )}
              {filters.datePosted && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
                  <Calendar className="w-3 h-3" />
                  {dateOptions.find(d => d.value === filters.datePosted)?.label}
                </span>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Results Header */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-between"
      >
        <p className="text-gray-600">
          <span className="font-semibold text-gray-900">{jobs?.length || 0}</span> job{jobs?.length !== 1 ? 's' : ''} found
          {totalPages > 1 && (
            <span className="ml-2 text-sm text-gray-500">
              (showing {startIndex + 1}-{Math.min(endIndex, totalJobs)})
            </span>
          )}
        </p>
      </motion.div>

      {/* Job Cards Grid */}
      <motion.div 
        layout
        className="grid gap-4"
      >
        <AnimatePresence mode="popLayout">
          {paginatedJobs?.map((job, index) => (
            <motion.div
              key={job.$id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
            >
              <JobCard job={job} />
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 mt-8"
          >
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </motion.div>
        )}
        
        {jobs?.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-200/50 border border-white/50"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-4">No jobs found matching your criteria.</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => dispatch(resetFilters())}
              className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium cursor-pointer"
            >
              Clear filters
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
