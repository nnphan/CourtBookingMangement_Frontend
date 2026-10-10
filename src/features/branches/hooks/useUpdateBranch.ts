import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { branchDetailApi } from '../api/branch-detail.api';
import { BRANCH_DETAIL_QUERY_KEYS } from '../api/branch-detail.query';
import type { UpdateBranchRequest, BranchDetailDto } from '../types/branch-detail.types';
import { toast } from '@/lib/toast';

interface UpdateBranchVariables {
  branchId: string;
  payload: UpdateBranchRequest;
}

export const useUpdateBranch = () => {
  const { t } = useTranslation('branch');
  const queryClient = useQueryClient();

  return useMutation<BranchDetailDto, Error, UpdateBranchVariables>({
    mutationFn: ({ branchId, payload }) => branchDetailApi.updateBranch(branchId, payload),
    onSuccess: (updatedData, variables) => {
      toast.success(
        t('messages.updateSuccess', 'Cập nhật chi nhánh thành công'),
        updatedData.name,
      );
      queryClient.invalidateQueries({
        queryKey: BRANCH_DETAIL_QUERY_KEYS.detail(variables.branchId),
      });
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      queryClient.invalidateQueries({ queryKey: ['branch-summary'] });
    },
    onError: (err) => {
      toast.error(
        t('messages.errorTitle', 'Đã xảy ra lỗi'),
        err.message || t('messages.updateError', 'Không thể cập nhật chi nhánh.'),
      );
    },
  });
};
