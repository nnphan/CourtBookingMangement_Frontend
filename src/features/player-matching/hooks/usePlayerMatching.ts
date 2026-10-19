import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { playerMatchingApi } from '../api/player-matching.api';
import type {
  CreatePlayerMatchRequest,
  PlayerMatchSearchParams,
  PlayerMatchingFilterParams,
} from '../types/player-matching.types';
import { BOOKING_QUERY_KEYS } from '@/features/bookings/api/booking.query';

export const playerMatchingKeys = {
  all: ['player-matching'] as const,
  stats: () => [...playerMatchingKeys.all, 'stats'] as const,
  featured: () => [...playerMatchingKeys.all, 'featured'] as const,
  list: (filters: Omit<PlayerMatchingFilterParams, 'pageNumber'>) =>
    [...playerMatchingKeys.all, 'list', filters] as const,
};

export const playerMatchKeys = {
  all: ['player-matches'] as const,
  lists: () => [...playerMatchKeys.all, 'list'] as const,
  list: (params: PlayerMatchSearchParams) => [...playerMatchKeys.lists(), params] as const,
  details: () => [...playerMatchKeys.all, 'detail'] as const,
  detail: (id: string) => [...playerMatchKeys.details(), id] as const,
};

export const usePlayerMatches = (params: PlayerMatchSearchParams, enabled = true) =>
  useQuery({
    queryKey: playerMatchKeys.list(params),
    queryFn: ({ signal }) => playerMatchingApi.getPlayerMatches(params, signal),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,
  });

export const usePlayerMatchDetail = (id?: string) =>
  useQuery({
    queryKey: playerMatchKeys.detail(id ?? ''),
    queryFn: ({ signal }) => playerMatchingApi.getPlayerMatchDetail(id ?? '', signal),
    enabled: Boolean(id?.trim()),
  });

/**
 * Hook to retrieve open match stats for badge counter
 * Endpoint: GET /api/player-matching/stats
 */
export const useMatchStats = () => {
  return useQuery({
    queryKey: playerMatchingKeys.stats(),
    queryFn: () => playerMatchingApi.getStats(),
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
};

/**
 * Hook to retrieve preview of latest active matches (status=OPEN, pageSize=3)
 * Endpoint: GET /api/player-matching?status=OPEN&pageSize=3
 */
export const useFeaturedMatches = () => {
  return useQuery({
    queryKey: playerMatchingKeys.featured(),
    queryFn: () => playerMatchingApi.getMatches({ status: 'OPEN', pageSize: 3, pageNumber: 1 }),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Hook to retrieve discoverable matches with infinite scrolling support
 * Endpoint: GET /api/player-matching
 */
export const useMatches = (filters: Omit<PlayerMatchingFilterParams, 'pageNumber'>) => {
  return useInfiniteQuery({
    queryKey: playerMatchingKeys.list(filters),
    queryFn: ({ pageParam = 1 }) =>
      playerMatchingApi.getMatches({
        ...filters,
        pageNumber: pageParam,
        pageSize: filters.pageSize ?? 6,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.metadata?.hasNextPage) {
        return (lastPage.metadata.pageNumber ?? 1) + 1;
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Hook to request joining a match
 */
export const useJoinMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      matchId,
      payload,
    }: {
      matchId: string;
      payload: { note?: string; phone?: string; skillLevel?: string };
    }) => playerMatchingApi.requestJoinMatch(matchId, payload),
    onSuccess: (_data, variables) => {
      // Invalidate match queries to refresh player count
      queryClient.invalidateQueries({ queryKey: playerMatchingKeys.all });
      queryClient.invalidateQueries({ queryKey: playerMatchKeys.lists() });
      queryClient.invalidateQueries({ queryKey: playerMatchKeys.detail(variables.matchId) });
    },
  });
};

export const useCreatePlayerMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePlayerMatchRequest) => playerMatchingApi.createPlayerMatch(payload),
    retry: false,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: playerMatchingKeys.all }),
        queryClient.invalidateQueries({ queryKey: playerMatchKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.myBookings() }),
      ]);
    },
    onError: async (error: { status?: number }) => {
      if (error.status === 404 || error.status === 409) {
        await queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.myBookings() });
      }
    },
  });
};
