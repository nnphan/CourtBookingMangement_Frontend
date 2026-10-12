import { useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import dayjs from '@/lib/dayjs';
import { useCourtStatusStore } from '../store/court-status.store';
import { SchedulerService } from '../services/scheduler.service';
import type { CourtStatusFilterParams } from '../types/common';

export const useCourtStatusFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlDate = searchParams.get('date');
  const urlBranch = searchParams.get('branchId');

  const selectedDate = useCourtStatusStore((s) => s.selectedDate);
  const selectedBranch = useCourtStatusStore((s) => s.selectedBranch);
  const selectedCourtGroup = useCourtStatusStore((s) => s.selectedCourtGroup);
  const slotInterval = useCourtStatusStore((s) => s.slotInterval);

  const setSelectedDate = useCourtStatusStore((s) => s.setSelectedDate);
  const setSelectedBranch = useCourtStatusStore((s) => s.setSelectedBranch);
  const setSelectedCourtGroup = useCourtStatusStore((s) => s.setSelectedCourtGroup);
  const setSlotInterval = useCourtStatusStore((s) => s.setSlotInterval);
  const reset = useCourtStatusStore((s) => s.reset);

  // Synchronize URL date parameter if provided
  useEffect(() => {
    if (urlDate && dayjs(urlDate, 'YYYY-MM-DD', true).isValid() && urlDate !== selectedDate) {
      setSelectedDate(urlDate);
    }
  }, [urlDate, selectedDate, setSelectedDate]);

  // Synchronize URL branch parameter if provided
  useEffect(() => {
    if (urlBranch && urlBranch !== selectedBranch) {
      setSelectedBranch(urlBranch);
    }
  }, [urlBranch, selectedBranch, setSelectedBranch]);

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
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('date', newDate);
          return next;
        },
        { replace: true },
      );
    },
    [setSelectedDate, setSearchParams],
  );

  const handleBranchChange = useCallback(
    (newBranch: string) => {
      setSelectedBranch(newBranch);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (newBranch) {
            next.set('branchId', newBranch);
          } else {
            next.delete('branchId');
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSelectedBranch, setSearchParams],
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
