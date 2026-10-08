import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { setDayjsLocale } from '@/lib/dayjs';
import {
  DEFAULT_LANGUAGE,
  DEFAULT_NAMESPACE,
  LANGUAGE_STORAGE_KEY,
  NAMESPACES,
  SUPPORTED_LANGUAGES,
  isSupportedLanguage,
  resources,
  type AppLanguage,
} from './resources';

const getInitialLanguage = (): AppLanguage => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (isSupportedLanguage(saved)) return saved;
  // Default to Vietnamese if no saved language is found
  localStorage.setItem(LANGUAGE_STORAGE_KEY, DEFAULT_LANGUAGE);
  return DEFAULT_LANGUAGE;
};

const initialLang = getInitialLanguage();

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    ns: [...NAMESPACES],
    defaultNS: DEFAULT_NAMESPACE,
    lng: initialLang,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: [...SUPPORTED_LANGUAGES],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ['localStorage'],
    },
  });

setDayjsLocale(initialLang);

i18n.on('languageChanged', (lng) => {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
  localStorage.setItem('i18nextLng', lng);
  setDayjsLocale(lng);
});

export * from './resources';
export * from './formatters';
export default i18n;
