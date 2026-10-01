import { memo } from 'react';
import { useNavigate } from 'react-router';
import { Calendar, Clock, MapPin, Users, Award, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MatchItem } from '../types/player-matching.types';
import dayjs from '@/lib/dayjs';

interface MatchPreviewCardProps {
  match: MatchItem;
  onJoinClick: (match: MatchItem) => void;
}

export const MatchPreviewCard = memo(({ match, onJoinClick }: MatchPreviewCardProps) => {
  const navigate = useNavigate();

  const formattedDate = dayjs(match.date).isValid()
    ? dayjs(match.date).format('DD MMM YYYY')
    : match.date;

  const handleViewDetails = () => {
    navigate(`/player-matching`);
  };

  return (
    <div
      role="article"
      aria-label={`Trận đấu tại ${match.branchName}, host ${match.host.name}`}
      className="group relative flex flex-col justify-between rounded-2xl border border-line bg-surface p-5 shadow-xs transition-all duration-300 hover:border-brand-400 hover:shadow-lg hover:-translate-y-1"
    >
      <div>
        {/* Card Header: Host info & Remaining slots badge */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-line">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <img
                src={match.host.avatar}
                alt={match.host.name}
                className="size-10 rounded-full object-cover ring-2 ring-emerald-500/20"
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
              <p className="truncate text-xs font-bold text-content-primary">
                {match.host.name}
              </p>
              <p className="text-[11px] text-content-secondary">Chủ trận</p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-extrabold text-emerald-700 border border-emerald-200">
            <Users className="size-3 text-emerald-600" />
            Need {match.remainingSlots} More {match.remainingSlots === 1 ? 'Player' : 'Players'}
          </span>
        </div>

        {/* Card Details */}
        <div className="mt-3.5 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-content-primary">
            <MapPin className="size-4 text-brand-600 shrink-0" />
            <span className="truncate">{match.branchName}</span>
          </div>

          <div className="flex items-center gap-4 text-content-secondary">
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3.5 text-content-tertiary shrink-0" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-content-primary">
              <Clock className="size-3.5 text-brand-600 shrink-0" />
              <span>
                {match.startTime} - {match.endTime}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-200">
              <Award className="size-3 text-amber-600" />
              <span>{match.skillLevel}</span>
            </div>

            {match.feePerPlayer ? (
              <span className="text-xs font-bold text-content-primary">
                {match.feePerPlayer.toLocaleString('vi-VN')} đ
                <span className="text-[10px] text-content-secondary font-normal"> / người</span>
              </span>
            ) : null}
          </div>

          <p className="line-clamp-2 text-xs text-content-secondary pt-1 leading-relaxed">
            {match.description}
          </p>
        </div>
      </div>

      {/* Card Actions */}
      <div className="mt-5 grid grid-cols-2 gap-2 pt-3 border-t border-line">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleViewDetails}
          className="rounded-xl border-line text-xs font-semibold hover:bg-surface-muted hover:text-brand-600"
        >
          View Details
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={() => onJoinClick(match)}
          className="rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1"
        >
          <span>Join Match</span>
          <ArrowRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );
});

MatchPreviewCard.displayName = 'MatchPreviewCard';
