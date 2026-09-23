import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router';
import { authApi } from '@/features/auth/api/auth.api';
import { paths } from '@/app/router/paths';
import { toast } from '@/lib/toast';
import type {
  RegisterErrorResponse,
  RegisterRequest,
  RegisterSuccessResponse,
} from '@/features/auth/types/register.types';

export const useRegisterMutation = () => {
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
