import React from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, CheckCircle2, XCircle, Grid3X3 } from 'lucide-react';
import type { BranchSummaryDto } from '../types/branch-admin.types';
import { StatCard, StatCardGrid, StatCardSkeleton } from '@/components/management';
import { useLocaleFormatters } from '@/hooks/useLocaleFormatters';

export interface BranchSummaryCardsProps {
  summary?: BranchSummaryDto | null;
  isLoading?: boolean;
}

export const BranchSummarySkeleton: React.FC = () => (
  <StatCardGrid>
    {Array.from({ length: 4 }).map((_, i) => (
      <StatCardSkeleton key={i} />
    ))}
  </StatCardGrid>
);

export const BranchSummaryCards: React.FC<BranchSummaryCardsProps> = ({
  summary,
  isLoading = false,
}) => {
  const { t } = useTranslation('branch');
  const { formatNumber } = useLocaleFormatters();

  if (isLoading) {
    return <BranchSummarySkeleton />;
  }

  return (
    <StatCardGrid>
      <StatCard
        label={t('stats.totalBranches', 'Tổng chi nhánh')}
        value={formatNumber(summary?.totalBranches ?? 0)}
        icon={Building2}
        tone="neutral"
      />
      <StatCard
        label={t('stats.activeBranches', 'Đang hoạt động')}
        value={formatNumber(summary?.activeBranches ?? 0)}
        icon={CheckCircle2}
        tone="success"
      />
      <StatCard
        label={t('stats.inactiveBranches', 'Ngưng hoạt động')}
        value={formatNumber(summary?.inactiveBranches ?? 0)}
        icon={XCircle}
        tone="danger"
      />
      <StatCard
        label={t('stats.totalCourts', 'Tổng số sân')}
        value={formatNumber(summary?.totalCourts ?? 0)}
        icon={Grid3X3}
        tone="primary"
      />
    </StatCardGrid>
  );
};
