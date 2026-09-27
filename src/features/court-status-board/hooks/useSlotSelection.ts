import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { CourtItem } from '../types/court';
import type { TimeSlot, SlotSelectionRange } from '../types/common';
import type { BookingItem } from '../types/booking';
import { SchedulerService } from '../services/scheduler.service';
import { useCourtStatusStore } from '../store/court-status.store';
import { toast } from '@/lib/toast';

interface UseSlotSelectionProps {
  bookings: BookingItem[];
  slotInterval: number;
}

export interface UseSlotSelectionReturn {
  activeSelection: SlotSelectionRange | null;
  handleSlotClick: (court: CourtItem, slot: TimeSlot) => void;
  isSlotSelected: (courtId: string, slotTime: string) => boolean;
  clearSelection: () => void;
}

export const useSlotSelection = ({
  bookings,
  slotInterval,
}: UseSlotSelectionProps): UseSlotSelectionReturn => {
  const { t } = useTranslation();

  const activeSelection = useCourtStatusStore((s) => s.activeSelection);
  const setActiveSelection = useCourtStatusStore((s) => s.setActiveSelection);
  const clearActiveSelection = useCourtStatusStore((s) => s.clearActiveSelection);

  /**
   * Handle clicking an individual time slot cell
   * Toggles selection state: Selected -> Unselected / Unselected -> Selected
   * Enforces Same Court Rule and Continuous Range Rule
   */
  const handleSlotClick = useCallback(
    (court: CourtItem, slot: TimeSlot) => {
      // 1. Same Court Rule:
      // If there are already selected slots on another court, reject and show toast
      if (
        activeSelection &&
        activeSelection.courtId !== court.id &&
        activeSelection.selectedSlots &&
        activeSelection.selectedSlots.length > 0
      ) {
        toast.error(
          t('courtStatus.selection.differentCourt', 'Vui lòng chỉ chọn các khung giờ trên cùng một sân.'),
          'Please select slots from the same court.',
        );
        return;
      }

      // Check existing selected slots on current court
      const currentSelected =
        activeSelection && activeSelection.courtId === court.id
          ? [...(activeSelection.selectedSlots ?? [])]
          : [];

      const existsIndex = currentSelected.indexOf(slot.time);

      let updatedSlots: string[];
      if (existsIndex !== -1) {
        // Toggle OFF: Selected -> Unselected
        updatedSlots = currentSelected.filter((time) => time !== slot.time);
      } else {
        // Toggle ON: Unselected -> Selected
        updatedSlots = [...currentSelected, slot.time];
      }

      // If no slots remain selected, clear state
      if (updatedSlots.length === 0) {
        clearActiveSelection();
        return;
      }

      // 2. Auto Calculate Time Range & Continuous Range Validation
      const newRange = SchedulerService.buildRangeFromSlots(
        court.id,
        court.name,
        updatedSlots,
        slotInterval,
        bookings,
      );

      if (newRange) {
        // 3. Continuous Range Rule Warning
        if (!newRange.isConsecutive) {
          toast.error(
            t('courtStatus.selection.notConsecutive', 'Các khung giờ đã chọn phải liền kề nhau.'),
            'Selected time slots must be consecutive.',
          );
        }

        setActiveSelection(newRange);
      }
    },
    [activeSelection, slotInterval, bookings, clearActiveSelection, setActiveSelection, t],
  );

  /**
   * Helper to check if an individual cell is selected
   */
  const isSlotSelected = useCallback(
    (courtId: string, slotTime: string): boolean => {
      if (!activeSelection || activeSelection.courtId !== courtId) return false;
      return activeSelection.selectedSlots.includes(slotTime);
    },
    [activeSelection],
  );

  // Keyboard shortcut: Escape clears active selection
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeSelection) {
        clearActiveSelection();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [activeSelection, clearActiveSelection]);

  return {
    activeSelection,
    handleSlotClick,
    isSlotSelected,
    clearSelection: clearActiveSelection,
  };
};
