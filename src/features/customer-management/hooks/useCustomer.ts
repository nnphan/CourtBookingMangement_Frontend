import { useQuery } from '@tanstack/react-query';
import { customerApi } from '../api/customer.api';
import type { Customer } from '../types/customer';

export interface UseCustomerResult {
  customer: Customer | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useCustomer = (id?: string | null): UseCustomerResult => {
  const query = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await customerApi.getCustomerById(id);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 3, // 3 minutes
  });

  return {
    customer: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
};
