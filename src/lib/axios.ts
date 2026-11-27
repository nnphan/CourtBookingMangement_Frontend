import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { env } from '@/lib/env';
import { tokenStorage } from '@/lib/token-storage';
import type { ApiErrorShape } from '@/types/api';
import type { ValidationError } from '@/types/api';

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };
type ApiErrorResponseBody = {
  message?: string;
  code?: string;
  errorCode?: string;
  errors?: Record<string, string>;
  validationErrors?: ValidationError[] | null;
  traceId?: string;
};

export const http: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeoutMs,
  headers: { 'Content-Type': 'application/json' },
});

/* ---------------------------------------------------------------- request */
http.interceptors.request.use((config) => {
  const isSignIn = /^\/(?:api\/)?auth\/(?:login\/|register$)/.test(config.url ?? '');
  const accessToken = isSignIn ? undefined : tokenStorage.read()?.accessToken;
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  } else {
    config.headers.delete('Authorization');
  }
  config.headers.set(
    'Accept-Language',
    localStorage.getItem('language') ?? localStorage.getItem('i18nextLng') ?? 'vi',
  );
  if (config.url && config.baseURL) {
    const cleanBase = config.baseURL.replace(/\/+$/, '');
    if (cleanBase.endsWith('/api') && config.url.startsWith('/api/')) {
      config.url = config.url.substring(4);
    }
  }
  return config;
});

/* --------------------------------------------- refresh-token single flight */
type RefreshResult = { accessToken: string } | { expired: boolean };
let refreshing: { refreshToken: string; result: Promise<RefreshResult> } | undefined;
let lastRotation: { previousAccessToken: string; accessToken: string } | undefined;

const refreshAccessToken = async (refreshToken: string, previousAccessToken: string): Promise<RefreshResult> => {
  try {
    const { data } = await axios.post<{ data: { accessToken: string; refreshToken: string } }>(
      `${env.apiBaseUrl.replace(/\/+$/, '')}/auth/refresh-token`,
      { refreshToken },
      { timeout: env.apiTimeoutMs },
    );
    if (tokenStorage.read()?.refreshToken !== refreshToken) return { expired: false };
    lastRotation = { previousAccessToken, accessToken: data.data.accessToken };
    tokenStorage.write(data.data);
    window.dispatchEvent(new CustomEvent('alobo:token-refreshed'));
    return { accessToken: data.data.accessToken };
  } catch (error) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    return { expired: status === 400 || status === 401 || status === 403 };
  }
};

/* --------------------------------------------------------------- response */
http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponseBody>) => {
    const original = error.config as RetriableConfig | undefined;

    // Anonymous requests (no Authorization header) must not trigger refresh or session-expiry.
    const authorization = original?.headers?.get('Authorization');
    const tokens = tokenStorage.read();
    if (error.response?.status === 401 && original && authorization && !original._retry && tokens?.accessToken) {
      original._retry = true;
      if (lastRotation?.accessToken === tokens.accessToken &&
        authorization === `Bearer ${lastRotation.previousAccessToken}`) {
        return http(original);
      }
      if (authorization === `Bearer ${tokens.accessToken}`) {
        const refreshToken = tokens.refreshToken;
        if (refreshToken && refreshing?.refreshToken !== refreshToken) {
          const result = refreshAccessToken(refreshToken, tokens.accessToken).finally(() => {
            if (refreshing?.result === result) refreshing = undefined;
          });
          refreshing = { refreshToken, result };
        }
        const refreshed = refreshing && refreshing.refreshToken === refreshToken
          ? await refreshing.result : { expired: true };
        if ('accessToken' in refreshed && tokenStorage.read()?.accessToken === refreshed.accessToken) {
          return http(original);
        }
        if ('expired' in refreshed && refreshed.expired && tokenStorage.read()?.refreshToken === refreshToken) {
          window.dispatchEvent(new CustomEvent('alobo:session-expired'));
        }
      }
    }

    const validationFields = error.response?.data?.validationErrors?.reduce<Record<string, string>>(
      (fields, validationError) => {
        fields[validationError.field] = validationError.message;
        return fields;
      },
      {},
    );
    const retryAfterHeader = error.response?.headers?.['retry-after'];
    const retryAfterSeconds =
      typeof retryAfterHeader === 'string' && /^\d+$/.test(retryAfterHeader)
        ? Number(retryAfterHeader)
        : undefined;
    const shaped: ApiErrorShape = {
      status: error.response?.status ?? 0,
      code:
        error.response?.data?.code ?? error.response?.data?.errorCode ?? error.code ?? 'UNKNOWN',
      message: error.response?.data?.message ?? 'error.network',
      fields: error.response?.data?.errors ?? validationFields,
      traceId: error.response?.data?.traceId,
      retryAfterSeconds,
    };
    return Promise.reject(shaped);
  },
);

export const request = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const { data } = await http.request<{ data: T }>(config);
  return data.data;
};
