import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { useLanguageStore, type Language } from '@/shared/store/language.store';
import { cn } from '@/lib/utils';
import { LanguageDropdown } from './LanguageDropdown';

export interface LanguageSwitcherProps {
  className?: string;
  variant?: 'default' | 'contrast' | 'compact';
  showIcon?: boolean;
  /** `toggle` renders inline VI | EN buttons; `dropdown` renders a 🌐 menu with flags. */
  mode?: 'toggle' | 'dropdown';
}

export const LanguageSwitcher = memo(
  ({ className, variant = 'default', showIcon = true, mode = 'toggle' }: LanguageSwitcherProps) => {
    const { i18n } = useTranslation();
    const { language, setLanguage } = useLanguageStore();

    // Current active language (fallback to i18n if store not yet synced)
    const currentLang: Language =
      language || (i18n.language.startsWith('vi') ? 'vi' : 'en');

    const handleSelectLanguage = (lang: Language) => {
      if (currentLang !== lang) {
        setLanguage(lang);
      }
    };

    const isContrast = variant === 'contrast';

    if (mode === 'dropdown') {
      return (
        <LanguageDropdown className={className} variant={isContrast ? 'contrast' : 'default'} />
      );
    }

    return (
      <div
        role="radiogroup"
        aria-label="Language selector"
        className={cn(
          'inline-flex items-center gap-1 rounded-full p-1 transition-colors select-none',
          isContrast
            ? 'bg-white/15 border border-white/20 text-white'
            : 'bg-surface-muted/80 border border-line text-content-secondary shadow-2xs',
          className,
        )}
      >
        {showIcon && (
          <div
            className={cn(
              'hidden sm:grid size-6 place-items-center rounded-full pl-0.5',
              isContrast ? 'text-white/80' : 'text-content-secondary',
            )}
            aria-hidden="true"
          >
            <Globe className="size-3.5" />
          </div>
        )}

        <div className="flex items-center gap-0.5">
          {/* Vietnamese Button */}
          <button
            type="button"
            role="radio"
            aria-checked={currentLang === 'vi'}
            aria-label="Switch language to Vietnamese"
            onClick={() => handleSelectLanguage('vi')}
            className={cn(
              'h-7 rounded-full px-2.5 text-xs font-bold transition-all duration-200 cursor-pointer',
              'focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1',
              currentLang === 'vi'
                ? isContrast
                  ? 'bg-white text-brand-900 shadow-xs font-black'
                  : 'bg-surface text-brand-600 shadow-xs font-black border border-line/60'
                : isContrast
                  ? 'text-white/80 hover:text-white hover:bg-white/10'
                  : 'text-content-secondary hover:text-content-primary hover:bg-line/40',
            )}
          >
            VI
          </button>

          <span
            className={cn(
              'text-[10px] font-medium select-none px-0.5',
              isContrast ? 'text-white/40' : 'text-line-strong',
            )}
            aria-hidden="true"
          >
            |
          </span>

          {/* English Button */}
          <button
            type="button"
            role="radio"
            aria-checked={currentLang === 'en'}
            aria-label="Switch language to English"
            onClick={() => handleSelectLanguage('en')}
            className={cn(
              'h-7 rounded-full px-2.5 text-xs font-bold transition-all duration-200 cursor-pointer',
              'focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1',
              currentLang === 'en'
                ? isContrast
                  ? 'bg-white text-brand-900 shadow-xs font-black'
                  : 'bg-surface text-brand-600 shadow-xs font-black border border-line/60'
                : isContrast
                  ? 'text-white/80 hover:text-white hover:bg-white/10'
                  : 'text-content-secondary hover:text-content-primary hover:bg-line/40',
            )}
          >
            EN
          </button>
        </div>
      </div>
    );
  },
);

LanguageSwitcher.displayName = 'LanguageSwitcher';

export default LanguageSwitcher;
