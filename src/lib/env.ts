export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:7047/api',
  socketUrl: import.meta.env.VITE_SOCKET_URL ?? '',
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '',
  ownerAppUrl: import.meta.env.VITE_OWNER_APP_URL ?? '#',
} as const;
