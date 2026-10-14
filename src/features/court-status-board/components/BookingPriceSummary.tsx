import React, { memo } from 'react';
import { Loader2, AlertCircle, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/features/bookings/utils/booking.mapper';
import { cn } from '@/lib/utils';

export interface BookingPriceSummaryProps {
  durationHours?: number | null;
  subtotalAmount?: number | null;
  totalAmount?: number | null;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  className?: string;
}

export const BookingPriceSummary: React.FC<BookingPriceSummaryProps> = memo(
  ({
    durationHours,
    subtotalAmount,
    totalAmount,
    isLoading = false,
    isError = false,
    onRetry,
    className,
  }) => {
    // 1. Loading State
    if (isLoading && totalAmount === undefined) {
      return (
        <div
          data-testid="booking-price-loading"
          className={cn(
            'rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 space-y-2',
            className,
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold">
              <Loader2 className="size-4 animate-spin text-emerald-600 shrink-0" />
              <span>Đang tính giá...</span>
            </div>
            <Skeleton className="h-5 w-24 bg-emerald-200/60" />
          </div>
        </div>
      );
    }

    // 2. Error State (Non-blocking)
    if (isError) {
      return (
        <div
          data-testid="booking-price-error"
          className={cn(
            'flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900',
            className,
          )}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 text-amber-600 shrink-0" />
            <span className="font-medium">Không thể tính giá.</span>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800 underline cursor-pointer focus:outline-none"
            >
              <RotateCcw className="size-3" />
              <span>Thử lại</span>
            </button>
          )}
        </div>
      );
    }

    // 3. Fallback / Idle State (no price yet)
    if (totalAmount === undefined || totalAmount === null) {
      return null;
    }

    const hasSubtotalDifference =
      subtotalAmount !== undefined &&
      subtotalAmount !== null &&
      subtotalAmount > 0 &&
      subtotalAmount !== totalAmount;

    // 4. Success State
    return (
      <div data-testid="booking-price-summary" className={cn('space-y-2', className)}>
        {/* Preferred Success-style Card: bg-green-50 border-green-200 text-green-700 */}
        <div className="rounded-xl border border-green-200 bg-green-50 p-3.5 text-green-700 transition-all shadow-xs">
          {/* Main Price Row */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-green-800 flex items-center gap-1.5">
              <span>💰 Tổng tiền</span>
            </span>
            <div className="flex items-center gap-2">
              {isLoading && (
                <Loader2 className="size-3.5 animate-spin text-green-600 shrink-0" />
              )}
              <span className="text-base font-extrabold text-green-700 tracking-tight font-mono">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>

          {/* Optional Breakdown: Subtotal & Duration Details */}
          {(hasSubtotalDifference || (durationHours && durationHours > 0)) && (
            <div className="mt-2 pt-2 border-t border-green-200/80 flex flex-wrap items-center justify-between text-[11px] text-green-800/80">
              {durationHours && durationHours > 0 ? (
                <span>Thời lượng: {durationHours} giờ</span>
              ) : (
                <span />
              )}
              {hasSubtotalDifference && (
                <span>Tạm tính: {formatCurrency(subtotalAmount)}</span>
              )}
            </div>
          )}
        </div>

        {/* UX Improvements: Automation Badge & Pricing Policy Helper */}
        <div className="space-y-0.5 px-0.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
            <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
            <span>Giá đã được tính tự động</span>
          </div>
          <p className="text-[10px] text-slate-500 pl-5">
            Đơn giá được xác định theo bảng giá của chi nhánh.
          </p>
        </div>
      </div>
    );
  },
);

BookingPriceSummary.displayName = 'BookingPriceSummary';
