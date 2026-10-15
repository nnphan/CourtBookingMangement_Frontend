import { queryOptions } from '@tanstack/react-query';
import { courtStatusApi } from './court-status.api';
import type { CourtStatusRequest, CourtStatusDto } from '../types/court-status.types';

export const courtStatusQueryKeys = {
  all: ['court-status'] as const,
  detail: (branchId: string, selectedDate: string) =>
    ['court-status', branchId, selectedDate] as const,
};

export const courtStatusQueries = {
  detail: (params: CourtStatusRequest) =>
    queryOptions<CourtStatusDto>({
      queryKey: courtStatusQueryKeys.detail(params.branchId, params.date),
      queryFn: () => courtStatusApi.getCourtStatus(params),
      enabled: Boolean(params.branchId && params.date),
      staleTime: 1000 * 30, // 30 seconds
    }),
};
