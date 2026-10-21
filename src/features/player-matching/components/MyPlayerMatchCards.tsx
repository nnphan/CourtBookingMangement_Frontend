import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarDays, Clock3, MapPin, UsersRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  formatBookingDate,
  formatBookingTime,
  formatCurrency,
} from '@/features/bookings/utils/booking.mapper';
import type { HostedPlayerMatch, ParticipatingPlayerMatch } from '../types/player-matching.types';

interface MatchCardProps {
  match: HostedPlayerMatch | ParticipatingPlayerMatch;
  matchId: string;
  onViewDetails: (matchId: string) => void;
  additionalAction?: ReactNode;
}

const MatchCardDetails = ({
  match,
  onViewDetails,
  matchId,
  children,
  additionalAction,
}: MatchCardProps & {
  children: ReactNode;
}) => {
  const { t } = useTranslation();
  const skillLabel = t(`playerMatch.skill.${match.skillLevel.toLowerCase()}`, {
    defaultValue: match.skillLevel,
  });
  const genderLabel = t(`playerMatch.gender.${match.genderPreference.toLowerCase()}`, {
    defaultValue: match.genderPreference,
  });

  return (
    <article className="border-line bg-surface flex min-w-0 flex-col justify-between rounded-2xl border p-5 shadow-xs">
      <div>
        <h2 className="text-content-primary line-clamp-2 text-base font-bold">{match.title}</h2>
        <div className="mt-4 space-y-3 text-sm">
          <p className="text-content-secondary flex items-start gap-2">
            <MapPin aria-hidden="true" className="text-brand-600 mt-0.5 size-4 shrink-0" />
            <span className="min-w-0">
              {match.branchName}
              {match.courtName ? ` · ${match.courtName}` : ''}
            </span>
          </p>
          <p className="text-content-secondary flex items-center gap-2">
            <CalendarDays aria-hidden="true" className="text-brand-600 size-4 shrink-0" />
            <span>{formatBookingDate(match.matchDate)}</span>
          </p>
          <p className="text-content-secondary flex items-center gap-2">
            <Clock3 aria-hidden="true" className="text-brand-600 size-4 shrink-0" />
            <span>
              {formatBookingTime(match.startTime)} - {formatBookingTime(match.endTime)}
            </span>
          </p>
          <p className="text-content-secondary">
            {skillLabel} · {genderLabel}
          </p>
          <p className="text-content-secondary flex items-center gap-2">
            <UsersRound aria-hidden="true" className="text-brand-600 size-4 shrink-0" />
            <span>
              {match.currentPlayers}/{match.maxPlayers} {t('playerMatch.card.players')}
            </span>
          </p>
          {match.feePerPlayer !== null && (
            <p className="text-brand-700 font-semibold">
              {formatCurrency(match.feePerPlayer)}{' '}
              <span className="text-content-secondary font-normal">
                {t('playerMatch.card.perPlayer')}
              </span>
            </p>
          )}
        </div>
        {children}
      </div>
      <div className={`mt-5 grid gap-2 ${additionalAction ? 'sm:grid-cols-2' : ''}`}>
        <Button
          type="button"
          variant="outline"
          className="border-line w-full"
          onClick={() => onViewDetails(matchId)}
        >
          {t('playerMatch.myMatches.viewDetails')}
        </Button>
        {additionalAction}
      </div>
    </article>
  );
};

export const HostedPlayerMatchCard = ({
  match,
  onViewDetails,
  onReviewRequests,
}: {
  match: HostedPlayerMatch;
  onViewDetails: (matchId: string) => void;
  onReviewRequests: (match: HostedPlayerMatch) => void;
}) => {
  const { t } = useTranslation();
  const statusKey = match.status.toLowerCase();

  return (
    <MatchCardDetails
      match={match}
      matchId={match.id}
      onViewDetails={onViewDetails}
      additionalAction={
        match.pendingRequestCount > 0 ? (
          <Button
            type="button"
            className="w-full"
            aria-label={t('playerMatch.joinRequests.review', {
              count: match.pendingRequestCount,
              title: match.title,
            })}
            onClick={() => onReviewRequests(match)}
          >
            {t('playerMatch.joinRequests.reviewCount', {
              count: match.pendingRequestCount,
            })}
          </Button>
        ) : undefined
      }
    >
      <div className="border-line mt-3 space-y-2 border-t pt-3 text-sm">
        <p className="text-content-secondary">
          {t(`playerMatch.myMatches.status.${statusKey}`, { defaultValue: match.status })}
        </p>
        <p className="text-content-primary font-semibold">
          {match.isFull
            ? t('playerMatch.myMatches.full')
            : t('playerMatch.myMatches.remainingSlots', { count: match.remainingSlots })}
        </p>
        <p
          role="status"
          className="text-content-secondary"
          aria-label={t('playerMatch.myMatches.pendingRequests', {
            count: match.pendingRequestCount,
          })}
        >
          {match.pendingRequestCount > 0
            ? t('playerMatch.myMatches.pendingRequests', {
                count: match.pendingRequestCount,
              })
            : t('playerMatch.myMatches.noPendingRequests')}
        </p>
      </div>
    </MatchCardDetails>
  );
};

export const ParticipatingPlayerMatchCard = ({
  match,
  onViewDetails,
}: {
  match: ParticipatingPlayerMatch;
  onViewDetails: (matchId: string) => void;
}) => {
  const { t } = useTranslation();
  const matchStatus = match.matchStatus.toUpperCase();
  const participationStatus = match.participationStatus.toUpperCase();
  const statusKey =
    matchStatus === 'CANCELLED' || matchStatus === 'COMPLETED'
      ? `match_${matchStatus.toLowerCase()}`
      : `participation_${participationStatus.toLowerCase()}`;
  const descriptionKey =
    matchStatus === 'COMPLETED'
      ? 'completedDescription'
      : matchStatus === 'CANCELLED'
        ? 'cancelledDescription'
        : `participation_${participationStatus.toLowerCase()}Description`;

  return (
    <MatchCardDetails match={match} matchId={match.matchId} onViewDetails={onViewDetails}>
      <div className="border-line mt-3 space-y-2 border-t pt-3">
        <p className="text-content-secondary text-xs font-semibold">
          {t('playerMatch.myMatches.statusLabel')}
        </p>
        <p className="text-content-primary text-sm font-bold">
          {t(`playerMatch.myMatches.${statusKey}`, {
            defaultValue: match.participationStatus,
          })}
        </p>
        <p className="text-content-secondary text-sm">
          {t(`playerMatch.myMatches.${descriptionKey}`)}
        </p>
        {participationStatus === 'PENDING' && (
          <p className="text-content-tertiary text-xs">
            {t('playerMatch.myMatches.cancelUnavailable')}
          </p>
        )}
      </div>
    </MatchCardDetails>
  );
};
