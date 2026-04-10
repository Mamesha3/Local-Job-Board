import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getAllCompanies,
  verifyCompany,
  deleteCompany,
  getAllJobs,
  moderateJob,
  deleteJob,
  getAdminStats,
  getAuditLogs,
  createAuditLog,
  type AdminStats,
  type AuditLog,
} from '@/services/admin';

// Keys
export const adminKeys = {
  all: ['admin'] as const,
  users: () => [...adminKeys.all, 'users'] as const,
  companies: () => [...adminKeys.all, 'companies'] as const,
  jobs: () => [...adminKeys.all, 'jobs'] as const,
  stats: () => [...adminKeys.all, 'stats'] as const,
  auditLogs: () => [...adminKeys.all, 'auditLogs'] as const,
};

// Stats
export function useAdminStats() {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: getAdminStats,
  });
}

// Users
export function useAllUsers() {
  return useQuery({
    queryKey: adminKeys.users(),
    queryFn: getAllUsers,
  });
}

export function useUserById(userId: string) {
  return useQuery({
    queryKey: [...adminKeys.users(), userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'seeker' | 'company' | 'admin' }) =>
      updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
  });
}

// Companies
export function useAllCompanies() {
  return useQuery({
    queryKey: adminKeys.companies(),
    queryFn: getAllCompanies,
  });
}

export function useVerifyCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, isVerified }: { companyId: string; isVerified: boolean }) =>
      verifyCompany(companyId, isVerified),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.companies() });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, logoId }: { companyId: string; logoId?: string }) =>
      deleteCompany(companyId, logoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.companies() });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
  });
}

// Jobs
export function useAllJobs() {
  return useQuery({
    queryKey: adminKeys.jobs(),
    queryFn: getAllJobs,
  });
}

export function useModerateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, action, reason }: { jobId: string; action: 'approve' | 'reject' | 'feature' | 'unfeature'; reason?: string }) =>
      moderateJob(jobId, action, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.jobs() });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => deleteJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.jobs() });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
  });
}

// Audit Logs
export function useAuditLogs() {
  return useQuery({
    queryKey: adminKeys.auditLogs(),
    queryFn: () => getAuditLogs(100),
  });
}

export function useCreateAuditLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof createAuditLog>[0]) => createAuditLog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.auditLogs() });
    },
  });
}
