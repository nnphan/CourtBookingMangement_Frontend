import React, { memo } from 'react';
import { CourtStatusErrorState } from '@/features/court-status/shared/components/CourtStatusErrorState';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry: () => void;
  onRefresh?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = memo(
  ({ title, message, onRetry, onRefresh }) => {
    return (
      <CourtStatusErrorState
        title={title}
        message={message}
        onRetry={onRetry}
        onRefresh={onRefresh}
      />
    );
  },
);

ErrorState.displayName = 'ErrorState';
