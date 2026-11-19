import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, Flame, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFeaturedMatches } from '../hooks/usePlayerMatching';
import { MatchPreviewCard } from './MatchPreviewCard';
import { JoinMatchDialog } from './JoinMatchDialog';
import type { MatchItem } from '../types/player-matching.types';
import { paths } from '@/app/router/paths';

export const LookingForPlayersSection = () => {
  const navigate = useNavigate();
  const { data: response, isLoading } = useFeaturedMatches();
  const [selectedMatchForJoin, setSelectedMatchForJoin] = useState<MatchItem | null>(null);

  const matches = response?.success ? response.data : [];

  const handleCreateMatch = () => {
    // Navigate to branches / court selection to reserve and create match
    navigate(paths.root);
  };

  const handleViewAll = () => {
    navigate(paths.playerMatching ?? '/player-matching');
  };

  return (
    <section
      aria-label="Looking For Players"
      className="w-full rounded-3xl border border-line bg-surface p-6 sm:p-8 shadow-xs"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700 mb-2 border border-orange-200">
            <Flame className="size-3.5 fill-orange-500 text-orange-500" />
            <span>Ghép Trận Cầu Lông Sôi Động</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-content-primary tracking-tight">
            🔥 Looking For Players
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-content-secondary">
            Join active matches from nearby players
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleViewAll}
          className="rounded-xl border-line font-bold text-xs hover:border-brand-500 hover:text-brand-600 sm:self-auto self-start flex items-center gap-1.5"
        >
          <span>View All Matches</span>
          <ArrowRight className="size-4" />
        </Button>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 rounded-2xl border border-line bg-surface-muted/50 p-5 animate-pulse flex flex-col justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-surface-muted" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-28 bg-surface-muted rounded-md" />
                  <div className="h-3 w-16 bg-surface-muted rounded-md" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-3/4 bg-surface-muted rounded-md" />
                <div className="h-3 w-1/2 bg-surface-muted rounded-md" />
              </div>
              <div className="h-9 w-full bg-surface-muted rounded-xl" />
            </div>
          ))}
        </div>
      ) : matches.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface-muted/30 py-12 px-4 text-center">
          <div className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-2xl mb-3">
            🏸
          </div>
          <h3 className="text-base font-bold text-content-primary">
            No active matches available
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-content-secondary max-w-sm">
            Be the first player to create a match request.
          </p>
          <Button
            type="button"
            onClick={handleCreateMatch}
            className="mt-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-2"
          >
            <PlusCircle className="size-4" />
            <span>Create Match</span>
          </Button>
        </div>
      ) : (
        /* Matches Grid */
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => (
            <MatchPreviewCard
              key={match.id}
              match={match}
              onJoinClick={setSelectedMatchForJoin}
            />
          ))}
        </div>
      )}

      {/* Join Match Dialog */}
      <JoinMatchDialog
        match={selectedMatchForJoin}
        isOpen={Boolean(selectedMatchForJoin)}
        onClose={() => setSelectedMatchForJoin(null)}
      />
    </section>
  );
};
