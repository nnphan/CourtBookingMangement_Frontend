import { useCallback, useEffect } from 'react';
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
      // CASE 1: No active selection, or clicked on a different court -> Fresh single-slot selection
      if (!activeSelection || activeSelection.courtId !== courtId) {
        const endMinutes =
          CustomerCourtStatusService.parseTimeToMinutes(slotTime) + slotInterval;
        const endTime = CustomerCourtStatusService.minutesToTime(endMinutes);

        setActiveSelection({
          courtId,
          courtName,
          startTime: slotTime,
          endTime,
          selectedSlots: [slotTime],
          durationMinutes: slotInterval,
        });
        return;
      }

      // CASE 2: Already selecting on this court
      const isAlreadySelected = activeSelection.selectedSlots.includes(slotTime);

      if (isAlreadySelected) {
        // TOGGLE OFF: Unselect!
        // Sub-case 2a: Only 1 slot was selected -> unselecting it clears the selection
        if (activeSelection.selectedSlots.length <= 1) {
          clearSelection();
          return;
        }

        // Sub-case 2b: Multi-slot selection. Remove the clicked slot.
        const remainingSlots = activeSelection.selectedSlots.filter((t) => t !== slotTime);
        if (remainingSlots.length === 0) {
          clearSelection();
          return;
        }

        // Check if remaining slots are consecutive
        const sortedMinutes = remainingSlots
          .map((t) => CustomerCourtStatusService.parseTimeToMinutes(t))
          .sort((a, b) => a - b);

        let isConsecutive = true;
        for (let i = 1; i < sortedMinutes.length; i++) {
          const prev = sortedMinutes[i - 1];
          const curr = sortedMinutes[i];
          if (prev === undefined || curr === undefined || curr - prev !== slotInterval) {
            isConsecutive = false;
            break;
          }
        }

        if (isConsecutive && sortedMinutes[0] !== undefined && sortedMinutes[sortedMinutes.length - 1] !== undefined) {
          const minMin = sortedMinutes[0];
          const maxMin = sortedMinutes[sortedMinutes.length - 1] + slotInterval;
          const duration = maxMin - minMin;
          setActiveSelection({
            courtId,
            courtName,
            startTime: CustomerCourtStatusService.minutesToTime(minMin),
            endTime: CustomerCourtStatusService.minutesToTime(maxMin),
            selectedSlots: remainingSlots,
            durationMinutes: duration,
          });
        } else {
          // If removing a middle slot breaks continuity, deselect all to avoid invalid gap
          clearSelection();
        }
        return;
      }

      // CASE 3: Slot is NOT selected on the current court -> Toggle ON / Extend range
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
          durationMinutes: slotInterval,
        });
        return;
      }

      // Build array of slot times
      const allSlots: string[] = [];
      for (let m = newMin; m < newMax; m += slotInterval) {
        allSlots.push(CustomerCourtStatusService.minutesToTime(m));
      }

      // Past slot protection: Multi-selection must ignore past slots
      const validSlots = allSlots.filter(
        (time) => !CustomerCourtStatusService.isPastSlot(selectedDate, time),
      );

      if (validSlots.length === 0) {
        toast.error('Các khung giờ đã chọn đều ở trong quá khứ.', 'Past time slots cannot be booked.');
        return;
      }

      const firstSlot = validSlots[0];
      const lastSlot = validSlots[validSlots.length - 1];
      if (!firstSlot || !lastSlot) {
        clearSelection();
        return;
      }

      const validStartMin = CustomerCourtStatusService.parseTimeToMinutes(firstSlot);
      const validEndMin = CustomerCourtStatusService.parseTimeToMinutes(lastSlot) + slotInterval;
      const totalDuration = validEndMin - validStartMin;

      setActiveSelection({
        courtId,
        courtName,
        startTime: CustomerCourtStatusService.minutesToTime(validStartMin),
        endTime: CustomerCourtStatusService.minutesToTime(validEndMin),
        selectedSlots: validSlots,
        durationMinutes: totalDuration,
      });
    },
    [activeSelection, courts, slots, slotInterval, selectedDate, setActiveSelection, clearSelection],
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

  // Keyboard shortcut: Escape clears active selection
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeSelection) {
        clearSelection();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeSelection, clearSelection]);

  return {
    activeSelection,
    handleSlotClick,
    isSlotSelected,
    clearSelection,
    handleBookCurrentSelection,
  };
};
