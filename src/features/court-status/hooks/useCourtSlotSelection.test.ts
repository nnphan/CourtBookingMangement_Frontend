import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  type SelectedCourtSlot,
  type NormalizedBookingRange,
  toggleSlotInSelection,
  removeRangeFromSlots,
  removeCourtFromSlots,
  mergeContiguousSlotsByCourtAndDate,
} from '../utils/court-slot-selection.utils.ts';

describe('useCourtSlotSelection core logic integration', () => {
  test('handles state progression: click 3 slots on court 1, 2 on court 2, toggle 1 off', () => {
    let slots: SelectedCourtSlot[] = [];

    // Court 1: 09:00, 10:00, 11:00
    slots = toggleSlotInSelection(slots, {
      courtId: 'court-1',
      courtName: 'Sân 1',
      bookingDate: '2026-11-01',
      startTime: '09:00:00',
      endTime: '10:00:00',
    });
    slots = toggleSlotInSelection(slots, {
      courtId: 'court-1',
      courtName: 'Sân 1',
      bookingDate: '2026-11-01',
      startTime: '10:00:00',
      endTime: '11:00:00',
    });
    slots = toggleSlotInSelection(slots, {
      courtId: 'court-1',
      courtName: 'Sân 1',
      bookingDate: '2026-11-01',
      startTime: '11:00:00',
      endTime: '12:00:00',
    });

    // Court 2: 14:00, 15:00
    slots = toggleSlotInSelection(slots, {
      courtId: 'court-2',
      courtName: 'Sân 2',
      bookingDate: '2026-11-01',
      startTime: '14:00:00',
      endTime: '15:00:00',
    });
    slots = toggleSlotInSelection(slots, {
      courtId: 'court-2',
      courtName: 'Sân 2',
      bookingDate: '2026-11-01',
      startTime: '15:00:00',
      endTime: '16:00:00',
    });

    assert.equal(slots.length, 5);
    let ranges = mergeContiguousSlotsByCourtAndDate(slots);
    assert.equal(ranges.length, 2);
    assert.equal(ranges[0]?.courtId, 'court-1');
    assert.equal(ranges[0]?.startTime, '09:00:00');
    assert.equal(ranges[0]?.endTime, '12:00:00');
    assert.equal(ranges[0]?.durationHours, 3);

    assert.equal(ranges[1]?.courtId, 'court-2');
    assert.equal(ranges[1]?.startTime, '14:00:00');
    assert.equal(ranges[1]?.endTime, '16:00:00');
    assert.equal(ranges[1]?.durationHours, 2);

    // Toggle OFF Court 1 middle slot (10:00) -> splits Court 1 into 09:00-10:00 and 11:00-12:00!
    slots = toggleSlotInSelection(slots, {
      courtId: 'court-1',
      courtName: 'Sân 1',
      bookingDate: '2026-11-01',
      startTime: '10:00:00',
      endTime: '11:00:00',
    });
    assert.equal(slots.length, 4);

    ranges = mergeContiguousSlotsByCourtAndDate(slots);
    assert.equal(ranges.length, 3);
    assert.equal(ranges[0]?.courtId, 'court-1');
    assert.equal(ranges[0]?.startTime, '09:00:00');
    assert.equal(ranges[0]?.endTime, '10:00:00');

    assert.equal(ranges[1]?.courtId, 'court-1');
    assert.equal(ranges[1]?.startTime, '11:00:00');
    assert.equal(ranges[1]?.endTime, '12:00:00');

    assert.equal(ranges[2]?.courtId, 'court-2');
    assert.equal(ranges[2]?.startTime, '14:00:00');
    assert.equal(ranges[2]?.endTime, '16:00:00');

    // Remove range (Court 2)
    slots = removeRangeFromSlots(slots, ranges[2]!);
    assert.equal(slots.length, 2);
    ranges = mergeContiguousSlotsByCourtAndDate(slots);
    assert.equal(ranges.length, 2);
    assert.ok(ranges.every((r) => r.courtId === 'court-1'));

    // Remove court (Court 1)
    slots = removeCourtFromSlots(slots, 'court-1');
    assert.equal(slots.length, 0);
  });
});

