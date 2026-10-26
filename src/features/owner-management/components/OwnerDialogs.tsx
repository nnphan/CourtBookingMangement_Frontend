import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/lib/toast';
import { useLocaleFormatters } from '@/hooks/useLocaleFormatters';
import { getUsers } from '@/features/user-management/api/user.api';
import { USER_QUERY_KEYS } from '@/features/user-management/api/user.query';
import type { UserListItem } from '@/features/user-management/types/user.types';
import { createOwner, deleteOwner, getOwner, updateOwner } from '../api/owner.api';
import { OWNER_QUERY_KEYS } from '../api/owner.query';
import type {
  CreateOwnerRequest,
  Owner,
  UpdateOwnerRequest,
} from '../types/owner.types';

interface OwnerDialogProps {
  owner: Owner;
  onClose: () => void;
}

interface OwnerFormDialogProps {
  owner: Owner | null;
  onClose: () => void;
}

type OwnerFormField = 'userId' | 'businessName' | 'taxId';
type OwnerFormErrors = Partial<Record<OwnerFormField, string>>;
type SelectedUserSummary = Pick<UserListItem, 'id' | 'fullName' | 'email' | 'phoneNumber'>;

const MIN_USER_SEARCH_LENGTH = 2;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getMutationError = (error: unknown) => {
  if (!isRecord(error)) return { message: '', fields: {} };

  const message = typeof error.message === 'string' ? error.message : '';
  const rawFields = isRecord(error.fields) ? error.fields : {};
  const fields: OwnerFormErrors = {};

  for (const [key, value] of Object.entries(rawFields)) {
    if (typeof value !== 'string') continue;
    const normalizedKey = key.toLowerCase().replace(/[^a-z]/g, '');
    if (normalizedKey === 'userid') fields.userId = value;
    if (normalizedKey === 'businessname') fields.businessName = value;
    if (normalizedKey === 'taxid') fields.taxId = value;
  }
  return { message, fields };
};

export const OwnerFormDialog = ({ owner, onClose }: OwnerFormDialogProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isEditing = Boolean(owner);
  const [userKeyword, setUserKeyword] = useState('');
  const [debouncedUserKeyword, setDebouncedUserKeyword] = useState('');
  const [selectedUser, setSelectedUser] = useState<SelectedUserSummary | null>(null);
  const [activeUserIndex, setActiveUserIndex] = useState(-1);
  const [formErrors, setFormErrors] = useState<OwnerFormErrors>({});

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedUserKeyword(userKeyword.trim()),
      300,
    );
    return () => window.clearTimeout(timer);
  }, [userKeyword]);

  const normalizedUserKeyword = userKeyword.trim();
  const hasMinimumUserKeyword =
    normalizedUserKeyword.length >= MIN_USER_SEARCH_LENGTH;
  const isUserSearchSettled =
    hasMinimumUserKeyword && normalizedUserKeyword === debouncedUserKeyword;

  const usersQuery = useQuery({
    queryKey: USER_QUERY_KEYS.page({
      pageNumber: 1,
      pageSize: 10,
      keyword: debouncedUserKeyword,
    }),
    queryFn: () => getUsers({ pageNumber: 1, pageSize: 10, keyword: debouncedUserKeyword }),
    enabled: !owner && isUserSearchSettled,
    staleTime: 60 * 1000,
    retry: 1,
  });

  const invalidateOwnerData = async () => {
    await queryClient.invalidateQueries({ queryKey: OWNER_QUERY_KEYS.lists() });
    if (owner) {
      await queryClient.invalidateQueries({ queryKey: OWNER_QUERY_KEYS.detail(owner.id) });
    }
    toast.success(
      t('ownerManagement.successTitle'),
      t(isEditing ? 'ownerManagement.updateSuccess' : 'ownerManagement.createSuccess'),
    );
    onClose();
  };

  const createMutation = useMutation({
    mutationFn: (request: CreateOwnerRequest) => createOwner(request),
    retry: false,
    onSuccess: invalidateOwnerData,
    onError: (error) => {
      const details = getMutationError(error);
      setFormErrors(details.fields);
      toast.error(
        t('ownerManagement.saveErrorTitle'),
        details.message || t('ownerManagement.saveError'),
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateOwnerRequest }) =>
      updateOwner(id, request),
    retry: false,
    onSuccess: invalidateOwnerData,
    onError: (error) => {
      const details = getMutationError(error);
      setFormErrors(details.fields);
      toast.error(
        t('ownerManagement.saveErrorTitle'),
        details.message || t('ownerManagement.saveError'),
      );
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;
  const users = usersQuery.data?.data ?? [];
  const isUserSearchLoading =
    hasMinimumUserKeyword &&
    (!isUserSearchSettled || (usersQuery.isFetching && !usersQuery.isError));
  const isUserSearchPanelOpen =
    isUserSearchSettled && !usersQuery.isFetching && !usersQuery.isError && users.length > 0;

  const selectUser = (user: UserListItem) => {
    setSelectedUser({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
    });
    setUserKeyword('');
    setActiveUserIndex(-1);
    setFormErrors((current) => ({ ...current, userId: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const businessName = String(formData.get('businessName') ?? '').trim();
    const taxId = String(formData.get('taxId') ?? '').trim();
    const isActive = formData.get('isActive') === 'on';
    const errors: OwnerFormErrors = {};

    if (!owner && !selectedUser) errors.userId = t('ownerManagement.userRequired');
    if (!businessName) errors.businessName = t('ownerManagement.businessRequired');
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    const request = { businessName, taxId: taxId || undefined, isActive };
    if (owner) {
      updateMutation.mutate({ id: owner.id, request });
      return;
    }

    if (!selectedUser) {
      setFormErrors({ userId: t('ownerManagement.userRequired') });
      return;
    }
    createMutation.mutate({ ...request, userId: selectedUser.id });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent closeDisabled={isPending} className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t(isEditing ? 'ownerManagement.editTitle' : 'ownerManagement.createTitle')}
          </DialogTitle>
          <DialogDescription>
            {t(isEditing ? 'ownerManagement.editDescription' : 'ownerManagement.createDescription')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {owner && (
            <div className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-500">
                {t('ownerManagement.linkedUser')}
              </p>
              <p className="truncate text-sm font-semibold text-slate-900">
                {owner.fullName || owner.email}
              </p>
              <p className="truncate text-xs text-slate-600">{owner.email}</p>
              {owner.phoneNumber && (
                <p className="text-xs text-slate-600">{owner.phoneNumber}</p>
              )}
            </div>
          )}
          {!owner && (
            <div className="space-y-2">
              <label htmlFor="owner-user-search" className="text-sm font-medium text-slate-700">
                {t('ownerManagement.user')}
              </label>
              <div className="relative">
                <Search
                  aria-hidden
                  className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="owner-user-search"
                  type="search"
                  role="combobox"
                  value={userKeyword}
                  onChange={(event) => {
                    setUserKeyword(event.target.value);
                    setSelectedUser(null);
                    setActiveUserIndex(-1);
                    setFormErrors((current) => ({ ...current, userId: undefined }));
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowDown' && isUserSearchSettled && users.length > 0) {
                      event.preventDefault();
                      setActiveUserIndex((current) =>
                        current < 0 || current === users.length - 1 ? 0 : current + 1,
                      );
                    } else if (
                      event.key === 'ArrowUp' &&
                      isUserSearchSettled &&
                      users.length > 0
                    ) {
                      event.preventDefault();
                      setActiveUserIndex((current) =>
                        current <= 0 ? users.length - 1 : current - 1,
                      );
                    } else if (
                      event.key === 'Enter' &&
                      isUserSearchSettled &&
                      activeUserIndex >= 0 &&
                      users[activeUserIndex]
                    ) {
                      event.preventDefault();
                      selectUser(users[activeUserIndex]);
                    } else if (event.key === 'Escape') {
                      setUserKeyword('');
                      setActiveUserIndex(-1);
                    }
                  }}
                  placeholder={t('ownerManagement.userSearch')}
                  autoComplete="off"
                  aria-autocomplete="list"
                  aria-expanded={isUserSearchPanelOpen}
                  aria-controls={isUserSearchPanelOpen ? 'owner-user-results' : undefined}
                  aria-activedescendant={
                    isUserSearchPanelOpen && activeUserIndex >= 0 && users[activeUserIndex]
                      ? `owner-user-option-${activeUserIndex}`
                      : undefined
                  }
                  aria-invalid={Boolean(formErrors.userId)}
                  aria-describedby={
                    formErrors.userId
                      ? 'owner-user-search-error'
                      : hasMinimumUserKeyword
                        ? undefined
                        : 'owner-user-search-hint'
                  }
                  className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              {selectedUser ? (
                <div className="flex items-start justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {selectedUser.fullName || selectedUser.email}
                    </p>
                    <p className="truncate text-xs text-slate-600">{selectedUser.email}</p>
                    {selectedUser.phoneNumber && (
                      <p className="text-xs text-slate-600">{selectedUser.phoneNumber}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(null);
                      setUserKeyword('');
                    }}
                  >
                    {t('ownerManagement.changeUser')}
                  </Button>
                </div>
              ) : !hasMinimumUserKeyword ? (
                <p
                  id="owner-user-search-hint"
                  className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600"
                >
                  {normalizedUserKeyword
                    ? t('ownerManagement.minUserSearchLength', {
                        minLength: MIN_USER_SEARCH_LENGTH,
                      })
                    : t('ownerManagement.userSearchHint')}
                </p>
              ) : isUserSearchLoading ? (
                <p className="flex items-center gap-2 p-2 text-sm text-slate-500">
                  <Loader2 aria-hidden className="size-4 animate-spin" />
                  <span role="status" aria-live="polite">
                    {t('ownerManagement.searchingUsers')}
                  </span>
                </p>
              ) : usersQuery.isError ? (
                <div
                  role="alert"
                  className="flex items-center justify-between gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-800"
                >
                  <span>{t('ownerManagement.userSearchError')}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => usersQuery.refetch()}
                  >
                    {t('ownerManagement.retry')}
                  </Button>
                </div>
              ) : users.length === 0 ? (
                <p role="status" className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                  {t('ownerManagement.noUsers')}
                </p>
              ) : (
                <ul
                  id="owner-user-results"
                  role="listbox"
                  aria-label={t('ownerManagement.userResults')}
                  className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-1"
                >
                  {users.map((user, index) => (
                    <li
                      key={user.id}
                      id={`owner-user-option-${index}`}
                      role="option"
                      aria-selected={activeUserIndex === index}
                      onMouseDown={(event) => event.preventDefault()}
                      onMouseEnter={() => setActiveUserIndex(index)}
                      onClick={() => selectUser(user)}
                      className={`cursor-pointer rounded-md px-3 py-2 text-left ${
                        activeUserIndex === index ? 'bg-emerald-50' : 'hover:bg-emerald-50'
                      }`}
                    >
                      <span className="block truncate text-sm font-medium text-slate-900">
                        {user.fullName || user.email}
                      </span>
                      <span className="block truncate text-xs text-slate-600">{user.email}</span>
                      {user.phoneNumber && (
                        <span className="block text-xs text-slate-500">{user.phoneNumber}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-slate-500">{t('ownerManagement.userEligibilityNote')}</p>
              {formErrors.userId && (
                <p id="owner-user-search-error" className="text-xs text-red-700" role="alert">
                  {formErrors.userId}
                </p>
              )}
            </div>
          )}
          <div className="space-y-1.5">
            <label htmlFor="owner-business-name" className="text-sm font-medium text-slate-700">
              {t('ownerManagement.businessName')}
            </label>
            <input
              id="owner-business-name"
              name="businessName"
              defaultValue={owner?.businessName ?? ''}
              required
              onChange={() =>
                setFormErrors((current) => ({ ...current, businessName: undefined }))
              }
              aria-invalid={Boolean(formErrors.businessName)}
              aria-describedby={formErrors.businessName ? 'owner-business-error' : undefined}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            {formErrors.businessName && (
              <p id="owner-business-error" className="text-xs text-red-700" role="alert">
                {formErrors.businessName}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="owner-tax-id" className="text-sm font-medium text-slate-700">
              {t('ownerManagement.taxId')}
            </label>
            <input
              id="owner-tax-id"
              name="taxId"
              defaultValue={owner?.taxId ?? ''}
              onChange={() => setFormErrors((current) => ({ ...current, taxId: undefined }))}
              aria-invalid={Boolean(formErrors.taxId)}
              aria-describedby={formErrors.taxId ? 'owner-tax-error' : undefined}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            {formErrors.taxId && (
              <p id="owner-tax-error" className="text-xs text-red-700" role="alert">
                {formErrors.taxId}
              </p>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              name="isActive"
              type="checkbox"
              defaultChecked={owner?.isActive ?? true}
              className="size-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
            />
            {t('ownerManagement.active')}
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              {t('ownerManagement.cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 aria-hidden className="size-4 animate-spin" />
                  {t('ownerManagement.saving')}
                </>
              ) : (
                t(isEditing ? 'ownerManagement.save' : 'ownerManagement.create')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const OwnerDetailDialog = ({ owner, onClose }: OwnerDialogProps) => {
  const { t } = useTranslation();
  const { formatDate } = useLocaleFormatters();
  const ownerQuery = useQuery({
    queryKey: OWNER_QUERY_KEYS.detail(owner.id),
    queryFn: () => getOwner(owner.id),
    staleTime: 2 * 60 * 1000,
  });
  const details = ownerQuery.data;
  const missing = t('ownerManagement.missing');
  const fields: Array<[string, string | null | undefined]> = details
    ? [
        [t('ownerManagement.userId'), details.userId],
        [t('ownerManagement.fullName'), details.fullName],
        [t('ownerManagement.email'), details.email],
        [t('ownerManagement.phone'), details.phoneNumber],
        [t('ownerManagement.businessName'), details.businessName],
        [t('ownerManagement.taxId'), details.taxId],
        [
          t('ownerManagement.status'),
          t(details.isActive ? 'ownerManagement.active' : 'ownerManagement.inactive'),
        ],
        [t('ownerManagement.createdAt'), formatDate(details.createdAt)],
        [t('ownerManagement.updatedAt'), formatDate(details.updatedAt)],
      ]
    : [];

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('ownerManagement.detailTitle')}</DialogTitle>
          <DialogDescription>{owner.fullName || owner.email}</DialogDescription>
        </DialogHeader>
        {ownerQuery.isLoading && (
          <p className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 aria-hidden className="size-4 animate-spin" />
            {t('ownerManagement.loadingDetails')}
          </p>
        )}
        {ownerQuery.isError && (
          <div className="flex items-center justify-between gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">
            <span>{t('ownerManagement.detailError')}</span>
            <Button type="button" variant="outline" size="sm" onClick={() => ownerQuery.refetch()}>
              {t('ownerManagement.retry')}
            </Button>
          </div>
        )}
        {details && (
          <dl className="grid gap-3 sm:grid-cols-2">
            {fields.map(([label, value]) => (
              <div key={label} className="min-w-0 rounded-lg bg-slate-50 p-3">
                <dt className="text-xs font-medium text-slate-500">{label}</dt>
                <dd className="mt-1 break-words text-sm text-slate-900">{value || missing}</dd>
              </div>
            ))}
          </dl>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t('ownerManagement.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const DeleteOwnerDialog = ({ owner, onClose }: OwnerDialogProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: () => deleteOwner(owner.id),
    retry: false,
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: OWNER_QUERY_KEYS.detail(owner.id) });
      await queryClient.invalidateQueries({ queryKey: OWNER_QUERY_KEYS.lists() });
      toast.success(t('ownerManagement.successTitle'), t('ownerManagement.deleteSuccess'));
      onClose();
    },
    onError: (error) => {
      const details = getMutationError(error);
      toast.error(
        t('ownerManagement.deleteErrorTitle'),
        details.message || t('ownerManagement.deleteError'),
      );
    },
  });

  return (
    <Dialog open onOpenChange={(open) => !open && !deleteMutation.isPending && onClose()}>
      <DialogContent closeDisabled={deleteMutation.isPending}>
        <DialogHeader>
          <DialogTitle>{t('ownerManagement.deleteTitle')}</DialogTitle>
          <DialogDescription>
            {t('ownerManagement.deleteConfirm', { owner: owner.fullName || owner.email })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={deleteMutation.isPending}
          >
            {t('ownerManagement.cancel')}
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 aria-hidden className="size-4 animate-spin" />
                {t('ownerManagement.deleting')}
              </>
            ) : (
              t('ownerManagement.delete')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
