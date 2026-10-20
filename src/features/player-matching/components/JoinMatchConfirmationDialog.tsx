import { Banknote, CalendarDays, Clock3, Loader2, MapPin, UsersRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  formatBookingDate,
  formatBookingTime,
  formatCurrency,
} from '@/features/bookings/utils/booking.mapper';
import type { PlayerMatchListItem } from '../types/player-matching.types';

interface JoinMatchConfirmationDialogProps {
  match: PlayerMatchListItem | null;
  open: boolean;
  isPending: boolean;
  errorMessage?: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

export const JoinMatchConfirmationDialog = ({
  match,
  open,
  isPending,
  errorMessage,
  onOpenChange,
  onConfirm,
}: JoinMatchConfirmationDialogProps) => {
  const { t } = useTranslation();

  if (!match) return null;

  const skillLabel = t(`playerMatch.skill.${match.skillLevel.toLowerCase()}`, {
    defaultValue: match.skillLevel,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto border-line bg-surface sm:w-full"
        onEscapeKeyDown={(event) => {
          if (isPending) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          if (isPending) event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-content-primary">
            {t('playerMatch.join.confirmTitle')}
          </DialogTitle>
          <DialogDescription>{t('playerMatch.join.confirmDescription')}</DialogDescription>
        </DialogHeader>

        <div className="border-line bg-surface-muted/60 space-y-3 rounded-xl border p-4">
          <h3 className="text-content-primary font-bold">{match.title}</h3>
          <div className="text-content-secondary flex items-start gap-2 text-sm">
            <MapPin aria-hidden="true" className="text-brand-600 mt-0.5 size-4 shrink-0" />
            <span>
              {match.branchName}
              {match.courtName ? ` · ${match.courtName}` : ''}
            </span>
          </div>
          <div className="text-content-secondary flex items-center gap-2 text-sm">
            <CalendarDays aria-hidden="true" className="text-brand-600 size-4 shrink-0" />
            <span>{formatBookingDate(match.matchDate)}</span>
          </div>
          <div className="text-content-secondary flex items-center gap-2 text-sm">
            <Clock3 aria-hidden="true" className="text-brand-600 size-4 shrink-0" />
            <span>
              {formatBookingTime(match.startTime)} - {formatBookingTime(match.endTime)}
            </span>
          </div>
          <div className="text-content-secondary flex items-center gap-2 text-sm">
            <UsersRound aria-hidden="true" className="text-brand-600 size-4 shrink-0" />
            <span>
              {skillLabel} · {match.currentPlayers}/{match.maxPlayers}{' '}
              {t('playerMatch.card.players')}
            </span>
          </div>
          <div className="text-content-secondary flex items-center gap-2 text-sm">
            <Banknote aria-hidden="true" className="text-brand-600 size-4 shrink-0" />
            <span>
              {formatCurrency(match.feePerPlayer)} {t('playerMatch.card.perPlayer')}
            </span>
          </div>
        </div>

        <p className="text-content-primary text-sm">
          {t('playerMatch.join.confirmDescriptionSecondary')}
        </p>

        {errorMessage && (
          <p role="alert" className="text-danger text-sm">
            {errorMessage}
          </p>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            {t('playerMatch.join.cancel')}
          </Button>
          <Button
            type="button"
            disabled={isPending}
            aria-busy={isPending}
            onClick={() => void onConfirm()}
          >
            {isPending && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
            {isPending ? t('playerMatch.join.sending') : t('playerMatch.join.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
