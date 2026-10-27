import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Building2, KeyRound, Menu, Shield, UserCog, LayoutGrid } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { ManagementNavigation } from '@/components/navigation';
import { paths } from '@/app/router/paths';
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher';
import { CurrentUserMenu } from '@/shared/components/current-user';

export const UserManagementLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const isOwnerPage = pathname.startsWith(paths.adminOwners);
  const isPermissionPage = pathname.startsWith(paths.adminPermissions);
  const isRolePage = pathname.startsWith(paths.adminRoles);
  const pageTitleKey = isOwnerPage
    ? 'ownerManagement.title'
    : isPermissionPage
      ? 'permission.title'
      : isRolePage
        ? 'role.title'
        : 'userManagement.title';

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50/70 text-slate-900">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-emerald-800/30 bg-[#0e6534] px-4 text-white shadow-xs sm:h-16 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Mở menu điều hướng"
            className="grid size-9 place-items-center rounded-xl text-white/90 transition-colors hover:bg-white/15 active:scale-95"
          >
            <Menu className="size-5 stroke-[2.2]" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="flex h-9 items-center gap-2 rounded-xl bg-white px-2.5 shadow-xs">
              <div className="grid size-6 place-items-center rounded-lg bg-[#dcfce7]">
                <span className="text-brand-600 text-[10px] font-black">ALO</span>
              </div>
              <span className="text-brand-900 text-xs font-black tracking-tight">ALOBO</span>
            </div>

            <div className="hidden items-center gap-2 text-xs font-semibold text-white/80 sm:flex">
              <span className="text-white/40">/</span>
              <div className="flex items-center gap-1.5 font-bold text-white">
                {isOwnerPage ? (
                  <Building2 className="size-3.5 text-emerald-300" />
                ) : isPermissionPage ? (
                  <KeyRound className="size-3.5 text-emerald-300" />
                ) : isRolePage ? (
                  <Shield className="size-3.5 text-emerald-300" />
                ) : (
                  <UserCog className="size-3.5 text-emerald-300" />
                )}
                <span>{t(pageTitleKey)}</span>
              </div>
            </div>
          </div>
        </div>

        <ManagementNavigation />

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher variant="contrast" />
          <button
            type="button"
            onClick={() => navigate(paths.dashboard)}
            className="hidden items-center gap-1.5 rounded-xl bg-white/15 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-white/25 sm:flex"
          >
            <LayoutGrid className="size-3.5 text-emerald-200" />
            <span>Dashboard</span>
          </button>
          <CurrentUserMenu />
        </div>
      </header>

      <main className="w-full flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default UserManagementLayout;
