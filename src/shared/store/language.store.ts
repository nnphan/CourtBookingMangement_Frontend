import { create } from 'zustand';
import i18n from '@/i18n';

export type Language = 'en' | 'vi';

export interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

const getInitialLanguage = (): Language => {
  if (typeof window === 'undefined') return 'vi';
  const saved = localStorage.getItem('language');
  if (saved === 'en' || saved === 'vi') return saved;
  return 'vi';
};

export const useLanguageStore = create<LanguageState>((set) => ({
  language: getInitialLanguage(),
  setLanguage: (language: Language) => {
    localStorage.setItem('language', language);
    localStorage.setItem('i18nextLng', language);
    void i18n.changeLanguage(language);
    set({ language });
  },
}));
