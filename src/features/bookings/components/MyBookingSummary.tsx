import type { LucideIcon } from 'lucide-react';
import { BadgeCheck, CalendarClock, CheckCircle2, XCircle } from 'lucide-react';

type SummaryTone = 'brand' | 'blue' | 'green' | 'red';

export interface MyBookingSummaryItem {
  label: string;
  count: number;
  icon: LucideIcon;
  tone: SummaryTone;
}

const toneClasses: Record<SummaryTone, string> = {
  brand: 'border-brand-300 bg-brand-50/60 text-brand-700',
  blue: 'border-blue-300 bg-blue-50/60 text-blue-700',
  green: 'border-green-300 bg-green-50/60 text-green-700',
  red: 'border-red-300 bg-red-50/60 text-red-700',
};

export const MY_BOOKING_SUMMARY_ICONS = {
  upcoming: CalendarClock,
  confirmed: BadgeCheck,
  completed: CheckCircle2,
  cancelled: XCircle,
} as const;

interface MyBookingSummaryProps {
  items: MyBookingSummaryItem[];
}

export const MyBookingSummary = ({ items }: MyBookingSummaryProps) => (
  <section aria-label="Tổng quan lịch đặt sân" className="mb-6">
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map(({ label, count, icon: Icon, tone }) => (
        <article
          key={label}
          className={`bg-surface flex min-h-20 min-w-0 items-center gap-3 rounded-lg border-l-2 px-3 py-3 shadow-xs sm:px-4 ${toneClasses[tone]}`}
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-md bg-white/80">
            <Icon aria-hidden="true" className="size-4" />
          </span>
          <span className="min-w-0">
            <span className="text-content-secondary block text-xs font-medium break-words">
              {label}
            </span>
            <span className="text-content-primary mt-0.5 block text-xl font-extrabold tabular-nums">
              {count}
            </span>
          </span>
        </article>
      ))}
    </div>
  </section>
);
