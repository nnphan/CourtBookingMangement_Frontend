import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const Card = ({ className, children }: { className?: string; children: ReactNode }) => (
  <section
    className={cn(
      'w-full overflow-hidden rounded-[var(--radius-card)] bg-surface shadow-[var(--shadow-card)]',
      className,
    )}
  >
    {children}
  </section>
);

export const CardBody = ({ className, children }: { className?: string; children: ReactNode }) => (
  <div className={cn('px-5 py-6 sm:px-7 sm:py-7', className)}>{children}</div>
);
