import React from 'react';
import { CourtStatusErrorState } from '@/features/court-status/shared/components/CourtStatusErrorState';

interface CustomerCourtStatusErrorProps {
  message?: string;
  onRetry: () => void;
}

export const CustomerCourtStatusError: React.FC<CustomerCourtStatusErrorProps> = ({
  message,
  onRetry,
}) => {
  return (
    <CourtStatusErrorState
      title="Không thể tải trạng thái sân."
      message={
        message ||
        'Đã xảy ra lỗi khi kết nối với máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.'
      }
      onRetry={onRetry}
    />
  );
};

export default CustomerCourtStatusError;
