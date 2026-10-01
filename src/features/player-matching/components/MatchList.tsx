import { useEffect, useRef, useState } from 'react';
import { MatchCard } from './MatchCard';
import { MatchCardSkeleton } from './MatchCardSkeleton';
import { JoinMatchDialog } from './JoinMatchDialog';
import { Button } from '@/components/ui/button';
import { RotateCcw, Loader2 } from 'lucide-react';
import type { MatchItem } from '../types/player-matching.types';
import { useMatches } from '../hooks/usePlayerMatching';
import { usePlayerMatchingFilterStore } from '../store/player-matching-filter.store';

export const MatchList = () => {
  const { search, date, branchId, skillLevel, gender, availableSlots, resetFilters } =
    usePlayerMatchingFilterStore();

  const [selectedMatchForJoin, setSelectedMatchForJoin] = useState<MatchItem | null>(null);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useMatches({
    search: search.trim() || undefined,
    matchDate: date,
    branchId: branchId && branchId !== 'all' ? branchId : undefined,
    skillLevel: skillLevel && skillLevel !== 'All' ? skillLevel : undefined,
    gender: gender && gender !== 'All' ? gender : undefined,
    availableSlots: availableSlots && availableSlots > 0 ? availableSlots : undefined,
    pageSize: 6,
  });

  // Flatten matches from all pages
  const allMatches: MatchItem[] =
    data?.pages.flatMap((page) => (page.success ? page.data : [])) ?? [];

  const totalCount = data?.pages[0]?.metadata?.totalCount ?? allMatches.length;

  // Infinite scroll observer sentinel
  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!observerRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: '100px' },
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-40 rounded-md bg-surface-muted animate-pulse" />
        <MatchCardSkeleton count={6} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center space-y-3">
        <p className="text-sm font-bold text-danger">
          Không thể tải danh sách trận đấu. Vui lòng kiểm tra lại kết nối.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="rounded-xl border-red-300 text-danger"
        >
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Result Summary */}
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-black text-content-primary">
          Showing {totalCount} {totalCount === 1 ? 'Match' : 'Matches'}
        </h2>
        <span className="text-xs text-content-secondary hidden sm:inline">
          Cập nhật tình trạng ghép cặp theo thời gian thực
        </span>
      </div>

      {/* Empty State */}
      {allMatches.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-surface p-12 text-center">
          <div className="grid size-16 place-items-center rounded-2xl bg-brand-50 text-3xl mb-4">
            🏸
          </div>
          <h3 className="text-lg font-black text-content-primary">No Matches Found</h3>
          <p className="mt-1 text-sm text-content-secondary max-w-sm">
            Try adjusting your filters.
          </p>
          <Button
            type="button"
            onClick={resetFilters}
            className="mt-5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-2"
          >
            <RotateCcw className="size-3.5" />
            <span>Clear Filters</span>
          </Button>
        </div>
      ) : (
        /* Match Grid */
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {allMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onJoinClick={setSelectedMatchForJoin}
            />
          ))}
        </div>
      )}

      {/* Infinite Scroll Sentinel & Fallback Load More Button */}
      {hasNextPage && (
        <div className="flex flex-col items-center justify-center py-6 gap-3">
          <div ref={observerRef} className="h-4 w-full" />
          <Button
            variant="outline"
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
            className="rounded-xl border-line font-bold text-xs hover:border-brand-500 hover:text-brand-600 px-6 py-2"
          >
            {isFetchingNextPage ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin text-brand-600" />
                <span>Đang tải thêm...</span>
              </span>
            ) : (
              'Load More Matches'
            )}
          </Button>
        </div>
      )}

      {/* Join Match Dialog */}
      <JoinMatchDialog
        match={selectedMatchForJoin}
        isOpen={Boolean(selectedMatchForJoin)}
        onClose={() => setSelectedMatchForJoin(null)}
      />
    </div>
  );
};
