import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { profileApi } from '@/features/profile/api/profile.api';
import { queryKeys } from '@/lib/query-client';

export const useMyProfile = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  return useQuery({
    queryKey: queryKeys.profile.me,
    queryFn: profileApi.getMyProfile,
    enabled: isAuthenticated,
  });
};
