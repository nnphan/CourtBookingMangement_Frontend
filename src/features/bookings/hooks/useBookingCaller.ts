import { useAuthStore } from '@/features/auth/store/auth.store';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';

export type BookingCallerMode = 'loading' | 'authenticated' | 'guest';

export interface BookingCaller {
  mode: BookingCallerMode;
  /** Authenticated account profile; the authoritative identity for a signed-in caller. */
  customerName: string;
  phoneNumber: string;
  /** Signed-in caller without a phone number: must complete profile, never downgraded to Guest. */
  profileIncomplete: boolean;
}

/** Resolves authenticated vs Guest only after auth hydration to avoid flashing Guest fields. */
export const useBookingCaller = (): BookingCaller => {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const { user, isLoading } = useCurrentUser();

  if (!hasHydrated) {
    return { mode: 'loading', customerName: '', phoneNumber: '', profileIncomplete: false };
  }
  if (!isAuthenticated) {
    return { mode: 'guest', customerName: '', phoneNumber: '', profileIncomplete: false };
  }

  const customerName = user?.fullName?.trim() ?? '';
  const phoneNumber = user?.phoneNumber?.trim() ?? '';
  if (!user && isLoading) {
    return { mode: 'loading', customerName, phoneNumber, profileIncomplete: false };
  }
  return {
    mode: 'authenticated',
    customerName,
    phoneNumber,
    profileIncomplete: !customerName || !phoneNumber,
  };
};
