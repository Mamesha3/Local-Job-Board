'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDefaultResume } from '@/hooks/useResumes';
import { useCreateApplication, useHasApplied } from '@/hooks/useApplications';
import { CheckCircle, Loader2, FileText, ClipboardCheck } from 'lucide-react';

interface ApplyButtonProps {
  jobId: string;
}

export function ApplyButton({ jobId }: ApplyButtonProps) {
  const { user } = useAuth();
  const { data: defaultResume } = useDefaultResume(user?.$id || '');
  const createApplication = useCreateApplication();
  const { data: hasApplied, isLoading: checkingApplication } = useHasApplied(jobId, user?.$id || '');
  const [showSuccess, setShowSuccess] = useState(false);

  async function handleApply() {
    if (!user || !defaultResume) return;

    try {
      await createApplication.mutateAsync({
        jobId,
        seekerId: user.$id,
        resumeId: defaultResume.resumeId,
        coverLetter: '',
        status: 'pending',
        appliedAt: new Date().toISOString(),
        $sequence: ''
      });
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to apply:', error);
    }
  }

  if (showSuccess) {
    return (
      <div className="text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
        <p className="text-green-700 font-medium">Application submitted!</p>
        <p className="text-sm text-gray-500">Good luck!</p>
      </div>
    );
  }

  if (checkingApplication) {
    return (
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
        <p className="text-gray-600 text-sm">Checking application status...</p>
      </div>
    );
  }

  if (hasApplied) {
    return (
      <div className="text-center">
        <ClipboardCheck className="w-12 h-12 text-green-500 mx-auto mb-2" />
        <p className="text-green-700 font-medium">You have applied!</p>
        <p className="text-sm text-gray-500">Your application is being reviewed</p>
        <a 
          href="/dashboard/seeker" 
          className="text-blue-600 hover:text-blue-500 text-sm mt-2 inline-block"
        >
          View in Dashboard →
        </a>
      </div>
    );
  }

  if (!defaultResume) {
    return (
      <div className="text-center">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600 mb-2">Upload your resume first</p>
        <a 
          href="/dashboard/seeker" 
          className="text-blue-600 hover:text-blue-500 text-sm"
        >
          Go to Dashboard →
        </a>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="text-sm text-gray-600 mb-4">
        Applying with: <span className="font-medium">{defaultResume.fileName}</span>
      </p>
      <button
        onClick={handleApply}
        disabled={createApplication.isPending}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {createApplication.isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Applying...
          </>
        ) : (
          '1-Click Apply'
        )}
      </button>
      <p className="text-xs text-gray-400 mt-2">
        Your default resume will be sent to the employer
      </p>
    </div>
  );
}
