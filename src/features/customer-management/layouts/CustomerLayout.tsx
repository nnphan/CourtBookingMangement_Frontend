import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Menu, ArrowLeft, Users, LayoutGrid, Lightbulb, Plus } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { ManagementNavigation } from '@/components/navigation';
import { paths } from '@/app/router/paths';
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher';
import { CurrentUserMenu } from '@/shared/components/current-user';

export const CustomerLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const isListPage = location.pathname === paths.customers;

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50/70 text-slate-900">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Top Enterprise Header Bar */}
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

          {!isListPage && (
            <button
              type="button"
              onClick={() => navigate(paths.customers)}
              aria-label="Quay lại danh sách khách hàng"
              className="grid size-9 place-items-center rounded-xl text-white/90 transition-colors hover:bg-white/15 active:scale-95"
            >
              <ArrowLeft className="size-5 stroke-[2.2]" />
            </button>
          )}

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
                <Users className="size-3.5 text-emerald-300" />
                <span>{t('customer.title', 'Quản lý Khách hàng')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center / Navigation Links on desktop */}
        <ManagementNavigation />

        {/* Right header actions */}
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

          {isListPage && (
            <button
              type="button"
              onClick={() => navigate(paths.customerCreate)}
              className="bg-accent-gold hover:bg-accent-gold/90 flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-xs transition-colors"
            >
              <Plus className="size-3.5" strokeWidth={3} />
              <span className="xs:inline hidden">
                {t('customer.addCustomer', 'Thêm khách hàng')}
              </span>
            </button>
          )}

          <button
            type="button"
            className="flex items-center gap-1.5 rounded-xl bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white/90 transition-colors hover:bg-white/20"
          >
            <Lightbulb className="size-3.5 text-amber-300" />
            <span className="hidden lg:inline">Hướng dẫn</span>
          </button>
          <CurrentUserMenu />
        </div>
      </header>

      {/* Full-width Workspace Container */}
      <main className="w-full flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default CustomerLayout;
