import { useQuery } from '@tanstack/react-query';
import { customerApi } from '../api/customer.api';
import type { CustomerStatsOverview } from '../types/customer';

export const useCustomerStats = () => {
  return useQuery<CustomerStatsOverview, Error>({
    queryKey: ['customer-stats'],
    queryFn: async () => {
      const response = await customerApi.getCustomerStats();
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
