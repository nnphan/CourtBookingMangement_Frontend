import type { User } from '@/types/auth';

export const authorize = (user: User | null) => {
  const permissions = new Set(user?.permissions ?? []);
  const roles = new Set(user?.roles ?? []);
  return {
    hasRole: (role: string) => roles.has(role),
    hasAnyRole: (values: readonly string[]) => values.some((role) => roles.has(role)),
    hasPermission: (permission: string) => permissions.has(permission),
    hasAnyPermission: (values: readonly string[]) => values.some((permission) => permissions.has(permission)),
    hasAllPermissions: (values: readonly string[]) => values.every((permission) => permissions.has(permission)),
  };
};
