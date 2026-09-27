import { useQuery } from '@tanstack/react-query';
import { customerApi } from '../api/customer.api';
import type { CustomerSearchRequest, Customer } from '../types/customer';
import type { PaginationMetadata } from '@/types/api';

export interface UseCustomersResult {
  customers: Customer[];
  metadata: PaginationMetadata | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useCustomers = (params: CustomerSearchRequest): UseCustomersResult => {
  const query = useQuery({
    queryKey: ['customers', params],
    queryFn: async () => {
      const response = await customerApi.getCustomers(params);
      if (!response.success) {
        throw new Error(response.message);
      }
      return {
        data: response.data,
        metadata: response.metadata,
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 1,
  });

  return {
    customers: query.data?.data ?? [],
    metadata: query.data?.metadata ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
};
