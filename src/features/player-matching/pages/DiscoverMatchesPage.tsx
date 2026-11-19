import { useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { DiscoveryHeader } from '@/features/branch-discovery/components/DiscoveryHeader';
import { MatchFilters } from '../components/MatchFilters';
import { MatchList } from '../components/MatchList';
import { PersonalizedMatchFilters } from '../components/PersonalizedMatchFilters';
import { PersonalizedMatchResults } from '../components/PersonalizedMatchResults';
import { JoinMatchConfirmationDialog } from '../components/JoinMatchConfirmationDialog';
import { paths } from '@/app/router/paths';
import { ArrowLeft, Flame, Sparkles, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { PlayerMatchDetailDialog } from '../components/PlayerMatchDetailDialog';
import { useJoinPlayerMatch, usePersonalizedPlayerMatchSearch } from '../hooks/usePlayerMatching';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { toast } from '@/lib/toast';
import type {
  PersonalizedPlayerMatchSearchRequest,
  PlayerMatchJoinPreview,
  PlayerMatchListItem,
} from '../types/player-matching.types';

const getErrorStatus = (error: unknown): number | undefined => {
  if (typeof error !== 'object' || error === null || !('status' in error)) return undefined;
  return typeof error.status === 'number' ? error.status : undefined;
};

const getErrorMessage = (error: unknown): string | undefined => {
  if (typeof error !== 'object' || error === null || !('message' in error)) return undefined;
  return typeof error.message === 'string' && error.message !== 'error.network'
    ? error.message
    : undefined;
};

const getErrorCode = (error: unknown): string | undefined => {
  if (typeof error !== 'object' || error === null || !('code' in error)) return undefined;
  return typeof error.code === 'string' ? error.code : undefined;
};

export const DiscoverMatchesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { id: matchId } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const joinMutation = useJoinPlayerMatch();
  const searchMutation = usePersonalizedPlayerMatchSearch();
  const isSubmittingJoinRef = useRef(false);
  const [joinRequestStatuses, setJoinRequestStatuses] = useState<Record<string, string>>({});
  const [selectedMatchForJoin, setSelectedMatchForJoin] = useState<PlayerMatchJoinPreview | null>(
    null,
  );
  const [joinError, setJoinError] = useState<string>();
  const [discoveryMode, setDiscoveryMode] = useState<'personalized' | 'all'>('personalized');
  const [personalizedResponse, setPersonalizedResponse] = useState<Awaited<
    ReturnType<typeof searchMutation.mutateAsync>
  > | null>(null);
  const [searchErrorMessage, setSearchErrorMessage] = useState<string>();
  const [retryRequest, setRetryRequest] = useState<PersonalizedPlayerMatchSearchRequest>();
  const [lastSuccessfulSearch, setLastSuccessfulSearch] =
    useState<PersonalizedPlayerMatchSearchRequest>();

  const handleJoinMatch = (match: PlayerMatchJoinPreview) => {
    if (!isAuthenticated) {
      navigate(paths.login, { state: { from: location.pathname } });
      return;
    }
    const requestStatus =
      joinRequestStatuses[match.id] ??
      personalizedResponse?.data.items.find((item) => item.roomId === match.id)?.joinRequestStatus;
    if (requestStatus?.toUpperCase() === 'PENDING') return;
    setJoinError(undefined);
    setSelectedMatchForJoin(match);
  };

  const handleLegacyJoinMatch = (match: PlayerMatchListItem) => {
    handleJoinMatch({
      id: match.id,
      title: match.title,
      branchName: match.branchName,
      courtName: match.courtName,
      matchDate: match.matchDate,
      startTime: match.startTime,
      endTime: match.endTime,
      matchLabel: t(`playerMatch.skill.${match.skillLevel.toLowerCase()}`, {
        defaultValue: match.skillLevel,
      }),
      currentPlayers: match.currentPlayers,
      maxPlayers: match.maxPlayers,
      feePerPlayer: match.feePerPlayer,
    });
  };

  const handlePersonalizedSearch = async (request: PersonalizedPlayerMatchSearchRequest) => {
    setSearchErrorMessage(undefined);
    setRetryRequest({ ...request, saveAsDefault: false });
    try {
      const response = await searchMutation.mutateAsync(request);
      setPersonalizedResponse(response);
      setLastSuccessfulSearch({ ...request, saveAsDefault: false });
      setRetryRequest(undefined);
      if (request.saveAsDefault) {
        toast.success(
          t('playerMatch.scoring.defaultsSaved'),
          t('playerMatch.scoring.defaultsSavedDescription'),
        );
      }
    } catch (error) {
      const code = getErrorCode(error);
      const status = getErrorStatus(error);
      const message =
        code === 'PLAYER_MATCHING_PROFILE_REQUIRED'
          ? t('playerMatch.scoring.errors.profileRequired')
          : code === 'PLAYER_MATCHING_DISABLED'
            ? t('playerMatch.scoring.errors.matchingDisabled')
            : code === 'PREFERENCE_WEIGHT_TOTAL_INVALID'
              ? t('playerMatch.scoring.errors.invalidWeights')
              : code === 'SEARCH_CRITERIA_INVALID'
                ? t('playerMatch.scoring.errors.invalidCriteria')
                : status === 401
                  ? t('playerMatch.scoring.errors.unauthorized')
                  : t('playerMatch.scoring.errors.generic');
      setSearchErrorMessage(message);
    }
  };

  const handleRetrySearch = () => {
    if (retryRequest && !searchMutation.isPending) {
      void handlePersonalizedSearch(retryRequest);
    }
  };

  const handlePageChange = (page: number) => {
    if (!lastSuccessfulSearch || searchMutation.isPending) return;
    void handlePersonalizedSearch({
      ...lastSuccessfulSearch,
      page,
      saveAsDefault: false,
    });
  };

  const handleJoinDialogOpenChange = (open: boolean) => {
    if (open || joinMutation.isPending || isSubmittingJoinRef.current) return;
    setJoinError(undefined);
    setSelectedMatchForJoin(null);
  };

  const handleConfirmJoin = async (message: string) => {
    if (!selectedMatchForJoin || isSubmittingJoinRef.current) return;
    isSubmittingJoinRef.current = true;
    try {
      const result = await joinMutation.mutateAsync({
        matchId: selectedMatchForJoin.id,
        message,
      });
      const status = result.status.trim().toUpperCase();
      setJoinRequestStatuses((current) => ({
        ...current,
        [selectedMatchForJoin.id]: status,
      }));

      if (status === 'PENDING') {
        toast.success(t('playerMatch.join.success'), t('playerMatch.join.successDescription'));
      } else {
        toast.success(t('playerMatch.join.submitted'), result.message);
      }
      setJoinError(undefined);
      setSelectedMatchForJoin(null);
    } catch (error) {
      const status = getErrorStatus(error);
      const code = getErrorCode(error);
      if (status === 401) {
        navigate(paths.login, { state: { from: location.pathname } });
      }
      const errorMessage =
        code === 'PLAYER_MATCH.REQUEST_EXISTS'
          ? t('playerMatch.join.alreadyPending')
          : code === 'PLAYER_MATCH.MATCH_FULL'
            ? t('playerMatch.join.full')
            : code === 'PLAYER_MATCH.NOT_OPEN' || code === 'PLAYER_MATCH.REQUEST_STATE_CHANGED'
              ? t('playerMatch.join.unavailable')
              : getErrorMessage(error) ?? t('playerMatch.join.failed');
      if (code === 'PLAYER_MATCH.REQUEST_EXISTS') {
        setJoinRequestStatuses((current) => ({
          ...current,
          [selectedMatchForJoin.id]: 'PENDING',
        }));
      }
      setJoinError(errorMessage);
      toast.error(t('playerMatch.join.errorTitle'), errorMessage);
    } finally {
      isSubmittingJoinRef.current = false;
    }
  };

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

        <div
          role="group"
          aria-label={t('playerMatch.scoring.discoveryMode')}
          className="flex flex-wrap gap-2"
        >
          <Button
            type="button"
            variant={discoveryMode === 'personalized' ? 'primary' : 'outline'}
            aria-pressed={discoveryMode === 'personalized'}
            onClick={() => setDiscoveryMode('personalized')}
            className="min-h-11"
          >
            {t('playerMatch.scoring.personalizedMode')}
          </Button>
          <Button
            type="button"
            variant={discoveryMode === 'all' ? 'primary' : 'outline'}
            aria-pressed={discoveryMode === 'all'}
            onClick={() => setDiscoveryMode('all')}
            className="min-h-11"
          >
            {t('playerMatch.scoring.allMatchesMode')}
          </Button>
        </div>

        {discoveryMode === 'personalized' ? (
          <>
            <section aria-label={t('playerMatch.discovery.filtersLabel')}>
              <PersonalizedMatchFilters
                isAuthenticated={isAuthenticated}
                isSearching={searchMutation.isPending}
                onSearch={(request) => void handlePersonalizedSearch(request)}
              />
            </section>
            <section aria-label={t('playerMatch.scoring.resultsLabel')}>
              <PersonalizedMatchResults
                response={personalizedResponse}
                isLoading={searchMutation.isPending}
                errorMessage={searchErrorMessage}
                joinRequestStatuses={joinRequestStatuses}
                onJoinMatch={handleJoinMatch}
                onRetry={handleRetrySearch}
                onPageChange={handlePageChange}
              />
            </section>
          </>
        ) : (
          <>
            <section aria-label={t('playerMatch.discovery.filtersLabel')}>
              <MatchFilters />
            </section>

            <section aria-label={t('playerMatch.discovery.listLabel')}>
              <MatchList
                currentUserId={user?.id}
                joinRequestStatuses={joinRequestStatuses}
                onJoinMatch={handleLegacyJoinMatch}
              />
            </section>
          </>
        )}

        <JoinMatchConfirmationDialog
          match={selectedMatchForJoin}
          open={selectedMatchForJoin !== null}
          isPending={joinMutation.isPending}
          errorMessage={joinError}
          onOpenChange={handleJoinDialogOpenChange}
          onConfirm={handleConfirmJoin}
        />
        <PlayerMatchDetailDialog
          matchId={matchId}
          joinRequestStatus={
            matchId
              ? joinRequestStatuses[matchId] ??
                personalizedResponse?.data.items.find((item) => item.roomId === matchId)?.joinRequestStatus
              : undefined
          }
          onRequestJoin={handleJoinMatch}
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
