import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerCourtStatusApi } from '../api/customer-court-status.api';
import { useCustomerCourtStatusStore } from '../store/customer-court-status.store';
import type { CustomerCreateBookingPayload } from '../types/customer-slot';
import { toast } from '@/lib/toast';

export const useCustomerCourtStatus = () => {
  const queryClient = useQueryClient();
  const selectedBranchId = useCustomerCourtStatusStore((s) => s.selectedBranchId);
  const selectedDate = useCustomerCourtStatusStore((s) => s.selectedDate);

  // 1. Branches Query
  const branchesQuery = useQuery({
    queryKey: ['customer-branches'],
    queryFn: () => customerCourtStatusApi.getBranches(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // 2. Court Status Query
  const statusQuery = useQuery({
    queryKey: ['customer-court-status', selectedBranchId, selectedDate],
    queryFn: () => customerCourtStatusApi.getCourtStatus(selectedBranchId, selectedDate),
    enabled: Boolean(selectedBranchId && selectedDate),
    staleTime: 1000 * 30, // 30 seconds
  });

  // 3. Create Booking Mutation
  const createBookingMutation = useMutation({
    mutationFn: (payload: CustomerCreateBookingPayload) =>
      customerCourtStatusApi.createBooking(payload),
    onSuccess: (result) => {
      toast.success(
        'Đặt sân thành công!',
        `Mã đơn: ${result.bookingNumber}. Nhân viên sẽ sớm liên hệ xác nhận.`,
      );
      // Invalidate status query to reflect new booking immediately
      queryClient.invalidateQueries({
        queryKey: ['customer-court-status', selectedBranchId, selectedDate],
      });
    },
    onError: (err: Error) => {
      toast.error('Đặt sân không thành công', err.message || 'Vui lòng thử lại sau.');
    },
  });

  return {
    branches: branchesQuery.data ?? [],
    statusData: statusQuery.data,
    courts: statusQuery.data?.courts ?? [],
    slots: statusQuery.data?.slots ?? [],
    isLoading: branchesQuery.isLoading || statusQuery.isLoading,
    isError: statusQuery.isError,
    error: statusQuery.error,
    refetch: statusQuery.refetch,
    createBooking: createBookingMutation.mutateAsync,
    isCreating: createBookingMutation.isPending,
  };
};
