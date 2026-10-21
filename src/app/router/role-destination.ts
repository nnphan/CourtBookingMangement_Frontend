import { paths } from '@/app/router/paths';
import { getCurrentUserRole } from '@/shared/utils/current-user';
import type { User } from '@/types/auth';

export const getDefaultRouteForUser = (user: User | null) =>
  getCurrentUserRole(user) === 'admin' ? paths.dashboard : paths.root;

export const getPostLoginRouteForUser = (user: User | null, requestedPath?: string) => {
  const defaultRoute = getDefaultRouteForUser(user);
  return requestedPath === paths.dashboard && defaultRoute !== paths.dashboard
    ? defaultRoute
    : (requestedPath ?? defaultRoute);
};
