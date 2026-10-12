import React, { memo } from 'react';
import {
  VietnameseDatePickerDialog,
  type VietnameseDatePickerDialogProps,
} from '@/features/court-status-board';

export interface CustomerDatePickerDialogProps
  extends Omit<VietnameseDatePickerDialogProps, 'value' | 'onChange'> {
  value?: string;
  onChange?: (date: string) => void;
  selectedDate?: string;
  onConfirmDate?: (date: string) => void;
}

export const CustomerDatePickerDialog: React.FC<CustomerDatePickerDialogProps> = memo(
  ({ value, onChange, selectedDate, onConfirmDate, ...rest }) => {
    return (
      <VietnameseDatePickerDialog
        {...rest}
        value={value ?? selectedDate}
        onChange={onChange ?? onConfirmDate}
        selectedDate={selectedDate ?? value}
        onConfirmDate={onConfirmDate ?? onChange}
      />
    );
  },
);

CustomerDatePickerDialog.displayName = 'CustomerDatePickerDialog';
