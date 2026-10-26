import type { OwnerSearchParams } from '../types/owner.types';

export const OWNER_QUERY_KEYS = {
  all: ['owners'] as const,
  lists: () => [...OWNER_QUERY_KEYS.all, 'list'] as const,
  list: (params: OwnerSearchParams) => [...OWNER_QUERY_KEYS.lists(), params] as const,
  details: () => [...OWNER_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...OWNER_QUERY_KEYS.details(), id] as const,
};
