import { useMemo, useCallback } from 'react';
import { useCourtStatusStore } from '../store/court-status.store';
import { SchedulerService } from '../services/scheduler.service';
import type { CourtStatusFilterParams } from '../types/common';

export const useCourtStatusFilters = () => {
  const selectedDate = useCourtStatusStore((s) => s.selectedDate);
  const selectedBranch = useCourtStatusStore((s) => s.selectedBranch);
  const selectedCourtGroup = useCourtStatusStore((s) => s.selectedCourtGroup);
  const slotInterval = useCourtStatusStore((s) => s.slotInterval);

  const setSelectedDate = useCourtStatusStore((s) => s.setSelectedDate);
  const setSelectedBranch = useCourtStatusStore((s) => s.setSelectedBranch);
  const setSelectedCourtGroup = useCourtStatusStore((s) => s.setSelectedCourtGroup);
  const setSlotInterval = useCourtStatusStore((s) => s.setSlotInterval);
  const reset = useCourtStatusStore((s) => s.reset);

  const filterParams: CourtStatusFilterParams = useMemo(
    () => ({
      branchId: selectedBranch,
      courtGroupId: selectedCourtGroup,
      date: selectedDate,
      slotInterval,
    }),
    [selectedBranch, selectedCourtGroup, selectedDate, slotInterval],
  );

  const dateLabel = useMemo(
    () => SchedulerService.formatVietnameseDateLabel(selectedDate),
    [selectedDate],
  );

  const handleDateChange = useCallback(
    (newDate: string) => {
      setSelectedDate(newDate);
    },
    [setSelectedDate],
  );

  const handleBranchChange = useCallback(
    (newBranch: string) => {
      setSelectedBranch(newBranch);
    },
    [setSelectedBranch],
  );

  const handleGroupChange = useCallback(
    (newGroup: string) => {
      setSelectedCourtGroup(newGroup);
    },
    [setSelectedCourtGroup],
  );

  const handleIntervalChange = useCallback(
    (newInterval: number) => {
      setSlotInterval(newInterval);
    },
    [setSlotInterval],
  );

  return {
    selectedDate,
    selectedBranch,
    selectedCourtGroup,
    slotInterval,
    filterParams,
    dateLabel,
    handleDateChange,
    handleBranchChange,
    handleGroupChange,
    handleIntervalChange,
    resetFilters: reset,
  };
};
