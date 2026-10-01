export const MatchCardSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <div
      role="status"
      aria-label="Loading available badminton matches..."
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-5 shadow-xs animate-pulse space-y-4"
        >
          {/* Header Skeleton */}
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-full bg-surface-muted" />
              <div className="space-y-1.5">
                <div className="h-4 w-28 rounded-md bg-surface-muted" />
                <div className="h-3 w-16 rounded-md bg-surface-muted" />
              </div>
            </div>
            <div className="h-6 w-16 rounded-full bg-surface-muted" />
          </div>

          {/* Body Skeleton */}
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="h-5 w-3/4 rounded-md bg-surface-muted" />
              <div className="h-3 w-1/3 rounded-md bg-surface-muted" />
            </div>

            <div className="h-10 w-full rounded-xl bg-surface-muted" />

            <div className="flex items-center justify-between pt-1">
              <div className="h-6 w-24 rounded-lg bg-surface-muted" />
              <div className="h-4 w-28 rounded-md bg-surface-muted" />
            </div>

            <div className="h-4 w-1/2 rounded-md bg-surface-muted" />
            <div className="h-8 w-full rounded-md bg-surface-muted" />
          </div>

          {/* Footer Actions Skeleton */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-line">
            <div className="h-9 rounded-xl bg-surface-muted" />
            <div className="h-9 rounded-xl bg-surface-muted" />
          </div>
        </div>
      ))}
    </div>
  );
};
