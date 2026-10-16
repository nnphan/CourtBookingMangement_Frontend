import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { paths } from '@/app/router/paths';
import { authApi } from '@/features/auth/api/auth.api';
import { useAuthStore } from '@/features/auth/store/auth.store';

export const useLogout = () => {
  const navigate = useNavigate();
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      useAuthStore.getState().logout();
      navigate(paths.login, { replace: true });
    },
  });

  return {
    logout: () => logoutMutation.mutate(),
    isLoggingOut: logoutMutation.isPending,
  };
};
