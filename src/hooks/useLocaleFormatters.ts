import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  formatDateByLocale,
  formatNumberByLocale,
  resolveLanguage,
  type FormatDateOptions,
} from '@/i18n';

/**
 * Locale-aware formatters bound to the current UI language.
 * Components using this hook re-render automatically when the language changes.
 */
export const useLocaleFormatters = () => {
  const { i18n } = useTranslation();
  const language = resolveLanguage(i18n.resolvedLanguage ?? i18n.language);

  const formatDate = useCallback(
    (value: string | number | Date | null | undefined, options?: FormatDateOptions) =>
      formatDateByLocale(value, language, options),
    [language],
  );

  const formatNumber = useCallback(
    (value: number | null | undefined, options?: Intl.NumberFormatOptions) =>
      formatNumberByLocale(value, language, options),
    [language],
  );

  return { language, formatDate, formatNumber };
};
