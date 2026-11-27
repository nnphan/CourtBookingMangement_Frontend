import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { CurrentUserMenu } from '@/shared/components/current-user';
import { cn } from '@/lib/utils';

export const WorkspaceHeader = ({ isManagementWorkspace = true }: { isManagementWorkspace?: boolean }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      <header
        className={cn(
          'app-global-header sticky top-[env(safe-area-inset-top,0px)] z-20',
          isManagementWorkspace && 'bg-brand-700 shadow-sm',
        )}
      >
        <div
          className={cn(
            'flex h-14 w-full items-center justify-between sm:h-16',
            isManagementWorkspace ? 'px-3 sm:px-4' : 'px-4',
          )}
        >
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
                <span className="text-brand-600 text-[10px] font-black">CN</span>
              </div>
              <span className="text-brand-900 text-sm font-black tracking-tight">CourtNow</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <CurrentUserMenu />
          </div>
        </div>
      </header>

    </>
  );
};
