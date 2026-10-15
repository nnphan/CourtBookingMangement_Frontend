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
};

export const http: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json' },
});

/* ---------------------------------------------------------------- request */
http.interceptors.request.use((config) => {
  const tokens = tokenStorage.read();
  if (tokens?.accessToken) {
    config.headers.set('Authorization', `Bearer ${tokens.accessToken}`);
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
let refreshing: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  const tokens = tokenStorage.read();
  if (!tokens?.refreshToken) return null;
  try {
    const { data } = await axios.post<{ data: { accessToken: string; refreshToken: string } }>(
      `${env.apiBaseUrl}/auth/refresh`,
      { refreshToken: tokens.refreshToken },
    );
    tokenStorage.write(data.data);
    return data.data.accessToken;
  } catch {
    tokenStorage.clear();
    return null;
  }
};

/* --------------------------------------------------------------- response */
http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponseBody>) => {
    const original = error.config as RetriableConfig | undefined;

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      refreshing ??= refreshAccessToken().finally(() => {
        refreshing = null;
      });
      const token = await refreshing;
      if (token) {
        original.headers.set('Authorization', `Bearer ${token}`);
        return http(original);
      }
      window.dispatchEvent(new CustomEvent('alobo:session-expired'));
    }

    const validationFields = error.response?.data?.validationErrors?.reduce<Record<string, string>>(
      (fields, validationError) => {
        fields[validationError.field] = validationError.message;
        return fields;
      },
      {},
    );
    const shaped: ApiErrorShape = {
      status: error.response?.status ?? 0,
      code:
        error.response?.data?.code ?? error.response?.data?.errorCode ?? error.code ?? 'UNKNOWN',
      message: error.response?.data?.message ?? 'error.network',
      fields: error.response?.data?.errors ?? validationFields,
    };
    return Promise.reject(shaped);
  },
);

export const request = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const { data } = await http.request<{ data: T }>(config);
  return data.data;
};
