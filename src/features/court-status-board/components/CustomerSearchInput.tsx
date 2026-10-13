import React, { memo } from 'react';
import { CustomerSearch } from '@/features/customer-management/components/CustomerSearch';
import type { Customer } from '@/features/customer-management/types/customer';

export interface CustomerSearchInputProps {
  onSelectCustomer: (customer: Customer) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const CustomerSearchInput: React.FC<CustomerSearchInputProps> = memo(
  ({
    onSelectCustomer,
    placeholder = 'Gõ SĐT (0909...), Tên hoặc Mã KH để tìm nhanh...',
    disabled = false,
    className,
  }) => {
    return (
      <CustomerSearch
        onSelectCustomer={onSelectCustomer}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
      />
    );
  },
);

CustomerSearchInput.displayName = 'CustomerSearchInput';
