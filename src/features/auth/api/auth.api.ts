import axios from 'axios';
import { env } from '@/lib/env';
import { request } from '@/lib/axios';
import type { AuthSession, LoginEmailPayload, LoginPhonePayload, User } from '@/types/auth';
import type {
  RegisterRequest,
  RegisterSuccessResponse,
} from '@/features/auth/types/register.types';

export const authApi = {
  loginWithPhone: (payload: LoginPhonePayload) =>
    request<AuthSession>({ url: '/auth/login/phone', method: 'POST', data: payload }),

  loginWithEmail: (payload: LoginEmailPayload) =>
    request<AuthSession>({ url: '/auth/login/email', method: 'POST', data: payload }),

  loginWithGoogle: (idToken: string) =>
    request<AuthSession>({ url: '/auth/login/google', method: 'POST', data: { idToken } }),

  register: async (payload: RegisterRequest): Promise<RegisterSuccessResponse> => {
    const { data } = await axios.post<RegisterSuccessResponse>(
      `${env.apiBaseUrl}/auth/register`,
      payload,
    );
    return data;
  },

  me: () => request<User>({ url: '/auth/me', method: 'GET' }),

  logout: () => request<void>({ url: '/auth/logout', method: 'POST' }),
};

export type RegisterApiResponse = RegisterSuccessResponse;
