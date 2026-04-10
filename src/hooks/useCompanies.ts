import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getCompanyById, 
  getCompanyByOwner, 
  createCompany, 
  updateCompany,
  Company 
} from '@/services/companies';

export const companiesKeys = {
  all: ['companies'] as const,
  lists: () => [...companiesKeys.all, 'list'] as const,
  details: () => [...companiesKeys.all, 'detail'] as const,
  detail: (id: string) => [...companiesKeys.details(), id] as const,
  byOwner: (ownerId: string) => [...companiesKeys.all, 'owner', ownerId] as const,
};

export function useCompany(companyId: string) {
  return useQuery({
    queryKey: companiesKeys.detail(companyId),
    queryFn: () => getCompanyById(companyId),
    enabled: !!companyId,
  });
}

export function useCompanyByOwner(ownerId: string) {
  return useQuery({
    queryKey: companiesKeys.byOwner(ownerId),
    queryFn: () => getCompanyByOwner(ownerId),
    enabled: !!ownerId,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCompany,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: companiesKeys.byOwner(data.ownerId) });
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: Partial<Company> }) => 
      updateCompany(companyId, data),
    onSuccess: (data, variables) => {
      // Invalidate both detail and byOwner queries to ensure UI updates immediately
      queryClient.invalidateQueries({ queryKey: companiesKeys.detail(variables.companyId) });
      if (data.ownerId) {
        queryClient.invalidateQueries({ queryKey: companiesKeys.byOwner(data.ownerId) });
      }
    },
  });
}
