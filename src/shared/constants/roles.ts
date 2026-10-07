/** Role hierarchy, highest privilege first. */
export const ROLE_PRIORITY = [
  'SUPER_ADMIN',
  'ADMIN',
  'BRANCH_OWNER',
  'STAFF',
  'CUSTOMER',
] as const;

export type AppRole = (typeof ROLE_PRIORITY)[number];

export const DEFAULT_ROLE: AppRole = 'CUSTOMER';

export const ROLE_LABELS: Record<AppRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  BRANCH_OWNER: 'Branch Owner',
  STAFF: 'Staff',
  CUSTOMER: 'Customer',
};

const isAppRole = (value: string): value is AppRole =>
  (ROLE_PRIORITY as readonly string[]).includes(value);

/**
 * Returns the highest-priority known role from a user's role list.
 * Matching is case-insensitive; unknown values are ignored.
 * Falls back to CUSTOMER when the list is empty, missing, or has no known roles.
 */
export const getHighestRole = (roles: readonly string[] | null | undefined): AppRole => {
  if (!roles?.length) return DEFAULT_ROLE;

  const normalized = new Set(roles.map((r) => r.trim().toUpperCase()).filter(isAppRole));

  return ROLE_PRIORITY.find((role) => normalized.has(role)) ?? DEFAULT_ROLE;
};

export const getRoleLabel = (roles: readonly string[] | null | undefined): string =>
  ROLE_LABELS[getHighestRole(roles)];
