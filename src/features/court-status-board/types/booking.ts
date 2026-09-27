export type BookingType =
  | 'recurring'
  | 'daily'
  | 'flexible'
  | 'event'
  | 'deposit_pending'
  | 'maintenance';

export type PaymentStatus =
  | 'paid'
  | 'unpaid'
  | 'deposit_pending'
  | 'service_unpaid'
  | 'ticket_unpaid'
  | 'partially_paid';

export interface AdditionalService {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface BookingItem {
  id: string;
  bookingNumber: string;
  courtId: string;
  courtName: string;
  customerName: string;
  phoneNumber: string;
  membership?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm (e.g. "17:00")
  endTime: string; // HH:mm (e.g. "20:00")
  bookingType: BookingType;
  bookingStatus: string;
  paymentStatus: PaymentStatus;
  depositAmount?: number;
  remainingAmount?: number;
  totalAmount?: number;
  notes?: string;
  services?: AdditionalService[];
  checkedIn?: boolean;
  checkedOut?: boolean;
  createdAt?: string;
}

export interface BookingBlockProps {
  bookingId: string;
  courtId: string;
  courtName: string;
  customerName: string;
  phoneNumber: string;
  startTime: string;
  endTime: string;
  bookingType: string;
  paymentStatus: string;
  bookingStatus: string;
}
