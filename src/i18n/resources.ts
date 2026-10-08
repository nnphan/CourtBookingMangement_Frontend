import enTranslation from './locales/en.json';
import viTranslation from './locales/vi.json';
import enBranch from './locales/en/branch.json';
import viBranch from './locales/vi/branch.json';

export const SUPPORTED_LANGUAGES = ['vi', 'en'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: AppLanguage = 'vi';
export const LANGUAGE_STORAGE_KEY = 'language';

export const NAMESPACES = ['translation', 'branch'] as const;
export const DEFAULT_NAMESPACE = 'translation';

export const resources = {
  en: { translation: enTranslation, branch: enBranch },
  vi: { translation: viTranslation, branch: viBranch },
} as const;

export const isSupportedLanguage = (value: unknown): value is AppLanguage =>
  typeof value === 'string' && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);

/** Normalizes i18next language codes (e.g. "en-US") to a supported app language. */
export const resolveLanguage = (lng?: string | null): AppLanguage => {
  if (!lng) return DEFAULT_LANGUAGE;
  const base = lng.split('-')[0];
  return isSupportedLanguage(base) ? base : DEFAULT_LANGUAGE;
};
