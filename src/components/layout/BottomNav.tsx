import { NavLink } from 'react-router';
import { Home, CalendarCheck, ClipboardList, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { paths } from '@/app/router/paths';

export const BottomNav = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30">
      {/* Floating Action Button for Chat */}
      <div className="absolute -top-14 right-4 z-40">
        <button
          type="button"
          className="flex size-12 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label="Chat"
        >
          <MessageCircle className="size-6" />
        </button>
      </div>

      {/* Bottom Nav Bar */}
      <nav className="flex h-[calc(4rem+env(safe-area-inset-bottom,0px))] w-full bg-brand-600 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <NavLink
          to={paths.dashboard}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center justify-center gap-1 transition-colors',
              isActive ? 'text-accent-gold' : 'text-white/70 hover:text-white'
            )
          }
        >
          <Home className="size-5" />
          <span className="text-[11px] font-semibold">Trang Chủ</span>
        </NavLink>

        <NavLink
          to={paths.bookings}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center justify-center gap-1 transition-colors',
              isActive ? 'text-accent-gold' : 'text-white/70 hover:text-white'
            )
          }
        >
          <CalendarCheck className="size-5" />
          <span className="text-[11px] font-semibold">Đặt lịch</span>
        </NavLink>

        <NavLink
          to="/orders" // Placeholder path for 'Duyệt đơn'
          className={({ isActive }) =>
            cn(
              'relative flex flex-1 flex-col items-center justify-center gap-1 transition-colors',
              isActive ? 'text-accent-gold' : 'text-white/70 hover:text-white'
            )
          }
        >
          <div className="relative">
            <ClipboardList className="size-5" />
            <span className="absolute -right-3 -top-1.5 flex h-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
              296
            </span>
          </div>
          <span className="text-[11px] font-semibold">Duyệt đơn</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default BottomNav;
