const defaultApiTimeoutMs = import.meta.env.DEV ? 300_000 : 30_000;
const configuredApiTimeoutMs = Number(import.meta.env.VITE_API_TIMEOUT_MS);

export const env = {
  apiBaseUrl: import.meta.env?.VITE_API_BASE_URL ?? 'https://localhost:7047/api',
  apiTimeoutMs:
    Number.isFinite(configuredApiTimeoutMs) && configuredApiTimeoutMs > 0
      ? configuredApiTimeoutMs
      : defaultApiTimeoutMs,
  socketUrl: import.meta.env?.VITE_SOCKET_URL ?? '',
  googleClientId: import.meta.env?.VITE_GOOGLE_CLIENT_ID ?? '',
  ownerAppUrl: import.meta.env?.VITE_OWNER_APP_URL ?? '#',
} as const;
