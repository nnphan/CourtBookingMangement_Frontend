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

  useEffect(() => {
    if (query.data && query.data !== storedUser) {
      setUser(query.data);
    }
  }, [query.data, setUser, storedUser]);

  return {
    ...query,
    user: storedUser,
  };
};
