import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getJobs, getJobById, createJob, updateJob, deleteJob, getJobsByCompany, Job } from '@/services/jobs';

export const jobsKeys = {
  all: ['jobs'] as const,
  lists: () => [...jobsKeys.all, 'list'] as const,
  list: (filters: Record<string, string>) => [...jobsKeys.lists(), filters] as const,
  details: () => [...jobsKeys.all, 'detail'] as const,
  detail: (id: string) => [...jobsKeys.details(), id] as const,
  byCompany: (companyId: string) => [...jobsKeys.all, 'company', companyId] as const,
};

export function useJobs(filters?: { category?: string; type?: string; location?: string; datePosted?: string }) {
  return useQuery({
    queryKey: jobsKeys.list(filters || {}),
    queryFn: () => getJobs(filters),
  });
}

export function useJob(jobId: string) {
  return useQuery({
    queryKey: jobsKeys.detail(jobId),
    queryFn: () => getJobById(jobId),
    enabled: !!jobId,
  });
}

export function useJobsByCompany(companyId: string) {
  return useQuery({
    queryKey: jobsKeys.byCompany(companyId),
    queryFn: () => getJobsByCompany(companyId),
    enabled: !!companyId,
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createJob,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: jobsKeys.lists() });
      // Also invalidate company-specific jobs list
      if (data.companyId) {
        queryClient.invalidateQueries({ queryKey: jobsKeys.byCompany(data.companyId) });
      }
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, data }: { jobId: string; data: Partial<Job> }) => updateJob(jobId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: jobsKeys.detail(variables.jobId) });
      queryClient.invalidateQueries({ queryKey: jobsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: jobsKeys.all });
      // Also invalidate company-specific jobs list if companyId is available
      if (data.companyId) {
        queryClient.invalidateQueries({ queryKey: jobsKeys.byCompany(data.companyId) });
      }
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteJob,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: jobsKeys.lists() });
      // Invalidate all company-specific job lists since we don't know the companyId here
      queryClient.invalidateQueries({ queryKey: jobsKeys.all });
    },
  });
}
