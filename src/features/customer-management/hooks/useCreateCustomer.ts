import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '../api/customer.api';
import type { CustomerCreateInput, Customer } from '../types/customer';
import { toast } from '@/lib/toast';

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation<Customer, Error, CustomerCreateInput>({
    mutationFn: async (input: CustomerCreateInput) => {
      const response = await customerApi.createCustomer(input);
      if (!response.success) {
        throw new Error(response.message || 'Lỗi tạo khách hàng');
      }
      return response.data;
    },
    onSuccess: (newCustomer) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer-stats'] });
      toast.success(
        'Tạo khách hàng thành công!',
        `Khách hàng ${newCustomer.fullName} (${newCustomer.customerCode}) đã được thêm vào hệ thống.`,
      );
    },
    onError: (err) => {
      toast.error('Không thể tạo khách hàng', err.message);
    },
  });
};
