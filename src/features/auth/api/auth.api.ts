import { request } from '@/lib/axios';
import type {
  AuthSession,
  LoginEmailPayload,
  LoginPhonePayload,
  RegisterPayload,
  User,
} from '@/types/auth';

export const authApi = {
  loginWithPhone: (payload: LoginPhonePayload) =>
    request<AuthSession>({ url: '/auth/login/phone', method: 'POST', data: payload }),

  loginWithEmail: (payload: LoginEmailPayload) =>
    request<AuthSession>({ url: '/auth/login/email', method: 'POST', data: payload }),

  loginWithGoogle: (idToken: string) =>
    request<AuthSession>({ url: '/auth/login/google', method: 'POST', data: { idToken } }),

  register: (payload: RegisterPayload) =>
    request<AuthSession>({ url: '/auth/register', method: 'POST', data: payload }),

  me: () => request<User>({ url: '/auth/me', method: 'GET' }),

  logout: () => request<void>({ url: '/auth/logout', method: 'POST' }),
};
