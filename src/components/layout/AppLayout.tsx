import { useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Menu, Lightbulb } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher';
import { CurrentUserMenu } from '@/shared/components/current-user';
import { paths } from '@/app/router/paths';
import { cn } from '@/lib/utils';

export const AppLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const isPosWorkspace =
    pathname === paths.posSales ||
    pathname === paths.posManagement ||
    pathname.startsWith(`${paths.posManagement}/`);

  return (
    <div className={cn(
      'flex min-h-dvh flex-col',
      isPosWorkspace ? 'bg-surface-muted' : 'dashboard-canvas bg-surface',
    )}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Top Header */}
      <header className={cn(
        'app-global-header sticky top-[env(safe-area-inset-top,0px)] z-20',
        isPosWorkspace && 'bg-brand-700 shadow-sm',
      )}>
        <div className={cn(
          'mx-auto flex h-14 items-center justify-between px-4 sm:h-16',
          isPosWorkspace && 'max-w-[1800px] lg:px-6 2xl:px-8',
        )}>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="grid size-11 place-items-center rounded-full text-white transition-colors hover:bg-white/20"
              aria-label="Menu"
            >
              <Menu aria-hidden className="size-6" strokeWidth={2.5} />
            </button>
            <div className="flex h-10 items-center gap-2 rounded-full bg-white px-2 pr-4 shadow-[var(--shadow-card)]">
              <div className="grid size-8 place-items-center rounded-full bg-[#dcfce7]">
                <span className="text-brand-600 text-[10px] font-black">ALO</span>
              </div>
              <span className="text-brand-900 text-sm font-black tracking-tight">ALOBO</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher variant="contrast" />
            <button
              type="button"
              aria-label="Hướng dẫn"
              className="bg-accent-gold text-brand-900 hover:bg-accent-gold/90 flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-bold shadow-sm"
            >
              <Lightbulb aria-hidden="true" className="size-4" />
              <span className="hidden sm:inline">Hướng dẫn</span>
            </button>
            <CurrentUserMenu />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={cn(
        'mx-auto w-full min-w-0 flex-1 px-4 pb-[calc(5rem+env(safe-area-inset-bottom,0px))]',
        isPosWorkspace ? 'max-w-[1800px] lg:px-6 lg:pb-6 2xl:px-8' : 'max-w-6xl',
      )}>
        <Outlet />
      </main>

      <div className={isPosWorkspace ? 'lg:hidden' : undefined}>
        <BottomNav chatInline={isPosWorkspace} />
      </div>
    </div>
  );
};
