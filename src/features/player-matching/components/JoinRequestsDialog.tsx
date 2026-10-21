import { useRef, useState } from 'react';
import { CalendarDays, Clock3, MapPin } from 'lucide-react';
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
import { formatBookingTime } from '@/features/bookings/utils/booking.mapper';
import dayjs from '@/lib/dayjs';
import { toast } from '@/lib/toast';
import type { HostedPlayerMatch, PlayerMatchJoinRequest } from '../types/player-matching.types';
import {
  useApproveJoinRequest,
  usePlayerMatchJoinRequests,
  useRejectJoinRequest,
} from '../hooks/usePlayerMatching';

interface JoinRequestsDialogProps {
  match: HostedPlayerMatch | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RequestCard = ({
  request,
  activeAction,
  error,
  onApprove,
  onReject,
}: {
  request: PlayerMatchJoinRequest;
  activeAction?: 'approve' | 'reject';
  error?: string;
  onApprove: (request: PlayerMatchJoinRequest) => void;
  onReject: (request: PlayerMatchJoinRequest) => void;
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
        <div className="grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            disabled={Boolean(activeAction)}
            aria-busy={activeAction === 'reject'}
            aria-label={t('playerMatch.joinRequests.rejectApplicant', {
              name: request.fullName,
            })}
            onClick={() => onReject(request)}
          >
            {activeAction === 'reject'
              ? t('playerMatch.joinRequests.rejecting')
              : t('playerMatch.joinRequests.reject')}
          </Button>
          <Button
            type="button"
            disabled={Boolean(activeAction)}
            aria-busy={activeAction === 'approve'}
            aria-label={t('playerMatch.joinRequests.approveApplicant', {
              name: request.fullName,
            })}
            onClick={() => onApprove(request)}
          >
            {activeAction === 'approve'
              ? t('playerMatch.joinRequests.approving')
              : t('playerMatch.joinRequests.approve')}
          </Button>
        </div>
      </div>
      {error && (
        <p role="alert" className="text-danger mt-3 text-sm">
          {error}
        </p>
      )}
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
}: JoinRequestsDialogProps) => {
  const { t } = useTranslation();
  const query = usePlayerMatchJoinRequests(match?.id, 'PENDING', open);
  const approveMutation = useApproveJoinRequest();
  const rejectMutation = useRejectJoinRequest();
  const [activeActions, setActiveActions] = useState<Record<string, 'approve' | 'reject'>>({});
  const activeRequestIds = useRef(new Set<string>());
  const requestListRef = useRef<HTMLElement>(null);
  const focusListOnRejectClose = useRef(false);
  const [actionErrors, setActionErrors] = useState<Record<string, string>>({});
  const [rejectRequest, setRejectRequest] = useState<PlayerMatchJoinRequest | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const date = match ? dayjs(match.matchDate) : null;
  const isProcessing = Object.keys(activeActions).length > 0;

  const processAction = async (
    action: 'approve' | 'reject',
    request: PlayerMatchJoinRequest,
  ) => {
    if (!match || activeRequestIds.current.has(request.requestId)) return false;

    activeRequestIds.current.add(request.requestId);
    setActiveActions((current) => ({ ...current, [request.requestId]: action }));
    setActionErrors((current) => {
      const next = { ...current };
      delete next[request.requestId];
      return next;
    });

    try {
      const variables = {
        matchId: match.id,
        requestId: request.requestId,
        fullName: request.fullName,
      };
      if (action === 'approve') {
        await approveMutation.mutateAsync(variables);
      } else {
        await rejectMutation.mutateAsync(variables);
      }

      toast.success(
        t(`playerMatch.joinRequests.${action}Success`),
        t(`playerMatch.joinRequests.${action}SuccessDescription`, {
          fullName: request.fullName,
        }),
      );
      if (action === 'approve') {
        window.requestAnimationFrame(() => requestListRef.current?.focus());
      }
      return true;
    } catch (error) {
      const status =
        typeof error === 'object' && error !== null && 'status' in error
          ? error.status
          : undefined;
      const serverMessage =
        typeof error === 'object' && error !== null && 'message' in error
          ? error.message
          : undefined;
      const message =
        status === 403
          ? t('playerMatch.joinRequests.forbidden')
          : status === 404 || status === 409
            ? typeof serverMessage === 'string' && serverMessage !== 'error.network'
              ? serverMessage
              : t('playerMatch.joinRequests.requestChanged')
            : typeof serverMessage === 'string' && serverMessage !== 'error.network'
              ? serverMessage
              : t('playerMatch.joinRequests.processFailed');

      setActionErrors((current) => ({ ...current, [request.requestId]: message }));
      toast.error(t('playerMatch.joinRequests.processErrorTitle'), message);
      return false;
    } finally {
      activeRequestIds.current.delete(request.requestId);
      setActiveActions((current) => {
        const next = { ...current };
        delete next[request.requestId];
        return next;
      });
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectRequest) return;
    const succeeded = await processAction('reject', rejectRequest);
    if (succeeded) {
      focusListOnRejectClose.current = true;
      setRejectDialogOpen(false);
      setRejectRequest(null);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && isProcessing) return;
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent
        className="border-line bg-surface text-content-primary max-h-[90dvh] w-[calc(100%-1rem)] max-w-2xl overflow-hidden p-4 sm:p-6"
        closeDisabled={isProcessing}
        onEscapeKeyDown={(event) => {
          if (isProcessing) event.preventDefault();
        }}
        onPointerDownOutside={(event) => {
          if (isProcessing) event.preventDefault();
        }}
      >
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
        <section
          ref={requestListRef}
          tabIndex={-1}
          className="min-h-0 space-y-3 overflow-y-auto outline-none"
          aria-live="polite"
        >
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
                {t('playerMatch.joinRequests.noPending')}
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
                  activeAction={activeActions[request.requestId]}
                  error={actionErrors[request.requestId]}
                  onApprove={(selectedRequest) => {
                    void processAction('approve', selectedRequest);
                  }}
                  onReject={(selectedRequest) => {
                    setRejectRequest(selectedRequest);
                    setRejectDialogOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </DialogContent>
      <Dialog
        open={rejectDialogOpen}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && rejectRequest && activeActions[rejectRequest.requestId] === 'reject') {
            return;
          }
          setRejectDialogOpen(nextOpen);
          if (!nextOpen) setRejectRequest(null);
        }}
      >
        <DialogContent
          className="border-line bg-surface text-content-primary w-[calc(100%-1rem)] max-w-md"
          closeDisabled={
            Boolean(rejectRequest && activeActions[rejectRequest.requestId] === 'reject')
          }
          onEscapeKeyDown={(event) => {
            if (rejectRequest && activeActions[rejectRequest.requestId] === 'reject') {
              event.preventDefault();
            }
          }}
          onPointerDownOutside={(event) => {
            if (rejectRequest && activeActions[rejectRequest.requestId] === 'reject') {
              event.preventDefault();
            }
          }}
          onCloseAutoFocus={(event) => {
            if (focusListOnRejectClose.current) {
              event.preventDefault();
              focusListOnRejectClose.current = false;
              requestListRef.current?.focus();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>{t('playerMatch.joinRequests.rejectConfirmTitle')}</DialogTitle>
            <DialogDescription>
              {t('playerMatch.joinRequests.rejectConfirmDescription', {
                fullName: rejectRequest?.fullName ?? '',
              })}
            </DialogDescription>
          </DialogHeader>
          {rejectRequest && actionErrors[rejectRequest.requestId] && (
            <p role="alert" className="text-danger text-sm">
              {actionErrors[rejectRequest.requestId]}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={
                Boolean(rejectRequest && activeActions[rejectRequest.requestId] === 'reject')
              }
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectRequest(null);
              }}
            >
              {t('playerMatch.joinRequests.cancel')}
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={
                Boolean(rejectRequest && activeActions[rejectRequest.requestId] === 'reject')
              }
              aria-busy={
                Boolean(rejectRequest && activeActions[rejectRequest.requestId] === 'reject')
              }
              onClick={() => void handleConfirmReject()}
            >
              {rejectRequest && activeActions[rejectRequest.requestId] === 'reject'
                ? t('playerMatch.joinRequests.rejecting')
                : t('playerMatch.joinRequests.reject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};
