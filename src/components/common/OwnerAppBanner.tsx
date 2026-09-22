import { useTranslation } from 'react-i18next';
import { env } from '@/lib/env';

/** Gold-cornered promo pointing court owners and staff to the ALOBO app. */
export const OwnerAppBanner = () => {
  const { t } = useTranslation();
  return (
    <a
      href={env.ownerAppUrl}
      target="_blank"
      rel="noreferrer"
      className="relative block w-full overflow-hidden rounded-[var(--radius-card)] bg-surface px-6 py-5 text-center shadow-[var(--shadow-card)]"
    >
      <span aria-hidden className="absolute left-0 top-0 h-full w-14 bg-accent-gold/90 [clip-path:polygon(0_0,100%_0,0_100%)]" />
      <span aria-hidden className="absolute right-0 bottom-0 h-full w-14 bg-accent-gold/90 [clip-path:polygon(100%_100%,100%_0,0_100%)]" />
      <span className="relative text-[15px] font-semibold leading-6 text-brand-600 underline decoration-1 underline-offset-4">
        {t('auth.login.ownerBanner')}
      </span>
    </a>
  );
};
