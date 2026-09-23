import { useState } from 'react';
import { Outlet } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Menu, Lightbulb } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';

export const AppLayout = () => {
  const { t } = useTranslation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-canvas flex min-h-dvh flex-col bg-surface">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Top Header */}
      <header className="sticky top-[env(safe-area-inset-top,0px)] z-20">
        <div className="mx-auto flex h-14 items-center justify-between px-4 sm:h-16">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="grid size-10 place-items-center rounded-full text-white transition-colors hover:bg-white/20"
              aria-label="Menu"
            >
              <Menu aria-hidden className="size-6" strokeWidth={2.5} />
            </button>
            <div className="flex h-10 items-center gap-2 rounded-full bg-white px-2 pr-4 shadow-[var(--shadow-card)]">
              <div className="grid size-8 place-items-center rounded-full bg-[#dcfce7]">
                <span className="text-[10px] font-black text-brand-600">ALO</span>
              </div>
              <span className="text-sm font-black tracking-tight text-brand-900">ALOBO</span>
            </div>
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full bg-accent-gold px-3 py-1.5 text-sm font-bold text-white shadow-sm hover:bg-accent-gold/90"
          >
            <Lightbulb className="size-4" />
            Hướng dẫn
          </button>
        </div>
      </header>
      
      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-[calc(5rem+env(safe-area-inset-bottom,0px))]">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
};
