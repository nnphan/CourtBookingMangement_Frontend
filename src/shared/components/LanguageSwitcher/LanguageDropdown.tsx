import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ChevronDown, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguageStore, type Language } from '@/shared/store/language.store';
import { cn } from '@/lib/utils';

interface LanguageOption {
  code: Language;
  flag: string;
  shortLabel: string;
  nativeLabel: string;
}

// Native labels are intentionally not translated so users can always find their language.
const LANGUAGE_OPTIONS: readonly LanguageOption[] = [
  { code: 'en', flag: '🇺🇸', shortLabel: 'EN', nativeLabel: 'English' },
  { code: 'vi', flag: '🇻🇳', shortLabel: 'VI', nativeLabel: 'Tiếng Việt' },
];

export interface LanguageDropdownProps {
  className?: string;
  variant?: 'default' | 'contrast';
  align?: 'start' | 'center' | 'end';
}

export const LanguageDropdown = memo(
  ({ className, variant = 'default', align = 'end' }: LanguageDropdownProps) => {
    const { t } = useTranslation();
    const { language, setLanguage } = useLanguageStore();

    const current = LANGUAGE_OPTIONS.find((opt) => opt.code === language) ?? LANGUAGE_OPTIONS[1]!;
    const isContrast = variant === 'contrast';

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={t('common.language')}
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-xl px-2.5 text-xs font-bold transition-colors select-none',
              'focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-1',
              isContrast
                ? 'bg-white/15 text-white hover:bg-white/25 focus-visible:ring-white/60'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-emerald-500',
              className,
            )}
          >
            <Globe
              aria-hidden
              className={cn('size-3.5', isContrast ? 'text-emerald-200' : 'text-slate-500')}
            />
            <span aria-hidden className="text-sm leading-none">
              {current.flag}
            </span>
            <span>{current.shortLabel}</span>
            <ChevronDown aria-hidden className="size-3 opacity-70" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align={align} className="w-44 rounded-xl">
          <DropdownMenuLabel className="flex items-center gap-1.5">
            <Globe aria-hidden className="size-3.5" />
            {t('common.language')}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {LANGUAGE_OPTIONS.map((opt) => {
            const isSelected = opt.code === current.code;
            return (
              <DropdownMenuItem
                key={opt.code}
                lang={opt.code}
                onClick={() => {
                  if (!isSelected) setLanguage(opt.code);
                }}
                className={cn('flex items-center gap-2', isSelected && 'font-bold text-emerald-700')}
              >
                <span aria-hidden className="text-base leading-none">
                  {opt.flag}
                </span>
                <span className="flex-1">{opt.nativeLabel}</span>
                {isSelected && <Check aria-hidden className="size-3.5 text-emerald-600" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
);

LanguageDropdown.displayName = 'LanguageDropdown';
