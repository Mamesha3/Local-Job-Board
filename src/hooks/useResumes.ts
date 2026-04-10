import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getDefaultResume, 
  saveDefaultResume,
  getResumeDownloadUrl,
  DefaultResume 
} from '@/services/applications';

export const resumesKeys = {
  all: ['resumes'] as const,
  default: (seekerId: string) => [...resumesKeys.all, 'default', seekerId] as const,
};

export function useDefaultResume(seekerId: string) {
  return useQuery({
    queryKey: resumesKeys.default(seekerId),
    queryFn: () => getDefaultResume(seekerId),
    enabled: !!seekerId,
  });
}

export function useSaveDefaultResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ seekerId, file }: { seekerId: string; file: File }) => 
      saveDefaultResume(seekerId, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: resumesKeys.default(variables.seekerId) });
    },
  });
}

export function useResumeDownloadUrl(resumeId: string | null) {
  if (!resumeId) return null;
  return getResumeDownloadUrl(resumeId);
}
