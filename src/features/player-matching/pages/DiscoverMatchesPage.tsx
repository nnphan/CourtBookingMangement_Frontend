import { Link, useNavigate, useParams } from 'react-router';
import { DiscoveryHeader } from '@/features/branch-discovery/components/DiscoveryHeader';
import { MatchFilters } from '../components/MatchFilters';
import { MatchList } from '../components/MatchList';
import { paths } from '@/app/router/paths';
import { ArrowLeft, Flame, Sparkles, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PlayerMatchDetailDialog } from '../components/PlayerMatchDetailDialog';

export const DiscoverMatchesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: matchId } = useParams<{ id: string }>();

  return (
    <div className="bg-surface selection:bg-brand-100 selection:text-brand-900 flex min-h-screen flex-col font-sans">
      {/* Top Header */}
      <DiscoveryHeader />

      {/* Main Container */}
      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb & Back Link */}
        <div className="text-content-secondary flex items-center gap-2 text-xs font-semibold">
          <Link
            to={paths.root}
            className="hover:text-brand-600 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>{t('playerMatch.discovery.home')}</span>
          </Link>
          <span>/</span>
          <span className="text-content-primary">Player Matching</span>
        </div>

        {/* Page Banner / Header */}
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-emerald-700 via-teal-700 to-cyan-800 p-6 text-white shadow-lg sm:p-10">
          <div className="pointer-events-none absolute -right-10 -bottom-10 size-60 rounded-full bg-white/10 blur-3xl" />
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold tracking-wider uppercase backdrop-blur-xs">
              <Flame className="size-3.5 fill-amber-300 text-amber-300" />
              <span>{t('playerMatch.discovery.community')}</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-4xl">
              {t('playerMatch.discovery.pageTitle')}
            </h1>
            <p className="text-xs leading-relaxed text-emerald-100 sm:text-base">
              {t('playerMatch.discovery.description')}
            </p>
            <div className="flex flex-wrap gap-4 pt-2 text-xs text-emerald-200">
              <div className="flex items-center gap-1.5">
                <Users className="size-4 text-emerald-300" />
                <span>{t('playerMatch.discovery.quickPairing')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="size-4 text-amber-300" />
                <span>{t('playerMatch.discovery.balancedSkill')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Section */}
        <section aria-label={t('playerMatch.discovery.filtersLabel')}>
          <MatchFilters />
        </section>

        <section aria-label={t('playerMatch.discovery.listLabel')}>
          <MatchList />
        </section>
        <PlayerMatchDetailDialog
          matchId={matchId}
          open={Boolean(matchId)}
          onOpenChange={(open) => {
            if (!open) navigate(paths.playerMatching, { replace: true });
          }}
        />
      </main>

      {/* Footer */}
      <footer className="border-line bg-surface mt-16 border-t py-8">
        <div className="text-content-secondary mx-auto max-w-7xl px-4 text-center text-xs sm:px-6 lg:px-8">
          <p>{t('playerMatch.discovery.footer')}</p>
        </div>
      </footer>
    </div>
  );
};

export default DiscoverMatchesPage;
