import { memo } from 'react';
import { useNavigate } from 'react-router';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  ShieldCheck,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MatchItem, MatchStatus } from '../types/player-matching.types';
import dayjs from '@/lib/dayjs';
import { cn } from '@/lib/utils';

export interface MatchCardProps {
  match: MatchItem;
  onJoinClick: (match: MatchItem) => void;
  onViewDetails?: (match: MatchItem) => void;
}

const statusConfig: Record<
  MatchStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  OPEN: {
    label: 'OPEN',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  FULL: {
    label: 'FULL',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    dotClass: 'bg-blue-500',
  },
  CANCELLED: {
    label: 'CANCELLED',
    badgeClass: 'bg-red-50 text-red-700 border-red-200',
    dotClass: 'bg-red-500',
  },
  EXPIRED: {
    label: 'EXPIRED',
    badgeClass: 'bg-gray-100 text-gray-700 border-gray-300',
    dotClass: 'bg-gray-400',
  },
};

export const MatchCard = memo(({ match, onJoinClick, onViewDetails }: MatchCardProps) => {
  const navigate = useNavigate();

  const formattedDate = dayjs(match.date).isValid()
    ? dayjs(match.date).format('DD MMM YYYY')
    : match.date;

  const statusInfo = statusConfig[match.status] ?? statusConfig.OPEN;
  const isJoinable = match.status === 'OPEN' && match.remainingSlots > 0;

  const handleDetailsClick = () => {
    if (onViewDetails) {
      onViewDetails(match);
      return;
    }
    navigate(`/player-matching/${match.id}`);
  };

  return (
    <article
      aria-label={`Match at ${match.branchName} hosted by ${match.host.name}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface p-5 shadow-xs transition-all duration-300 hover:border-brand-300 hover:shadow-lg hover:-translate-y-1"
    >
      <div>
        {/* Header: Host Avatar, Host Name & Status Badge */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-line">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <img
                src={match.host.avatar}
                alt={match.host.name}
                className="size-11 rounded-full object-cover ring-2 ring-emerald-500/20"
                loading="lazy"
              />
              <span
                title="Verified Host"
                aria-label="Verified Host"
                className="absolute -bottom-1 -right-1 grid size-4 place-items-center rounded-full bg-emerald-600 text-white shadow-xs"
              >
                <ShieldCheck className="size-2.5" />
              </span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-content-primary">
                {match.host.name}
              </p>
              <p className="text-xs text-content-secondary">Host</p>
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold border tracking-wide',
              statusInfo.badgeClass,
            )}
          >
            <span className={cn('size-1.5 rounded-full', statusInfo.dotClass)} />
            {statusInfo.label}
          </span>
        </div>

        {/* Body */}
        <div className="mt-4 space-y-3">
          {/* Branch & Court */}
          <div>
            <div className="flex items-center gap-2 text-content-primary font-black text-base">
              <MapPin className="size-4 text-brand-600 shrink-0" />
              <span className="truncate">{match.branchName}</span>
            </div>
            <div className="ml-6 text-xs font-semibold text-content-secondary">
              {match.courtName}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-surface-muted/60 p-2.5 rounded-xl border border-line">
            <div className="flex items-center gap-2 text-content-secondary">
              <Calendar className="size-3.5 text-content-tertiary shrink-0" />
              <span className="font-medium text-content-primary">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2 text-content-secondary">
              <Clock className="size-3.5 text-brand-600 shrink-0" />
              <span className="font-bold text-content-primary">
                {match.startTime} - {match.endTime}
              </span>
            </div>
          </div>

          {/* Skill Level & Player Count */}
          <div className="flex items-center justify-between text-xs pt-1">
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-200">
              <Award className="size-3.5 text-amber-600" />
              <span>{match.skillLevel}</span>
            </div>

            <div className="flex items-center gap-1.5 text-content-secondary font-medium">
              <Users className="size-3.5 text-brand-600" />
              <span className="font-bold text-content-primary">
                {match.currentPlayers} / {match.requiredPlayers} Players
              </span>
            </div>
          </div>

          {/* Remaining Slots */}
          <div className="flex items-center justify-between text-xs">
            <span
              className={cn(
                'font-extrabold',
                match.remainingSlots > 0 ? 'text-emerald-700' : 'text-content-tertiary',
              )}
            >
              {match.remainingSlots > 0
                ? `Need ${match.remainingSlots} More ${match.remainingSlots === 1 ? 'Player' : 'Players'}`
                : 'Đã đủ thành viên'}
            </span>

            {match.feePerPlayer ? (
              <span className="font-extrabold text-brand-700">
                {match.feePerPlayer.toLocaleString('vi-VN')} đ
                <span className="text-[10px] text-content-secondary font-normal"> / người</span>
              </span>
            ) : null}
          </div>

          {/* Description Preview */}
          <p className="line-clamp-2 text-xs text-content-secondary pt-1 leading-relaxed border-t border-line">
            {match.description}
          </p>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="mt-5 grid grid-cols-2 gap-2 pt-3 border-t border-line">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDetailsClick}
          className="rounded-xl border-line text-xs font-bold hover:bg-surface-muted hover:text-brand-600 flex items-center justify-center gap-1.5"
        >
          <Info className="size-3.5" />
          <span>View Details</span>
        </Button>

        <Button
          type="button"
          size="sm"
          disabled={!isJoinable}
          onClick={() => onJoinClick(match)}
          className={cn(
            'rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5',
            isJoinable
              ? 'bg-brand-600 hover:bg-brand-700 text-white hover:shadow-md'
              : 'bg-surface-muted text-content-tertiary cursor-not-allowed border border-line',
          )}
        >
          <span>Join Match</span>
          <ArrowRight className="size-3.5" />
        </Button>
      </div>
    </article>
  );
});

MatchCard.displayName = 'MatchCard';
