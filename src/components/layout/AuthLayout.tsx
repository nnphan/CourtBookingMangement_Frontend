import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

/**
 * Full-bleed green canvas with the wave motif, a centred screen title and a
 * back affordance. Content is centred and capped at the 600px card width.
 */
export const AuthLayout = ({ title, children }: { title: string; children: ReactNode }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="auth-canvas relative min-h-dvh w-full overflow-hidden">
      {/* Wave motif — decorative only */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <g fill="none" stroke="#ffffff" strokeOpacity="0.07" strokeWidth="2">
          <path d="M-100 120C260 -20 900 40 1540 -60" />
          <path d="M-100 170C260 30 900 90 1540 -10" />
          <path d="M-100 220C260 80 900 140 1540 40" />
        </g>
        <path
          d="M0 760C280 700 520 830 760 812C1000 794 1240 690 1440 700V900H0Z"
          fill="#ffffff"
          fillOpacity="0.06"
        />
        <path
          d="M0 836C300 790 560 892 820 872C1080 852 1280 790 1440 800V900H0Z"
          fill="#ffffff"
          fillOpacity="0.05"
        />
      </svg>

      <header className="relative z-10 flex h-14 items-center px-2 pt-[env(safe-area-inset-top,0px)] sm:h-16">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label={t('common.back')}
          className="grid size-11 place-items-center rounded-full text-content-onbrand transition-colors hover:bg-white/10"
        >
          <ChevronLeft aria-hidden className="size-6" strokeWidth={2.5} />
        </button>
        <h1 className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-[17px] font-bold text-content-onbrand sm:text-lg">
          {title}
        </h1>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-[600px] flex-col items-center px-4 pb-[calc(3rem+env(safe-area-inset-bottom,0px))] pt-6 sm:pt-10">
        {children}
      </main>
    </div>
  );
};
