import { useQuery } from '@tanstack/react-query';
import { customerApi } from '../api/customer.api';
import type { CustomerBookingHistory, BookingHistoryParams } from '../types/booking-history';

export const useCustomerBookings = (customerId: string, params?: BookingHistoryParams) => {
  return useQuery<CustomerBookingHistory[], Error>({
    queryKey: ['customer-bookings', customerId, params],
    queryFn: async () => {
      const response = await customerApi.getCustomerBookings(customerId, params);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    enabled: Boolean(customerId),
    staleTime: 1000 * 60 * 2,
  });
};
