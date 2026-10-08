import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  useGetBranchDetail,
  useDeleteBranch,
  useUpdateBranch,
  useBranchPermissions,
} from '@/hooks/branches';
import {
  BranchDetailTabs,
  BranchDeleteDialog,
} from '@/components/branches';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader, StatusBadge } from '@/components/management';
import type { CourtItem } from '@/types/branch';

export const BranchDetailPage: React.FC = () => {
  const { t } = useTranslation('branch');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const permissions = useBranchPermissions();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {
    branch,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGetBranchDetail(id);

  const { mutateAsync: deleteBranchMutation, isPending: isDeleting } = useDeleteBranch();
  const { mutateAsync: updateBranchMutation } = useUpdateBranch();

  const handleDeleteConfirm = async () => {
    if (!id) return;
    try {
      await deleteBranchMutation(id);
      navigate('/admin/branches');
    } catch {
      // Error handled by hook toast
    }
  };

  const handleAddCourt = async (courtData: Partial<CourtItem>) => {
    if (!branch) return;
    const existingCourts = branch.courts || [];
    const newCourt: CourtItem = {
      id: `court-${Date.now().toString().slice(-4)}`,
      name: courtData.name || t('form.courts.defaultName', { index: existingCourts.length + 1 }),
      surface: courtData.surface || 'bwf_mat',
      category: courtData.category || 'standard',
      status: courtData.status || 'available',
      pricePerHour: courtData.pricePerHour || 120000,
    };

    await updateBranchMutation({
      id: branch.id,
      data: {
        courts: [...existingCourts, newCourt],
      },
    });
  };

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="w-full space-y-6 max-w-6xl mx-auto">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20 rounded-xl" />
            <Skeleton className="h-9 w-20 rounded-xl" />
          </div>
        </div>
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  // Error State
  if (isError || !branch) {
    return (
      <div className="w-full bg-white rounded-2xl border border-red-200 p-8 sm:p-12 text-center max-w-lg mx-auto mt-10 shadow-xs">
        <div className="size-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
          <AlertCircle className="size-6 stroke-[2.2]" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">{t('errors.notFoundTitle')}</h2>
        <p className="text-sm text-slate-500 mt-1">
          {error?.message || t('errors.notFoundDescription')}
        </p>
        <div className="flex items-center justify-center gap-2 mt-5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/branches')}
            className="rounded-xl border-slate-200 text-xs font-semibold"
          >
            {t('actions.backToList')}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => refetch()}
            
          >
            {t('actions.retry')}
          </Button>
        </div>
      </div>
    );
  }

  const isActive = branch.status === 'active';

  return (
    <div className="w-full space-y-6 max-w-6xl mx-auto">
      {/* Detail Page Header */}
      <PageHeader
        leading={
          <button
            type="button"
            onClick={() => navigate('/admin/branches')}
            aria-label={t('actions.backToListAria')}
            className="size-10 shrink-0 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
          >
            <ArrowLeft className="size-5 stroke-[2.2]" />
          </button>
        }
        title={branch.branchName}
        description={`${branch.address}, ${branch.district}, ${branch.city}`}
        actions={
          <>
            <StatusBadge status={isActive ? 'active' : 'inactive'}>
              {isActive ? t('status.active') : t('status.inactive')}
            </StatusBadge>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              aria-label={t('actions.refresh')}
              title={t('actions.refresh')}
            >
              <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
            </Button>

            {permissions.canEdit && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigate(`/admin/branches/${branch.id}/edit`)}
              >
                <Edit2 className="size-4" />
                {t('actions.edit')}
              </Button>
            )}

            {permissions.canDelete && (
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="size-4" />
                {t('actions.delete')}
              </Button>
            )}
          </>
        }
      />

      {/* Tabs Container */}
      <BranchDetailTabs
        branch={branch}
        onEdit={() => navigate(`/admin/branches/${branch.id}/edit`)}
        onAddCourt={handleAddCourt}
      />

      {/* Delete Confirmation Dialog */}
      <BranchDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        branchName={branch.branchName}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default BranchDetailPage;
