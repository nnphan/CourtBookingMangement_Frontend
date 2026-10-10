import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { branchAdminApi } from '../api/branch-admin.api';
import { BRANCH_ADMIN_QUERY_KEYS } from '../api/branch-admin.query';
import type { BranchSummaryDto } from '../types/branch-admin.types';

export const useBranchSummary = (): UseQueryResult<BranchSummaryDto, Error> => {
  return useQuery({
    queryKey: BRANCH_ADMIN_QUERY_KEYS.summary,
    queryFn: branchAdminApi.getBranchSummary,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};
