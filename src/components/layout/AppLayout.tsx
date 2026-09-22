import { NavLink, Outlet } from 'react-router';
import { useTranslation } from 'react-i18next';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { cn } from '@/lib/utils';
import { paths } from '@/app/router/paths';

const links = [
  { to: paths.dashboard, key: 'nav.dashboard' },
  { to: paths.courts, key: 'nav.courts' },
  { to: paths.bookings, key: 'nav.bookings' },
];

export const AppLayout = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();

  return (
    <div className="flex min-h-dvh flex-col bg-surface-muted">
      <header className="sticky top-[env(safe-area-inset-top,0px)] z-20 bg-brand-600 text-content-onbrand">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <span className="text-lg font-bold">ALO Booking</span>
          <nav className="ml-auto flex items-center gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-[var(--radius-field)] px-3 py-2 text-sm font-semibold transition-colors',
                    isActive ? 'bg-white/20' : 'hover:bg-white/10',
                  )
                }
              >
                {t(l.key)}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={logout}
              className="ml-2 grid size-9 place-items-center rounded-full hover:bg-white/10"
              aria-label={t('nav.logout')}
              title={user?.fullName ?? ''}
            >
              <LogOut aria-hidden className="size-5" />
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 p-4">
        <Outlet />
      </main>
    </div>
  );
};
