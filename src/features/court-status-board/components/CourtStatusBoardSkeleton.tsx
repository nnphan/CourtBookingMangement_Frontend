import React from 'react';
import { CourtStatusSchedulerSkeleton } from '@/features/court-status/shared/components/CourtStatusSchedulerSkeleton';

export interface CourtStatusBoardSkeletonProps {
  rowCount?: number;
  columnCount?: number;
}

export const CourtStatusBoardSkeleton: React.FC<CourtStatusBoardSkeletonProps> = ({
  rowCount = 12,
  columnCount = 18,
}) => {
  return (
    <CourtStatusSchedulerSkeleton
      ariaLabel="Loading court status board..."
      rowCount={rowCount}
      columnCount={columnCount}
      courtColumnWidth={140}
    />
  );
};

export default CourtStatusBoardSkeleton;
