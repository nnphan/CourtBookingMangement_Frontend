interface CurrentUserMenuSkeletonProps {
  variant?: 'contrast' | 'surface';
  label: string;
}

export const CurrentUserMenuSkeleton = ({
  variant = 'contrast',
  label,
}: CurrentUserMenuSkeletonProps) => {
  const blockClass = variant === 'surface' ? 'bg-slate-200' : 'bg-white/25';

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className="flex h-11 items-center gap-2 rounded-full px-1.5"
    >
      <span className={`size-9 animate-pulse rounded-full ${blockClass}`} />
      <span className="hidden flex-col gap-1 sm:flex">
        <span className={`h-3 w-24 animate-pulse rounded ${blockClass}`} />
        <span className={`h-2.5 w-16 animate-pulse rounded ${blockClass}`} />
      </span>
    </div>
  );
};
