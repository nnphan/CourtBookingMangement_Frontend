import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getBranches } from './branch.api';
import type { BranchSearchRequest, BranchSearchResponse } from '../types/branch.types';

export const branchQueryKeys = {
  all: ['branches'] as const,
  list: (filters: BranchSearchRequest) => ['branches', filters] as const,
};

/**
 * TanStack Query hook to fetch branches list
 * Query Key: ["branches", filters]
 */
export const useBranches = (filters: BranchSearchRequest) => {
  return useQuery<BranchSearchResponse, Error>({
    queryKey: branchQueryKeys.list(filters),
    queryFn: () => getBranches(filters),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
};
