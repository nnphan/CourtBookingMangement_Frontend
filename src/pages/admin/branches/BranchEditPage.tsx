import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Building2, AlertCircle } from 'lucide-react';
import {
  useGetBranchDetail,
  useUpdateBranch,
  useBranchPermissions,
} from '@/hooks/branches';
import { BranchForm } from '@/components/branches';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/management';
import type { CreateBranchInput } from '@/types/branch';

export const BranchEditPage: React.FC = () => {
  const { t } = useTranslation('branch');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const permissions = useBranchPermissions();

  const { branch, isLoading, isError, error, refetch } = useGetBranchDetail(id);
  const { mutateAsync: updateBranchMutation, isPending } = useUpdateBranch();

  // Role guard: ADMIN or BRANCH_MANAGER can edit
  if (!permissions.canEdit) {
    return (
      <div className="w-full bg-white rounded-2xl border border-amber-200 p-8 text-center max-w-lg mx-auto mt-10 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900">{t('access.restrictedTitle')}</h2>
        <p className="text-sm text-slate-500 mt-1">
          {t('access.editDenied')}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => navigate('/admin/branches')}
          className="mt-4 rounded-xl border-slate-200 text-xs font-semibold"
        >
          {t('actions.backToList')}
        </Button>
      </div>
    );
  }

  const handleSubmit = async (data: CreateBranchInput) => {
    if (!id) return;
    try {
      await updateBranchMutation({
        id,
        data,
      });
      navigate(`/admin/branches/${id}`);
    } catch {
      // Error handled by hook toast
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="w-full space-y-6 max-w-5xl mx-auto">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
        <Skeleton className="h-72 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  // Error state
  if (isError || !branch) {
    return (
      <div className="w-full bg-white rounded-2xl border border-red-200 p-8 sm:p-12 text-center max-w-lg mx-auto mt-10 shadow-xs">
        <div className="size-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
          <AlertCircle className="size-6 stroke-[2.2]" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">{t('errors.notFoundTitle')}</h2>
        <p className="text-sm text-slate-500 mt-1">
          {error?.message || t('errors.editLoadDescription')}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="mt-4 rounded-xl border-slate-200 text-xs font-semibold"
        >
          {t('actions.retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <PageHeader
        leading={
          <button
            type="button"
            onClick={() => navigate(`/admin/branches/${id}`)}
            aria-label={t('actions.backToDetailAria')}
            className="size-10 shrink-0 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
          >
            <ArrowLeft className="size-5 stroke-[2.2]" />
          </button>
        }
        icon={Building2}
        title={t('page.editTitle', { name: branch.branchName })}
        description={t('page.editDescription')}
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/branches/${id}`)}
          >
            {t('actions.cancel')}
          </Button>
        }
      />

      {/* Form preloaded with existing data */}
      <BranchForm
        initialData={branch}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/admin/branches/${id}`)}
        isLoading={isPending}
        isEditMode={true}
      />
    </div>
  );
};

export default BranchEditPage;
