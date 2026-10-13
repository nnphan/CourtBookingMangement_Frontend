import dayjs from '@/lib/dayjs';
import type { CreateBookingRequest, BookingTypeApi } from '../types/booking.types';

export const mapBookingTypeToPayload = (type: string): BookingTypeApi => {
  const normalized = (type || '').trim().toUpperCase();
  if (normalized === 'FIXED' || normalized === 'CỐ ĐỊNH') {
    return 'FIXED';
  }
  return 'FLEXIBLE';
};

export const mapBookingTypeToLabel = (type: string): string => {
  const normalized = (type || '').trim().toUpperCase();
  if (normalized === 'FIXED') {
    return 'Cố định';
  }
  if (normalized === 'FLEXIBLE') {
    return 'Vãng lai';
  }
  return type || '-';
};

/**
 * Maps booking status to Vietnamese display label and badge styling
 * FIXED -> Cố định
 * FLEXIBLE -> Vãng lai
 * CONFIRMED -> Đã xác nhận
 * CANCELLED -> Đã hủy
 */
export const mapBookingStatus = (
  status?: string | null,
): { label: string; badgeClass: string } => {
  const upper = (status || '').trim().toUpperCase();
  switch (upper) {
    case 'FIXED':
      return {
        label: 'Cố định',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      };
    case 'FLEXIBLE':
      return {
        label: 'Vãng lai',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      };
    case 'CONFIRMED':
      return {
        label: 'Đã xác nhận',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      };
    case 'CANCELLED':
      return {
        label: 'Đã hủy',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      };
    default:
      return {
        label: status || '-',
        badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
      };
  }
};

/**
 * Maps payment method code to Vietnamese display label
 * CASH -> Tiền mặt
 * MOMO -> MoMo
 * BANK_TRANSFER -> Chuyển khoản
 */
export const mapPaymentMethod = (method?: string | null): string => {
  const upper = (method || '').trim().toUpperCase();
  switch (upper) {
    case 'CASH':
      return 'Tiền mặt';
    case 'MOMO':
      return 'MoMo';
    case 'BANK_TRANSFER':
      return 'Chuyển khoản';
    default:
      return method || '-';
  }
};

/**
 * Maps payment status code to Vietnamese display label and badge classes
 * UNPAID -> Chưa thanh toán (Red)
 * PAID -> Đã thanh toán (Green)
 * PARTIAL_PAID / PARTIALLY_PAID -> Thanh toán một phần (Orange)
 */
export const mapPaymentStatus = (
  status?: string | null,
): { label: string; badgeClass: string } => {
  const upper = (status || '').trim().toUpperCase();
  switch (upper) {
    case 'UNPAID':
      return {
        label: 'Chưa thanh toán',
        badgeClass: 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-600/10',
      };
    case 'PAID':
      return {
        label: 'Đã thanh toán',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-600/10',
      };
    case 'PARTIAL_PAID':
    case 'PARTIALLY_PAID':
      return {
        label: 'Thanh toán một phần',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-600/10',
      };
    default:
      return {
        label: status || 'Chưa xác định',
        badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
      };
  }
};

/**
 * Formats booking date string (YYYY-MM-DD) to DD/MM/YYYY using dayjs
 */
export const formatBookingDate = (dateStr?: string | null): string => {
  if (!dateStr) return '-';
  const parsed = dayjs(dateStr);
  return parsed.isValid() ? parsed.format('DD/MM/YYYY') : dateStr;
};

/**
 * Formats time string (HH:mm:ss or HH:mm) to HH:mm
 */
export const formatBookingTime = (timeStr?: string | null): string => {
  if (!timeStr) return '--:--';
  const parts = timeStr.trim().split(':');
  if (parts.length >= 2) {
    return `${parts[0]?.padStart(2, '0')}:${parts[1]?.padStart(2, '0')}`;
  }
  return timeStr;
};

/**
 * Auto-calculates duration in hours / minutes between startTime and endTime
 * Formula: endTime - startTime -> e.g. "2 giờ" or "1 giờ 30 phút"
 */
export const calculateBookingDuration = (
  startTime?: string | null,
  endTime?: string | null,
): string => {
  if (!startTime || !endTime) return '-';
  const [sHours = 0, sMinutes = 0] = startTime.split(':').map(Number);
  const [eHours = 0, eMinutes = 0] = endTime.split(':').map(Number);

  const startTotalMinutes = sHours * 60 + sMinutes;
  const endTotalMinutes = eHours * 60 + eMinutes;
  const diffMinutes = endTotalMinutes - startTotalMinutes;

  if (diffMinutes <= 0) return '-';

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours} giờ ${minutes} phút`;
  }
  if (hours > 0) {
    return `${hours} giờ`;
  }
  return `${minutes} phút`;
};

/**
 * Formats number to Vietnamese currency string: e.g. 0 VNĐ or 140.000 VNĐ
 */
export const formatCurrency = (amount?: number | null): string => {
  const numeric = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return `${new Intl.NumberFormat('vi-VN').format(numeric)} VNĐ`;
};

export const toCreateBookingPayload = (
  values: {
    customerName: string;
    phoneNumber: string;
    bookingType: string;
    note?: string;
  },
  context: {
    branchId: string;
    courtId: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    customerId?: string | null;
    paymentMethod?: string;
  },
): CreateBookingRequest => {
  return {
    branchId: context.branchId,
    courtId: context.courtId,
    customerId: context.customerId ?? null,
    customerName: values.customerName.trim(),
    phoneNumber: values.phoneNumber.trim(),
    bookingDate: context.bookingDate,
    startTime: context.startTime,
    endTime: context.endTime,
    bookingType: mapBookingTypeToPayload(values.bookingType),
    paymentMethod: context.paymentMethod || 'CASH',
    note: values.note?.trim() || '',
  };
};
