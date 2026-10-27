import type { PermissionSearchRequest } from '../types/permission.types';

export const PERMISSION_QUERY_KEYS = {
  all: ['permissions'] as const,
  lists: () => [...PERMISSION_QUERY_KEYS.all, 'list'] as const,
  list: (request: PermissionSearchRequest) =>
    [...PERMISSION_QUERY_KEYS.lists(), request] as const,
  details: () => [...PERMISSION_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PERMISSION_QUERY_KEYS.details(), id] as const,
};
