import { useMemo } from 'react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { authorize } from '@/features/auth/authorization-core';

export const useAuthorization = () => {
  const user = useAuthStore((state) => state.user);
  return useMemo(() => authorize(user), [user]);
};
