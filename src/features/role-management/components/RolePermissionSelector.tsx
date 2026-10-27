import { useEffect, useId, useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilterSearchInput } from '@/components/management';
import { getPermissions } from '@/features/permission-management/api/permission.api';
import { PERMISSION_QUERY_KEYS } from '@/features/permission-management/api/permission.query';
import type { PermissionSearchRequest } from '@/features/permission-management/types/permission.types';
import type { RolePermissionSummary } from '../types/role.types';

const PERMISSION_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;
const OTHER_GROUP = '__other__';

interface RolePermissionSelectorProps {
  value: RolePermissionSummary[];
  onChange: (value: RolePermissionSummary[]) => void;
  disabled?: boolean;
}

const getGroup = (code: string) => {
  const index = code.indexOf('.');
  return index > 0 ? code.slice(0, index) : OTHER_GROUP;
};

export const RolePermissionSelector = ({
  value,
  onChange,
  disabled,
}: RolePermissionSelectorProps) => {
  const { t } = useTranslation();
  const baseId = useId();
  const [searchInput, setSearchInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = searchInput.trim();
      setKeyword((previous) => {
        if (previous === next) return previous;
        setPageNumber(1);
        return next;
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const request = useMemo<PermissionSearchRequest>(
    () => ({ keyword: keyword || undefined, pageNumber, pageSize: PERMISSION_PAGE_SIZE }),
    [keyword, pageNumber],
  );
  const query = useQuery({
    queryKey: PERMISSION_QUERY_KEYS.list(request),
    queryFn: ({ signal }) => getPermissions(request, signal),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  const options = query.data?.data;
  const metadata = query.data?.metadata ?? null;
  const selectedIds = useMemo(() => new Set(value.map((item) => item.id)), [value]);

  const groups = useMemo(() => {
    const map = new Map<string, NonNullable<typeof options>>();
    for (const permission of options ?? []) {
      const key = getGroup(permission.code);
      map.set(key, [...(map.get(key) ?? []), permission]);
    }
    return [...map.entries()];
  }, [options]);

  const toggle = (permission: RolePermissionSummary) => {
    if (selectedIds.has(permission.id)) {
      onChange(value.filter((item) => item.id !== permission.id));
      return;
    }
    onChange([
      ...value,
      {
        id: permission.id,
        code: permission.code,
        name: permission.name,
        description: permission.description,
      },
    ]);
  };

  const groupLabel = (key: string) =>
    key === OTHER_GROUP ? t('role.permissions.otherGroup') : key;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span id={`${baseId}-label`} className="text-sm font-medium text-slate-700">
          {t('role.fields.permissions')}
        </span>
        <span className="text-xs font-medium text-slate-600" aria-live="polite">
          {t('role.permissions.selectedCount', { count: value.length })}
        </span>
      </div>

      <FilterSearchInput
        value={searchInput}
        onChange={setSearchInput}
        aria-label={t('role.permissions.searchAria')}
        placeholder={t('role.permissions.searchPlaceholder')}
        disabled={disabled}
        onKeyDown={(event) => {
          if (event.key === 'Enter') event.preventDefault();
        }}
      />

      <div
        role="group"
        aria-labelledby={`${baseId}-label`}
        className="max-h-64 overflow-y-auto rounded-lg border border-slate-200"
      >
        {query.isLoading ? (
          <p className="flex items-center gap-2 p-4 text-sm text-slate-500" role="status">
            <Loader2 aria-hidden className="size-4 animate-spin" />
            {t('role.permissions.loading')}
          </p>
        ) : query.isError ? (
          <div className="space-y-2 p-4 text-sm text-red-800" role="alert">
            <p>{t('role.permissions.loadError')}</p>
            <Button type="button" variant="outline" size="sm" onClick={() => query.refetch()}>
              {t('role.actions.retry')}
            </Button>
          </div>
        ) : groups.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">
            {t(keyword ? 'role.permissions.noResults' : 'role.permissions.noPermissions')}
          </p>
        ) : (
          groups.map(([key, permissions]) => (
            <div key={key}>
              <p className="sticky top-0 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase text-slate-500">
                {groupLabel(key)}
              </p>
              <ul>
                {permissions.map((permission) => {
                  const inputId = `${baseId}-${permission.id}`;
                  return (
                    <li key={permission.id}>
                      <label
                        htmlFor={inputId}
                        className="flex cursor-pointer items-start gap-3 px-3 py-2 hover:bg-slate-50"
                      >
                        <input
                          id={inputId}
                          type="checkbox"
                          className="mt-1 size-4 accent-emerald-600"
                          checked={selectedIds.has(permission.id)}
                          disabled={disabled}
                          onChange={() => toggle(permission)}
                        />
                        <span className="min-w-0">
                          <code className="block truncate font-mono text-xs text-slate-700">
                            {permission.code}
                          </code>
                          <span className="block truncate text-sm text-slate-900">
                            {permission.name}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </div>

      {metadata && metadata.totalPages > 1 && (
        <div className="flex items-center justify-between gap-2 text-xs text-slate-600">
          <span>
            {t('role.permissions.pageInfo', {
              page: metadata.pageNumber,
              total: metadata.totalPages,
              count: metadata.totalCount,
            })}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!metadata.hasPreviousPage || disabled}
              onClick={() => setPageNumber((current) => Math.max(1, current - 1))}
            >
              {t('role.permissions.previous')}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!metadata.hasNextPage || disabled}
              onClick={() => setPageNumber((current) => current + 1)}
            >
              {t('role.permissions.next')}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">
            {t('role.permissions.selected')}
          </span>
          {value.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => onChange([])}
            >
              {t('role.permissions.clearAll')}
            </Button>
          )}
        </div>
        {value.length === 0 ? (
          <p className="text-xs text-slate-500">{t('role.permissions.noneSelected')}</p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {value.map((permission) => (
              <li
                key={permission.id}
                className="inline-flex max-w-full items-center gap-1 rounded-full bg-emerald-50 py-0.5 pl-2.5 pr-1 text-xs text-emerald-800"
              >
                <code className="truncate font-mono">{permission.code}</code>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(value.filter((item) => item.id !== permission.id))}
                  aria-label={t('role.permissions.removeLabel', { code: permission.code })}
                  className="grid size-4 place-items-center rounded-full hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <X aria-hidden className="size-3" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
