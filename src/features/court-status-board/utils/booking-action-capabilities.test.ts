import test from 'node:test';
import assert from 'node:assert/strict';
import { getBookingActionCapabilities } from './booking-action-capabilities.ts';

test('Booking action capabilities for CONFIRMED booking with remaining balance', () => {
  const caps = getBookingActionCapabilities({
    bookingStatus: 'CONFIRMED',
    paymentStatus: 'UNPAID',
    totalAmount: 560000,
    paidAmount: 0,
    mode: 'ADMIN',
  });

  assert.equal(caps.canCheckIn, true);
  assert.equal(caps.canCheckOut, false);
  assert.equal(caps.canPay, true);
  assert.equal(caps.canEdit, true);
  assert.equal(caps.canCancel, true);
  assert.equal(caps.isReadOnly, false);
  assert.equal(caps.remainingAmount, 560000);
  assert.equal(caps.isFullyPaid, false);
});

test('Booking action capabilities for CHECKED_IN / PLAYING booking with remaining balance', () => {
  const caps = getBookingActionCapabilities({
    bookingStatus: 'CHECKED_IN',
    paymentStatus: 'UNPAID',
    totalAmount: 560000,
    paidAmount: 200000,
    mode: 'ADMIN',
  });

  assert.equal(caps.canCheckIn, false, 'Checked-in bookings should not allow checking in again');
  assert.equal(caps.canCheckOut, true, 'Checked-in bookings should allow check-out');
  assert.equal(caps.canPay, true, 'Unpaid balance should allow payment');
  assert.equal(caps.canEdit, false);
  assert.equal(caps.canCancel, true);
  assert.equal(caps.remainingAmount, 360000);
  assert.equal(caps.isFullyPaid, false);
});

test('Booking action capabilities for CHECKED_IN fully paid booking', () => {
  const caps = getBookingActionCapabilities({
    bookingStatus: 'CHECKED_IN',
    paymentStatus: 'PAID',
    totalAmount: 560000,
    paidAmount: 560000,
    mode: 'ADMIN',
  });

  assert.equal(caps.canCheckIn, false);
  assert.equal(caps.canCheckOut, true);
  assert.equal(caps.canPay, false);
  assert.equal(caps.remainingAmount, 0);
  assert.equal(caps.isFullyPaid, true);
});

test('Booking action capabilities for COMPLETED booking', () => {
  const caps = getBookingActionCapabilities({
    bookingStatus: 'COMPLETED',
    paymentStatus: 'PAID',
    totalAmount: 560000,
    paidAmount: 560000,
    mode: 'ADMIN',
  });

  assert.equal(caps.isReadOnly, true);
  assert.equal(caps.canCheckIn, false);
  assert.equal(caps.canCheckOut, false);
  assert.equal(caps.canPay, false);
  assert.equal(caps.canEdit, false);
  assert.equal(caps.canCancel, false);
});

test('Booking action capabilities for CANCELLED booking', () => {
  const caps = getBookingActionCapabilities({
    bookingStatus: 'CANCELLED',
    paymentStatus: 'UNPAID',
    totalAmount: 560000,
    paidAmount: 0,
    mode: 'ADMIN',
  });

  assert.equal(caps.isReadOnly, true);
  assert.equal(caps.canCheckIn, false);
  assert.equal(caps.canCheckOut, false);
  assert.equal(caps.canPay, false);
  assert.equal(caps.canEdit, false);
  assert.equal(caps.canCancel, false);
});

test('Booking action capabilities for CUSTOMER mode', () => {
  const caps = getBookingActionCapabilities({
    bookingStatus: 'CONFIRMED',
    paymentStatus: 'UNPAID',
    totalAmount: 560000,
    paidAmount: 0,
    mode: 'CUSTOMER',
  });

  assert.equal(caps.isReadOnly, true);
  assert.equal(caps.canCheckIn, false);
  assert.equal(caps.canCheckOut, false);
  assert.equal(caps.canPay, false);
  assert.equal(caps.canEdit, false);
  assert.equal(caps.canCancel, false);
});

