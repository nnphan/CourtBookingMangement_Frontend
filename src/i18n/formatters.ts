import dayjs from '@/lib/dayjs';
import { resolveLanguage, type AppLanguage } from './resources';

const INTL_LOCALES: Record<AppLanguage, string> = {
  en: 'en-US',
  vi: 'vi-VN',
};

const DATE_FORMATS: Record<AppLanguage, { date: string; dateTime: string }> = {
  en: { date: 'MMM DD, YYYY', dateTime: 'MMM DD, YYYY HH:mm' },
  vi: { date: 'DD/MM/YYYY', dateTime: 'DD/MM/YYYY HH:mm' },
};

export const getIntlLocale = (lng?: string | null): string => INTL_LOCALES[resolveLanguage(lng)];

export interface FormatDateOptions {
  withTime?: boolean;
  /** Fallback text when the value is empty or not a valid date. */
  fallback?: string;
}

/**
 * Formats a date according to the active UI language.
 * en → "Oct 07, 2026", vi → "07/10/2026"
 */
export const formatDateByLocale = (
  value: string | number | Date | null | undefined,
  lng?: string | null,
  { withTime = false, fallback = '—' }: FormatDateOptions = {},
): string => {
  if (value === null || value === undefined || value === '') return fallback;
  const date = dayjs(value);
  if (!date.isValid()) return fallback;

  const language = resolveLanguage(lng);
  const pattern = withTime ? DATE_FORMATS[language].dateTime : DATE_FORMATS[language].date;
  return date.locale(language).format(pattern);
};

const numberFormatterCache = new Map<string, Intl.NumberFormat>();

/**
 * Formats a number according to the active UI language.
 * en → "1,200", vi → "1.200"
 */
export const formatNumberByLocale = (
  value: number | null | undefined,
  lng?: string | null,
  options?: Intl.NumberFormatOptions,
): string => {
  if (value === null || value === undefined || Number.isNaN(value)) return '0';

  const locale = getIntlLocale(lng);
  const cacheKey = `${locale}|${options ? JSON.stringify(options) : ''}`;
  let formatter = numberFormatterCache.get(cacheKey);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    numberFormatterCache.set(cacheKey, formatter);
  }
  return formatter.format(value);
};
