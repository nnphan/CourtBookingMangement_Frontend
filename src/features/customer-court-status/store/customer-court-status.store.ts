import { create } from 'zustand';
import dayjs from '@/lib/dayjs';
import type { CustomerSlotSelection } from '../types/customer-slot';
import { SCHEDULER_CONFIG } from '../constants/customer-scheduler.config';
import { CustomerCourtStatusService } from '../services/customer-court-status.service';
import { useSchedulerSelectionStore } from './scheduler-selection.store';
import { useBranchSearchStore } from '@/features/branch-discovery/store/branch-search.store';

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

const getInitialDate = (): string => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const urlDate = params.get('date');
    if (urlDate && dayjs(urlDate, 'YYYY-MM-DD', true).isValid()) {
      return urlDate;
    }
  }
  const searchStoreDate = useBranchSearchStore.getState().selectedDate;
  if (searchStoreDate && dayjs(searchStoreDate).isValid()) {
    return searchStoreDate;
  }
  return dayjs().format('YYYY-MM-DD');
};

export const useCustomerCourtStatusStore = create<CustomerCourtStatusState>((set) => ({
  selectedBranchId: 'branch-q7',
  selectedDate: getInitialDate(),
  slotInterval: SCHEDULER_CONFIG.SLOT_DURATION,
  zoomLevel: 1.0,
  isPriceModalOpen: false,
  isCreateBookingOpen: false,
  activeSelection: null,

  setSelectedBranchId: (selectedBranchId) => {
    useSchedulerSelectionStore.getState().clearSelection();
    set({ selectedBranchId, activeSelection: null, isCreateBookingOpen: false });
  },
  setSelectedDate: (selectedDate) => {
    const validDate =
      selectedDate && dayjs(selectedDate).isValid()
        ? dayjs(selectedDate).format('YYYY-MM-DD')
        : dayjs().format('YYYY-MM-DD');
    useSchedulerSelectionStore.getState().clearSelection();
    if (useBranchSearchStore.getState().selectedDate !== validDate) {
      useBranchSearchStore.getState().setSelectedDate(validDate);
    }
    set({ selectedDate: validDate, activeSelection: null, isCreateBookingOpen: false });
  },
  setSlotInterval: (slotInterval) => {
    useSchedulerSelectionStore.getState().clearSelection();
    set({ slotInterval, activeSelection: null, isCreateBookingOpen: false });
  },
  setZoomLevel: (zoomLevel) => set({ zoomLevel }),
  openPriceModal: () => set({ isPriceModalOpen: true }),
  closePriceModal: () => set({ isPriceModalOpen: false }),
  openCreateBooking: (selection) => {
    if (selection) {
      const duration =
        selection.durationMinutes ??
        CustomerCourtStatusService.calculateDurationMinutes(
          selection.startTime,
          selection.endTime,
        );
      useSchedulerSelectionStore.getState().setSelection({
        selectedCourtId: selection.courtId,
        selectedCourtName: selection.courtName,
        selectedSlots: selection.selectedSlots,
        startTime: selection.startTime,
        endTime: selection.endTime,
        durationMinutes: duration,
      });
    }
    set((state) => ({
      isCreateBookingOpen: true,
      activeSelection: selection !== undefined ? selection : state.activeSelection,
    }));
  },
  closeCreateBooking: () => {
    useSchedulerSelectionStore.getState().clearSelection();
    set({ isCreateBookingOpen: false, activeSelection: null });
  },
  setActiveSelection: (activeSelection) => {
    if (activeSelection) {
      const duration =
        activeSelection.durationMinutes ??
        CustomerCourtStatusService.calculateDurationMinutes(
          activeSelection.startTime,
          activeSelection.endTime,
        );
      useSchedulerSelectionStore.getState().setSelection({
        selectedCourtId: activeSelection.courtId,
        selectedCourtName: activeSelection.courtName,
        selectedSlots: activeSelection.selectedSlots,
        startTime: activeSelection.startTime,
        endTime: activeSelection.endTime,
        durationMinutes: duration,
      });
    } else {
      useSchedulerSelectionStore.getState().clearSelection();
    }
    set({ activeSelection });
  },
  clearSelection: () => {
    useSchedulerSelectionStore.getState().clearSelection();
    set({ activeSelection: null, isCreateBookingOpen: false });
  },
}));
