import { create } from 'zustand';
import i18n, {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  isSupportedLanguage,
  type AppLanguage,
} from '@/i18n';

export type Language = AppLanguage;

export interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

const getInitialLanguage = (): Language => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return isSupportedLanguage(saved) ? saved : DEFAULT_LANGUAGE;
};

export const useLanguageStore = create<LanguageState>((set) => ({
  language: getInitialLanguage(),
  setLanguage: (language: Language) => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    localStorage.setItem('i18nextLng', language);
    void i18n.changeLanguage(language);
    set({ language });
  },
}));
