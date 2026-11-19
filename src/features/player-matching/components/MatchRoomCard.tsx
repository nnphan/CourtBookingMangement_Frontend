import {
  Award,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  TriangleAlert,
  UsersRound,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { paths } from '@/app/router/paths';
import { formatBookingTime, formatCurrency } from '@/features/bookings/utils/booking.mapper';
import dayjs from '@/lib/dayjs';
import type {
  PersonalizedPlayerMatch,
  PlayerMatchJoinPreview,
  PlayerMatchPreferenceWeights,
} from '../types/player-matching.types';

interface MatchRoomCardProps {
  match: PersonalizedPlayerMatch;
  appliedWeights: PlayerMatchPreferenceWeights;
  joinRequestStatus?: string | null;
  onJoinMatch: (match: PlayerMatchJoinPreview) => void;
}

export const MatchRoomCard = ({
  match,
  appliedWeights,
  joinRequestStatus,
  onJoinMatch,
}: MatchRoomCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const date = dayjs(match.matchDate);
  const levelKey = match.matchLevel.toLowerCase();
  const levelLabel = t(`playerMatch.scoring.levels.${levelKey}`, {
    defaultValue: t('playerMatch.scoring.levels.unknown'),
  });
  const gameTypeLabel = t(`playerMatch.drafts.${match.gameType.toLowerCase()}`, {
    defaultValue: match.gameType,
  });
  const isCourtReserved = match.courtReservationStatus === 'COURT_RESERVED';
  const requestStatus = joinRequestStatus ?? match.joinRequestStatus;
  const isFull = match.availableSlots <= 0;
  const canRequestToJoin = !isFull && !requestStatus;
  const score = Math.max(0, Math.min(100, match.matchScore));
  const scoreLabel = t('playerMatch.scoring.scoreLabel', {
    score: match.matchScore.toFixed(1),
    level: levelLabel,
  });
  const scoreParts = [
    ['skill', match.scoreBreakdown.skillScore, appliedWeights.skillWeight],
    ['time', match.scoreBreakdown.timeScore, appliedWeights.timeWeight],
    ['branch', match.scoreBreakdown.branchScore, appliedWeights.branchWeight],
    ['gender', match.scoreBreakdown.genderScore, appliedWeights.genderWeight],
  ] as const;

  const handleJoin = () => {
    onJoinMatch({
      id: match.roomId,
      title: match.title,
      branchName: match.branchName,
      courtName: match.courtName,
      matchDate: match.matchDate,
      startTime: match.startTime,
      endTime: match.endTime,
      matchLabel: gameTypeLabel,
      currentPlayers: match.currentPlayerCount,
      maxPlayers: match.requiredPlayerCount,
      feePerPlayer: match.participationFee,
    });
  };

  return (
    <article className="group border-line bg-surface hover:border-brand-300 flex min-w-0 flex-col justify-between overflow-hidden rounded-2xl border p-5 shadow-xs transition-shadow hover:shadow-lg">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-content-primary line-clamp-2 text-base font-bold">{match.title}</h3>
            <div className="text-content-secondary mt-2 flex min-w-0 items-center gap-2 text-sm">
              <MapPin aria-hidden="true" className="text-brand-600 size-4 shrink-0" />
              <span className="truncate">{match.branchName}</span>
              <span aria-hidden="true">·</span>
              <span className="truncate">{match.courtName}</span>
            </div>
          </div>
          <div
            role="group"
            aria-label={scoreLabel}
            className="bg-brand-50 text-brand-800 border-brand-200 inline-flex shrink-0 flex-col items-center rounded-xl border px-3 py-2"
          >
            <span className="text-lg leading-tight font-black tabular-nums">
              {match.matchScore.toFixed(1)}
            </span>
            <span className="text-xs font-semibold">{levelLabel}</span>
            <span
              aria-hidden="true"
              className="bg-brand-200 mt-1 h-1.5 w-full overflow-hidden rounded-full"
            >
              <span
                className="bg-brand-600 block h-full rounded-full"
                style={{ width: `${score}%` }}
              />
            </span>
          </div>
        </div>

        <div className="bg-surface-muted/60 border-line grid grid-cols-1 gap-2 rounded-xl border p-3 text-xs sm:grid-cols-2">
          <div className="text-content-primary flex min-w-0 items-center gap-2">
            <CalendarDays aria-hidden="true" className="text-content-tertiary size-4 shrink-0" />
            <span>{date.isValid() ? date.format('DD/MM/YYYY') : match.matchDate}</span>
          </div>
          <div className="text-content-primary flex min-w-0 items-center gap-2">
            <Clock3 aria-hidden="true" className="text-brand-600 size-4 shrink-0" />
            <span className="tabular-nums">
              {formatBookingTime(match.startTime)} - {formatBookingTime(match.endTime)}
            </span>
          </div>
          <div className="text-content-primary flex min-w-0 items-center gap-2">
            <Award aria-hidden="true" className="size-4 shrink-0 text-amber-600" />
            <span>
              {gameTypeLabel} · {match.minimumRating}–{match.maximumRating}
            </span>
          </div>
          <div className="text-content-primary flex min-w-0 items-center gap-2">
            <UsersRound aria-hidden="true" className="text-brand-600 size-4 shrink-0" />
            <span>
              {t('playerMatch.scoring.capacity', {
                current: match.currentPlayerCount,
                required: match.requiredPlayerCount,
                available: match.availableSlots,
              })}
            </span>
          </div>
        </div>

        <div
          className={`inline-flex min-h-8 items-center gap-2 rounded-lg border px-2.5 py-1 text-xs font-semibold ${
            isCourtReserved
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-amber-200 bg-amber-50 text-amber-800'
          }`}
        >
          <CheckCircle2 aria-hidden="true" className="size-4 shrink-0" />
          {isCourtReserved
            ? t('playerMatch.scoring.courtReserved')
            : t('playerMatch.scoring.courtNotReserved')}
        </div>

        <div className="border-line space-y-3 border-t pt-3">
          <p className="text-content-primary text-xs font-bold">
            {t('playerMatch.scoring.breakdownTitle')}
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {scoreParts.map(([key, value, weight]) => (
              <li key={key} className="min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-content-secondary truncate">
                    {t(`playerMatch.scoring.components.${key}`)} · {weight}%
                  </span>
                  <span className="text-content-primary shrink-0 font-semibold tabular-nums">
                    {value.toFixed(1)}
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-label={t('playerMatch.scoring.componentScore', {
                    component: t(`playerMatch.scoring.components.${key}`),
                  })}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(value)}
                  className="bg-surface-muted h-2 overflow-hidden rounded-full"
                >
                  <div
                    className="bg-brand-600 h-full rounded-full"
                    style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        {match.reasons.length > 0 && (
          <ul className="space-y-1.5">
            {match.reasons.map((reason) => (
              <li key={reason} className="text-content-secondary flex items-start gap-2 text-xs">
                <CheckCircle2
                  aria-hidden="true"
                  className="mt-0.5 size-3.5 shrink-0 text-emerald-700"
                />
                <span>
                  {t(`playerMatch.scoring.reasons.${reason}`, {
                    defaultValue: t('playerMatch.scoring.reasonFallback'),
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}

        {match.warnings.length > 0 && (
          <ul className="space-y-1.5 rounded-lg border border-amber-200 bg-amber-50 p-3">
            {match.warnings.map((warning) => (
              <li key={warning} className="flex items-start gap-2 text-xs text-amber-900">
                <TriangleAlert aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                <span>
                  {t(`playerMatch.scoring.warnings.${warning}`, {
                    defaultValue: t('playerMatch.scoring.warningFallback'),
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}

        <p className="text-brand-700 border-line flex items-center justify-between gap-2 border-t pt-3 text-sm font-extrabold">
          <span>
            {formatCurrency(match.participationFee)}
            <span className="text-content-secondary ml-1 text-xs font-normal">
              {t('playerMatch.card.perPlayer')}
            </span>
          </span>
          <span className="text-content-secondary text-xs font-medium">
            {t('playerMatch.scoring.scoreExplanation')}
          </span>
        </p>
      </div>

      <div className="border-line mt-5 grid grid-cols-1 gap-2 border-t pt-3 sm:grid-cols-2">
        <Button
          type="button"
          disabled={!canRequestToJoin}
          className="min-h-11 w-full text-xs font-bold"
          onClick={handleJoin}
        >
          {isFull
            ? t('playerMatch.join.full')
            : requestStatus
              ? t('playerMatch.join.submitted')
              : t('playerMatch.join.request')}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="border-line hover:bg-surface-muted hover:text-brand-600 min-h-11 w-full text-xs font-bold"
          onClick={() => navigate(paths.playerMatchingDetail(match.roomId))}
        >
          {t('playerMatch.card.viewDetails')}
        </Button>
      </div>
    </article>
  );
};
