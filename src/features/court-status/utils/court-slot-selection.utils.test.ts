import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  mergeContiguousSlotsByCourtAndDate,
  toggleSlotInSelection,
  removeRangeFromSlots,
  removeCourtFromSlots,
  isSlotInSelection,
  getSlotKey,
  timeToMinutes,
  type SelectedCourtSlot,
} from './court-slot-selection.utils.ts';

describe('court-slot-selection.utils', () => {
  const date = '2026-10-30';

  it('1. Two adjacent slots on the same court merge', () => {
    const slots: SelectedCourtSlot[] = [
      {
        courtId: 'c1',
        courtName: 'Court 1',
        bookingDate: date,
        startTime: '09:00:00',
        endTime: '10:00:00',
      },
      {
        courtId: 'c1',
        courtName: 'Court 1',
        bookingDate: date,
        startTime: '10:00:00',
        endTime: '11:00:00',
      },
    ];

    const ranges = mergeContiguousSlotsByCourtAndDate(slots);
    assert.strictEqual(ranges.length, 1);
    assert.strictEqual(ranges[0]?.courtId, 'c1');
    assert.strictEqual(ranges[0]?.startTime, '09:00:00');
    assert.strictEqual(ranges[0]?.endTime, '11:00:00');
    assert.strictEqual(ranges[0]?.durationHours, 2);
    assert.strictEqual(ranges[0]?.slots.length, 2);
  });

  it('2. Three adjacent slots merge', () => {
    const slots: SelectedCourtSlot[] = [
      { courtId: 'c2', courtName: 'Court 2', bookingDate: date, startTime: '13:00', endTime: '14:00' },
      { courtId: 'c2', courtName: 'Court 2', bookingDate: date, startTime: '14:00', endTime: '15:00' },
      { courtId: 'c2', courtName: 'Court 2', bookingDate: date, startTime: '15:00', endTime: '16:00' },
    ];

    const ranges = mergeContiguousSlotsByCourtAndDate(slots);
    assert.strictEqual(ranges.length, 1);
    assert.strictEqual(ranges[0]?.courtId, 'c2');
    assert.strictEqual(ranges[0]?.startTime, '13:00:00');
    assert.strictEqual(ranges[0]?.endTime, '16:00:00');
    assert.strictEqual(ranges[0]?.durationHours, 3);
  });

  it('3. Slots separated by a gap do not merge', () => {
    const slots: SelectedCourtSlot[] = [
      { courtId: 'c1', courtName: 'Court 1', bookingDate: date, startTime: '09:00', endTime: '11:00' },
      { courtId: 'c1', courtName: 'Court 1', bookingDate: date, startTime: '14:00', endTime: '16:00' },
    ];

    const ranges = mergeContiguousSlotsByCourtAndDate(slots);
    assert.strictEqual(ranges.length, 2);
    assert.strictEqual(ranges[0]?.startTime, '09:00:00');
    assert.strictEqual(ranges[0]?.endTime, '11:00:00');
    assert.strictEqual(ranges[1]?.startTime, '14:00:00');
    assert.strictEqual(ranges[1]?.endTime, '16:00:00');
  });

  it('4. Equal times on different courts do not merge', () => {
    const slots: SelectedCourtSlot[] = [
      { courtId: 'c1', courtName: 'Court 1', bookingDate: date, startTime: '18:00', endTime: '20:00' },
      { courtId: 'c2', courtName: 'Court 2', bookingDate: date, startTime: '18:00', endTime: '20:00' },
    ];

    const ranges = mergeContiguousSlotsByCourtAndDate(slots);
    assert.strictEqual(ranges.length, 2);
    assert.strictEqual(ranges[0]?.courtId, 'c1');
    assert.strictEqual(ranges[1]?.courtId, 'c2');
  });

  it('5. Slots on different dates do not merge', () => {
    const slots: SelectedCourtSlot[] = [
      { courtId: 'c1', courtName: 'Court 1', bookingDate: '2026-10-30', startTime: '09:00', endTime: '10:00' },
      { courtId: 'c1', courtName: 'Court 1', bookingDate: '2026-10-31', startTime: '10:00', endTime: '11:00' },
    ];

    const ranges = mergeContiguousSlotsByCourtAndDate(slots);
    assert.strictEqual(ranges.length, 2);
    assert.strictEqual(ranges[0]?.bookingDate, '2026-10-30');
    assert.strictEqual(ranges[1]?.bookingDate, '2026-10-31');
  });

  it('6. Input ordering does not affect normalized output', () => {
    const slotA: SelectedCourtSlot = {
      courtId: 'c1',
      courtName: 'Court 1',
      bookingDate: date,
      startTime: '09:00',
      endTime: '10:00',
    };
    const slotB: SelectedCourtSlot = {
      courtId: 'c1',
      courtName: 'Court 1',
      bookingDate: date,
      startTime: '10:00',
      endTime: '11:00',
    };

    const out1 = mergeContiguousSlotsByCourtAndDate([slotA, slotB]);
    const out2 = mergeContiguousSlotsByCourtAndDate([slotB, slotA]);

    assert.deepStrictEqual(out1, out2);
  });

  it('7. Duplicate slots are handled deterministically', () => {
    const slot: SelectedCourtSlot = {
      courtId: 'c1',
      courtName: 'Court 1',
      bookingDate: date,
      startTime: '09:00',
      endTime: '10:00',
    };

    const ranges = mergeContiguousSlotsByCourtAndDate([slot, slot, { ...slot }]);
    assert.strictEqual(ranges.length, 1);
    assert.strictEqual(ranges[0]?.slots.length, 1);
  });

  it('8. Toggle selection adds and removes exact slots', () => {
    const slot1: SelectedCourtSlot = {
      courtId: 'c1',
      courtName: 'Court 1',
      bookingDate: date,
      startTime: '09:00',
      endTime: '10:00',
    };
    const slot2: SelectedCourtSlot = {
      courtId: 'c1',
      courtName: 'Court 1',
      bookingDate: date,
      startTime: '10:00',
      endTime: '11:00',
    };
    const slot3: SelectedCourtSlot = {
      courtId: 'c2',
      courtName: 'Court 2',
      bookingDate: date,
      startTime: '13:00',
      endTime: '14:00',
    };

    let selected: SelectedCourtSlot[] = [];
    selected = toggleSlotInSelection(selected, slot1);
    assert.strictEqual(selected.length, 1);
    assert.strictEqual(isSlotInSelection(selected, 'c1', date, '09:00'), true);

    selected = toggleSlotInSelection(selected, slot2);
    assert.strictEqual(selected.length, 2);

    selected = toggleSlotInSelection(selected, slot3);
    assert.strictEqual(selected.length, 3);
    assert.strictEqual(isSlotInSelection(selected, 'c2', date, '13:00'), true);

    // Deselect only slot1
    selected = toggleSlotInSelection(selected, slot1);
    assert.strictEqual(selected.length, 2);
    assert.strictEqual(isSlotInSelection(selected, 'c1', date, '09:00'), false);
    assert.strictEqual(isSlotInSelection(selected, 'c1', date, '10:00'), true);
    assert.strictEqual(isSlotInSelection(selected, 'c2', date, '13:00'), true);
  });

  it('9. Remove range removes only that range underlying slots', () => {
    const slots: SelectedCourtSlot[] = [
      { courtId: 'c1', courtName: 'Court 1', bookingDate: date, startTime: '09:00', endTime: '10:00' },
      { courtId: 'c1', courtName: 'Court 1', bookingDate: date, startTime: '10:00', endTime: '11:00' },
      { courtId: 'c2', courtName: 'Court 2', bookingDate: date, startTime: '13:00', endTime: '14:00' },
    ];

    const ranges = mergeContiguousSlotsByCourtAndDate(slots);
    assert.strictEqual(ranges.length, 2);

    const remaining = removeRangeFromSlots(slots, ranges[0]!);
    assert.strictEqual(remaining.length, 1);
    assert.strictEqual(remaining[0]?.courtId, 'c2');
  });

  it('10. Acceptance Scenario: Mixed multi-court independent ranges', () => {
    const input: SelectedCourtSlot[] = [
      { courtId: 'court-1', courtName: 'Court 1', bookingDate: '2026-10-30', startTime: '09:00:00', endTime: '10:00:00' },
      { courtId: 'court-1', courtName: 'Court 1', bookingDate: '2026-10-30', startTime: '10:00:00', endTime: '11:00:00' },
      { courtId: 'court-2', courtName: 'Court 2', bookingDate: '2026-10-30', startTime: '13:00:00', endTime: '14:00:00' },
      { courtId: 'court-2', courtName: 'Court 2', bookingDate: '2026-10-30', startTime: '14:00:00', endTime: '15:00:00' },
      { courtId: 'court-2', courtName: 'Court 2', bookingDate: '2026-10-30', startTime: '15:00:00', endTime: '16:00:00' },
    ];

    const result = mergeContiguousSlotsByCourtAndDate(input);
    assert.strictEqual(result.length, 2);

    assert.strictEqual(result[0]?.courtId, 'court-1');
    assert.strictEqual(result[0]?.bookingDate, '2026-10-30');
    assert.strictEqual(result[0]?.startTime, '09:00:00');
    assert.strictEqual(result[0]?.endTime, '11:00:00');
    assert.strictEqual(result[0]?.durationHours, 2);

    assert.strictEqual(result[1]?.courtId, 'court-2');
    assert.strictEqual(result[1]?.bookingDate, '2026-10-30');
    assert.strictEqual(result[1]?.startTime, '13:00:00');
    assert.strictEqual(result[1]?.endTime, '16:00:00');
    assert.strictEqual(result[1]?.durationHours, 3);
  });
});
