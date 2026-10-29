import { useQuery } from '@tanstack/react-query';
import { customerCourtStatusApi } from '../api/customer-court-status.api';
import { useCustomerCourtStatusStore } from '../store/customer-court-status.store';

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

  // 2. Court Status Query: GET /api/court-status?BranchId=...&Date=...
  const statusQuery = useQuery({
    queryKey: ['court-status', selectedBranchId, selectedDate],
    queryFn: () => customerCourtStatusApi.getCourtStatusRaw(selectedBranchId, selectedDate),
    enabled: Boolean(selectedBranchId && selectedDate),
    staleTime: 1000 * 30, // 30 seconds
  });

  return {
    branches: branchesQuery.data ?? [],
    statusData: statusQuery.data,
    courts: statusQuery.data?.courts ?? [],
    scheduleItems: statusQuery.data?.scheduleItems ?? [],
    openTime: statusQuery.data?.openTime || '05:00:00',
    closeTime: statusQuery.data?.closeTime || '23:00:00',
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
