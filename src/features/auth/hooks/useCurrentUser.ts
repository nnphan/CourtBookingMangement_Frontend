import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/features/auth/api/auth.api';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { queryKeys } from '@/lib/query-client';

export const useCurrentUser = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const storedUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const query = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authApi.me,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
  const queryHasFullName =
    typeof query.data?.fullName === 'string' && query.data.fullName.trim().length > 0;
  const shouldUseQueryUser = Boolean(
    query.data && (queryHasFullName || !storedUser?.fullName?.trim()),
  );

  useEffect(() => {
    if (query.data && shouldUseQueryUser && query.data !== storedUser) {
      setUser(query.data);
    }
  }, [query.data, setUser, shouldUseQueryUser, storedUser]);

  return {
    ...query,
    user: shouldUseQueryUser ? (query.data ?? storedUser) : storedUser,
  };
};
