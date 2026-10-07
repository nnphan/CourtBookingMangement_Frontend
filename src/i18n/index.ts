import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import vi from './locales/vi.json';
import en from './locales/en.json';
import { setDayjsLocale } from '@/lib/dayjs';

const getInitialLanguage = (): 'vi' | 'en' => {
  if (typeof window === 'undefined') return 'vi';
  const saved = localStorage.getItem('language');
  if (saved === 'en' || saved === 'vi') return saved;
  // Default to Vietnamese if no saved language is found
  localStorage.setItem('language', 'vi');
  return 'vi';
};

const initialLang = getInitialLanguage();

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { vi: { translation: vi }, en: { translation: en } },
    lng: initialLang,
    fallbackLng: 'vi',
    supportedLngs: ['vi', 'en'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'language',
      caches: ['localStorage'],
    },
  });

setDayjsLocale(initialLang);

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
  localStorage.setItem('i18nextLng', lng);
  setDayjsLocale(lng);
});

export default i18n;
