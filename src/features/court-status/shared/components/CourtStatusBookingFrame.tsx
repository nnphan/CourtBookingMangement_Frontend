import React from 'react';
import { cn } from '@/lib/utils';

interface CourtStatusBookingFrameProps {
  left: number;
  width: number;
  height: number;
  backgroundColor?: string;
  color?: string;
  className?: string;
  role?: React.AriaRole;
  tabIndex?: number;
  ariaLabel?: string;
  title?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onDoubleClick?: React.MouseEventHandler<HTMLDivElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  children: React.ReactNode;
}

export const CourtStatusBookingFrame: React.FC<CourtStatusBookingFrameProps> = ({
  left,
  width,
  height,
  backgroundColor,
  color,
  className,
  role,
  tabIndex,
  ariaLabel,
  title,
  onClick,
  onDoubleClick,
  onKeyDown,
  children,
}) => (
  <div
    role={role}
    tabIndex={tabIndex}
    aria-label={ariaLabel}
    title={title}
    onClick={onClick}
    onDoubleClick={onDoubleClick}
    onKeyDown={onKeyDown}
    style={{
      position: 'absolute',
      left: `${left}px`,
      width: `${width}px`,
      height: `${height}px`,
      top: '1px',
      backgroundColor,
      color,
    }}
    className={cn(
      'group z-10 flex items-center justify-center overflow-hidden rounded-xs px-2 text-center text-xs font-semibold shadow-xs transition-all select-none',
      className,
    )}
  >
    {children}
  </div>
);
