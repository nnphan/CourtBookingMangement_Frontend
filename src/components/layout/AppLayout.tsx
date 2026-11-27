import { Outlet, useLocation } from 'react-router';
import { MessageCircle } from 'lucide-react';
import { WorkspaceHeader } from '@/components/layout/WorkspaceHeader';
import { paths } from '@/app/router/paths';
import { cn } from '@/lib/utils';

export const AppLayout = () => {
  const { pathname } = useLocation();
  const isManagementWorkspace =
    pathname === paths.posSales ||
    pathname === paths.posManagement ||
    pathname.startsWith(`${paths.posManagement}/`) ||
    pathname === paths.adminBranches ||
    pathname.startsWith(`${paths.adminBranches}/`) ||
    pathname === paths.staffManagement ||
    pathname.startsWith(`${paths.staffManagement}/`);

  return (
    <div
      className={cn(
        'flex min-h-dvh flex-col',
        isManagementWorkspace ? 'bg-surface-muted' : 'dashboard-canvas bg-surface',
      )}
    >
      <WorkspaceHeader isManagementWorkspace={isManagementWorkspace} />

      {/* Main Content Area */}
      <main
        className={cn(
          'mx-auto w-full min-w-0 flex-1 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]',
          isManagementWorkspace ? 'px-3 sm:px-4 lg:pb-6' : 'max-w-6xl px-4',
        )}
      >
        <Outlet />
      </main>

      <button
        type="button"
        aria-label="Chat"
        className={cn(
          'bg-brand-600 hover:bg-brand-700 fixed right-4 bottom-4 z-30 grid size-12 place-items-center rounded-full text-white shadow-lg',
          isManagementWorkspace && 'lg:hidden',
        )}
      >
        <MessageCircle aria-hidden className="size-6" />
      </button>
    </div>
  );
};
