import { CalendarDays, Clock3, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatBookingTime } from '@/features/bookings/utils/booking.mapper';
import dayjs from '@/lib/dayjs';
import type { HostedPlayerMatch, PlayerMatchJoinRequest } from '../types/player-matching.types';
import { usePlayerMatchJoinRequests } from '../hooks/usePlayerMatching';

interface JoinRequestsDialogProps {
  match: HostedPlayerMatch | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove?: (request: PlayerMatchJoinRequest) => void;
  onReject?: (request: PlayerMatchJoinRequest) => void;
}

const RequestCard = ({
  request,
  onApprove,
  onReject,
}: {
  request: PlayerMatchJoinRequest;
  onApprove?: (request: PlayerMatchJoinRequest) => void;
  onReject?: (request: PlayerMatchJoinRequest) => void;
}) => {
  const { t, i18n } = useTranslation();
  const requestedAt = dayjs(request.requestedAt);
  const skillLabel = request.skillLevel
    ? t(`playerMatch.skill.${request.skillLevel.toLowerCase()}`, {
        defaultValue: request.skillLevel,
      })
    : null;

  return (
    <article className="border-line bg-surface rounded-xl border p-4">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-content-primary truncate font-semibold">{request.fullName}</h3>
          {skillLabel && <p className="text-content-secondary mt-1 text-sm">{skillLabel}</p>}
          <p className="text-content-secondary mt-1 text-xs">
            {t('playerMatch.joinRequests.requestedAt', {
              date: requestedAt.isValid()
                ? requestedAt
                    .locale(i18n.language.startsWith('vi') ? 'vi' : 'en')
                    .fromNow()
                : request.requestedAt,
            })}
          </p>
        </div>
        {(onReject || onApprove) && (
          <div className="grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-2">
            {onReject && (
              <Button
                type="button"
                variant="outline"
                aria-label={t('playerMatch.joinRequests.rejectApplicant', {
                  name: request.fullName,
                })}
                onClick={() => onReject(request)}
              >
                {t('playerMatch.joinRequests.reject')}
              </Button>
            )}
            {onApprove && (
              <Button
                type="button"
                aria-label={t('playerMatch.joinRequests.approveApplicant', {
                  name: request.fullName,
                })}
                onClick={() => onApprove(request)}
              >
                {t('playerMatch.joinRequests.approve')}
              </Button>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

const RequestCardSkeleton = () => (
  <div
    aria-hidden="true"
    className="border-line animate-pulse space-y-3 rounded-xl border p-4"
  >
    <div className="bg-surface-muted h-5 w-2/5 rounded" />
    <div className="bg-surface-muted h-4 w-1/4 rounded" />
    <div className="bg-surface-muted h-4 w-1/3 rounded" />
  </div>
);

export const JoinRequestsDialog = ({
  match,
  open,
  onOpenChange,
  onApprove,
  onReject,
}: JoinRequestsDialogProps) => {
  const { t } = useTranslation();
  const query = usePlayerMatchJoinRequests(match?.id, 'PENDING', open);
  const date = match ? dayjs(match.matchDate) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-line bg-surface text-content-primary max-h-[90dvh] w-[calc(100%-1rem)] max-w-2xl overflow-hidden p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>{t('playerMatch.joinRequests.title')}</DialogTitle>
          <DialogDescription>{t('playerMatch.joinRequests.description')}</DialogDescription>
        </DialogHeader>
        {match && (
          <section className="border-line space-y-2 border-b pb-4" aria-label={match.title}>
            <h2 className="text-content-primary font-semibold">{match.title}</h2>
            <p className="text-content-secondary flex items-center gap-2 text-sm">
              <MapPin aria-hidden="true" className="size-4 shrink-0" />
              <span>
                {match.branchName}
                {match.courtName ? ` · ${match.courtName}` : ''}
              </span>
            </p>
            <p className="text-content-secondary flex items-center gap-2 text-sm">
              <CalendarDays aria-hidden="true" className="size-4 shrink-0" />
              <span>
                {date?.isValid() ? date.format('DD/MM/YYYY') : match.matchDate}
                {' · '}
                <Clock3 aria-hidden="true" className="mr-1 inline size-4 align-text-bottom" />
                {formatBookingTime(match.startTime)} - {formatBookingTime(match.endTime)}
              </span>
            </p>
          </section>
        )}
        <section className="min-h-0 space-y-3 overflow-y-auto" aria-live="polite">
          <h2 className="text-content-primary text-sm font-bold">
            {t('playerMatch.joinRequests.pending')}
          </h2>
          {query.isLoading ? (
            <div role="status" aria-label={t('playerMatch.joinRequests.loading')} className="space-y-3">
              <RequestCardSkeleton />
              <RequestCardSkeleton />
            </div>
          ) : query.isError ? (
            <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4 text-center">
              <p role="alert" className="text-danger text-sm font-semibold">
                {t('playerMatch.joinRequests.loadError')}
              </p>
              <Button type="button" variant="outline" onClick={() => void query.refetch()}>
                {t('playerMatch.joinRequests.retry')}
              </Button>
            </div>
          ) : query.data?.length === 0 ? (
            <div className="border-line rounded-xl border p-6 text-center">
              <p className="text-content-primary font-semibold">
                {t('playerMatch.joinRequests.emptyTitle')}
              </p>
              <p className="text-content-secondary mt-1 text-sm">
                {t('playerMatch.joinRequests.emptyDescription')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {query.data?.map((request) => (
                <RequestCard
                  key={request.requestId}
                  request={request}
                  onApprove={onApprove}
                  onReject={onReject}
                />
              ))}
            </div>
          )}
        </section>
      </DialogContent>
    </Dialog>
  );
};
