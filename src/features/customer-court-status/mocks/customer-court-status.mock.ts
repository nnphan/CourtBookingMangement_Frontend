import { createSuccessResponse } from '@/mocks/shared/mock-api-response';
import type { CustomerBranch, CustomerCourt } from '../types/customer-court';
import type {
  CustomerCourtStatusData,
  CustomerSlotItem,
  CustomerCreateBookingPayload,
  CustomerCreateBookingResult,
  CustomerCourtAvailableSlotsData,
} from '../types/customer-slot';

import { SEED_BRANCHES } from '@/features/branch-discovery/api/branches.api';

const DISCOVERY_MAPPED_BRANCHES: CustomerBranch[] = SEED_BRANCHES.map((b) => ({
  id: b.id,
  branchCode: b.district.replace(/\s+/g, '').slice(0, 4).toUpperCase(),
  branchName: b.name,
  address: b.address,
  openTime: b.operatingHours?.open || '05:30',
  closeTime: b.operatingHours?.close || '23:30',
  rating: b.rating,
  isActive: true,
}));

export const MOCK_CUSTOMER_BRANCHES: CustomerBranch[] = [
  {
    id: 'branch-q7',
    branchCode: 'Q7',
    branchName: 'TMT Badminton Club Quận 7',
    address: '123 Nguyễn Thị Thập, Quận 7',
    openTime: '05:00',
    closeTime: '23:00',
    rating: 4.8,
    isActive: true,
  },
  {
    id: 'branch-td',
    branchCode: 'TD',
    branchName: 'TMT Badminton Club Thủ Đức',
    address: '456 Võ Văn Ngân, Thủ Đức',
    openTime: '05:00',
    closeTime: '23:00',
    rating: 4.7,
    isActive: true,
  },
  ...DISCOVERY_MAPPED_BRANCHES,
];

export const MOCK_CUSTOMER_COURTS: CustomerCourt[] = [
  { courtId: 'court-1', courtName: 'Sân 1' },
  { courtId: 'court-2', courtName: 'Sân 2' },
  { courtId: 'court-3', courtName: 'Sân 3' },
  { courtId: 'court-4', courtName: 'Sân 4' },
  { courtId: 'court-5', courtName: 'Sân 5' },
  { courtId: 'court-6', courtName: 'Sân 6' },
  { courtId: 'court-7', courtName: 'Sân 7' },
  { courtId: 'court-8', courtName: 'Sân 8' },
];

// Seed slots matching attached screenshot exactly
let inMemorySlots: CustomerSlotItem[] = [
  // Court 1
  { courtId: 'court-1', startTime: '05:00', endTime: '07:00', status: 'BOOKED' },
  { courtId: 'court-1', startTime: '07:00', endTime: '11:00', status: 'LOCKED' },
  { courtId: 'court-1', startTime: '18:00', endTime: '20:00', status: 'BOOKED' },

  // Court 2
  { courtId: 'court-2', startTime: '05:00', endTime: '07:00', status: 'BOOKED' },
  { courtId: 'court-2', startTime: '07:00', endTime: '11:00', status: 'LOCKED' },
  { courtId: 'court-2', startTime: '17:00', endTime: '20:00', status: 'BOOKED' },

  // Court 3
  { courtId: 'court-3', startTime: '05:00', endTime: '08:00', status: 'BOOKED' },
  { courtId: 'court-3', startTime: '08:00', endTime: '11:00', status: 'LOCKED' },
  { courtId: 'court-3', startTime: '17:00', endTime: '22:00', status: 'BOOKED' },

  // Court 4
  { courtId: 'court-4', startTime: '05:00', endTime: '06:00', status: 'LOCKED' },
  { courtId: 'court-4', startTime: '06:00', endTime: '07:00', status: 'BOOKED' },
  { courtId: 'court-4', startTime: '07:00', endTime: '11:00', status: 'LOCKED' },
  { courtId: 'court-4', startTime: '19:00', endTime: '21:00', status: 'BOOKED' },

  // Court 5
  { courtId: 'court-5', startTime: '05:00', endTime: '07:00', status: 'BOOKED' },
  { courtId: 'court-5', startTime: '07:00', endTime: '11:00', status: 'LOCKED' },
  { courtId: 'court-5', startTime: '19:00', endTime: '21:00', status: 'BOOKED' },

  // Court 6
  { courtId: 'court-6', startTime: '05:00', endTime: '07:00', status: 'BOOKED' },
  { courtId: 'court-6', startTime: '07:00', endTime: '11:00', status: 'LOCKED' },
  { courtId: 'court-6', startTime: '18:00', endTime: '22:00', status: 'BOOKED' },

  // Court 7
  { courtId: 'court-7', startTime: '05:00', endTime: '07:00', status: 'BOOKED' },
  { courtId: 'court-7', startTime: '07:00', endTime: '11:00', status: 'LOCKED' },
  { courtId: 'court-7', startTime: '18:00', endTime: '20:00', status: 'BOOKED' },

  // Court 8
  { courtId: 'court-8', startTime: '05:00', endTime: '07:00', status: 'BOOKED' },
  { courtId: 'court-8', startTime: '07:00', endTime: '11:00', status: 'LOCKED' },
  { courtId: 'court-8', startTime: '19:00', endTime: '21:00', status: 'BOOKED' },
];

export const getMockCustomerCourtStatus = (
  branchId: string = 'branch-q7',
  date: string = '2026-09-29',
) => {
  const branch = MOCK_CUSTOMER_BRANCHES.find((b) => b.id === branchId) || MOCK_CUSTOMER_BRANCHES[0]!;
  const data: CustomerCourtStatusData = {
    branchId: branch.id,
    branchName: branch.branchName,
    bookingDate: date,
    courts: MOCK_CUSTOMER_COURTS,
    slots: inMemorySlots,
  };
  return createSuccessResponse(data);
};

export const getMockAvailableSlots = (
  courtId: string = 'court-5',
  date: string = '2026-09-29',
) => {
  const court = MOCK_CUSTOMER_COURTS.find((c) => c.courtId === courtId) || MOCK_CUSTOMER_COURTS[4]!;
  const data: CustomerCourtAvailableSlotsData = {
    courtId: court.courtId,
    courtName: court.courtName,
    bookingDate: date,
    availableSlots: [
      { startTime: '11:00', endTime: '12:00' },
      { startTime: '12:00', endTime: '13:00' },
      { startTime: '13:00', endTime: '14:00' },
      { startTime: '14:00', endTime: '15:00' },
      { startTime: '15:00', endTime: '16:00' },
      { startTime: '16:00', endTime: '17:00' },
      { startTime: '17:00', endTime: '18:00' },
      { startTime: '18:00', endTime: '19:00' },
      { startTime: '21:00', endTime: '22:00' },
      { startTime: '22:00', endTime: '23:00' },
    ],
  };
  return createSuccessResponse(data);
};

let bookingCounter = 1;

export const createMockCustomerBooking = (payload: CustomerCreateBookingPayload) => {
  const idStr = String(bookingCounter++).padStart(6, '0');
  const result: CustomerCreateBookingResult = {
    bookingId: `BK${idStr}`,
    bookingNumber: `BK-${payload.bookingDate.replace(/-/g, '')}-${idStr.slice(-4)}`,
    bookingStatus: 'PENDING',
  };

  // Add to in-memory slots as BOOKED so scheduler immediately updates
  inMemorySlots = [
    ...inMemorySlots,
    {
      courtId: payload.courtId,
      startTime: payload.startTime,
      endTime: payload.endTime,
      status: 'BOOKED',
    },
  ];

  return createSuccessResponse(result, null, 'Booking created successfully.');
};
