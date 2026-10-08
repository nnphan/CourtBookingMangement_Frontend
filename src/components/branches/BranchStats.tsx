import React from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, CheckCircle2, XCircle, Grid3X3 } from 'lucide-react';
import type { BranchStats as BranchStatsType } from '@/types/branch';
import { StatCard, StatCardGrid, StatCardSkeleton } from '@/components/management';
import { useLocaleFormatters } from '@/hooks/useLocaleFormatters';

interface BranchStatsProps {
  stats?: BranchStatsType;
  isLoading?: boolean;
}

export const BranchStats: React.FC<BranchStatsProps> = ({ stats, isLoading }) => {
  const { t } = useTranslation('branch');
  const { formatNumber } = useLocaleFormatters();

  if (isLoading) {
    return (
      <StatCardGrid>
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </StatCardGrid>
    );
  }

  return (
    <StatCardGrid>
      <StatCard
        label={t('stats.totalBranches')}
        value={formatNumber(stats?.totalBranches ?? 0)}
        icon={Building2}
        tone="neutral"
      />
      <StatCard
        label={t('stats.activeBranches')}
        value={formatNumber(stats?.activeBranches ?? 0)}
        icon={CheckCircle2}
        tone="success"
      />
      <StatCard
        label={t('stats.inactiveBranches')}
        value={formatNumber(stats?.inactiveBranches ?? 0)}
        icon={XCircle}
        tone="danger"
      />
      <StatCard
        label={t('stats.totalCourts')}
        value={formatNumber(stats?.totalCourts ?? 0)}
        icon={Grid3X3}
        tone="primary"
      />
    </StatCardGrid>
  );
};
