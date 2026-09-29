import { create } from 'zustand';
import type { CustomerSlotSelection } from '../types/customer-slot';
import { CUSTOMER_SCHEDULER_CONFIG } from '../constants/customer-scheduler.config';

interface CustomerCourtStatusState {
  selectedBranchId: string;
  selectedDate: string;
  slotInterval: number;
  zoomLevel: number;
  isPriceModalOpen: boolean;
  isCreateBookingOpen: boolean;
  activeSelection: CustomerSlotSelection | null;

  // Actions
  setSelectedBranchId: (branchId: string) => void;
  setSelectedDate: (date: string) => void;
  setSlotInterval: (interval: number) => void;
  setZoomLevel: (zoom: number) => void;
  openPriceModal: () => void;
  closePriceModal: () => void;
  openCreateBooking: (selection?: CustomerSlotSelection | null) => void;
  closeCreateBooking: () => void;
  setActiveSelection: (selection: CustomerSlotSelection | null) => void;
  clearSelection: () => void;
}

export const useCustomerCourtStatusStore = create<CustomerCourtStatusState>((set) => ({
  selectedBranchId: 'branch-q7',
  selectedDate: '2026-09-29', // Defaulting to the screenshot date
  slotInterval: CUSTOMER_SCHEDULER_CONFIG.DEFAULT_INTERVAL_MINUTES,
  zoomLevel: 1.0,
  isPriceModalOpen: false,
  isCreateBookingOpen: false,
  activeSelection: {
    courtId: 'court-5',
    courtName: 'C.Lông 5',
    startTime: '12:00',
    endTime: '14:00',
    selectedSlots: ['12:00', '12:30', '13:00', '13:30'],
  }, // Initial seed matching screenshot highlight on Court 5!

  setSelectedBranchId: (selectedBranchId) => set({ selectedBranchId }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setSlotInterval: (slotInterval) => set({ slotInterval }),
  setZoomLevel: (zoomLevel) => set({ zoomLevel }),
  openPriceModal: () => set({ isPriceModalOpen: true }),
  closePriceModal: () => set({ isPriceModalOpen: false }),
  openCreateBooking: (selection) =>
    set((state) => ({
      isCreateBookingOpen: true,
      activeSelection: selection !== undefined ? selection : state.activeSelection,
    })),
  closeCreateBooking: () => set({ isCreateBookingOpen: false }),
  setActiveSelection: (activeSelection) => set({ activeSelection }),
  clearSelection: () => set({ activeSelection: null }),
}));
