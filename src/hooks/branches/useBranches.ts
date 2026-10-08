import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { branchService } from '@/services/branch';
import type {
  Branch,
  BranchSearchParams,
  BranchStats,
  CreateBranchInput,
} from '@/types/branch';
import type { PaginationMetadata } from '@/types/api';
import { toast } from '@/lib/toast';

export const QUERY_KEYS = {
  BRANCHES: ['branches'] as const,
  BRANCHES_LIST: (params?: BranchSearchParams) => ['branches', 'list', params] as const,
  BRANCH_DETAIL: (id: string) => ['branches', 'detail', id] as const,
  BRANCH_STATS: ['branches', 'stats'] as const,
};

export interface UseGetBranchesResult {
  branches: Branch[];
  metadata: PaginationMetadata | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch paginated branches list with query params
 */
export const useGetBranches = (params: BranchSearchParams = {}): UseGetBranchesResult => {
  const { t } = useTranslation('branch');
  const query = useQuery({
    queryKey: QUERY_KEYS.BRANCHES_LIST(params),
    queryFn: async () => {
      const response = await branchService.getBranches(params);
      if (!response.success) {
        throw new Error(response.message || t('messages.loadListError'));
      }
      return {
        data: response.data,
        metadata: response.metadata,
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 1,
  });

  return {
    branches: query.data?.data ?? [],
    metadata: query.data?.metadata ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
};

export interface UseGetBranchDetailResult {
  branch: Branch | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch single branch detail by ID
 */
export const useGetBranchDetail = (id?: string): UseGetBranchDetailResult => {
  const { t } = useTranslation('branch');
  const query = useQuery({
    queryKey: QUERY_KEYS.BRANCH_DETAIL(id ?? ''),
    queryFn: async () => {
      if (!id) throw new Error(t('messages.invalidId'));
      const response = await branchService.getBranchDetail(id);
      if (!response.success) {
        throw new Error(response.message || t('messages.loadDetailError'));
      }
      return response.data;
    },
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 3,
    retry: 1,
  });

  return {
    branch: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
};

/**
 * Hook to fetch statistics overview for branches
 */
export const useGetBranchStats = () => {
  const { t } = useTranslation('branch');
  return useQuery<BranchStats>({
    queryKey: QUERY_KEYS.BRANCH_STATS,
    queryFn: async () => {
      const response = await branchService.getBranchStats();
      if (!response.success) {
        throw new Error(response.message || t('messages.loadStatsError'));
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook to create a new branch
 */
export const useCreateBranch = () => {
  const { t } = useTranslation('branch');
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBranchInput) => {
      const res = await branchService.createBranch(input);
      if (!res.success) {
        throw new Error(res.message || t('messages.createError'));
      }
      return res.data;
    },
    onSuccess: (newBranch) => {
      toast.success(t('messages.createSuccess'), newBranch.branchName);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BRANCHES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BRANCH_STATS });
    },
    onError: (err: Error) => {
      toast.error(t('messages.errorTitle'), err.message || t('messages.createError'));
    },
  });
};

/**
 * Hook to update an existing branch
 */
export const useUpdateBranch = () => {
  const { t } = useTranslation('branch');
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateBranchInput> }) => {
      const res = await branchService.updateBranch(id, data);
      if (!res.success) {
        throw new Error(res.message || t('messages.updateError'));
      }
      return res.data;
    },
    onSuccess: (updatedBranch) => {
      toast.success(t('messages.updateSuccess'), updatedBranch.branchName);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BRANCHES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BRANCH_DETAIL(updatedBranch.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BRANCH_STATS });
    },
    onError: (err: Error) => {
      toast.error(t('messages.errorTitle'), err.message || t('messages.updateError'));
    },
  });
};

/**
 * Hook to delete a branch
 */
export const useDeleteBranch = () => {
  const { t } = useTranslation('branch');
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await branchService.deleteBranch(id);
      if (!res.success) {
        throw new Error(res.message || t('messages.deleteError'));
      }
      return res.data;
    },
    onSuccess: () => {
      toast.success(t('messages.deleteSuccess'));
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BRANCHES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BRANCH_STATS });
    },
    onError: (err: Error) => {
      toast.error(t('messages.errorTitle'), err.message || t('messages.deleteError'));
    },
  });
};
