import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { paths } from '@/app/router/paths';
import { getCurrentUserRole } from '@/shared/utils/current-user';
import { getDefaultRouteForUser } from '@/app/router/role-destination';

export const ProtectedRoute = () => {
  const location = useLocation();
  const authenticated = useAuthStore((s) => s.isAuthenticated());
  if (!authenticated) {
    return <Navigate to={paths.login} replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
};

export const GuestRoute = () => {
  const authenticated = useAuthStore((s) => s.isAuthenticated());
  const user = useAuthStore((s) => s.user);
  const destination = getDefaultRouteForUser(user);
  return authenticated ? <Navigate to={destination} replace /> : <Outlet />;
};

export const AdminRoute = () => {
  const user = useAuthStore((s) => s.user);
  return getCurrentUserRole(user) === 'admin' ? (
    <Outlet />
  ) : (
    <Navigate to={paths.root} replace />
  );
};
