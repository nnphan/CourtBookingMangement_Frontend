import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

/** Strips non-digits and a leading 0 so `090 123 4567` -> `901234567`. */
export const normalizePhone = (raw: string) => raw.replace(/\D/g, '').replace(/^0+/, '');

/** Groups a VN mobile number for display: `901234567` -> `901 234 567`. */
export const formatPhone = (raw: string) =>
  normalizePhone(raw).replace(/(\d{3})(\d{0,3})(\d{0,4})/, (_m, a, b, c) =>
    [a, b, c].filter(Boolean).join(' '),
  );
