import { QueryClient } from '@tanstack/react-query';
import type { ApiErrorShape } from '@/types/api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        const status = (error as ApiErrorShape)?.status ?? 0;
        if (status >= 400 && status < 500) return false;
        return failureCount < 2;
      },
    },
    mutations: { retry: 0 },
  },
});

export const queryKeys = {
  auth: { me: ['auth', 'me'] as const },
  courts: {
    all: ['courts'] as const,
    list: (clubId: string) => ['courts', 'list', clubId] as const,
    detail: (id: string) => ['courts', 'detail', id] as const,
  },
  bookings: {
    all: ['bookings'] as const,
    byDate: (courtId: string, date: string) => ['bookings', courtId, date] as const,
  },
  dashboard: { revenue: (range: string) => ['dashboard', 'revenue', range] as const },
};
