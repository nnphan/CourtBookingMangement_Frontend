export const USER_QUERY_KEYS = {
  all: ['users'] as const,
  list: () => [...USER_QUERY_KEYS.all, 'list'] as const,
  roles: (userId: string) => [...USER_QUERY_KEYS.all, userId, 'roles'] as const,
};

export const ROLE_QUERY_KEYS = {
  all: ['roles'] as const,
  list: () => [...ROLE_QUERY_KEYS.all, 'list'] as const,
};
