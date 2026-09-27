import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router';
import type { AxiosError } from 'axios';
import { authApi } from '@/features/auth/api/auth.api';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { paths } from '@/app/router/paths';
import { toast } from '@/lib/toast';
import type { AuthSession } from '@/types/auth';
import type {
  RegisterErrorResponse,
  RegisterRequest,
  RegisterSuccessResponse,
} from '@/features/auth/types/register.types';

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
  const navigate = useNavigate();

  return useMutation<RegisterSuccessResponse, Error, RegisterRequest>({
    mutationFn: authApi.register,
    onSuccess: () => {
      toast.success('Registration successful', 'Your account has been created. Please sign in.');
      navigate(paths.login, { replace: true });
    },
    onError: (error) => {
      const apiError = error as AxiosError<RegisterErrorResponse>;
      const message =
        apiError.response?.data?.message ??
        apiError.message ??
        'Registration failed. Please try again.';

      toast.error('Registration failed', message);
    },
  });
};
