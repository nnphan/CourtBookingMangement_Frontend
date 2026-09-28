import { useQuery, useMutation } from '@tanstack/react-query';
import { branchesApi } from '../api/branches.api';
import type { BranchSearchParams, BranchBookingRequest } from '../types/branch';

export const branchQueryKeys = {
  all: ['branches'] as const,
  list: (params?: BranchSearchParams) => ['branches', 'list', params] as const,
  detail: (idOrSlug: string) => ['branches', 'detail', idOrSlug] as const,
};

export const useBranches = (params?: BranchSearchParams) => {
  return useQuery({
    queryKey: branchQueryKeys.list(params),
    queryFn: () => branchesApi.getBranches(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useBranchDetail = (idOrSlug: string) => {
  return useQuery({
    queryKey: branchQueryKeys.detail(idOrSlug),
    queryFn: () => branchesApi.getBranchById(idOrSlug),
    enabled: Boolean(idOrSlug),
  });
};

export const useCreateQuickBooking = () => {
  return useMutation({
    mutationFn: (booking: BranchBookingRequest) => branchesApi.createQuickBooking(booking),
  });
};
