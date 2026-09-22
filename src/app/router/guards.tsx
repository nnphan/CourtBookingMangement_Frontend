import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { paths } from '@/app/router/paths';

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
  return authenticated ? <Navigate to={paths.dashboard} replace /> : <Outlet />;
};
