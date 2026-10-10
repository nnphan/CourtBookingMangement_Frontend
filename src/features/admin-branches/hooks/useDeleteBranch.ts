import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { branchAdminApi } from '../api/branch-admin.api';
import { BRANCH_ADMIN_QUERY_KEYS } from '../api/branch-admin.query';
import { toast } from '@/lib/toast';

export const useDeleteBranch = () => {
  const { t } = useTranslation('branch');
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => branchAdminApi.deleteBranch(id),
    onSuccess: () => {
      toast.success(t('messages.deleteSuccess', 'Xóa chi nhánh thành công.'));
      queryClient.invalidateQueries({ queryKey: BRANCH_ADMIN_QUERY_KEYS.allBranches });
      queryClient.invalidateQueries({ queryKey: BRANCH_ADMIN_QUERY_KEYS.summary });
    },
    onError: (err: Error) => {
      toast.error(
        t('messages.errorTitle', 'Đã xảy ra lỗi'),
        err.message || t('messages.deleteError', 'Không thể xóa chi nhánh.'),
      );
    },
  });
};
