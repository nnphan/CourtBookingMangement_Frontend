import { CalendarDays, Clock3, MapPin, UsersRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatBookingTime, formatCurrency } from '@/features/bookings/utils/booking.mapper';
import dayjs from '@/lib/dayjs';
import { usePlayerMatchDetail } from '../hooks/usePlayerMatching';
import type { PlayerMatchDetail } from '../types/player-matching.types';

interface PlayerMatchDetailDialogProps {
  matchId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DetailSkeleton = () => {
  const { t } = useTranslation();
  return (
    <div
      role="status"
      aria-label={t('playerMatch.detail.loading')}
      className="animate-pulse space-y-5"
    >
      <div className="bg-surface-muted h-7 w-2/3 rounded" />
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="bg-surface-muted h-20 rounded-lg" />
        ))}
      </div>
      <div className="bg-surface-muted h-24 rounded-lg" />
    </div>
  );
};

const MatchDetailContent = ({ match }: { match: PlayerMatchDetail }) => {
  const { t } = useTranslation();
  const date = dayjs(match.matchDate);
  const skillLabel = t(`playerMatch.skill.${match.skillLevel.toLowerCase()}`, {
    defaultValue: match.skillLevel,
  });
  const genderLabel = t(`playerMatch.gender.${match.genderPreference.toLowerCase()}`, {
    defaultValue: match.genderPreference,
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-content-primary text-xl font-extrabold">{match.title}</h2>
          <p className="text-content-secondary mt-1 text-sm">
            {t('playerMatch.detail.host', { name: match.createdByName })}
          </p>
        </div>
        <span className="bg-surface-muted text-content-secondary border-line rounded-full border px-3 py-1 text-xs font-bold">
          {match.status}
        </span>
      </div>

      <section
        aria-label={t('playerMatch.detail.scheduleLocation')}
        className="grid gap-3 sm:grid-cols-2"
      >
        <div className="bg-surface-muted/60 border-line flex min-w-0 items-start gap-2.5 rounded-lg border p-3">
          <MapPin aria-hidden="true" className="text-brand-600 mt-0.5 size-4 shrink-0" />
          <div className="min-w-0">
            <p className="text-content-secondary text-xs">{t('playerMatch.detail.location')}</p>
            <p className="text-content-primary text-sm font-semibold">{match.branchName}</p>
            {match.courtName && <p className="text-content-secondary text-xs">{match.courtName}</p>}
            {[match.district, match.city].filter(Boolean).length > 0 && (
              <p className="text-content-secondary text-xs">
                {[match.district, match.city].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        </div>
        <div className="bg-surface-muted/60 border-line flex min-w-0 items-start gap-2.5 rounded-lg border p-3">
          <CalendarDays aria-hidden="true" className="text-brand-600 mt-0.5 size-4 shrink-0" />
          <div>
            <p className="text-content-secondary text-xs">{t('playerMatch.detail.schedule')}</p>
            <p className="text-content-primary text-sm font-semibold">
              {date.isValid() ? date.format('DD/MM/YYYY') : match.matchDate}
            </p>
            <p className="text-content-secondary flex items-center gap-1 text-xs tabular-nums">
              <Clock3 aria-hidden="true" className="size-3" />
              {formatBookingTime(match.startTime)} - {formatBookingTime(match.endTime)}
            </p>
          </div>
        </div>
      </section>

      <section
        aria-label={t('playerMatch.detail.requirements')}
        className="grid gap-3 sm:grid-cols-3"
      >
        <div className="border-line rounded-lg border p-3">
          <p className="text-content-secondary text-xs">{t('playerMatch.detail.skillLevel')}</p>
          <p className="text-content-primary mt-1 text-sm font-semibold">{skillLabel}</p>
        </div>
        <div className="border-line rounded-lg border p-3">
          <p className="text-content-secondary text-xs">
            {t('playerMatch.detail.genderPreference')}
          </p>
          <p className="text-content-primary mt-1 text-sm font-semibold">{genderLabel}</p>
        </div>
        <div className="border-line rounded-lg border p-3">
          <p className="text-content-secondary text-xs">{t('playerMatch.detail.players')}</p>
          <p className="text-content-primary mt-1 flex items-center gap-1.5 text-sm font-semibold">
            <UsersRound aria-hidden="true" className="text-brand-600 size-4" />
            {match.currentPlayers} / {match.maxPlayers}
          </p>
          <p className="text-content-secondary mt-1 text-xs">
            {match.isFull
              ? t('playerMatch.detail.full')
              : t('playerMatch.detail.remaining', { count: match.remainingSlots })}
          </p>
        </div>
      </section>

      <div className="border-line flex flex-wrap items-center justify-between gap-3 border-y py-3">
        <p className="text-content-secondary text-sm">{t('playerMatch.detail.fee')}</p>
        <p className="text-brand-700 text-lg font-extrabold">
          {formatCurrency(match.feePerPlayer)}
        </p>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${match.isFull ? 'bg-surface-muted text-content-secondary' : match.canJoin ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}
        >
          {match.isFull
            ? t('playerMatch.detail.full')
            : match.canJoin
              ? t('playerMatch.detail.canJoin')
              : t('playerMatch.detail.cannotJoin')}
        </span>
      </div>

      {match.description?.trim() && (
        <section>
          <h3 className="text-content-primary text-sm font-bold">
            {t('playerMatch.detail.description')}
          </h3>
          <p className="text-content-secondary mt-1 text-sm whitespace-pre-wrap">
            {match.description}
          </p>
        </section>
      )}

      <section>
        <h3 className="text-content-primary text-sm font-bold">
          {t('playerMatch.detail.participants', { count: match.participantCount })}
        </h3>
        {match.participants.length === 0 ? (
          <p className="text-content-secondary bg-surface-muted mt-2 rounded-lg p-3 text-sm">
            {t('playerMatch.detail.noParticipants')}
          </p>
        ) : (
          <ul className="divide-line border-line mt-2 divide-y rounded-lg border">
            {match.participants.map((participant) => (
              <li
                key={`${participant.userId}-${participant.joinedAt}`}
                className="flex flex-wrap items-center justify-between gap-2 p-3"
              >
                <div>
                  <p className="text-content-primary text-sm font-semibold">
                    {participant.fullName}
                  </p>
                  <p className="text-content-secondary text-xs">
                    {participant.role} · {participant.status}
                  </p>
                </div>
                <time className="text-content-secondary text-xs" dateTime={participant.joinedAt}>
                  {dayjs(participant.joinedAt).isValid()
                    ? dayjs(participant.joinedAt).format('DD/MM/YYYY HH:mm')
                    : participant.joinedAt}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export const PlayerMatchDetailDialog = ({
  matchId,
  open,
  onOpenChange,
}: PlayerMatchDetailDialogProps) => {
  const { t } = useTranslation();
  const query = usePlayerMatchDetail(open ? matchId : undefined);
  const status = (query.error as (Error & { status?: number }) | null)?.status;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-line bg-surface max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('playerMatch.detail.title')}</DialogTitle>
          <DialogDescription>{t('playerMatch.detail.descriptionIntro')}</DialogDescription>
        </DialogHeader>

        {query.isLoading ? (
          <DetailSkeleton />
        ) : query.isError ? (
          <div role="alert" className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-danger text-sm font-semibold">
              {status === 404
                ? t('playerMatch.detail.notFound')
                : status === 401
                  ? t('playerMatch.detail.unauthorized')
                  : status === 403
                    ? t('playerMatch.detail.forbidden')
                    : t('playerMatch.detail.error')}
            </p>
            {status !== 404 && (
              <Button type="button" variant="outline" onClick={() => void query.refetch()}>
                {t('playerMatch.discovery.retry')}
              </Button>
            )}
          </div>
        ) : query.data ? (
          <MatchDetailContent match={query.data} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
