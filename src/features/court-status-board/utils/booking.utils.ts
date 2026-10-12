import { BookingType } from '@/types/booking-type.enum';
import { BOOKING_TYPE_LABELS } from '../constants/booking.constants';

/**
 * Returns human-readable Vietnamese label for booking types.
 * FLEXIBLE -> "Vãng lai"
 * FIXED -> "Cố định"
 */
export const getBookingTypeLabel = (bookingType?: BookingType | string | null): string => {
  if (!bookingType) return '-';
  const upper = String(bookingType).toUpperCase();
  if (upper === BookingType.FLEXIBLE || upper === 'DAILY') {
    return 'Vãng lai';
  }
  if (upper === BookingType.FIXED || upper === 'RECURRING') {
    return 'Cố định';
  }
  return BOOKING_TYPE_LABELS[bookingType] ?? '-';
};

/**
 * Normalizes any string representation to a valid BookingType enum.
 * Defaults to BookingType.FLEXIBLE if unknown.
 */
export const toBookingTypeEnum = (bookingType?: string | null): BookingType => {
  if (!bookingType) return BookingType.FLEXIBLE;
  const upper = bookingType.trim().toUpperCase();
  if (upper === BookingType.FIXED || upper === 'RECURRING') {
    return BookingType.FIXED;
  }
  return BookingType.FLEXIBLE;
};

export const isFlexibleBooking = (bookingType?: BookingType | string | null): boolean => {
  return toBookingTypeEnum(bookingType as string) === BookingType.FLEXIBLE;
};

export const isFixedBooking = (bookingType?: BookingType | string | null): boolean => {
  return toBookingTypeEnum(bookingType as string) === BookingType.FIXED;
};
