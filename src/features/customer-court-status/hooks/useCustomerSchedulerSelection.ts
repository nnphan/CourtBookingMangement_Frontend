import { useCallback } from 'react';
import type { CustomerCourt } from '../types/customer-court';
import type { CustomerSlotItem } from '../types/customer-slot';
import { CustomerCourtStatusService } from '../services/customer-court-status.service';
import { useCustomerCourtStatusStore } from '../store/customer-court-status.store';
import { toast } from '@/lib/toast';

interface UseCustomerSchedulerSelectionProps {
  courts: CustomerCourt[];
  slots: CustomerSlotItem[];
  slotInterval: number;
}

export const useCustomerSchedulerSelection = ({
  courts,
  slots,
  slotInterval,
}: UseCustomerSchedulerSelectionProps) => {
  const activeSelection = useCustomerCourtStatusStore((s) => s.activeSelection);
  const setActiveSelection = useCustomerCourtStatusStore((s) => s.setActiveSelection);
  const clearSelection = useCustomerCourtStatusStore((s) => s.clearSelection);
  const openCreateBooking = useCustomerCourtStatusStore((s) => s.openCreateBooking);
  const selectedDate = useCustomerCourtStatusStore((s) => s.selectedDate);

  const handleSlotClick = useCallback(
    (courtId: string, slotTime: string) => {
      // 1. Check if slot is occupied
      const occupiedSlot = CustomerCourtStatusService.findSlotAtTime(slots, courtId, slotTime);
      if (occupiedSlot && occupiedSlot.status !== 'AVAILABLE') {
        const msg =
          occupiedSlot.status === 'BOOKED'
            ? 'Khung giờ này đã được đặt.'
            : occupiedSlot.status === 'LOCKED'
              ? 'Khung giờ này đang tạm khóa.'
              : 'Khung giờ này dành cho sự kiện.';
        toast.info(msg);
        return;
      }

      // 2. Check if slot is in the past
      if (CustomerCourtStatusService.isPastSlot(selectedDate, slotTime)) {
        toast.error('Không thể đặt khung giờ trong quá khứ.');
        return;
      }

      const court = courts.find((c) => c.courtId === courtId);
      const courtName = court?.courtName ?? courtId;

      // 3. Selection logic
      if (!activeSelection || activeSelection.courtId !== courtId) {
        // Start fresh selection
        const endMinutes =
          CustomerCourtStatusService.parseTimeToMinutes(slotTime) + slotInterval;
        const endTime = CustomerCourtStatusService.minutesToTime(endMinutes);

        setActiveSelection({
          courtId,
          courtName,
          startTime: slotTime,
          endTime,
          selectedSlots: [slotTime],
        });
        return;
      }

      // Already selecting on this court
      const startMin = CustomerCourtStatusService.parseTimeToMinutes(activeSelection.startTime);
      const clickedMin = CustomerCourtStatusService.parseTimeToMinutes(slotTime);

      const newMin = Math.min(startMin, clickedMin);
      const maxSlotMin = Math.max(startMin, clickedMin);
      const newMax = maxSlotMin + slotInterval;

      const newStartTime = CustomerCourtStatusService.minutesToTime(newMin);
      const newEndTime = CustomerCourtStatusService.minutesToTime(newMax);

      // Validate entire range is free of occupied slots
      const isAvailable = CustomerCourtStatusService.isRangeAvailable(
        slots,
        courtId,
        newStartTime,
        newEndTime,
      );

      if (!isAvailable) {
        toast.error('Khoảng thời gian đã chọn có khung giờ bị trùng hoặc đã được đặt.');
        // Reset to just the clicked slot
        const singleEnd = CustomerCourtStatusService.minutesToTime(clickedMin + slotInterval);
        setActiveSelection({
          courtId,
          courtName,
          startTime: slotTime,
          endTime: singleEnd,
          selectedSlots: [slotTime],
        });
        return;
      }

      // Build array of slot times
      const allSlots: string[] = [];
      for (let m = newMin; m < newMax; m += slotInterval) {
        allSlots.push(CustomerCourtStatusService.minutesToTime(m));
      }

      setActiveSelection({
        courtId,
        courtName,
        startTime: newStartTime,
        endTime: newEndTime,
        selectedSlots: allSlots,
      });
    },
    [activeSelection, courts, slots, slotInterval, selectedDate, setActiveSelection],
  );

  const isSlotSelected = useCallback(
    (courtId: string, slotTime: string): boolean => {
      if (!activeSelection || activeSelection.courtId !== courtId) return false;
      return activeSelection.selectedSlots.includes(slotTime);
    },
    [activeSelection],
  );

  const handleBookCurrentSelection = useCallback(() => {
    if (!activeSelection) {
      toast.info('Vui lòng chọn khung giờ trống trên bảng lịch để đặt.');
      return;
    }
    openCreateBooking(activeSelection);
  }, [activeSelection, openCreateBooking]);

  return {
    activeSelection,
    handleSlotClick,
    isSlotSelected,
    clearSelection,
    handleBookCurrentSelection,
  };
};
