export interface BookingActionCapabilitiesInput {
  bookingStatus?: string | null;
  paymentStatus?: string | null;
  totalAmount?: number | null;
  paidAmount?: number | null;
  remainingAmount?: number | null;
  mode?: 'ADMIN' | 'CUSTOMER';
  checkedIn?: boolean;
}

export interface BookingActionCapabilities {
  normalizedStatus: string;
  isPending: boolean;
  isConfirmed: boolean;
  isCheckedIn: boolean;
  isCompleted: boolean;
  isCancelled: boolean;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  isFullyPaid: boolean;
  canCheckIn: boolean;
  canCheckOut: boolean;
  canPay: boolean;
  canEdit: boolean;
  canCancel: boolean;
  isReadOnly: boolean;
}

export function getBookingActionCapabilities(
  input: BookingActionCapabilitiesInput
): BookingActionCapabilities {
  const mode = input.mode ?? 'ADMIN';
  const rawStatus = (input.bookingStatus || '').trim().toUpperCase();

  const isPending = rawStatus === 'PENDING' || rawStatus === 'WAITING';
  const isConfirmed = rawStatus === 'CONFIRMED';
  const isCheckedIn =
    rawStatus === 'CHECKED_IN' ||
    rawStatus === 'CHECKEDIN' ||
    rawStatus === 'PLAYING' ||
    Boolean(input.checkedIn);
  const isCompleted = rawStatus === 'COMPLETED';
  const isCancelled = rawStatus === 'CANCELLED' || rawStatus === 'CANCELED';

  const totalAmount = Math.max(0, input.totalAmount ?? 0);
  const paidAmount = Math.max(0, input.paidAmount ?? 0);
  const calculatedRemaining = Math.max(0, totalAmount - paidAmount);
  const remainingAmount =
    input.remainingAmount !== undefined && input.remainingAmount !== null
      ? Math.max(0, input.remainingAmount)
      : calculatedRemaining;

  const paymentStatusUpper = (input.paymentStatus || '').trim().toUpperCase();
  const isFullyPaid = paymentStatusUpper === 'PAID' || remainingAmount <= 0;

  const isStaff = mode !== 'CUSTOMER';
  const isTerminal = isCompleted || isCancelled;

  const normalizedStatus = isCompleted
    ? 'COMPLETED'
    : isCancelled
    ? 'CANCELLED'
    : isCheckedIn
    ? 'CHECKED_IN'
    : isConfirmed
    ? 'CONFIRMED'
    : isPending
    ? 'PENDING'
    : rawStatus;

  return {
    normalizedStatus,
    isPending,
    isConfirmed,
    isCheckedIn,
    isCompleted,
    isCancelled,
    totalAmount,
    paidAmount,
    remainingAmount,
    isFullyPaid,
    isReadOnly: !isStaff || isTerminal,
    canCheckIn: isStaff && !isTerminal && (isConfirmed || isPending) && !isCheckedIn,
    canCheckOut: isStaff && !isTerminal && isCheckedIn,
    canPay: isStaff && !isTerminal && !isFullyPaid,
    canEdit: isStaff && !isTerminal && (isPending || isConfirmed),
    canCancel: isStaff && !isTerminal,
  };
}

