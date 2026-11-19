import { paths } from '@/app/router/paths';
import { PERMISSIONS } from '@/shared/constants/permissions';
import type { User } from '@/types/auth';

export const getDefaultRouteForUser = (user: User | null) =>
  user?.permissions?.includes(PERMISSIONS.DASHBOARD_VIEW) ? paths.dashboard : paths.root;

export const getPostLoginRouteForUser = (user: User | null, requestedPath?: string) => {
  return requestedPath ?? getDefaultRouteForUser(user);
};
