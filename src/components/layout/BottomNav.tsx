import { NavLink } from 'react-router';
import { Home, CalendarCheck, ClipboardList, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { paths } from '@/app/router/paths';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { PERMISSIONS } from '@/shared/constants/permissions';

export const BottomNav = ({ chatInline = false }: { chatInline?: boolean }) => {
  const user = useAuthStore((s) => s.user);
  const homePath = user?.permissions?.includes(PERMISSIONS.DASHBOARD_VIEW) ? paths.dashboard : paths.root;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30">
      {/* Floating Action Button for Chat */}
      {!chatInline && <div className="absolute -top-14 right-4 z-40">
        <button
          type="button"
          className="flex size-12 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label="Chat"
        >
          <MessageCircle aria-hidden="true" className="size-6" />
        </button>
      </div>}

      {/* Bottom Nav Bar */}
      <nav aria-label="Điều hướng chính" className="flex h-[calc(4rem+env(safe-area-inset-bottom,0px))] w-full bg-brand-600 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <NavLink
          to={homePath}
          className={({ isActive }) =>
            cn(
              'relative flex flex-1 flex-col items-center justify-center gap-1 transition-colors',
              isActive ? 'bg-brand-700 text-white' : 'text-white hover:bg-brand-700/70'
            )
          }
        >
          <Home aria-hidden="true" className="size-5" />
          <span className="text-xs font-semibold">Trang Chủ</span>
        </NavLink>

        {user?.permissions?.includes(PERMISSIONS.BOOKING_VIEW) && <NavLink
          to={paths.bookings}
          className={({ isActive }) =>
            cn(
              'relative flex flex-1 flex-col items-center justify-center gap-1 transition-colors',
              isActive ? 'bg-brand-700 text-white' : 'text-white hover:bg-brand-700/70'
            )
          }
        >
          <CalendarCheck aria-hidden="true" className="size-5" />
          <span className="text-xs font-semibold">Đặt lịch</span>
        </NavLink>}

        <NavLink
          to="/orders" // Placeholder path for 'Duyệt đơn'
          className={({ isActive }) =>
            cn(
              'relative flex flex-1 flex-col items-center justify-center gap-1 transition-colors',
              isActive ? 'bg-brand-700 text-white' : 'text-white hover:bg-brand-700/70'
            )
          }
        >
          <div className="relative">
            <ClipboardList aria-hidden="true" className="size-5" />
            <span className="absolute -right-3 -top-1.5 flex h-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
              296
            </span>
          </div>
          <span className="text-xs font-semibold">Duyệt đơn</span>
        </NavLink>
        {chatInline && (
          <button type="button" className="flex flex-1 flex-col items-center justify-center gap-1 text-white transition-colors hover:bg-brand-700/70" aria-label="Chat">
            <MessageCircle aria-hidden="true" className="size-5" />
            <span className="text-xs font-semibold">Chat</span>
          </button>
        )}
      </nav>
    </div>
  );
};

export default BottomNav;
