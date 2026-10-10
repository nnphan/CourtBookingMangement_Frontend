import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { branchDetailApi } from '../api/branch-detail.api';
import { BRANCH_DETAIL_QUERY_KEYS } from '../api/branch-detail.query';
import type { BranchDetailDto } from '../types/branch-detail.types';

export const useBranchDetail = (
  branchId?: string,
): UseQueryResult<BranchDetailDto, Error> => {
  return useQuery({
    queryKey: BRANCH_DETAIL_QUERY_KEYS.detail(branchId ?? ''),
    queryFn: () => {
      if (!branchId) throw new Error('Mã chi nhánh không hợp lệ.');
      return branchDetailApi.getBranchDetail(branchId);
    },
    enabled: Boolean(branchId),
    staleTime: 1000 * 60 * 3, // 3 minutes
    retry: 1,
  });
};
