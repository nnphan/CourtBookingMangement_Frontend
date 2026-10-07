import { memo, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type QuickActionVariant = 'emerald' | 'blue' | 'featured' | 'default';

export interface QuickActionCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  badge?: string;
  route: string;
  featured?: boolean;
  variant?: QuickActionVariant;
  actionText?: string;
  className?: string;
}

const variantStyles: Record<
  QuickActionVariant,
  {
    container: string;
    glow: string;
    iconBox: string;
    badge: string;
    arrow: string;
    title: string;
    description: string;
    actionText: string;
    defaultActionText: string;
    focusRing: string;
  }
> = {
  emerald: {
    container:
      'bg-gradient-to-br from-emerald-50 via-teal-50/50 to-emerald-100/40 border border-emerald-200/80 text-content-primary shadow-xs hover:from-emerald-100/70 hover:via-teal-50/80 hover:to-emerald-100/60 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-600/10 hover:-translate-y-1',
    glow: 'bg-emerald-400/20 group-hover:bg-emerald-400/30',
    iconBox: 'bg-white text-emerald-700 ring-1 ring-emerald-200/80 shadow-xs',
    badge: 'bg-emerald-200/70 text-emerald-900 ring-1 ring-emerald-300/70',
    arrow: 'bg-white/80 text-emerald-700 shadow-xs group-hover:bg-emerald-600 group-hover:text-white',
    title: 'text-content-primary group-hover:text-emerald-950',
    description: 'text-emerald-950/75',
    actionText: 'text-emerald-700 font-bold group-hover:text-emerald-900',
    defaultActionText: 'Đặt sân ngay →',
    focusRing: 'focus-visible:ring-emerald-500',
  },
  blue: {
    container:
      'bg-gradient-to-br from-blue-50 via-indigo-50/50 to-blue-100/40 border border-blue-200/80 text-content-primary shadow-xs hover:from-blue-100/70 hover:via-indigo-50/80 hover:to-blue-100/60 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-600/10 hover:-translate-y-1',
    glow: 'bg-blue-400/20 group-hover:bg-blue-400/30',
    iconBox: 'bg-white text-blue-700 ring-1 ring-blue-200/80 shadow-xs',
    badge: 'bg-blue-200/70 text-blue-900 ring-1 ring-blue-300/70',
    arrow: 'bg-white/80 text-blue-700 shadow-xs group-hover:bg-blue-600 group-hover:text-white',
    title: 'text-content-primary group-hover:text-blue-950',
    description: 'text-blue-950/75',
    actionText: 'text-blue-700 font-bold group-hover:text-blue-900',
    defaultActionText: 'Xem lịch đặt →',
    focusRing: 'focus-visible:ring-blue-500',
  },
  featured: {
    container:
      'bg-linear-to-br from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-700/20 hover:shadow-xl hover:shadow-emerald-700/30 hover:-translate-y-1',
    glow: 'bg-white/10 group-hover:bg-white/15',
    iconBox: 'bg-white/20 text-white shadow-xs backdrop-blur-xs',
    badge: 'bg-amber-400 text-amber-950 shadow-xs animate-pulse',
    arrow: 'text-white/80 group-hover:text-white group-hover:bg-white/10',
    title: 'text-white',
    description: 'text-emerald-100',
    actionText: 'text-emerald-200 group-hover:text-white',
    defaultActionText: 'Tham gia ngay →',
    focusRing: 'focus-visible:ring-emerald-400',
  },
  default: {
    container:
      'bg-surface border border-line text-content-primary shadow-xs hover:border-brand-300 hover:shadow-md hover:-translate-y-1',
    glow: 'bg-brand-500/5 group-hover:bg-brand-500/10',
    iconBox: 'bg-brand-50 text-brand-700',
    badge: 'bg-brand-100 text-brand-800',
    arrow: 'text-content-secondary group-hover:text-brand-600 group-hover:bg-brand-50',
    title: 'text-content-primary',
    description: 'text-content-secondary',
    actionText: 'text-brand-600 group-hover:text-brand-700',
    defaultActionText: 'Khám phá ngay →',
    focusRing: 'focus-visible:ring-brand-500',
  },
};

export const QuickActionCard = memo(
  ({
    icon,
    title,
    description,
    badge,
    route,
    featured = false,
    variant,
    actionText,
    className,
  }: QuickActionCardProps) => {
    const navigate = useNavigate();

    // Determine variant: explicit variant prop takes priority, otherwise featured fallback
    const resolvedVariant: QuickActionVariant = variant ?? (featured ? 'featured' : 'default');
    const styles = variantStyles[resolvedVariant];

    const handleClick = () => {
      if (route.startsWith('#')) {
        const el = document.querySelector(route);
        el?.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      navigate(route);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    };

    const displayActionText = actionText ?? styles.defaultActionText;

    return (
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={`${title} - ${description}${badge ? ` (${badge})` : ''}`}
        className={cn(
          'group relative flex flex-col justify-between overflow-hidden rounded-2xl p-5 sm:p-6 transition-all duration-300',
          'cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2',
          styles.focusRing,
          styles.container,
          className,
        )}
      >
        {/* Subtle decorative glow */}
        <div
          className={cn(
            'absolute -right-8 -top-8 size-32 rounded-full blur-2xl pointer-events-none transition-colors duration-300',
            styles.glow,
          )}
        />

        <div>
          {/* Card Top: Icon & Badge / External Link Indicator */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div
              className={cn(
                'grid size-12 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-110',
                styles.iconBox,
              )}
            >
              {icon}
            </div>

            <div className="flex items-center gap-2">
              {badge && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold tracking-wide transition-colors',
                    styles.badge,
                  )}
                >
                  <span className="size-1.5 rounded-full bg-current" />
                  {badge}
                </span>
              )}

              <div
                className={cn(
                  'grid size-7 place-items-center rounded-full transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5',
                  styles.arrow,
                )}
              >
                <ArrowUpRight className="size-4" />
              </div>
            </div>
          </div>

          {/* Card Content */}
          <h3 className={cn('text-lg font-black tracking-tight mb-1.5 transition-colors', styles.title)}>
            {title}
          </h3>
          <p className={cn('text-xs sm:text-sm line-clamp-2 leading-relaxed', styles.description)}>
            {description}
          </p>
        </div>

        {/* Bottom accent hint */}
        <div className="mt-5 flex items-center text-xs font-bold gap-1">
          <span className={cn('transition-colors duration-200', styles.actionText)}>
            {displayActionText}
          </span>
        </div>
      </div>
    );
  },
);

QuickActionCard.displayName = 'QuickActionCard';
