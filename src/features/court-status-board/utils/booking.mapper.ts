import { BookingType } from '@/types/booking-type.enum';
export {
  getBookingTypeLabel,
  toBookingTypeEnum,
  isFlexibleBooking,
  isFixedBooking,
} from './booking.utils';

export interface BookingPayloadMapping {
  bookingType: BookingType;
}

/**
 * Maps user selection to API request payload enum
 */
export const mapBookingTypeToPayload = (type: BookingType): BookingType => {
  return type === BookingType.FIXED ? BookingType.FIXED : BookingType.FLEXIBLE;
};
