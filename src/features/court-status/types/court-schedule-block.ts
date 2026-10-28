export type NormalizedCourtScheduleStatus =
  | 'PENDING_PAYMENT'
  | 'RESERVED'
  | 'CONFIRMED'
  | 'PAID'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'UNKNOWN';

export interface CourtScheduleBlockViewModel {
  bookingDetailId: string;
  bookingId: string;
  bookingCode: string;
  courtId: string;
  courtNumber: number;
  courtName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  bookingType: string;
  bookingStatus: string;
  bookingDetailStatus: string;
  paymentStatus: string;
  bookingCourtCount: number;
  label: string;
  displayStatus: NormalizedCourtScheduleStatus;
  blocksAvailability: boolean;
}
