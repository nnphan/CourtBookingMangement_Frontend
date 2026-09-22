import { useTranslation } from 'react-i18next';
import type { ApiErrorShape } from '@/types/api';

const CODE_TO_KEY: Record<string, string> = {
  INVALID_CREDENTIALS: 'auth.errors.invalidCredentials',
  UNKNOWN: 'auth.errors.network',
  ERR_NETWORK: 'auth.errors.network',
};

/** Turns a shaped API error into a sentence that says what to do next. */
export const useApiErrorMessage = () => {
  const { t, i18n } = useTranslation();
  return (error: unknown): string | undefined => {
    if (!error) return undefined;
    const e = error as ApiErrorShape;
    const key = CODE_TO_KEY[e.code];
    if (key) return t(key);
    if (e.message && i18n.exists(e.message)) return t(e.message);
    return e.message || t('auth.errors.network');
  };
};
