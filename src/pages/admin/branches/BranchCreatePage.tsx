import React from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Building2, ShieldAlert } from 'lucide-react';
import { useCreateBranch, useBranchPermissions } from '@/hooks/branches';
import { BranchForm } from '@/components/branches';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/management';
import type { CreateBranchInput } from '@/types/branch';

export const BranchCreatePage: React.FC = () => {
  const { t } = useTranslation('branch');
  const navigate = useNavigate();
  const permissions = useBranchPermissions();
  const { mutateAsync: createBranchMutation, isPending } = useCreateBranch();

  // Role Guard: Only ADMIN can create branches
  if (!permissions.canCreate) {
    return (
      <div className="w-full bg-white rounded-2xl border border-amber-200 p-8 text-center max-w-lg mx-auto mt-10 shadow-xs">
        <div className="size-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-100">
          <ShieldAlert className="size-6 stroke-[2.2]" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">{t('access.restrictedTitle')}</h2>
        <p className="text-sm text-slate-500 mt-1">
          {t('access.createDenied')}
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

  const handleSubmit = async (data: CreateBranchInput, continueEditing = false) => {
    try {
      const created = await createBranchMutation(data);
      if (continueEditing) {
        navigate(`/admin/branches/${created.id}/edit`);
      } else {
        navigate('/admin/branches');
      }
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
    <div className="w-full space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
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
        icon={Building2}
        title={t('page.createTitle')}
        description={t('page.createDescription')}
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/branches')}
          >
            {t('actions.cancel')}
          </Button>
        }
      />

      {/* Multi-section Branch Form */}
      <BranchForm
        onSubmit={handleSubmit}
        onCancel={() => navigate('/admin/branches')}
        isLoading={isPending}
        isEditMode={false}
      />
    </div>
  );
};

export default BranchCreatePage;
