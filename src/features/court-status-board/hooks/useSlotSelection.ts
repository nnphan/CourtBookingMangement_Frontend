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

  const selectedDate = useCourtStatusStore((s) => s.selectedDate);
  const activeSelection = useCourtStatusStore((s) => s.activeSelection);
  const setActiveSelection = useCourtStatusStore((s) => s.setActiveSelection);
  const clearActiveSelection = useCourtStatusStore((s) => s.clearActiveSelection);

  /**
   * Handle clicking an individual time slot cell
   * Toggles selection state: Selected -> Unselected / Unselected -> Selected
   * Enforces Same Court Rule, Past Slot Protection, and Continuous Range Rule
   */
  const handleSlotClick = useCallback(
    (court: CourtItem, slot: TimeSlot) => {
      // 0. Past Date & Past Slot Protection:
      if (SchedulerService.isPastDate(selectedDate)) {
        toast.error(
          t('courtStatus.pastDateAlert', 'Cannot create bookings for past dates.'),
          'Không thể đặt lịch cho các ngày trong quá khứ.',
        );
        return;
      }

      if (SchedulerService.isPastSlot(selectedDate, slot.time)) {
        toast.error(
          t('courtStatus.pastSlotTooltip', 'Past time slots cannot be booked.'),
          'Khung giờ trong quá khứ không thể đặt lịch.',
        );
        return;
      }

      const selectedCourts = activeSelection?.courts ?? [];
      const isAnotherCourt = Boolean(
        activeSelection &&
          activeSelection.selectedSlots.length > 0 &&
          activeSelection.courtId !== court.id,
      );
      if (isAnotherCourt) {
        const withinSharedRange =
          SchedulerService.parseTimeToMinutes(slot.time) >=
            SchedulerService.parseTimeToMinutes(activeSelection!.startTime) &&
          SchedulerService.parseTimeToMinutes(slot.time) <
            SchedulerService.parseTimeToMinutes(activeSelection!.endTime);
        const courtBookings = bookings.filter((booking) => booking.courtId === court.id);
        const available = activeSelection!.selectedSlots.every(
          (time) => !SchedulerService.checkCollision(
            courtBookings,
            court.id,
            time,
            SchedulerService.minutesToTime(
              SchedulerService.parseTimeToMinutes(time) + slotInterval,
            ),
          ),
        );
        if (!withinSharedRange || !available) {
          toast.error(t('booking.multiCourt.sameTimeRequired'));
          return;
        }
        const alreadySelected = selectedCourts.some((item) => item.courtId === court.id);
        if (alreadySelected) {
          const remaining = selectedCourts.filter((item) => item.courtId !== court.id);
          if (remaining.length === 0) {
            clearActiveSelection();
          } else {
            setActiveSelection({ ...activeSelection!, courts: remaining, courtId: remaining[0]!.courtId, courtName: remaining[0]!.courtName });
          }
        } else {
          setActiveSelection({
            ...activeSelection!,
            courts: [...selectedCourts, { courtId: court.id, courtName: court.name }],
          });
        }
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

      // Filter out any past slots to guarantee multi-selection ignores past slots
      updatedSlots = updatedSlots.filter(
        (time) => !SchedulerService.isPastSlot(selectedDate, time),
      );

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
        // If toggling off broke consecutive continuity, clear selection cleanly
        if (existsIndex !== -1 && !newRange.isConsecutive) {
          clearActiveSelection();
          return;
        }

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
    [activeSelection, slotInterval, bookings, clearActiveSelection, setActiveSelection, selectedDate, t],
  );

  /**
   * Helper to check if an individual cell is selected
   */
  const isSlotSelected = useCallback(
    (courtId: string, slotTime: string): boolean => {
      if (!activeSelection || !(activeSelection.courts ?? []).some((item) => item.courtId === courtId)) return false;
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
