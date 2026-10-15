import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getBranches } from './branch.api';
import type { BranchSearchRequest, BranchSearchResponse } from '../types/branch.types';

export const branchQueryKeys = {
  all: ['branches'] as const,
  list: (filters: BranchSearchRequest, pageNumber?: number) =>
    ['branches', filters, pageNumber ?? filters.pageNumber ?? 1] as const,
};

/**
 * TanStack Query hook to fetch branches list
 * Query Key: ["branches", filters, pageNumber]
 */
export const useBranches = (filters: BranchSearchRequest) => {
  const pageNumber = filters.pageNumber ?? 1;

  return useQuery<BranchSearchResponse, Error>({
    queryKey: branchQueryKeys.list(filters, pageNumber),
    queryFn: () => getBranches(filters),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
};
