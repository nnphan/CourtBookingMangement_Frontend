import { useQuery } from '@tanstack/react-query';
import { getMyBranches } from '@/services/branch';
import { QUERY_KEYS } from './useBranches';
import type { BranchLookupResponse } from '@/types/branch';

export { QUERY_KEYS };

export const useMyBranches = () => {
  return useQuery<BranchLookupResponse[], Error>({
    queryKey: QUERY_KEYS.MY_BRANCHES,
    queryFn: getMyBranches,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
