import { jwtDecode } from 'jwt-decode';
import type { AuthTokens, JwtPayload } from '@/types/auth';

const KEY = 'alobo.auth';

export const tokenStorage = {
  read(): AuthTokens | null {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as AuthTokens) : null;
    } catch {
      return null;
    }
  },
  write(tokens: AuthTokens) {
    try {
      localStorage.setItem(KEY, JSON.stringify(tokens));
    } catch {
      /* storage may be unavailable (private mode); session still works in memory */
    }
  },
  clear() {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* no-op */
    }
  },
};

export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    return null;
  }
};

export const isExpired = (token: string, skewSeconds = 30) => {
  const payload = decodeToken(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 - skewSeconds * 1000 <= Date.now();
};
