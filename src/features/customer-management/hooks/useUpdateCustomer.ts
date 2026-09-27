import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '../api/customer.api';
import type { CustomerUpdateInput, Customer } from '../types/customer';
import { toast } from '@/lib/toast';

interface UpdateCustomerPayload {
  id: string;
  data: CustomerUpdateInput;
}

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation<Customer, Error, UpdateCustomerPayload>({
    mutationFn: async ({ id, data }) => {
      const response = await customerApi.updateCustomer(id, data);
      if (!response.success) {
        throw new Error(response.message || 'Lỗi cập nhật khách hàng');
      }
      return response.data;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', updated.id] });
      queryClient.invalidateQueries({ queryKey: ['customer-stats'] });
      toast.success(
        'Cập nhật thành công!',
        `Thông tin của khách hàng ${updated.fullName} đã được lưu.`,
      );
    },
    onError: (err) => {
      toast.error('Không thể cập nhật khách hàng', err.message);
    },
  });
};
