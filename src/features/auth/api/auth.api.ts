import axios from 'axios';
import { env } from '@/lib/env';
import { request } from '@/lib/axios';
import { tokenStorage } from '@/lib/token-storage';
import type { AuthSession, LoginEmailPayload, LoginPhonePayload, User } from '@/types/auth';
import type {
  RegisterRequest,
  RegisterSuccessResponse,
} from '@/features/auth/types/register.types';

export const authApi = {
  loginWithPhone: ({ dialCode, phone, password }: LoginPhonePayload) =>
    request<AuthSession>({
      url: '/auth/login/phonenumber', method: 'POST', data: { phoneNumber: `${dialCode}${phone}`, password },
    }),

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

  me: (signal?: AbortSignal) => request<User>({ url: '/auth/me', method: 'GET', signal }),

  logout: () => request<void>({
    url: '/auth/logout', method: 'POST', data: { refreshToken: tokenStorage.read()?.refreshToken },
  }),
};

export type RegisterApiResponse = RegisterSuccessResponse;
