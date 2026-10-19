import { useNavigate } from 'react-router';
import { Award, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { paths } from '@/app/router/paths';
import { formatBookingTime, formatCurrency } from '@/features/bookings/utils/booking.mapper';
import { useTranslation } from 'react-i18next';
import type { PlayerMatchListItem } from '../types/player-matching.types';
import dayjs from '@/lib/dayjs';

export const PlayerMatchCard = ({ match }: { match: PlayerMatchListItem }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const date = dayjs(match.matchDate);
  const skillLabel = t(`playerMatch.skill.${match.skillLevel.toLowerCase()}`, {
    defaultValue: match.skillLevel,
  });
  const genderLabel = t(`playerMatch.gender.${match.genderPreference.toLowerCase()}`, {
    defaultValue: match.genderPreference,
  });

  return (
    <article className="group border-line bg-surface hover:border-brand-300 relative flex min-w-0 flex-col justify-between overflow-hidden rounded-2xl border p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div>
        <div className="border-line flex items-start justify-between gap-3 border-b pb-3">
          <div className="min-w-0">
            <p className="text-content-secondary truncate text-xs">{match.createdByName}</p>
            <h2 className="text-content-primary mt-1 line-clamp-2 text-base font-bold">
              {match.title}
            </h2>
          </div>
          <span className="bg-surface-muted text-content-secondary border-line inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-semibold">
            {match.status}
          </span>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <div className="text-content-primary flex min-w-0 items-center gap-2 text-sm font-black">
              <MapPin aria-hidden="true" className="text-brand-600 size-4 shrink-0" />
              <span className="truncate">{match.branchName}</span>
            </div>
            <p className="text-content-secondary mt-1 ml-6 truncate text-xs">{match.courtName}</p>
          </div>

          <div className="bg-surface-muted/60 border-line grid grid-cols-2 gap-2 rounded-xl border p-2.5 text-xs">
            <div className="flex min-w-0 items-center gap-2">
              <Calendar aria-hidden="true" className="text-content-tertiary size-3.5 shrink-0" />
              <span className="text-content-primary font-medium">
                {date.isValid() ? date.format('DD/MM/YYYY') : match.matchDate}
              </span>
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <Clock aria-hidden="true" className="text-brand-600 size-3.5 shrink-0" />
              <span className="text-content-primary font-bold tabular-nums">
                {formatBookingTime(match.startTime)} - {formatBookingTime(match.endTime)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 font-bold text-amber-800">
              <Award aria-hidden="true" className="size-3.5 text-amber-600" />
              {skillLabel}
            </span>
            <span className="text-content-secondary">{genderLabel}</span>
          </div>

          <div className="text-content-secondary flex items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-1.5">
              <Users aria-hidden="true" className="text-brand-600 size-3.5" />
              <span className="text-content-primary font-bold">
                {match.currentPlayers} / {match.maxPlayers} {t('playerMatch.card.players')}
              </span>
            </span>
            <span className="font-bold text-emerald-700">
              {t('playerMatch.card.remainingSlots', { count: match.remainingSlots })}
            </span>
          </div>

          <p className="text-brand-700 border-line border-t pt-3 text-sm font-extrabold">
            {formatCurrency(match.feePerPlayer)}
            <span className="text-content-secondary ml-1 text-xs font-normal">
              {t('playerMatch.card.perPlayer')}
            </span>
          </p>
        </div>
      </div>

      <div className="border-line mt-5 border-t pt-3">
        <Button
          type="button"
          variant="outline"
          className="border-line hover:bg-surface-muted hover:text-brand-600 w-full gap-2 text-xs font-bold"
          onClick={() => navigate(paths.playerMatchingDetail(match.id))}
        >
          {t('playerMatch.card.viewDetails')}
        </Button>
      </div>
    </article>
  );
};
