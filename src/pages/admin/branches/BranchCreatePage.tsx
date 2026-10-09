import React from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ShieldAlert } from 'lucide-react';
import { useBranchPermissions } from '@/hooks/branches';
import { Button } from '@/components/ui/button';
import { AdminBranchCreate } from '@/features/branch-management';
import { paths } from '@/app/router/paths';

export const BranchCreatePage: React.FC = () => {
  const { t } = useTranslation('branch');
  const navigate = useNavigate();
  const permissions = useBranchPermissions();

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
          onClick={() => navigate(paths.adminBranches)}
          className="mt-4 rounded-xl border-slate-200 text-xs font-semibold"
        >
          {t('actions.backToList')}
        </Button>
      </div>
    );
  }

  return <AdminBranchCreate />;
};

export default BranchCreatePage;
