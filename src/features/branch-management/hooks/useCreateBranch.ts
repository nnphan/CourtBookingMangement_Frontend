import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBranch } from '../services/branchService';
import type { CreateBranchRequest, CreateBranchResponse } from '../types/branch.types';
import { extractErrorMessage } from '../utils/error';
import { toast } from '@/lib/toast';

/**
 * Hook to create a new branch with react-query mutation support
 * Supports Loading, Success, Error and cache invalidation
 */
export const useCreateBranch = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateBranchResponse['data'], Error, CreateBranchRequest>({
    mutationFn: async (request: CreateBranchRequest) => {
      return await createBranch(request);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      queryClient.invalidateQueries({ queryKey: ['branches', 'stats'] });
      toast.success(
        'Tạo chi nhánh thành công!',
        `Chi nhánh "${data?.name ?? 'mới'}" đã được lưu vào hệ thống.`,
      );
    },
    onError: (err: unknown) => {
      const message = extractErrorMessage(err, 'Vui lòng kiểm tra lại thông tin cơ sở và thử lại.');
      toast.error('Cannot create branch', message);
    },
    retry: false,
  });
};
