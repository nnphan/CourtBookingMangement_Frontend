import { CalendarDays, Clock3, CreditCard, MapPin, ScanEye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BookingStatusBadge } from '@/features/court-status-board/components/BookingStatusBadge';
import { getBookingStatusConfig } from '../utils/booking-status.utils';
import {
  calculateBookingDuration,
  formatBookingTime,
  formatCurrency,
  mapBookingTypeToLabel,
  mapPaymentMethod,
} from '../utils/booking.mapper';
import type { MyBookingListItemDto } from '../types/booking.types';
import dayjs from '@/lib/dayjs';

interface MyBookingCardProps {
  booking: MyBookingListItemDto;
  onViewDetails: (bookingId: string) => void;
  isUpcoming?: boolean;
  isNearestUpcoming?: boolean;
}

export const MyBookingCard = ({
  booking,
  onViewDetails,
  isUpcoming = false,
  isNearestUpcoming = false,
}: MyBookingCardProps) => {
  const statusConfig = getBookingStatusConfig(booking.status);
  const date = dayjs.tz(booking.bookingDate, 'YYYY-MM-DD', 'Asia/Ho_Chi_Minh');
  const formattedDate = date.isValid()
    ? date.locale('vi').format('dddd, DD-MM-YYYY')
    : booking.bookingDate;
  const startTime = formatBookingTime(booking.startTime);
  const endTime = formatBookingTime(booking.endTime);

  return (
    <article className="group border-line bg-surface hover:border-brand-200 relative min-w-0 overflow-hidden rounded-xl border shadow-xs transition-[border-color,box-shadow,transform] duration-200 ease-[var(--ease-standard)] hover:shadow-md motion-safe:hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none">
      <div
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 w-1 ${statusConfig.accentClass}`}
      />
      <div className="min-w-0 space-y-4 p-4 pl-5 sm:p-5 sm:pl-6">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <BookingStatusBadge status={booking.status} size="sm" />
            {isNearestUpcoming && (
              <span className="bg-brand-50 text-brand-700 inline-flex min-h-6 items-center rounded-full px-2.5 text-[11px] font-semibold">
                Lịch gần nhất
              </span>
            )}
          </div>
          <span className="text-content-secondary max-w-full text-right font-mono text-[11px] break-all">
            {booking.bookingCode || booking.bookingId}
          </span>
        </div>

        <div className="min-w-0">
          <div className="flex min-w-0 items-start gap-2">
            <MapPin aria-hidden="true" className="text-brand-600 mt-1 size-4 shrink-0" />
            <h2 className="text-content-primary min-w-0 text-base font-bold break-words sm:text-lg">
              {booking.branchName || 'Chi nhánh'}
            </h2>
          </div>
          <p className="bg-surface-muted text-content-secondary mt-1 ml-6 inline-flex max-w-full rounded-md px-2.5 py-1 text-xs font-medium break-words">
            {booking.courtName || 'Sân đấu'}
          </p>
        </div>

        <div
          className={`grid min-w-0 gap-3 rounded-lg border p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center ${
            isUpcoming ? 'border-brand-100 bg-brand-50/70' : 'border-line bg-surface-muted/70'
          }`}
        >
          <div className="flex min-w-0 items-start gap-2.5">
            <CalendarDays aria-hidden="true" className="text-brand-700 mt-0.5 size-4 shrink-0" />
            <span className="text-content-primary min-w-0 text-sm font-semibold break-words capitalize">
              {formattedDate}
            </span>
          </div>
          <div className="flex items-start gap-2.5 sm:justify-self-end">
            <Clock3 aria-hidden="true" className="text-brand-700 mt-0.5 size-4 shrink-0" />
            <div>
              <p className="text-content-primary text-sm font-bold tabular-nums">
                {startTime} - {endTime}
              </p>
              <p className="text-content-secondary text-xs">
                {calculateBookingDuration(booking.startTime, booking.endTime)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="bg-surface-muted text-content-secondary inline-flex min-h-7 items-center rounded-md px-2.5 text-xs font-medium">
            {mapBookingTypeToLabel(booking.bookingType)}
          </span>
          <span className="bg-surface-muted text-content-secondary inline-flex min-h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium">
            <CreditCard aria-hidden="true" className="size-3.5" />
            {mapPaymentMethod(booking.paymentMethod)}
          </span>
        </div>

        <div className="border-line flex flex-col gap-3 border-t pt-4 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
          <div>
            <p className="text-content-secondary text-xs">Tổng tiền</p>
            <p className="text-brand-700 text-lg font-extrabold tabular-nums">
              {formatCurrency(booking.totalAmount)}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="border-brand-200 text-brand-700 hover:bg-brand-50 hover:text-brand-800 min-h-11 w-full gap-2 min-[420px]:w-auto"
            aria-label={`Xem chi tiết đặt sân ${booking.bookingCode || booking.bookingId}`}
            onClick={() => onViewDetails(booking.bookingId)}
          >
            <ScanEye aria-hidden="true" className="size-4" />
            Xem chi tiết
          </Button>
        </div>
      </div>
    </article>
  );
};
