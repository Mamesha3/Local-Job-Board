'use client';

import { JobList } from '@/components/jobs/JobList';
import { Navbar } from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';

export default function JobsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
      <Navbar role="seeker" />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-purple-600/5" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4"
            >
              <Sparkles className="w-4 h-4" />
              Find Your Next Opportunity
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Browse <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Local Jobs</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover opportunities from trusted local businesses in your community
            </p>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <JobList />
      </main>
    </div>
  );
}
