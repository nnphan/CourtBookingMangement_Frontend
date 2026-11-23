import type { StaffListParams } from '../types/staff.types';

export const STAFF_MANAGEMENT_QUERY_KEYS = {
  all: ['staffManagement'] as const,
  owner: (ownerId: string | null) => [...STAFF_MANAGEMENT_QUERY_KEYS.all, ownerId] as const,
  access: (ownerId: string | null) => [...STAFF_MANAGEMENT_QUERY_KEYS.owner(ownerId), 'access'] as const,
  branches: (ownerId: string | null) => [...STAFF_MANAGEMENT_QUERY_KEYS.owner(ownerId), 'branches'] as const,
  lists: (ownerId: string | null) => [...STAFF_MANAGEMENT_QUERY_KEYS.owner(ownerId), 'list'] as const,
  list: (ownerId: string | null, filters: StaffListParams) =>
    [...STAFF_MANAGEMENT_QUERY_KEYS.lists(ownerId), filters] as const,
  detail: (ownerId: string | null, userId: string) =>
    [...STAFF_MANAGEMENT_QUERY_KEYS.owner(ownerId), 'detail', userId] as const,
};
