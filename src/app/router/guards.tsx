import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { paths } from '@/app/router/paths';
import { getDefaultRouteForUser } from '@/app/router/role-destination';
import { getCurrentUserRole, hasCurrentUserRole } from '@/shared/utils/current-user';
import { USER_ROLES } from '@/shared/constants/roles';
import { RouteFallback } from '@/components/common/RouteFallback';

export const ProtectedRoute = () => {
  const location = useLocation();
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const authenticated = useAuthStore((s) => s.isAuthenticated());
  if (!hasHydrated) return <RouteFallback />;
  if (!authenticated) {
    return <Navigate to={paths.login} replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
};

export const GuestRoute = () => {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const authenticated = useAuthStore((s) => s.isAuthenticated());
  const user = useAuthStore((s) => s.user);
  const destination = getDefaultRouteForUser(user);
  if (!hasHydrated) return <RouteFallback />;
  return authenticated ? <Navigate to={destination} replace /> : <Outlet />;
};

export const AdminRoute = () => {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const user = useAuthStore((s) => s.user);
  if (!hasHydrated) return <RouteFallback />;
  return getCurrentUserRole(user) === 'admin' ? <Outlet /> : <Navigate to={paths.root} replace />;
};

export const AdminOnlyRoute = () => {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const authenticated = useAuthStore((s) => s.isAuthenticated());
  const user = useAuthStore((s) => s.user);
  if (!hasHydrated) return <RouteFallback />;
  if (!authenticated) {
    return <Navigate to={paths.login} replace />;
  }
  return hasCurrentUserRole(user, USER_ROLES.ADMIN) ? (
    <Outlet />
  ) : (
    <Navigate to={paths.root} replace />
  );
};
