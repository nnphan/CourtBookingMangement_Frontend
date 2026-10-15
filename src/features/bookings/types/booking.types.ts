export type BookingTypeApi = 'FLEXIBLE' | 'FIXED';
export type BookingDialogMode = 'ADMIN' | 'CUSTOMER';

export interface BookingSelection {
  branchId: string;
  branchName?: string;
  courtId: string;
  courtName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

export interface CreateBookingRequest {
  branchId: string;
  courtId: string;
  customerId?: string | null;
  customerName: string;
  phoneNumber: string;
  bookingDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  bookingType: BookingTypeApi;
  paymentMethod: string; // Default: 'CASH'
  note?: string;
}

export interface CalculateBookingPriceRequest {
  branchId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
}

export interface CalculateBookingPriceResponse {
  branchId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  subtotalAmount: number;
  paidAmount: number;
  totalAmount: number;
}

export interface CreateBookingResponse {
  id?: string;
  bookingId?: string;
  bookingNumber?: string;
  branchId?: string;
  courtId?: string;
  customerId?: string | null;
  customerName?: string;
  phoneNumber?: string;
  bookingDate?: string;
  startTime?: string;
  endTime?: string;
  bookingType?: string;
  paymentMethod?: string;
  bookingStatus?: string;
  paymentStatus?: string;
  note?: string;
  createdAt?: string;
}

export interface CreateBookingFormValues {
  customerId?: string | null;
  customerName: string;
  phoneNumber: string;
  courtId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  bookingType: BookingTypeApi;
  note?: string;
}

export interface SchedulerBookingContext {
  branchId: string;
  courtId: string;
  courtName?: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
}

export type BookingStatusValue = 'PENDING' | 'CHECKED_IN' | 'COMPLETED' | string;

export interface BookingDetailDto {
  bookingId: string;
  bookingCode: string;
  courtName: string;
  customerName: string;
  phoneNumber: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  bookingType: string;
  paymentMethod: string;
  bookingStatus: BookingStatusValue;
  paymentStatus: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  notes: string | null;
}
