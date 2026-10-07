import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  Menu,
  ArrowLeft,
  Users,
  LayoutGrid,
  Lightbulb,
  Plus,
  CalendarCheck,
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { paths } from '@/app/router/paths';
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher';

export const CustomerLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const isListPage = location.pathname === paths.customers;

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50/70 text-slate-900">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Top Enterprise Header Bar */}
      <header className="sticky top-0 z-20 flex h-14 sm:h-16 shrink-0 items-center justify-between border-b border-emerald-800/30 bg-[#0e6534] px-4 sm:px-6 lg:px-8 text-white shadow-xs">
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
                <span className="text-[10px] font-black text-brand-600">ALO</span>
              </div>
              <span className="text-xs font-black tracking-tight text-brand-900">ALOBO</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-white/80 text-xs font-semibold">
              <span className="text-white/40">/</span>
              <div className="flex items-center gap-1.5 text-white font-bold">
                <Users className="size-3.5 text-emerald-300" />
                <span>{t('customer.title', 'Quản lý Khách hàng')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right header actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher variant="contrast" />

          <button
            type="button"
            onClick={() => navigate(paths.courtStatus)}
            className="hidden md:flex items-center gap-1.5 rounded-xl bg-white/15 hover:bg-white/25 px-3 py-1.5 text-xs font-bold text-white transition-colors"
          >
            <CalendarCheck className="size-3.5 text-emerald-200" />
            <span>Trạng thái sân</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(paths.dashboard)}
            className="hidden sm:flex items-center gap-1.5 rounded-xl bg-white/15 hover:bg-white/25 px-3 py-1.5 text-xs font-bold text-white transition-colors"
          >
            <LayoutGrid className="size-3.5 text-emerald-200" />
            <span>Dashboard</span>
          </button>

          {isListPage && (
            <button
              type="button"
              onClick={() => navigate(paths.customerCreate)}
              className="flex items-center gap-1.5 rounded-xl bg-accent-gold hover:bg-accent-gold/90 px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-xs transition-colors"
            >
              <Plus className="size-3.5" strokeWidth={3} />
              <span className="hidden xs:inline">{t('customer.addCustomer', 'Thêm khách hàng')}</span>
            </button>
          )}

          <button
            type="button"
            className="flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 px-2.5 py-1.5 text-xs font-semibold text-white/90 transition-colors"
          >
            <Lightbulb className="size-3.5 text-amber-300" />
            <span className="hidden lg:inline">Hướng dẫn</span>
          </button>
        </div>
      </header>

      {/* Full-width Workspace Container */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default CustomerLayout;
