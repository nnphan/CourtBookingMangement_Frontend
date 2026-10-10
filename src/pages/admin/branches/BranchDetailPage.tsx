import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  AlertCircle,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';
import {
  useBranchDetail,
  BranchDetailTabs,
  BranchDetailSkeleton,
  EditBranchDialog,
  buildFullAddress,
  BRANCH_DETAIL_QUERY_KEYS,
} from '@/features/branches';
import { useDeleteBranch, useBranchPermissions } from '@/hooks/branches';
import { BranchDeleteDialog } from '@/components/branches';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/management';
import { useQueryClient } from '@tanstack/react-query';

export const BranchDetailPage: React.FC = () => {
  const { t } = useTranslation('branch');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const permissions = useBranchPermissions();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const {
    data: branch,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useBranchDetail(id);

  const { mutateAsync: deleteBranchMutation, isPending: isDeleting } = useDeleteBranch();

  const handleRefresh = () => {
    if (id) {
      queryClient.invalidateQueries({
        queryKey: BRANCH_DETAIL_QUERY_KEYS.detail(id),
      });
    }
    refetch();
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;
    try {
      await deleteBranchMutation(id);
      navigate('/admin/branches');
    } catch {
      // Toast notification is managed by hook
    }
  };

  // Loading Skeleton State
  if (isLoading) {
    return <BranchDetailSkeleton />;
  }

  // Error State
  if (isError || !branch) {
    return (
      <div className="w-full bg-white rounded-2xl border border-red-200 p-8 sm:p-12 text-center max-w-lg mx-auto mt-10 shadow-xs">
        <div className="size-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
          <AlertCircle className="size-6 stroke-[2.2]" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">
          {t('errors.loadDetailTitle', 'Không thể tải thông tin chi nhánh.')}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {error?.message || t('errors.notFoundDescription', 'Tải thông tin chi nhánh thất bại. Vui lòng thử lại.')}
        </p>
        <div className="flex items-center justify-center gap-2 mt-5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/branches')}
            className="rounded-xl border-slate-200 text-xs font-semibold"
          >
            {t('actions.backToList', 'Quay lại danh sách')}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleRefresh}
          >
            <RefreshCw className="size-3.5 mr-1.5" />
            {t('actions.retry', 'Thử lại')}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            <RotateCcw className="size-3.5 mr-1.5" />
            {t('actions.reload', 'Tải lại')}
          </Button>
        </div>
      </div>
    );
  }

  const fullAddress = buildFullAddress(branch.address, branch.district, branch.city);

  return (
    <div className="w-full space-y-6 max-w-6xl mx-auto">
      {/* Detail Page Header */}
      <PageHeader
        leading={
          <button
            type="button"
            onClick={() => navigate('/admin/branches')}
            aria-label={t('actions.backToListAria', 'Quay lại danh sách chi nhánh')}
            className="size-10 shrink-0 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-5 stroke-[2.2]" />
          </button>
        }
        title={branch.name}
        description={fullAddress || undefined}
        actions={
          <>
            {/* Status Badge */}
            {branch.isActive ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap bg-emerald-50 text-emerald-700 border-emerald-200">
                <span aria-hidden className="size-1.5 rounded-full bg-emerald-500" />
                {t('status.active', 'Hoạt động')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap bg-red-50 text-red-700 border-red-200">
                <span aria-hidden className="size-1.5 rounded-full bg-red-500" />
                {t('status.inactive', 'Ngưng hoạt động')}
              </span>
            )}

            {/* Refresh Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isFetching}
              aria-label={t('actions.refresh', 'Làm mới')}
              title={t('actions.refresh', 'Làm mới')}
            >
              <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
            </Button>

            {/* Edit Button */}
            {permissions.canEdit && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Edit2 className="size-4" />
                {t('actions.edit', 'Chỉnh sửa')}
              </Button>
            )}

            {/* Delete Button */}
            {permissions.canDelete && (
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="size-4" />
                {t('actions.delete', 'Xóa')}
              </Button>
            )}
          </>
        }
      />

      {/* Tabs Container */}
      <BranchDetailTabs
        branch={branch}
        onEdit={() => setIsEditDialogOpen(true)}
        canEdit={permissions.canEdit}
      />

      {/* Edit Branch Dialog */}
      <EditBranchDialog
        branch={branch}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <BranchDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        branchName={branch.name}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default BranchDetailPage;
