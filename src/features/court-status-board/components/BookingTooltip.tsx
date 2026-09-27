import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { BookingItem } from '../types/booking';
import { getStatusConfig } from '../constants/booking-status';
import { User, Phone, MapPin, Calendar, Clock, CreditCard, FileText } from 'lucide-react';

interface BookingTooltipProps {
  booking: BookingItem;
  children: React.ReactNode;
}

export const BookingTooltip: React.FC<BookingTooltipProps> = memo(({ booking, children }) => {
  const { t } = useTranslation();
  const statusCfg = getStatusConfig(booking.bookingType);

  const paymentText = (() => {
    switch (booking.paymentStatus) {
      case 'paid':
        return t('courtStatus.payment.paid', 'Đã thanh toán');
      case 'unpaid':
        return t('courtStatus.payment.unpaid', 'Chưa thanh toán');
      case 'deposit_pending':
        return t('courtStatus.payment.depositPending', 'Chờ đặt cọc');
      case 'service_unpaid':
        return t('courtStatus.payment.serviceUnpaid', 'Chưa TT dịch vụ');
      case 'ticket_unpaid':
        return t('courtStatus.payment.ticketUnpaid', 'Chưa TT tiền vé');
      default:
        return booking.paymentStatus;
    }
  })();

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side="top"
          align="center"
          className="z-50 w-72 p-3 text-xs bg-slate-900/95 text-white backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
            <div className="flex items-center gap-1.5 font-bold text-sm text-emerald-400">
              <MapPin className="size-4 shrink-0" />
              <span>{booking.courtName}</span>
            </div>
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ backgroundColor: statusCfg.color, color: statusCfg.textColor }}
            >
              {statusCfg.name}
            </span>
          </div>

          {/* Details list */}
          <div className="space-y-1.5 text-slate-200">
            <div className="flex items-center gap-2">
              <User className="size-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold text-white">{booking.customerName}</span>
              {booking.membership && (
                <span className="ml-auto text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-medium">
                  {booking.membership}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Phone className="size-3.5 text-slate-400 shrink-0" />
              <span>{booking.phoneNumber}</span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="size-3.5 text-slate-400 shrink-0" />
              <span>{booking.date}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="size-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold text-white">
                {booking.startTime} - {booking.endTime}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-white/10">
              <div className="flex items-center gap-1.5">
                <CreditCard className="size-3.5 text-slate-400 shrink-0" />
                <span>{paymentText}</span>
              </div>
              <span className="font-bold text-emerald-400">
                {(booking.totalAmount ?? 0).toLocaleString('vi-VN')} đ
              </span>
            </div>

            {booking.notes && (
              <div className="flex items-start gap-1.5 pt-1 text-slate-300 text-[11px] italic">
                <FileText className="size-3 text-slate-400 mt-0.5 shrink-0" />
                <span className="line-clamp-2">{booking.notes}</span>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

BookingTooltip.displayName = 'BookingTooltip';
