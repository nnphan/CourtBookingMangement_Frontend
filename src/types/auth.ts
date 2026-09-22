export type UserRole = 'customer' | 'staff' | 'owner' | 'admin';

export interface User {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  avatarUrl: string | null;
  role: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;
  role: UserRole;
  exp: number;
  iat: number;
}

export interface AuthSession extends AuthTokens {
  user: User;
}

export interface LoginPhonePayload {
  dialCode: string;
  phone: string;
  password: string;
}
export interface LoginEmailPayload {
  email: string;
  password: string;
}
export interface RegisterPayload {
  dialCode: string;
  phone: string;
  email?: string;
  fullName: string;
  password: string;
}
