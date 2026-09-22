import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router';
import { authApi } from '@/features/auth/api/auth.api';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { paths } from '@/app/router/paths';
import type { AuthSession } from '@/types/auth';

const useOnAuthenticated = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);
  const from = (location.state as { from?: string } | null)?.from ?? paths.dashboard;

  return (session: AuthSession) => {
    setSession(session);
    void navigate(from, { replace: true });
  };
};

export const useLoginWithPhone = () => {
  const onSuccess = useOnAuthenticated();
  return useMutation({ mutationFn: authApi.loginWithPhone, onSuccess });
};

export const useLoginWithEmail = () => {
  const onSuccess = useOnAuthenticated();
  return useMutation({ mutationFn: authApi.loginWithEmail, onSuccess });
};

export const useLoginWithGoogle = () => {
  const onSuccess = useOnAuthenticated();
  return useMutation({ mutationFn: authApi.loginWithGoogle, onSuccess });
};

export const useRegister = () => {
  const onSuccess = useOnAuthenticated();
  return useMutation({ mutationFn: authApi.register, onSuccess });
};
