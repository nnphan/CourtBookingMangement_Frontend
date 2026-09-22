import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export const LanguageSwitcher = ({ className }: { className?: string }) => {
  const { i18n } = useTranslation();
  const current = i18n.language.startsWith('vi') ? 'vi' : 'en';

  return (
    <div className={cn('inline-flex rounded-[var(--radius-pill)] bg-white/15 p-0.5', className)}>
      {(['vi', 'en'] as const).map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={() => void i18n.changeLanguage(lng)}
          aria-pressed={current === lng}
          className={cn(
            'h-8 rounded-[var(--radius-pill)] px-3 text-sm font-semibold uppercase transition-colors',
            current === lng ? 'bg-surface text-brand-600' : 'text-content-onbrand/80',
          )}
        >
          {lng}
        </button>
      ))}
    </div>
  );
};
