import React from 'react';
import { cn } from '@/lib/utils';

interface CourtStatusCourtNameCellProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const CourtStatusCourtNameCell: React.FC<CourtStatusCourtNameCellProps> = ({
  children,
  className,
  style,
}) => (
  <div
    role="rowheader"
    style={style}
    className={cn(
      'sticky left-0 z-20 flex shrink-0 items-center justify-center border-r border-[#c8ded2] bg-[#f4faf6] px-2 text-xs font-semibold text-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]',
      className,
    )}
  >
    {children}
  </div>
);
