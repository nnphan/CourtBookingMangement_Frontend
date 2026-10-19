import { Loader2, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { PlayerMatchCard } from './PlayerMatchCard';
import { MatchCardSkeleton } from './MatchCardSkeleton';
import { usePlayerMatches } from '../hooks/usePlayerMatching';
import { usePlayerMatchingFilterStore } from '../store/player-matching-filter.store';

export const MatchList = () => {
  const { t } = useTranslation();
  const {
    keyword,
    matchDate,
    startTime,
    endTime,
    skillLevel,
    genderPreference,
    city,
    district,
    sortBy,
    page,
    pageSize,
    setPage,
    resetFilters,
  } = usePlayerMatchingFilterStore();
  const hasInvalidTimeRange = Boolean(startTime && endTime && startTime >= endTime);
  const query = usePlayerMatches(
    {
      keyword: keyword.trim() || undefined,
      matchDate,
      startTime,
      endTime,
      skillLevel,
      genderPreference,
      city: city.trim() || undefined,
      district: district.trim() || undefined,
      sortBy,
      page,
      pageSize,
    },
    !hasInvalidTimeRange,
  );

  if (hasInvalidTimeRange) return null;

  const matches = query.data?.data ?? [];
  const metadata = query.data?.metadata;

  if (query.isLoading && !query.data) {
    return <MatchCardSkeleton count={pageSize} />;
  }

  if (query.isError) {
    const status = (query.error as Error & { status?: number }).status;
    const errorMessage =
      status === 401
        ? t('playerMatch.discovery.unauthorized')
        : status === 403
          ? t('playerMatch.discovery.forbidden')
          : t('playerMatch.discovery.error');
    return (
      <div className="space-y-3 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-danger text-sm font-bold">{errorMessage}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void query.refetch()}
          className="text-danger border-red-300"
        >
          {t('playerMatch.discovery.retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex min-h-7 items-center justify-between gap-3">
        <h2 className="text-content-primary text-base font-black sm:text-lg">
          {t('playerMatch.discovery.resultCount', { count: metadata?.totalCount ?? 0 })}
        </h2>
        {query.isFetching && (
          <span
            role="status"
            className="text-content-secondary inline-flex items-center gap-2 text-xs"
          >
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            {t('playerMatch.discovery.updating')}
          </span>
        )}
      </div>

      {matches.length === 0 ? (
        <div className="border-line bg-surface flex flex-col items-center justify-center rounded-3xl border border-dashed p-12 text-center">
          <div
            aria-hidden="true"
            className="bg-brand-50 mb-4 grid size-16 place-items-center rounded-2xl text-3xl"
          >
            🏸
          </div>
          <h3 className="text-content-primary text-lg font-black">
            {t('playerMatch.discovery.emptyTitle')}
          </h3>
          <p className="text-content-secondary mt-1 max-w-sm text-sm">
            {t('playerMatch.discovery.emptyDescription')}
          </p>
          <Button type="button" onClick={resetFilters} className="mt-5 gap-2 text-xs font-bold">
            <RotateCcw aria-hidden="true" className="size-3.5" />
            {t('playerMatch.filters.reset')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => (
            <PlayerMatchCard key={match.id} match={match} />
          ))}
        </div>
      )}

      {metadata && metadata.totalPages > 1 && (
        <nav
          aria-label={t('playerMatch.discovery.pagination')}
          className="flex items-center justify-center gap-3 pt-2"
        >
          <Button
            type="button"
            variant="outline"
            disabled={!metadata.hasPreviousPage || query.isFetching}
            onClick={() => setPage(page - 1)}
          >
            {t('playerMatch.discovery.previous')}
          </Button>
          <span className="text-content-secondary text-sm tabular-nums">
            {t('playerMatch.discovery.pageOf', { page, totalPages: metadata.totalPages })}
          </span>
          <Button
            type="button"
            variant="outline"
            disabled={!metadata.hasNextPage || query.isFetching}
            onClick={() => setPage(page + 1)}
          >
            {t('playerMatch.discovery.next')}
          </Button>
        </nav>
      )}
    </div>
  );
};
