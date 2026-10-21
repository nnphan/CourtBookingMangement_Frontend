import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CalendarDays,
  CircleCheck,
  CircleHelp,
  CircleX,
  Clock3,
  MapPin,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  statusBadge?: ReactNode;
  viewDetailsLabel?: string;
  viewDetailsPrimary?: boolean;
}

const MatchCardDetails = ({
  match,
  onViewDetails,
  matchId,
  children,
  additionalAction,
  statusBadge,
  viewDetailsLabel,
  viewDetailsPrimary = false,
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
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-content-primary min-w-0 flex-1 text-base font-bold">{match.title}</h2>
          {statusBadge}
        </div>
        <div className="mt-4 space-y-3 text-sm">
          <p className="text-content-secondary flex items-start gap-2">
            <MapPin aria-hidden="true" className="text-brand-600 mt-0.5 size-4 shrink-0" />
            <span className="min-w-0">
              {match.branchName}
              {match.courtName ? ` · ${match.courtName}` : ''}
            </span>
          </p>
          <div className="text-content-secondary flex flex-wrap gap-x-4 gap-y-2">
            <p className="flex items-center gap-2">
              <CalendarDays aria-hidden="true" className="text-brand-600 size-4 shrink-0" />
              <span>{formatBookingDate(match.matchDate)}</span>
            </p>
            <p className="flex items-center gap-2">
              <Clock3 aria-hidden="true" className="text-brand-600 size-4 shrink-0" />
              <span>
                {formatBookingTime(match.startTime)} - {formatBookingTime(match.endTime)}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{skillLabel}</Badge>
            <Badge variant="secondary">{genderLabel}</Badge>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
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
        </div>
        {children}
      </div>
      <div className={`mt-5 grid gap-2 ${additionalAction ? 'sm:grid-cols-2' : ''}`}>
        <Button
          type="button"
          variant={viewDetailsPrimary ? 'primary' : 'outline'}
          className={`w-full ${viewDetailsPrimary ? '' : 'border-line'}`}
          onClick={() => onViewDetails(matchId)}
        >
          {viewDetailsLabel ?? t('playerMatch.myMatches.viewDetails')}
        </Button>
        {additionalAction}
      </div>
    </article>
  );
};

type ParticipationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

interface ParticipationStatusConfig {
  icon: LucideIcon;
  labelKey: string;
  descriptionKey: string;
  className: string;
}

const participationStatusConfig: Record<ParticipationStatus, ParticipationStatusConfig> = {
  PENDING: {
    icon: Clock3,
    labelKey: 'playerMatch.myMatches.participation_pending',
    descriptionKey: 'playerMatch.myMatches.participation_pendingDescription',
    className: 'border-amber-200 bg-amber-50 text-amber-900',
  },
  APPROVED: {
    icon: CircleCheck,
    labelKey: 'playerMatch.myMatches.participation_approved',
    descriptionKey: 'playerMatch.myMatches.participation_approvedDescription',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  },
  REJECTED: {
    icon: CircleX,
    labelKey: 'playerMatch.myMatches.participation_rejected',
    descriptionKey: 'playerMatch.myMatches.participation_rejectedDescription',
    className: 'border-rose-200 bg-rose-50 text-rose-900',
  },
  CANCELLED: {
    icon: CircleX,
    labelKey: 'playerMatch.myMatches.participation_cancelled',
    descriptionKey: 'playerMatch.myMatches.participation_cancelledDescription',
    className: 'border-line bg-surface-muted text-content-secondary',
  },
};

const MatchStatusBadge = ({ status }: { status: string }) => {
  const { t } = useTranslation();
  const statusKey = status.toLowerCase();
  const variants: Record<string, 'info' | 'secondary' | 'muted' | 'destructive'> = {
    OPEN: 'info',
    FULL: 'secondary',
    COMPLETED: 'muted',
    CANCELLED: 'destructive',
  };
  const className =
    status.toUpperCase() === 'CANCELLED'
      ? 'border border-rose-200 bg-rose-50 text-rose-800'
      : 'shrink-0';

  return (
    <Badge variant={variants[status.toUpperCase()] ?? 'muted'} className={className}>
      {t(`playerMatch.myMatches.status.${statusKey}`, {
        defaultValue: t('playerMatch.myMatches.unknownStatus', { status }),
      })}
    </Badge>
  );
};

const ParticipationStatusCard = ({ status }: { status: string }) => {
  const { t } = useTranslation();
  const config = participationStatusConfig[status.toUpperCase() as ParticipationStatus];
  const Icon = config?.icon ?? CircleHelp;

  return (
    <section
      role="status"
      className={`mt-4 rounded-xl border p-3.5 ${
        config?.className ?? 'border-line bg-surface-muted text-content-secondary'
      }`}
    >
      <div className="flex items-start gap-2.5">
        <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <div className="min-w-0">
          <h3 className="text-sm font-semibold">
            {config
              ? t(config.labelKey)
              : t('playerMatch.myMatches.unknownStatus', { status })}
          </h3>
          <p className="mt-1 text-sm">
            {config
              ? t(config.descriptionKey)
              : t('playerMatch.myMatches.unknownParticipationDescription')}
          </p>
        </div>
      </div>
    </section>
  );
};

const MatchLifecycleCard = ({ status }: { status: string }) => {
  const { t } = useTranslation();
  const completed = status.toUpperCase() === 'COMPLETED';
  const labelKey = completed
    ? 'playerMatch.myMatches.match_completed'
    : 'playerMatch.myMatches.match_cancelled';
  const descriptionKey = completed
    ? 'playerMatch.myMatches.completedDescription'
    : 'playerMatch.myMatches.cancelledDescription';
  const Icon = completed ? CircleCheck : CircleX;

  return (
    <section
      role="status"
      className={`mt-4 rounded-xl border p-3.5 ${
        completed
          ? 'border-line bg-surface-muted text-content-secondary'
          : 'border-rose-200 bg-rose-50 text-rose-900'
      }`}
    >
      <div className="flex items-start gap-2.5">
        <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <div>
          <h3 className="text-sm font-semibold">{t(labelKey)}</h3>
          <p className="mt-1 text-sm">{t(descriptionKey)}</p>
        </div>
      </div>
    </section>
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

  return (
    <MatchCardDetails
      match={match}
      matchId={match.id}
      onViewDetails={onViewDetails}
      statusBadge={<MatchStatusBadge status={match.status} />}
      viewDetailsPrimary={match.pendingRequestCount <= 0}
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
      <div className="border-line mt-4 space-y-3 border-t pt-3 text-sm">
        <p className="text-content-primary font-semibold">
          {match.isFull
            ? t('playerMatch.myMatches.full')
            : t('playerMatch.myMatches.remainingSlots', { count: match.remainingSlots })}
        </p>
        {match.pendingRequestCount > 0 && (
          <p
            role="status"
            aria-label={t('playerMatch.myMatches.pendingRequests', {
              count: match.pendingRequestCount,
            })}
            className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900"
          >
            <Clock3 aria-hidden="true" className="size-4 shrink-0" />
            {t('playerMatch.myMatches.pendingRequests', {
              count: match.pendingRequestCount,
            })}
          </p>
        )}
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
  const hasEnded = matchStatus === 'CANCELLED' || matchStatus === 'COMPLETED';
  const isApproved = participationStatus === 'APPROVED';

  return (
    <MatchCardDetails
      match={match}
      matchId={match.matchId}
      onViewDetails={onViewDetails}
      statusBadge={<MatchStatusBadge status={match.matchStatus} />}
      viewDetailsLabel={
        isApproved ? t('playerMatch.myMatches.viewMatch') : t('playerMatch.myMatches.viewDetails')
      }
      viewDetailsPrimary
    >
      {hasEnded ? (
        <MatchLifecycleCard status={matchStatus} />
      ) : (
        <ParticipationStatusCard status={participationStatus} />
      )}
    </MatchCardDetails>
  );
};
