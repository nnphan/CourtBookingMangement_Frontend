import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { courtStatusApi } from './court-status.api';
import { courtStatusQueryKeys } from './court-status.query';
import type { CourtStatusDto, CourtStatusCourtDto, CourtScheduleItemDto } from '../types/court-status.types';

export interface UseCourtStatusReturn {
  statusData: CourtStatusDto | undefined;
  courts: CourtStatusCourtDto[];
  scheduleItems: CourtScheduleItemDto[];
  branchName: string;
  openTime: string;
  closeTime: string;
  date: string;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => ReturnType<typeof query.refetch>;
  invalidateCourtStatus: () => Promise<void>;
}

export const useCourtStatus = (
  branchId: string,
  selectedDate: string,
) => {
  const queryClient = useQueryClient();

  const isEnabled = Boolean(branchId && selectedDate);

  const query = useQuery<CourtStatusDto, Error>({
    queryKey: courtStatusQueryKeys.detail(branchId, selectedDate),
    queryFn: () => courtStatusApi.getCourtStatus({ branchId, date: selectedDate }),
    enabled: isEnabled,
    staleTime: 1000 * 30, // 30 seconds
    retry: 1,
  });

  const invalidateCourtStatus = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: courtStatusQueryKeys.all,
    });
  }, [queryClient]);

  const courts = query.data?.courts ?? [];
  const scheduleItems = query.data?.scheduleItems ?? [];
  const branchName = query.data?.branchName ?? '';
  const openTime = query.data?.openTime ?? '05:00:00';
  const closeTime = query.data?.closeTime ?? '23:00:00';
  const date = query.data?.date ?? selectedDate;

  return {
    ...query,
    statusData: query.data,
    courts,
    scheduleItems,
    branchName,
    openTime,
    closeTime,
    date,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    invalidateCourtStatus,
  };
};

export default useCourtStatus;
