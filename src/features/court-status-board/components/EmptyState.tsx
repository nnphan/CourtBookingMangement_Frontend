import React, { memo } from 'react';
import { CourtStatusEmptyState } from '@/features/court-status/shared/components/CourtStatusEmptyState';

interface EmptyStateProps {
  title?: string;
  description?: string;
  date?: string;
  onCreateBooking?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = memo(
  ({ title, description, date, onCreateBooking }) => {
    return (
      <CourtStatusEmptyState
        title={title}
        description={description}
        date={date}
        onCreateBooking={onCreateBooking}
      />
    );
  },
);

EmptyState.displayName = 'EmptyState';
