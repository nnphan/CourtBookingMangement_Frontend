export type BookingTypeApi = 'FLEXIBLE' | 'FIXED';
export type BookingDialogMode = 'ADMIN' | 'CUSTOMER';

export type PaymentMethodApi = 'CASH';

export interface SelectedBookingCourt {
  courtId: string;
  courtName: string;
}

/**
 * Shared multi-Court selection: every Court shares one Branch, Date and time range.
 * Used by CustomerCourtStatusPage, CourtStatusPage and CreateBookingDialog.
 */
export interface MultiCourtBookingSelection {
  branchId: string;
  branchName?: string;
  bookingDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm or HH:mm:ss
  endTime: string; // HH:mm or HH:mm:ss
  courts: SelectedBookingCourt[];
}

export interface CreateBookingDetailRequest {
  courtId: string;
  bookingDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
}

/**
 * POST /api/bookings: one aggregate Booking with one detail per Court.
 * customerName/phoneNumber are required by the UI for Guests; the backend ignores them
 * for an authenticated caller that has a Customer profile.
 */
export interface CreateBookingRequest {
  branchId: string;
  bookingType: BookingTypeApi;
  paymentMethod: PaymentMethodApi;
  notes: string;
  details: CreateBookingDetailRequest[];
  customerName?: string;
  phoneNumber?: string;
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

export interface CreateBookingDetailResponse {
  courtId: string;
  courtName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  price: number;
}

export interface CreateBookingResponseData {
  bookingId: string;
  bookingCode: string;
  branchId: string;
  customerId: string | null;
  customerName: string;
  phoneNumber: string;
  bookingType: string;
  bookingStatus: string;
  paymentMethod: string;
  totalAmount: number;
  notes: string | null;
  details: CreateBookingDetailResponse[];
}

export type CreateBookingResponse = CreateBookingResponseData;

/** Values owned by the CreateBookingDialog form. Schedule and Courts come from the shared selection. */
export interface CreateBookingFormValues {
  customerName?: string;
  phoneNumber?: string;
  paymentMethod: PaymentMethodApi;
  notes?: string;
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

export interface MyBookingListItemDto {
  bookingId: string;
  bookingCode: string;
  branchId: string;
  branchName: string;
  courtId: string;
  courtName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  bookingType: string;
  status: string;
  paymentMethod: string;
  totalAmount: number;
}
