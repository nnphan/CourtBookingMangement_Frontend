import type { CustomerCourt } from './customer-court';
import type { CustomerCourtStatusType } from './customer-status';

export interface CustomerSlotItem {
  courtId: string;
  startTime: string;
  endTime: string;
  status: CustomerCourtStatusType;
}

export interface CustomerCourtStatusData {
  branchId: string;
  branchName: string;
  bookingDate: string;
  courts: CustomerCourt[];
  slots: CustomerSlotItem[];
}

export interface CustomerAvailableSlot {
  startTime: string;
  endTime: string;
}

export interface CustomerCourtAvailableSlotsData {
  courtId: string;
  courtName: string;
  bookingDate: string;
  availableSlots: CustomerAvailableSlot[];
}

export interface CustomerCreateBookingPayload {
  branchId: string;
  courtId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  customerName: string;
  phoneNumber: string;
  note?: string;
}

export interface CustomerCreateBookingResult {
  bookingId: string;
  bookingNumber: string;
  bookingStatus: string;
}

export interface CustomerSlotSelection {
  courtId: string;
  courtName: string;
  startTime: string;
  endTime: string;
  selectedSlots: string[];
  durationMinutes?: number;
}
