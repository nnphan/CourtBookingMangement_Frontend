import type { RoleSearchRequest } from '../types/role.types';

export const ROLE_QUERY_KEYS = {
  all: ['roles'] as const,
  lists: () => [...ROLE_QUERY_KEYS.all, 'list'] as const,
  list: (request: RoleSearchRequest) => [...ROLE_QUERY_KEYS.lists(), request] as const,
  details: () => [...ROLE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...ROLE_QUERY_KEYS.details(), id] as const,
};
