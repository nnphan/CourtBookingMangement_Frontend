// @vitest-environment jsdom
import { focusManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { bookingApi } from '../api/booking.api';
import { paymentApi } from '@/features/payments/api/payment.api';
import type { BookingPaymentStatus } from '@/features/payments/api/payment.api';
import { toast } from '@/lib/toast';
import { CreateBookingDialog } from './CreateBookingDialog';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('../api/booking.api', () => ({ bookingApi: { createBooking: vi.fn() } }));
vi.mock('@/features/payments/api/payment.api', () => ({
  paymentApi: { createSePayPayment: vi.fn(), getBookingPaymentStatus: vi.fn() },
}));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('../hooks/useBookingCaller', () => ({
  useBookingCaller: () => ({
    mode: 'authenticated', customerName: 'Guest', phoneNumber: '0912345678', profileIncomplete: false,
  }),
}));
vi.mock('../hooks/useCalculateBookingPrice', () => ({
  useCalculateBookingPrice: () => ({ data: { totalAmount: 220000 } }),
}));

const bookingId = 'booking-1';
const paymentId = 'payment-1';
const queryKey = ['payments', 'booking-status', bookingId];
const schedule = {
  branchId: 'branch-1',
  branchName: 'Test branch',
  bookingDate: '2027-12-01',
  startTime: '16:00',
  endTime: '18:00',
  courts: [{ courtId: 'court-1', courtName: 'Court 1' }],
};
const pendingPayment: BookingPaymentStatus = {
  bookingId, paymentId, status: 'PENDING', bookingStatus: 'pending_payment', amount: 220000,
  paidAt: null, payUrl: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  const serverTime = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 300_000).toISOString();
  vi.mocked(bookingApi.createBooking).mockResolvedValue({
    bookingId, bookingCode: 'BK123', branchId: schedule.branchId, customerId: 'customer-1',
    customerName: 'Guest', phoneNumber: '0912345678', bookingStatus: 'PENDING_PAYMENT',
    bookingType: 'FLEXIBLE', paymentMethod: 'SEPAY', totalAmount: 220000, notes: null,
    expiresAt, serverTime,
    details: [{ ...schedule.courts[0], bookingDate: schedule.bookingDate,
      startTime: schedule.startTime, endTime: schedule.endTime, price: 220000 }],
  });
  vi.mocked(paymentApi.createSePayPayment).mockResolvedValue({
    paymentId, bookingId, bookingCode: 'BK123', paymentCode: 'BCM0011223344',
    amount: 220000, status: 'PENDING', qrUrl: 'https://example.test/qr.png',
    bankCode: 'MB', bankAccountNumber: '0000', accountHolderName: 'Test',
    expiresAt, serverTime, remainingSeconds: 300,
  });
  vi.mocked(paymentApi.getBookingPaymentStatus).mockResolvedValue(pendingPayment);
});

afterEach(() => {
  cleanup();
  focusManager.setFocused(undefined);
});

async function openPayment() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(<QueryClientProvider client={queryClient}>
    <MemoryRouter>
      <CreateBookingDialog isOpen onClose={vi.fn()} selection={schedule} />
    </MemoryRouter>
  </QueryClientProvider>);
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'SEPAY' } });
  fireEvent.submit(screen.getByRole('combobox').closest('form')!);
  await screen.findByRole('heading', { name: 'booking.payment.holdCreated' });
  expect(toast.success).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'booking.payment.pay' }));
  await screen.findByRole('img', { name: 'booking.payment.qrAlt' });
  await waitFor(() => expect(queryClient.getQueryData(queryKey)).toEqual(pendingPayment));
  return queryClient;
}

function refetchStatus(client: QueryClient, payment: BookingPaymentStatus) {
  vi.mocked(paymentApi.getBookingPaymentStatus).mockResolvedValue(payment);
  return act(async () => { await client.refetchQueries({ queryKey }); });
}

describe('SePay booking confirmation', () => {
  it('shows success once and refreshes booking data after the server confirms both statuses', async () => {
    const client = await openPayment();
    const invalidate = vi.spyOn(client, 'invalidateQueries');
    const confirmed = { ...pendingPayment, status: 'PAID', bookingStatus: 'confirmed' };

    await refetchStatus(client, { ...pendingPayment, status: 'PAID' });
    await screen.findByRole('heading', { name: 'booking.payment.needsAttention' });
    expect(toast.success).not.toHaveBeenCalled();

    await refetchStatus(client, confirmed);

    await screen.findByRole('heading', { name: 'booking.multiCourt.success' });
    expect(screen.getByText('booking.payment.confirmed')).toBeTruthy();
    expect(screen.queryByRole('img')).toBeNull();
    expect(toast.success).toHaveBeenCalledTimes(1);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['bookings'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['court-status', schedule.branchId] });

    await refetchStatus(client, confirmed);
    expect(toast.success).toHaveBeenCalledTimes(1);
  });

  it('notifies automatically when SePay confirms payment while the tab is unfocused', async () => {
    await openPayment();
    act(() => focusManager.setFocused(false));
    vi.mocked(paymentApi.getBookingPaymentStatus).mockResolvedValue({
      ...pendingPayment, status: 'PAID', bookingStatus: 'confirmed',
    });

    await screen.findByRole('heading', { name: 'booking.multiCourt.success' }, { timeout: 4500 });
    expect(toast.success).toHaveBeenCalledTimes(1);
  });

  it('hides the QR and never announces success for an expired hold', async () => {
    const client = await openPayment();

    await refetchStatus(client, { ...pendingPayment, bookingStatus: 'expired' });

    await screen.findByRole('heading', { name: 'booking.payment.holdExpired' });
    expect(screen.queryByRole('img')).toBeNull();
    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('booking.payment.bookingNotConfirmed', 'booking.payment.expired');

    await refetchStatus(client, { ...pendingPayment, status: 'EXPIRED', bookingStatus: 'expired' });
    expect(toast.error).toHaveBeenCalledTimes(1);

    await refetchStatus(client, { ...pendingPayment, status: 'PAYMENT_REVIEW', bookingStatus: 'expired' });
    await screen.findByText('booking.payment.review');
    expect(toast.error).toHaveBeenLastCalledWith('booking.payment.bookingNotConfirmed', 'booking.payment.review');
  });
});

