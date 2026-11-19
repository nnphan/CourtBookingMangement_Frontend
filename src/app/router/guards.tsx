import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { paths } from '@/app/router/paths';
import { getDefaultRouteForUser } from '@/app/router/role-destination';
import { hasCurrentUserRole } from '@/shared/utils/current-user';
import { USER_ROLES } from '@/shared/constants/roles';
import { RouteFallback } from '@/components/common/RouteFallback';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { useAuthorization } from '@/features/auth/authorization';
import type { ReactNode } from 'react';

const Forbidden = () => (
  <div role="alert" className="mx-auto max-w-lg p-8 text-center">
    <h1 className="text-xl font-bold">403</h1>
    <p className="my-4">Bạn không có quyền truy cập chức năng này.</p>
    <a className="font-semibold text-emerald-700 underline" href={paths.root}>Về trang chủ</a>
  </div>
);

export const ProtectedRoute = () => {
  const location = useLocation();
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const authenticated = useAuthStore((s) => s.isAuthenticated());
  const storedUser = useAuthStore((s) => s.user);
  const profile = useCurrentUser();
  if (!hasHydrated) return <RouteFallback />;
  if (!authenticated) {
    return <Navigate to={paths.login} replace state={{ from: location.pathname + location.search + location.hash }} />;
  }
  if (profile.isLoading || profile.isFetching) return <RouteFallback />;
  if (profile.isError || !profile.data || !Array.isArray(profile.data.permissions) || !Array.isArray(profile.data.roles)) {
    return <div role="alert" className="p-8 text-center">
      <p>Không thể tải quyền truy cập. Vui lòng thử lại.</p>
      <button type="button" className="mt-4 font-semibold text-emerald-700 underline" onClick={() => void profile.refetch()}>Thử lại</button>
    </div>;
  }
  if (storedUser && profile.data.id !== storedUser.id) {
    return <div role="alert" className="p-8 text-center">Không thể xác minh tài khoản hiện tại. Vui lòng đăng nhập lại.</div>;
  }
  if (profile.data !== storedUser) return <RouteFallback />;
  return <Outlet />;
};

export const PermissionGuard = ({ permissions, mode = 'all', children }: {
  permissions: readonly string[];
  mode?: 'any' | 'all';
  children: ReactNode;
}) => {
  const { hasAnyPermission, hasAllPermissions } = useAuthorization();
  const allowed = mode === 'any' ? hasAnyPermission(permissions) : hasAllPermissions(permissions);
  return allowed ? children : <Forbidden />;
};

export const GuestRoute = () => {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const authenticated = useAuthStore((s) => s.isAuthenticated());
  const user = useAuthStore((s) => s.user);
  const destination = getDefaultRouteForUser(user);
  if (!hasHydrated) return <RouteFallback />;
  return authenticated ? <Navigate to={destination} replace /> : <Outlet />;
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
    <Forbidden />
  );
};
