import { useQuery } from '@tanstack/react-query';
import { customerCourtStatusApi } from '../api/customer-court-status.api';
import { useCustomerCourtStatusStore } from '../store/customer-court-status.store';
import { mapCourtStatusV2ScheduleItem } from '../utils/court-status-v2.mapper';

export const customerCourtStatusKeys = {
  all: ['court-status-v2'] as const,
  byBranchAndDate: (branchId: string, date: string) =>
    [...customerCourtStatusKeys.all, branchId, date] as const,
};

export const useCustomerCourtStatus = (branchIdOverride?: string, dateOverride?: string) => {
  const storeBranchId = useCustomerCourtStatusStore((s) => s.selectedBranchId);
  const storeDate = useCustomerCourtStatusStore((s) => s.selectedDate);
  const selectedBranchId = branchIdOverride || storeBranchId;
  const selectedDate = dateOverride || storeDate;

  // 1. Branches Query
  const branchesQuery = useQuery({
    queryKey: ['active-branches'],
    queryFn: () => customerCourtStatusApi.getBranches(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // 2. Court Status V2 Query: GET /api/court-status-v2?BranchId=...&Date=...
  const statusQuery = useQuery({
    queryKey: customerCourtStatusKeys.byBranchAndDate(selectedBranchId, selectedDate),
    queryFn: ({ signal }) =>
      customerCourtStatusApi.getCourtStatusV2(
        { branchId: selectedBranchId, date: selectedDate },
        signal,
      ),
    enabled:
      Boolean(selectedBranchId?.trim()) &&
      /^\d{4}-\d{2}-\d{2}$/.test(selectedDate),
    staleTime: 1000 * 30, // 30 seconds
  });

  const courts = Array.isArray(statusQuery.data?.courts) ? statusQuery.data.courts : [];
  const scheduleItems = Array.isArray(statusQuery.data?.scheduleItems)
    ? statusQuery.data.scheduleItems.map(mapCourtStatusV2ScheduleItem)
    : [];

  return {
    branches: branchesQuery.data ?? [],
    statusData: statusQuery.data,
    courts,
    scheduleItems,
    openTime: statusQuery.data?.openTime ?? null,
    closeTime: statusQuery.data?.closeTime ?? null,
    timezone: statusQuery.data?.timezone ?? 'Asia/Ho_Chi_Minh',
    branchName: statusQuery.data?.branchName || '',
    isLoading: branchesQuery.isLoading || statusQuery.isLoading,
    isBranchesLoading: branchesQuery.isLoading,
    isStatusLoading: statusQuery.isLoading,
    isError: statusQuery.isError,
    error: statusQuery.error,
    refetch: statusQuery.refetch,
  };
};

export default useCustomerCourtStatus;
