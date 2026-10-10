import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { branchAdminApi } from '../api/branch-admin.api';
import { BRANCH_ADMIN_QUERY_KEYS } from '../api/branch-admin.query';
import type { BranchListParams, BranchListResponse } from '../types/branch-admin.types';

export const useBranches = (
  filters: BranchListParams,
): UseQueryResult<BranchListResponse, Error> => {
  return useQuery({
    queryKey: BRANCH_ADMIN_QUERY_KEYS.branches(filters),
    queryFn: () => branchAdminApi.getBranches(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 1,
  });
};
