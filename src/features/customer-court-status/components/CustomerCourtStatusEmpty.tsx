import React from 'react';
import { CourtStatusEmptyState } from '@/features/court-status/shared/components/CourtStatusEmptyState';

interface CustomerCourtStatusEmptyProps {
  date?: string;
}

export const CustomerCourtStatusEmpty: React.FC<CustomerCourtStatusEmptyProps> = ({ date }) => {
  return (
    <CourtStatusEmptyState
      title="Không có sân khả dụng."
      description={
        date
          ? `Hiện không có sân nào hoạt động vào ngày ${date}. Quý khách vui lòng chọn ngày khác hoặc chuyển sang chi nhánh khác.`
          : 'Không tìm thấy sân khả dụng cho chi nhánh đã chọn.'
      }
    />
  );
};

export default CustomerCourtStatusEmpty;
