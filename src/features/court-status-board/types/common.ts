import type { CourtItem, CourtBranch, CourtGroup } from './court';
import type { BookingItem } from './booking';

export interface CourtStatusResponse {
  courts: CourtItem[];
  bookings: BookingItem[];
  branches: CourtBranch[];
  groups: CourtGroup[];
}

export interface CourtStatusFilterParams {
  branchId: string;
  courtGroupId?: string;
  date: string;
  slotInterval?: number;
}

export interface TimeSlot {
  time: string; // e.g. "05:00", "05:30"
  formattedTime: string; // e.g. "5:00", "5:30"
  slotIndex: number;
  minutesFromStart: number;
}

export interface SlotSelectionRange {
  courtId: string;
  courtName: string;
  startTime: string; // e.g. "14:00"
  endTime: string; // e.g. "17:00"
  durationMinutes: number; // e.g. 180
  durationFormatted: string; // e.g. "180 phút (3 giờ)"
  hasOverlap: boolean;
  overlappingBookingIds?: string[];
  selectedSlots: string[]; // Individual selected slot times e.g. ["14:00", "14:30", "15:00"]
  isConsecutive: boolean;
  consecutiveError?: string;
}
