import { CalendarDays, LayoutDashboard, LogOut, UsersRound } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { paths } from '@/app/router/paths';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { getCurrentUserRole } from '@/shared/utils/current-user';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CurrentUserAvatar } from './CurrentUserAvatar';
import { CurrentUserMenuSkeleton } from './CurrentUserMenuSkeleton';
import { CurrentUserSummary } from './CurrentUserSummary';

interface CurrentUserMenuProps {
  variant?: 'contrast' | 'surface';
}

export const CurrentUserMenu = ({ variant = 'contrast' }: CurrentUserMenuProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, isLoading, isError, refetch } = useCurrentUser();
  const { logout, isLoggingOut } = useLogout();

  if (isLoading && !user) {
    return <CurrentUserMenuSkeleton variant={variant} label={t('account.loading')} />;
  }

  const fullName = user?.fullName?.trim() || t('account.user');
  const secondary = user?.email || user?.phone || '';
  const roleKey = getCurrentUserRole(user);
  const roleLabel = t(`account.roles.${roleKey}`);
  const isCustomer = roleKey === 'customer';
  const canAccessDashboard = roleKey === 'admin';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t('account.openMenuFor', { name: fullName })}
          className={cn(
            'flex min-h-11 max-w-full items-center rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            variant === 'surface'
              ? 'text-content-primary hover:bg-surface-muted focus-visible:ring-brand-600 focus-visible:ring-offset-surface'
              : 'focus-visible:ring-offset-brand-700 text-white hover:bg-white/10 focus-visible:ring-white',
          )}
        >
          <CurrentUserSummary
            fullName={fullName}
            avatarUrl={user?.avatarUrl}
            roleLabel={roleLabel}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="border-line bg-surface text-content-primary w-64 max-w-[calc(100vw-1rem)] p-1.5"
      >
        <DropdownMenuLabel className="px-2.5 py-2">
          <span className="flex items-center gap-2.5">
            <CurrentUserAvatar
              fullName={fullName}
              avatarUrl={user?.avatarUrl}
              className="size-10"
            />
            <span className="flex min-w-0 flex-col">
              <span className="text-content-primary text-sm font-bold wrap-break-word">
                {fullName}
              </span>
              {secondary && (
                <span className="text-content-secondary max-w-full truncate text-xs font-normal">
                  {secondary}
                </span>
              )}
              <span className="text-content-secondary text-xs font-medium">{roleLabel}</span>
            </span>
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-line" />
        {isError && (
          <DropdownMenuItem onSelect={() => void refetch()}>
            {t('account.retryProfile')}
          </DropdownMenuItem>
        )}
        {canAccessDashboard && (
          <DropdownMenuItem asChild>
            <Link to={paths.dashboard}>
              <LayoutDashboard aria-hidden="true" className="size-4" />
              {t('account.dashboard')}
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link
            to={isCustomer ? paths.myBooking : paths.bookings}
            aria-current={isCustomer && location.pathname === paths.myBooking ? 'page' : undefined}
          >
            <CalendarDays aria-hidden="true" className="size-4" />
            {t(isCustomer ? 'account.myBookings' : 'account.bookings')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            to={paths.myPlayerMatches}
            aria-current={location.pathname === paths.myPlayerMatches ? 'page' : undefined}
          >
            <UsersRound aria-hidden="true" className="size-4" />
            {t('account.myMatches')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-line" />
        <DropdownMenuItem
          destructive
          disabled={isLoggingOut}
          onSelect={(event) => {
            event.preventDefault();
            logout();
          }}
        >
          <LogOut aria-hidden="true" className="size-4" />
          {isLoggingOut ? t('account.loggingOut') : t('account.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
