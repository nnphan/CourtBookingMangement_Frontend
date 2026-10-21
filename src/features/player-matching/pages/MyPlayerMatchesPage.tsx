import type { ReactNode } from 'react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Loader2, Search, UsersRound } from 'lucide-react';
import { DiscoveryHeader } from '@/features/branch-discovery/components/DiscoveryHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { paths } from '@/app/router/paths';
import { MatchCardSkeleton } from '../components/MatchCardSkeleton';
import {
  HostedPlayerMatchCard,
  ParticipatingPlayerMatchCard,
} from '../components/MyPlayerMatchCards';
import { useHostedPlayerMatches, useParticipatingPlayerMatches } from '../hooks/usePlayerMatching';
import { PlayerMatchDetailDialog } from '../components/PlayerMatchDetailDialog';

const PAGE_SIZE = 10;

type MatchesTab = 'hosted' | 'participating';

const FilterLabel = ({ children, htmlFor }: { children: ReactNode; htmlFor: string }) => (
  <label htmlFor={htmlFor} className="text-content-secondary grid gap-1.5 text-xs font-semibold">
    {children}
  </label>
);

const SelectFilter = ({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) => (
  <FilterLabel htmlFor={id}>
    {label}
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="border-line bg-surface text-content-primary focus-visible:ring-brand-500 h-10 w-full rounded-lg border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
    >
      {options.map((option) => (
        <option key={option.value || 'all'} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </FilterLabel>
);

const DateFilter = ({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <FilterLabel htmlFor={id}>
    {label}
    <input
      id={id}
      type="date"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="border-line bg-surface text-content-primary focus-visible:ring-brand-500 h-10 w-full rounded-lg border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
    />
  </FilterLabel>
);

const MatchPagination = ({
  page,
  totalPages,
  isFetching,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  isFetching: boolean;
  onPageChange: (page: number) => void;
}) => {
  const { t } = useTranslation();
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label={t('playerMatch.myMatches.pagination')}
      className="flex items-center justify-center gap-3 pt-2"
    >
      <Button
        type="button"
        variant="outline"
        disabled={page <= 1 || isFetching}
        onClick={() => onPageChange(page - 1)}
      >
        {t('playerMatch.discovery.previous')}
      </Button>
      <span className="text-content-secondary text-sm tabular-nums">
        {t('playerMatch.discovery.pageOf', { page, totalPages })}
      </span>
      <Button
        type="button"
        variant="outline"
        disabled={page >= totalPages || isFetching}
        onClick={() => onPageChange(page + 1)}
      >
        {t('playerMatch.discovery.next')}
      </Button>
    </nav>
  );
};

const HostedMatchesPanel = ({ onViewDetails }: { onViewDetails: (id: string) => void }) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [keywordDraft, setKeywordDraft] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const query = useHostedPlayerMatches({
    status: status || undefined,
    matchDate: matchDate || undefined,
    keyword: keyword || undefined,
    page,
    pageSize: PAGE_SIZE,
  });
  const matches = query.data?.data ?? [];
  const metadata = query.data?.metadata;

  return (
    <div className="space-y-5">
      <div className="border-line bg-surface-muted/50 grid gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-3">
        <SelectFilter
          id="hosted-match-status"
          label={t('playerMatch.myMatches.statusFilter')}
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          options={[
            { value: '', label: t('playerMatch.myMatches.allStatuses') },
            { value: 'OPEN', label: t('playerMatch.myMatches.status.open') },
            { value: 'FULL', label: t('playerMatch.myMatches.status.full') },
            { value: 'COMPLETED', label: t('playerMatch.myMatches.status.completed') },
            { value: 'CANCELLED', label: t('playerMatch.myMatches.status.cancelled') },
          ]}
        />
        <DateFilter
          id="hosted-match-date"
          label={t('playerMatch.myMatches.matchDate')}
          value={matchDate}
          onChange={(value) => {
            setMatchDate(value);
            setPage(1);
          }}
        />
        <form
          className="flex items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            setKeyword(keywordDraft.trim());
            setPage(1);
          }}
        >
          <label
            htmlFor="hosted-match-keyword"
            className="text-content-secondary grid min-w-0 flex-1 gap-1.5 text-xs font-semibold"
          >
            {t('playerMatch.myMatches.keyword')}
            <input
              id="hosted-match-keyword"
              type="search"
              value={keywordDraft}
              onChange={(event) => setKeywordDraft(event.target.value)}
              className="border-line bg-surface text-content-primary focus-visible:ring-brand-500 h-10 w-full rounded-lg border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
            />
          </label>
          <Button type="submit" className="h-10 gap-2">
            <Search aria-hidden="true" className="size-4" />
            {t('playerMatch.myMatches.search')}
          </Button>
        </form>
      </div>

      <p className="border-brand-200 bg-brand-50 text-brand-900 rounded-lg border px-4 py-3 text-sm">
        {t('playerMatch.myMatches.requestReviewUnavailable')}
      </p>

      {query.isLoading && !query.data ? (
        <MatchCardSkeleton count={3} />
      ) : query.isError ? (
        <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p role="alert" className="text-danger text-sm font-semibold">
            {t('playerMatch.myMatches.loadError')}
          </p>
          <Button type="button" variant="outline" onClick={() => void query.refetch()}>
            {t('playerMatch.discovery.retry')}
          </Button>
        </div>
      ) : matches.length === 0 ? (
        <p className="border-line bg-surface text-content-secondary rounded-xl border p-8 text-center">
          {t('playerMatch.myMatches.hostedEmpty')}
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-content-secondary text-sm">
              {t('playerMatch.myMatches.matchCount', {
                count: metadata?.totalCount ?? 0,
              })}
            </p>
            {query.isFetching && (
              <span
                role="status"
                className="text-content-secondary inline-flex items-center gap-2 text-xs"
              >
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                {t('playerMatch.discovery.updating')}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {matches.map((match) => (
              <HostedPlayerMatchCard key={match.id} match={match} onViewDetails={onViewDetails} />
            ))}
          </div>
        </>
      )}
      {metadata && (
        <MatchPagination
          page={metadata.pageNumber}
          totalPages={metadata.totalPages}
          isFetching={query.isFetching}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};

const ParticipatingMatchesPanel = ({ onViewDetails }: { onViewDetails: (id: string) => void }) => {
  const { t } = useTranslation();
  const [participationStatus, setParticipationStatus] = useState('');
  const [matchStatus, setMatchStatus] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [page, setPage] = useState(1);
  const query = useParticipatingPlayerMatches({
    participationStatus: participationStatus || undefined,
    matchStatus: matchStatus || undefined,
    fromDate: fromDate || undefined,
    page,
    pageSize: PAGE_SIZE,
  });
  const matches = query.data?.data ?? [];
  const metadata = query.data?.metadata;

  return (
    <div className="space-y-5">
      <div className="border-line bg-surface-muted/50 grid gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-3">
        <SelectFilter
          id="participation-status"
          label={t('playerMatch.myMatches.participationStatus')}
          value={participationStatus}
          onChange={(value) => {
            setParticipationStatus(value);
            setPage(1);
          }}
          options={[
            { value: '', label: t('playerMatch.myMatches.allStatuses') },
            { value: 'PENDING', label: t('playerMatch.myMatches.participation_pending') },
            { value: 'APPROVED', label: t('playerMatch.myMatches.participation_approved') },
            { value: 'REJECTED', label: t('playerMatch.myMatches.participation_rejected') },
          ]}
        />
        <SelectFilter
          id="participating-match-status"
          label={t('playerMatch.myMatches.matchStatus')}
          value={matchStatus}
          onChange={(value) => {
            setMatchStatus(value);
            setPage(1);
          }}
          options={[
            { value: '', label: t('playerMatch.myMatches.allStatuses') },
            { value: 'OPEN', label: t('playerMatch.myMatches.status.open') },
            { value: 'FULL', label: t('playerMatch.myMatches.status.full') },
            { value: 'COMPLETED', label: t('playerMatch.myMatches.status.completed') },
            { value: 'CANCELLED', label: t('playerMatch.myMatches.status.cancelled') },
          ]}
        />
        <DateFilter
          id="participating-from-date"
          label={t('playerMatch.myMatches.fromDate')}
          value={fromDate}
          onChange={(value) => {
            setFromDate(value);
            setPage(1);
          }}
        />
      </div>

      {query.isLoading && !query.data ? (
        <MatchCardSkeleton count={3} />
      ) : query.isError ? (
        <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p role="alert" className="text-danger text-sm font-semibold">
            {t('playerMatch.myMatches.loadError')}
          </p>
          <Button type="button" variant="outline" onClick={() => void query.refetch()}>
            {t('playerMatch.discovery.retry')}
          </Button>
        </div>
      ) : matches.length === 0 ? (
        <p className="border-line bg-surface text-content-secondary rounded-xl border p-8 text-center">
          {t('playerMatch.myMatches.participatingEmpty')}
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-content-secondary text-sm">
              {t('playerMatch.myMatches.matchCount', {
                count: metadata?.totalCount ?? 0,
              })}
            </p>
            {query.isFetching && (
              <span
                role="status"
                className="text-content-secondary inline-flex items-center gap-2 text-xs"
              >
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                {t('playerMatch.discovery.updating')}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {matches.map((match) => (
              <ParticipatingPlayerMatchCard
                key={match.matchId}
                match={match}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>
        </>
      )}
      {metadata && (
        <MatchPagination
          page={metadata.pageNumber}
          totalPages={metadata.totalPages}
          isFetching={query.isFetching}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};

export const MyPlayerMatchesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedMatchId, setSelectedMatchId] = useState<string>();
  const activeTab: MatchesTab =
    searchParams.get('tab') === 'participating' ? 'participating' : 'hosted';

  const handleTabChange = (tab: string) => {
    if (tab !== 'hosted' && tab !== 'participating') return;
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set('tab', tab);
      return next;
    });
  };

  const handleViewDetails = (matchId: string) => {
    setSelectedMatchId(matchId);
  };

  return (
    <div className="bg-surface-muted/50 text-content-primary flex min-h-screen flex-col">
      <DiscoveryHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="text-content-secondary flex items-center gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => navigate(paths.playerMatching)}
            className="hover:text-brand-600 inline-flex items-center gap-1 transition-colors"
          >
            <ArrowLeft aria-hidden="true" className="size-3.5" />
            {t('playerMatch.myMatches.discoverMatches')}
          </button>
        </div>

        <section className="border-line bg-surface rounded-2xl border p-5 shadow-xs sm:p-7">
          <div className="flex items-start gap-3">
            <div className="bg-brand-50 text-brand-700 grid size-11 shrink-0 place-items-center rounded-xl">
              <UsersRound aria-hidden="true" className="size-5" />
            </div>
            <div>
              <h1 className="text-content-primary text-2xl font-extrabold sm:text-3xl">
                {t('playerMatch.myMatches.title')}
              </h1>
              <p className="text-content-secondary mt-1 text-sm">
                {t('playerMatch.myMatches.subtitle')}
              </p>
            </div>
          </div>
        </section>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-5">
          <TabsList aria-label={t('playerMatch.myMatches.tabsLabel')} className="rounded-xl">
            <TabsTrigger value="hosted">{t('playerMatch.myMatches.hostedTab')}</TabsTrigger>
            <TabsTrigger value="participating">
              {t('playerMatch.myMatches.participatingTab')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="hosted">
            {activeTab === 'hosted' && <HostedMatchesPanel onViewDetails={handleViewDetails} />}
          </TabsContent>
          <TabsContent value="participating">
            {activeTab === 'participating' && (
              <ParticipatingMatchesPanel onViewDetails={handleViewDetails} />
            )}
          </TabsContent>
        </Tabs>
        <PlayerMatchDetailDialog
          matchId={selectedMatchId}
          open={Boolean(selectedMatchId)}
          onOpenChange={(open) => {
            if (!open) setSelectedMatchId(undefined);
          }}
        />
      </main>
    </div>
  );
};

export default MyPlayerMatchesPage;
