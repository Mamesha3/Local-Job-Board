import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserProfile, updateUserProfile, UserProfile } from '@/services/users';

export const userKeys = {
  all: ['users'] as const,
  detail: (userId: string) => [...userKeys.all, userId] as const,
};

export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => getUserProfile(userId),
    enabled: !!userId,
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: Parameters<typeof updateUserProfile>[1] }) =>
      updateUserProfile(userId, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.userId) });
      queryClient.refetchQueries({ queryKey: userKeys.detail(variables.userId) });
      // Also invalidate auth context profile
      queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] });
    },
  });
}
