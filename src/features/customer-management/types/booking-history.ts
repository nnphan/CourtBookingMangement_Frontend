export type BookingHistoryStatus = 'CONFIRMED' | 'PENDING' | 'CHECKED-IN' | 'CANCELLED';

export type PaymentHistoryStatus = 'PAID' | 'UNPAID' | 'DEPOSIT_PENDING' | 'PARTIALLY_PAID';

export interface CustomerBookingHistory {
  id: string;
  bookingNumber: string; // e.g. "BK-20260927-01"
  bookingDate: string; // YYYY-MM-DD
  courtId: string;
  courtName: string; // e.g. "Sân 5"
  startTime: string; // "14:00"
  endTime: string; // "17:00"
  durationMinutes: number;
  totalAmount: number;
  bookingStatus: BookingHistoryStatus;
  paymentStatus: PaymentHistoryStatus;
  notes?: string;
  createdDate: string;
}

export interface BookingHistoryParams {
  pageNumber?: number;
  pageSize?: number;
  bookingStatus?: BookingHistoryStatus | 'all';
  paymentStatus?: PaymentHistoryStatus | 'all';
  startDate?: string;
  endDate?: string;
  sortBy?: 'bookingDate' | 'totalAmount';
  sortOrder?: 'asc' | 'desc';
}
