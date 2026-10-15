import React from 'react';
import { CourtStatusSchedulerSkeleton } from '@/features/court-status/shared/components/CourtStatusSchedulerSkeleton';

export const CustomerCourtStatusSkeleton: React.FC = () => {
  return (
    <CourtStatusSchedulerSkeleton
      ariaLabel="Đang tải lịch trạng thái sân"
      rowCount={8}
      columnCount={18}
      courtColumnWidth={140}
    />
  );
};

export default CustomerCourtStatusSkeleton;
