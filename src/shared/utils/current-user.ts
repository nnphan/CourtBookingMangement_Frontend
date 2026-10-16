import type { User } from '@/types/auth';

export type CurrentUserRole = 'customer' | 'staff' | 'branchManager' | 'admin' | 'user';

export function getUserInitials(fullName?: string | null): string {
  const parts = fullName?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length === 0) return 'U';

  const firstInitial = Array.from(parts[0] ?? '')[0] ?? '';
  if (parts.length === 1) return firstInitial.toLocaleUpperCase();

  const lastInitial = Array.from(parts.at(-1) ?? '')[0] ?? '';
  return `${firstInitial}${lastInitial}`.toLocaleUpperCase();
}

export function getCurrentUserRole(user: Pick<User, 'role' | 'roles'> | null): CurrentUserRole {
  if (!user) return 'user';

  const roleValues: unknown[] = [user.role, ...(Array.isArray(user.roles) ? user.roles : [])];
  const roles = new Set(
    roleValues
      .filter((role): role is string => typeof role === 'string')
      .map((role) => role.trim().toUpperCase())
      .filter(Boolean),
  );

  if (roles.has('SUPER_ADMIN') || roles.has('ADMIN')) return 'admin';
  if (roles.has('BRANCH_OWNER') || roles.has('BRANCH_MANAGER') || roles.has('OWNER')) {
    return 'branchManager';
  }
  if (roles.has('STAFF') || roles.has('RECEPTIONIST')) return 'staff';
  if (roles.has('CUSTOMER')) return 'customer';
  return 'user';
}
