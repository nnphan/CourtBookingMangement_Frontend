import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  Menu,
  Building2,
  LayoutGrid,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { ManagementNavigation } from '@/components/navigation';
import { paths } from '@/app/router/paths';
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useBranchPermissions } from '@/hooks/branches';

export const AdminBranchLayout: React.FC = () => {
  const { t } = useTranslation('branch');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const permissions = useBranchPermissions();
  const { user, setUser } = useAuthStore();

  // Quick demo toggle to switch between ADMIN and BRANCH_MANAGER roles for testing permission rules
  const toggleRole = () => {
    if (!user) {
      setUser({
        id: 'admin-01',
        fullName: 'Admin Manager',
        phone: '0901234567',
        email: 'admin@alobo.vn',
        avatarUrl: null,
        role: 'admin',
        roles: ['ADMIN'],
      });
      return;
    }

    if (permissions.isAdmin) {
      setUser({
        ...user,
        role: 'owner',
        roles: ['BRANCH_MANAGER'],
      });
    } else {
      setUser({
        ...user,
        role: 'admin',
        roles: ['ADMIN'],
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50/70 text-slate-900 font-sans">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Enterprise SaaS Admin Header */}
      <header className="sticky top-0 z-30 flex h-14 sm:h-16 shrink-0 items-center justify-between border-b border-emerald-950/20 bg-[#064e3b] px-4 sm:px-6 lg:px-8 text-white shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label={t('layout.toggleNavigation')}
            className="grid size-9 place-items-center rounded-xl text-white/90 transition-colors hover:bg-white/15 active:scale-95"
          >
            <Menu className="size-5 stroke-[2.2]" />
          </button>

          <div
            onClick={() => navigate(paths.root)}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="flex h-9 items-center gap-2 rounded-xl bg-white px-2.5 shadow-xs">
              <div className="grid size-6 place-items-center rounded-lg bg-emerald-100">
                <span className="text-[10px] font-black text-emerald-800">ALO</span>
              </div>
              <span className="text-xs font-black tracking-tight text-emerald-950">ALOBO</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-white/80 text-xs font-semibold">
              <span className="text-white/40">/</span>
              <div className="flex items-center gap-1.5 text-white font-bold">
                <Building2 className="size-3.5 text-emerald-300" />
                <span>{t('layout.adminPortal')}</span>
              </div>
              <span className="text-white/40">/</span>
              <span className="text-emerald-200">{t('layout.breadcrumb')}</span>
            </div>
          </div>
        </div>

        {/* Center / Navigation Links on desktop */}
        <ManagementNavigation />

        {/* Right header actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Role badge with interactive test switch */}
          <button
            type="button"
            onClick={toggleRole}
            title={t('layout.role.toggleHint')}
            className="flex items-center gap-1.5 rounded-xl bg-white/15 hover:bg-white/25 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-white transition-colors"
          >
            {permissions.isAdmin ? (
              <>
                <ShieldCheck className="size-3.5 text-emerald-300" />
                <span>{t('layout.role.admin')}</span>
              </>
            ) : (
              <>
                <UserCheck className="size-3.5 text-amber-300" />
                <span>{t('layout.role.branchManager')}</span>
              </>
            )}
          </button>

          <LanguageSwitcher mode="dropdown" variant="contrast" />

          <button
            type="button"
            onClick={() => navigate(paths.dashboard)}
            className="hidden md:flex items-center gap-1.5 rounded-xl bg-white/15 hover:bg-white/25 px-3 py-1.5 text-xs font-bold text-white transition-colors"
          >
            <LayoutGrid className="size-3.5 text-emerald-200" />
            <span>{t('layout.nav.dashboard')}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminBranchLayout;
