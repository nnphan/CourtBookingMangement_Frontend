import React from 'react';
import { useTranslation } from 'react-i18next';
import { CourtStatusEmptyState } from '@/features/court-status/shared/components/CourtStatusEmptyState';

interface CustomerCourtStatusEmptyProps {
  date?: string;
}

export const CustomerCourtStatusEmpty: React.FC<CustomerCourtStatusEmptyProps> = ({ date }) => {
  const { t } = useTranslation();

  return (
    <CourtStatusEmptyState
      title={t('courtStatus.empty.noCourts')}
      description={
        date
          ? t('courtStatus.empty.noCourtsOnDate', { date })
          : t('courtStatus.empty.noCourtsDescription')
      }
    />
  );
};

export default CustomerCourtStatusEmpty;
