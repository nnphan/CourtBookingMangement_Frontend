export type BookingHistoryStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';

export type PaymentHistoryStatus = 'paid' | 'unpaid' | 'deposit_pending' | 'partially_paid';

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
