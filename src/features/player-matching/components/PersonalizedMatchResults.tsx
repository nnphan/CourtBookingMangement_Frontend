import { Loader2, RotateCcw, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import type { ApiSuccessResponse } from '@/types/api';
import { MatchCardSkeleton } from './MatchCardSkeleton';
import { MatchRoomCard } from './MatchRoomCard';
import type {
  PersonalizedPlayerMatchSearchResponse,
  PlayerMatchJoinPreview,
} from '../types/player-matching.types';

interface PersonalizedMatchResultsProps {
  response: ApiSuccessResponse<PersonalizedPlayerMatchSearchResponse> | null;
  isLoading: boolean;
  errorMessage?: string;
  joinRequestStatuses: Readonly<Record<string, string>>;
  onJoinMatch: (match: PlayerMatchJoinPreview) => void;
  onRetry: () => void;
  onPageChange: (page: number) => void;
}

export const PersonalizedMatchResults = ({
  response,
  isLoading,
  errorMessage,
  joinRequestStatuses,
  onJoinMatch,
  onRetry,
  onPageChange,
}: PersonalizedMatchResultsProps) => {
  const { t } = useTranslation();

  if (!response && isLoading) {
    return (
      <div className="space-y-4">
        <p role="status" className="text-content-secondary inline-flex items-center gap-2 text-sm">
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          {t('playerMatch.scoring.searching')}
        </p>
        <MatchCardSkeleton count={3} />
      </div>
    );
  }

  if (!response && errorMessage) {
    return (
      <div role="alert" className="space-y-3 rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="text-danger text-sm font-semibold">{errorMessage}</p>
        <Button type="button" variant="outline" onClick={onRetry} className="min-h-11 gap-2">
          <RotateCcw aria-hidden="true" className="size-4" />
          {t('playerMatch.discovery.retry')}
        </Button>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="border-line bg-surface flex flex-col items-center rounded-2xl border border-dashed p-8 text-center sm:p-10">
        <Sparkles aria-hidden="true" className="text-brand-600 size-8" />
        <h3 className="text-content-primary mt-3 text-lg font-bold">
          {t('playerMatch.scoring.readyTitle')}
        </h3>
        <p className="text-content-secondary mt-1 max-w-md text-sm leading-6">
          {t('playerMatch.scoring.readyDescription')}
        </p>
      </div>
    );
  }

  const { data, metadata } = response;
  const matches = data.items;

  return (
    <div className="space-y-5">
      <div className="flex min-h-8 flex-wrap items-center justify-between gap-3">
        <h2 className="text-content-primary text-base font-black sm:text-lg">
          {t('playerMatch.scoring.resultCount', { count: metadata?.totalCount ?? matches.length })}
        </h2>
        {isLoading && (
          <span
            role="status"
            aria-atomic="true"
            className="text-content-secondary inline-flex items-center gap-2 text-xs"
          >
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            {t('playerMatch.discovery.updating')}
          </span>
        )}
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
        >
          <p className="text-danger text-sm">{errorMessage}</p>
          <Button type="button" variant="outline" onClick={onRetry} className="min-h-11">
            {t('playerMatch.discovery.retry')}
          </Button>
        </div>
      )}

      {data.candidateLimitReached && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          {t('playerMatch.scoring.candidateLimitReached')}
        </p>
      )}

      {matches.length === 0 ? (
        <div className="border-line bg-surface flex flex-col items-center justify-center rounded-3xl border border-dashed p-10 text-center">
          <h3 className="text-content-primary text-lg font-black">
            {t('playerMatch.scoring.emptyTitle')}
          </h3>
          <p className="text-content-secondary mt-1 max-w-sm text-sm">
            {t('playerMatch.scoring.emptyDescription')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {matches.map((match) => (
            <MatchRoomCard
              key={match.roomId}
              match={match}
              appliedWeights={data.appliedWeights}
              joinRequestStatus={joinRequestStatuses[match.roomId]}
              onJoinMatch={onJoinMatch}
            />
          ))}
        </div>
      )}

      {metadata && metadata.totalPages > 1 && (
        <nav
          aria-label={t('playerMatch.discovery.pagination')}
          className="flex flex-wrap items-center justify-center gap-3 pt-2"
        >
          <Button
            type="button"
            variant="outline"
            disabled={!metadata.hasPreviousPage || isLoading}
            onClick={() => onPageChange(metadata.pageNumber - 1)}
            className="min-h-11"
          >
            {t('playerMatch.discovery.previous')}
          </Button>
          <span className="text-content-secondary text-sm tabular-nums">
            {t('playerMatch.discovery.pageOf', {
              page: metadata.pageNumber,
              totalPages: metadata.totalPages,
            })}
          </span>
          <Button
            type="button"
            variant="outline"
            disabled={!metadata.hasNextPage || isLoading}
            onClick={() => onPageChange(metadata.pageNumber + 1)}
            className="min-h-11"
          >
            {t('playerMatch.discovery.next')}
          </Button>
        </nav>
      )}
    </div>
  );
};
