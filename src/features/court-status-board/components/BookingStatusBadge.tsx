import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import { getBookingStatusConfig } from '../utils/booking-status.utils';

export interface BookingStatusBadgeProps {
  status?: string | null;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = memo(
  ({ status, className, showIcon = true, size = 'md' }) => {
    const config = getBookingStatusConfig(status);
    const Icon = config.icon;

    const sizeClasses = {
      sm: 'px-2 py-0.5 text-[11px] gap-1',
      md: 'px-2.5 py-1 text-xs gap-1.5',
      lg: 'px-3 py-1.5 text-sm gap-2',
    }[size];

    const iconSizes = {
      sm: 'size-3',
      md: 'size-3.5',
      lg: 'size-4',
    }[size];

    return (
      <span
        role="status"
        aria-label={`Trạng thái đặt sân: ${config.label}`}
        className={cn(
          'inline-flex items-center font-semibold rounded-full border shadow-2xs whitespace-nowrap transition-colors select-none',
          config.badgeClass,
          sizeClasses,
          className,
        )}
      >
        {showIcon && <Icon className={cn(iconSizes, 'shrink-0')} />}
        <span>{config.label}</span>
      </span>
    );
  },
);

BookingStatusBadge.displayName = 'BookingStatusBadge';
export default BookingStatusBadge;
