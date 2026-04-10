import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getSavedJobs,
  saveJob,
  unsaveJob,
  isJobSaved,
  SavedJob 
} from '@/services/savedJobs';

export const savedJobsKeys = {
  all: ['savedJobs'] as const,
  lists: (seekerId: string) => [...savedJobsKeys.all, 'list', seekerId] as const,
  detail: (seekerId: string, jobId: string) => [...savedJobsKeys.all, 'detail', seekerId, jobId] as const,
};

export function useSavedJobs(seekerId: string) {
  return useQuery({
    queryKey: savedJobsKeys.lists(seekerId),
    queryFn: () => getSavedJobs(seekerId),
    enabled: !!seekerId,
  });
}

export function useIsJobSaved(seekerId: string, jobId: string) {
  return useQuery({
    queryKey: savedJobsKeys.detail(seekerId, jobId),
    queryFn: () => isJobSaved(seekerId, jobId),
    enabled: !!seekerId && !!jobId,
  });
}

export function useSaveJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ seekerId, jobId }: { seekerId: string; jobId: string }) => 
      saveJob(seekerId, jobId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: savedJobsKeys.lists(variables.seekerId) });
      queryClient.invalidateQueries({ queryKey: savedJobsKeys.detail(variables.seekerId, variables.jobId) });
    },
  });
}

export function useUnsaveJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ savedJobId, seekerId, jobId }: { savedJobId: string; seekerId: string; jobId: string }) => 
      unsaveJob(savedJobId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: savedJobsKeys.lists(variables.seekerId) });
      queryClient.invalidateQueries({ queryKey: savedJobsKeys.detail(variables.seekerId, variables.jobId) });
    },
  });
}
