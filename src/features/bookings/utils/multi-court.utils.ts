import type { MultiCourtBookingSelection, SelectedBookingCourt } from '../types/booking.types';

export interface TimeRangeLike {
  startTime: string;
  endTime: string;
}

export interface ScheduleItemLike extends TimeRangeLike {
  courtId: string;
  bookingStatus?: string | null;
  bookingDetailStatus?: string | null;
}

const NON_BLOCKING_STATUSES = new Set(['cancelled', 'canceled', 'no_show', 'noshow']);

/** Parses HH:mm or HH:mm:ss into minutes from midnight without using Date. */
export const timeToMinutes = (value: string): number => {
  const [hours = '0', minutes = '0'] = (value ?? '').trim().split(':');
  const h = Number.parseInt(hours, 10);
  const m = Number.parseInt(minutes, 10);
  return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
};

/** Half-open interval overlap: adjacent ranges (16-18 vs 18-20) do not overlap. */
export const rangesOverlap = (a: TimeRangeLike, b: TimeRangeLike): boolean =>
  timeToMinutes(a.startTime) < timeToMinutes(b.endTime) &&
  timeToMinutes(a.endTime) > timeToMinutes(b.startTime);

/** Schedule items that are cancelled no longer block selection. */
export const isBlockingScheduleItem = (item: ScheduleItemLike): boolean => {
  const status = (item.bookingDetailStatus || item.bookingStatus || '').trim().toLowerCase();
  return !NON_BLOCKING_STATUSES.has(status);
};

export const hasScheduleConflict = (
  courtId: string,
  range: TimeRangeLike,
  scheduleItems: readonly ScheduleItemLike[],
): boolean =>
  scheduleItems.some(
    (item) => item.courtId === courtId && isBlockingScheduleItem(item) && rangesOverlap(range, item),
  );

/** Court ids from the selection that now overlap an existing schedule item. */
export const findConflictingCourtIds = (
  selection: Pick<MultiCourtBookingSelection, 'courts' | 'startTime' | 'endTime'>,
  scheduleItems: readonly ScheduleItemLike[],
): string[] =>
  selection.courts
    .filter((court) => hasScheduleConflict(court.courtId, selection, scheduleItems))
    .map((court) => court.courtId);

export const dedupeCourts = (courts: readonly SelectedBookingCourt[]): SelectedBookingCourt[] => {
  const seen = new Set<string>();
  return courts.filter((court) => {
    if (seen.has(court.courtId)) return false;
    seen.add(court.courtId);
    return true;
  });
};

export type SelectionValidationError =
  | 'atLeastOneCourt'
  | 'invalidRange'
  | 'missingBranch'
  | 'missingDate';

/** Structural validation of the shared selection before submitting. */
export const validateSelection = (
  selection: MultiCourtBookingSelection | null | undefined,
): SelectionValidationError | null => {
  if (!selection || !selection.branchId) return 'missingBranch';
  if (selection.details && selection.details.length > 0) {
    for (const d of selection.details) {
      if (!d.bookingDate) return 'missingDate';
      if (timeToMinutes(d.endTime) <= timeToMinutes(d.startTime)) return 'invalidRange';
    }
    return null;
  }
  if (!selection.bookingDate) return 'missingDate';
  if (dedupeCourts(selection.courts ?? []).length === 0) return 'atLeastOneCourt';
  if (timeToMinutes(selection.endTime) <= timeToMinutes(selection.startTime)) return 'invalidRange';
  return null;
};
