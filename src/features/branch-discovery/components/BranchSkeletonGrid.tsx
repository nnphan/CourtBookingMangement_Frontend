export const BranchSkeletonGrid = ({ count = 6 }: { count?: number }) => {
  return (
    <div
      role="status"
      aria-label="Đang tải danh sách câu lạc bộ cầu lông..."
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-xs animate-pulse"
        >
          {/* Photo box skeleton */}
          <div className="aspect-16/10 w-full bg-surface-muted" />

          {/* Body skeleton */}
          <div className="flex flex-1 flex-col p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 rounded-md bg-surface-muted" />
              <div className="h-4 w-12 rounded-md bg-surface-muted" />
            </div>

            <div className="h-5 w-3/4 rounded-md bg-surface-muted" />
            <div className="h-3 w-full rounded-md bg-surface-muted" />

            <div className="h-8 w-full rounded-lg bg-surface-muted" />

            <div className="flex gap-2 pt-2">
              <div className="h-5 w-20 rounded-md bg-surface-muted" />
              <div className="h-5 w-24 rounded-md bg-surface-muted" />
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
              <div className="h-5 w-28 rounded-md bg-surface-muted" />
              <div className="h-8 w-20 rounded-xl bg-surface-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
