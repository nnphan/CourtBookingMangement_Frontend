import { memo, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QuickActionCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  badge?: string;
  route: string;
  featured?: boolean;
  className?: string;
}

export const QuickActionCard = memo(
  ({ icon, title, description, badge, route, featured = false, className }: QuickActionCardProps) => {
    const navigate = useNavigate();

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

    return (
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={`${title} - ${description}${badge ? ` (${badge})` : ''}`}
        className={cn(
          'group relative flex flex-col justify-between overflow-hidden rounded-2xl p-5 sm:p-6 transition-all duration-300',
          'cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
          featured
            ? 'bg-linear-to-br from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-700/20 hover:shadow-xl hover:shadow-emerald-700/30 hover:-translate-y-1'
            : 'bg-surface border border-line text-content-primary shadow-xs hover:border-brand-300 hover:shadow-md hover:-translate-y-1',
          className,
        )}
      >
        {/* Subtle decorative glow for featured card */}
        {featured && (
          <div className="absolute -right-8 -top-8 size-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        )}

        <div>
          {/* Card Top: Icon & Badge / External Link Indicator */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div
              className={cn(
                'grid size-12 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-110',
                featured
                  ? 'bg-white/20 text-white shadow-xs backdrop-blur-xs'
                  : 'bg-brand-50 text-brand-700',
              )}
            >
              {icon}
            </div>

            <div className="flex items-center gap-2">
              {badge && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold tracking-wide transition-colors',
                    featured
                      ? 'bg-amber-400 text-amber-950 shadow-xs animate-pulse'
                      : 'bg-brand-100 text-brand-800',
                  )}
                >
                  <span className="size-1.5 rounded-full bg-current" />
                  {badge}
                </span>
              )}

              <div
                className={cn(
                  'grid size-7 place-items-center rounded-full transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5',
                  featured
                    ? 'text-white/80 group-hover:text-white'
                    : 'text-content-secondary group-hover:text-brand-600',
                )}
              >
                <ArrowUpRight className="size-4" />
              </div>
            </div>
          </div>

          {/* Card Content */}
          <h3
            className={cn(
              'text-lg font-black tracking-tight mb-1.5',
              featured ? 'text-white' : 'text-content-primary',
            )}
          >
            {title}
          </h3>
          <p
            className={cn(
              'text-xs sm:text-sm line-clamp-2 leading-relaxed',
              featured ? 'text-emerald-100' : 'text-content-secondary',
            )}
          >
            {description}
          </p>
        </div>

        {/* Bottom accent hint */}
        <div className="mt-5 flex items-center text-xs font-bold gap-1">
          <span
            className={cn(
              'transition-colors duration-200',
              featured ? 'text-emerald-200 group-hover:text-white' : 'text-brand-600 group-hover:text-brand-700',
            )}
          >
            Khám phá ngay →
          </span>
        </div>
      </div>
    );
  },
);

QuickActionCard.displayName = 'QuickActionCard';
