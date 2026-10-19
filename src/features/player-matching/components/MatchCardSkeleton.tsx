import { useTranslation } from 'react-i18next';

export const MatchCardSkeleton = ({ count = 6 }: { count?: number }) => {
  const { t } = useTranslation();
  return (
    <div
      role="status"
      aria-label={t('playerMatch.discovery.loading')}
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="border-line bg-surface flex animate-pulse flex-col justify-between space-y-4 rounded-2xl border p-5 shadow-xs"
        >
          {/* Header Skeleton */}
          <div className="border-line flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-3">
              <div className="bg-surface-muted size-11 rounded-full" />
              <div className="space-y-1.5">
                <div className="bg-surface-muted h-4 w-28 rounded-md" />
                <div className="bg-surface-muted h-3 w-16 rounded-md" />
              </div>
            </div>
            <div className="bg-surface-muted h-6 w-16 rounded-full" />
          </div>

          {/* Body Skeleton */}
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="bg-surface-muted h-5 w-3/4 rounded-md" />
              <div className="bg-surface-muted h-3 w-1/3 rounded-md" />
            </div>

            <div className="bg-surface-muted h-10 w-full rounded-xl" />

            <div className="flex items-center justify-between pt-1">
              <div className="bg-surface-muted h-6 w-24 rounded-lg" />
              <div className="bg-surface-muted h-4 w-28 rounded-md" />
            </div>

            <div className="bg-surface-muted h-4 w-1/2 rounded-md" />
            <div className="bg-surface-muted h-8 w-full rounded-md" />
          </div>

          {/* Footer Actions Skeleton */}
          <div className="border-line grid grid-cols-2 gap-2 border-t pt-3">
            <div className="bg-surface-muted h-9 rounded-xl" />
            <div className="bg-surface-muted h-9 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
};
