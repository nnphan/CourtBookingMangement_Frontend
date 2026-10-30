import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  buildCreateBookingFormSchema,
  normalizePhoneNumber,
  isValidVietnamPhone,
} from '../schemas/create-booking.schema.ts';
import { toCreateBookingRequest } from '../utils/booking.mapper.ts';
import type { MultiCourtBookingSelection, CreateBookingFormValues } from '../types/booking.types.ts';

describe('Guest Booking & CreateBookingDialog Validation', () => {
  it('1. Normalizes phone numbers with +84, spaces, and dashes', () => {
    assert.strictEqual(normalizePhoneNumber('+84912345678'), '0912345678');
    assert.strictEqual(normalizePhoneNumber('0912 345 678'), '0912345678');
    assert.strictEqual(normalizePhoneNumber('0912-345-678'), '0912345678');
    assert.strictEqual(normalizePhoneNumber('+84 912 345 678'), '0912345678');
  });

  it('2. Validates Vietnam phone numbers according to backend specification (0[0-9]{9,10})', () => {
    assert.strictEqual(isValidVietnamPhone('0912345678'), true);
    assert.strictEqual(isValidVietnamPhone('+84912345678'), true);
    assert.strictEqual(isValidVietnamPhone('01234567890'), true); // 11 digits
    assert.strictEqual(isValidVietnamPhone('12345'), false);
    assert.strictEqual(isValidVietnamPhone('abc'), false);
    assert.strictEqual(isValidVietnamPhone(''), false);
  });

  it('3. Guest mode form validation requires customerName and phoneNumber', () => {
    const guestSchema = buildCreateBookingFormSchema(true); // requireContact = true

    // Missing contact info
    const invalidResult = guestSchema.safeParse({
      customerName: '',
      phoneNumber: '',
      paymentMethod: 'CASH',
    });
    assert.strictEqual(invalidResult.success, false);
    if (!invalidResult.success) {
      const issues = invalidResult.error.issues;
      assert.ok(issues.some((i) => i.path[0] === 'customerName'));
      assert.ok(issues.some((i) => i.path[0] === 'phoneNumber'));
    }

    // Valid guest info
    const validResult = guestSchema.safeParse({
      customerName: 'Nguyen Van A',
      phoneNumber: '0912345678',
      paymentMethod: 'CASH',
      notes: 'Need water',
    });
    assert.strictEqual(validResult.success, true);
  });

  it('4. Authenticated mode does not require customerName or phoneNumber in form', () => {
    const authSchema = buildCreateBookingFormSchema(false); // requireContact = false

    const result = authSchema.safeParse({
      customerName: '',
      phoneNumber: '',
      paymentMethod: 'CASH',
    });
    assert.strictEqual(result.success, true);
  });

  it('5. toCreateBookingRequest produces backend-compatible guest payload without customerId', () => {
    const selection: MultiCourtBookingSelection = {
      branchId: 'branch-1',
      branchName: 'Test Branch',
      bookingDate: '2026-10-30',
      startTime: '09:00:00',
      endTime: '11:00:00',
      courts: [{ courtId: 'court-1', courtName: 'Court 1' }],
    };

    const formValues: CreateBookingFormValues = {
      customerName: 'Guest User',
      phoneNumber: '+84 912 345 678',
      paymentMethod: 'CASH',
      notes: 'Bring balls',
    };

    const payload = toCreateBookingRequest(selection, formValues, formValues);

    assert.strictEqual(payload.branchId, 'branch-1');
    assert.strictEqual(payload.bookingType, 'FLEXIBLE');
    assert.strictEqual(payload.paymentMethod, 'CASH');
    assert.strictEqual(payload.customerName, 'Guest User');
    assert.strictEqual(payload.phoneNumber, '0912345678'); // Normalized to backend regex
    assert.strictEqual(payload.notes, 'Bring balls');
    assert.strictEqual(payload.details.length, 1);
    assert.strictEqual(payload.details[0]?.courtId, 'court-1');
    assert.strictEqual(payload.details[0]?.bookingDate, '2026-10-30');
    assert.strictEqual(payload.details[0]?.startTime, '09:00:00');
    assert.strictEqual(payload.details[0]?.endTime, '11:00:00');
    // Ensure customerId is not present
    assert.strictEqual('customerId' in payload, false);
  });

  it('6. toCreateBookingRequest preserves multi-court independent detail ranges', () => {
    const selection: MultiCourtBookingSelection = {
      branchId: 'branch-1',
      branchName: 'Test Branch',
      bookingDate: '2026-10-30',
      startTime: '09:00:00',
      endTime: '11:00:00',
      courts: [
        { courtId: 'court-1', courtName: 'Court 1' },
        { courtId: 'court-2', courtName: 'Court 2' },
      ],
      details: [
        {
          courtId: 'court-1',
          courtName: 'Court 1',
          bookingDate: '2026-10-30',
          startTime: '09:00:00',
          endTime: '11:00:00',
        },
        {
          courtId: 'court-2',
          courtName: 'Court 2',
          bookingDate: '2026-10-30',
          startTime: '13:00:00',
          endTime: '16:00:00',
        },
      ],
    };

    const formValues: CreateBookingFormValues = {
      customerName: 'Guest User',
      phoneNumber: '0987654321',
      paymentMethod: 'CASH',
    };

    const payload = toCreateBookingRequest(selection, formValues, formValues);

    assert.strictEqual(payload.details.length, 2);
    assert.strictEqual(payload.details[0]?.courtId, 'court-1');
    assert.strictEqual(payload.details[0]?.startTime, '09:00:00');
    assert.strictEqual(payload.details[0]?.endTime, '11:00:00');

    assert.strictEqual(payload.details[1]?.courtId, 'court-2');
    assert.strictEqual(payload.details[1]?.startTime, '13:00:00');
    assert.strictEqual(payload.details[1]?.endTime, '16:00:00');
  });
});

