import { Link } from 'react-router';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  icon: LucideIcon;
  gradientClass: string;
  to?: string;
  onClick?: () => void;
}

export const DashboardCard = ({ title, icon: Icon, gradientClass, to, onClick }: DashboardCardProps) => {
  const content = (
    <>
      <div className="relative z-10 flex flex-col gap-2">
        <Icon className="size-6 text-white" strokeWidth={2.5} />
        <h3 className="mt-2 text-sm font-bold text-white leading-tight sm:text-base">{title}</h3>
      </div>
      
      {/* Watermark Icon */}
      <Icon
        className="absolute -right-2 top-1/2 size-24 -translate-y-1/2 text-white/20 sm:size-28 sm:-right-4"
        strokeWidth={2}
        aria-hidden="true"
      />
    </>
  );

  const wrapperClass = cn(
    'relative overflow-hidden rounded-[var(--radius-card)] p-4 sm:p-5 shadow-[var(--shadow-card)] transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus active:scale-95 text-left',
    gradientClass
  );

  if (to) {
    return (
      <Link to={to} className={wrapperClass}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={wrapperClass}>
      {content}
    </button>
  );
};
