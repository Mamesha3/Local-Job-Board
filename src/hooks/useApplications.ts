import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getApplicationsBySeeker,
  getApplicationsByJob,
  checkExistingApplication,
  createApplication,
  updateApplicationStatus,
  deleteApplication,
  getResumeDownloadUrl,
  Application 
} from '@/services/applications';
import { getUserProfile } from '@/services/users';
import { userKeys } from '@/hooks/useUsers';

export const applicationsKeys = {
  all: ['applications'] as const,
  lists: () => [...applicationsKeys.all, 'list'] as const,
  bySeeker: (seekerId: string) => [...applicationsKeys.lists(), 'seeker', seekerId] as const,
  byJob: (jobId: string) => [...applicationsKeys.lists(), 'job', jobId] as const,
};

export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => getUserProfile(userId),
    enabled: !!userId,
  });
}

export function useResumeDownloadUrl(resumeId: string | null) {
  // URL construction is synchronous, no need for React Query
  return {
    data: resumeId ? getResumeDownloadUrl(resumeId) : null,
    isLoading: false,
    isError: false,
  };
}

export function useApplicationsBySeeker(seekerId: string) {
  return useQuery({
    queryKey: applicationsKeys.bySeeker(seekerId),
    queryFn: () => getApplicationsBySeeker(seekerId),
    enabled: !!seekerId,
  });
}

export function useApplicationsByJob(jobId: string) {
  return useQuery({
    queryKey: applicationsKeys.byJob(jobId),
    queryFn: () => getApplicationsByJob(jobId),
    enabled: !!jobId,
  });
}

export function useHasApplied(jobId: string, seekerId: string) {
  return useQuery({
    queryKey: [...applicationsKeys.all, 'hasApplied', jobId, seekerId],
    queryFn: () => checkExistingApplication(jobId, seekerId),
    enabled: !!jobId && !!seekerId,
  });
}

export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createApplication,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: applicationsKeys.bySeeker(data.seekerId) });
      queryClient.invalidateQueries({ queryKey: applicationsKeys.byJob(data.jobId) });
    },
  });
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ applicationId, status, jobId }: { applicationId: string; status: Application['status']; jobId: string }) => 
      updateApplicationStatus(applicationId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: applicationsKeys.byJob(variables.jobId) });
    },
  });
}

export function useDeleteApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ applicationId, jobId }: { applicationId: string; jobId: string }) => 
      deleteApplication(applicationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: applicationsKeys.byJob(variables.jobId) });
    },
  });
}

// Get all applications for all jobs of a company
export function useCompanyApplications(companyId: string) {
  const { data: jobs } = useQuery({
    queryKey: ['jobs', 'byCompany', companyId],
    queryFn: async () => {
      const { getJobsByCompany } = await import('@/services/jobs');
      return getJobsByCompany(companyId);
    },
    enabled: !!companyId,
  });

  const jobIds = jobs?.map(j => j.$id) || [];
  
  return useQuery({
    queryKey: [...applicationsKeys.all, 'byCompany', companyId],
    queryFn: async () => {
      if (jobIds.length === 0) return [];
      const allApps: Application[] = [];
      for (const jobId of jobIds) {
        const apps = await getApplicationsByJob(jobId);
        allApps.push(...apps);
      }
      return allApps.sort((a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime());
    },
    enabled: jobIds.length > 0,
  });
}
