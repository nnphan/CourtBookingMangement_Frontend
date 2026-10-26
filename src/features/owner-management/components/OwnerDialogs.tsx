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
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [formErrors, setFormErrors] = useState<OwnerFormErrors>({});

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedUserKeyword(userKeyword.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [userKeyword]);

  const usersQuery = useQuery({
    queryKey: USER_QUERY_KEYS.page({
      pageNumber: 1,
      pageSize: 10,
      keyword: debouncedUserKeyword,
    }),
    queryFn: () => getUsers({ pageNumber: 1, pageSize: 10, keyword: debouncedUserKeyword }),
    enabled: !owner,
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

  const users = usersQuery.data?.data ?? [];

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
                  value={userKeyword}
                  onChange={(event) => {
                    setUserKeyword(event.target.value);
                    setSelectedUser(null);
                    setFormErrors((current) => ({ ...current, userId: undefined }));
                  }}
                  placeholder={t('ownerManagement.userSearch')}
                  autoComplete="off"
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
                    onClick={() => setSelectedUser(null)}
                  >
                    {t('ownerManagement.changeUser')}
                  </Button>
                </div>
              ) : usersQuery.isLoading ? (
                <p className="flex items-center gap-2 p-2 text-sm text-slate-500">
                  <Loader2 aria-hidden className="size-4 animate-spin" />
                  {t('ownerManagement.loadingUsers')}
                </p>
              ) : usersQuery.isError ? (
                <div className="flex items-center justify-between gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">
                  <span>{t('ownerManagement.usersLoadError')}</span>
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
                <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                  {t('ownerManagement.noUsers')}
                </p>
              ) : (
                <ul
                  aria-label={t('ownerManagement.userResults')}
                  className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-1"
                >
                  {users.map((user) => (
                    <li key={user.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUser(user);
                          setFormErrors((current) => ({ ...current, userId: undefined }));
                        }}
                        className="w-full rounded-md px-3 py-2 text-left hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                      >
                        <span className="block truncate text-sm font-medium text-slate-900">
                          {user.fullName || user.email}
                        </span>
                        <span className="block truncate text-xs text-slate-600">{user.email}</span>
                        {user.phoneNumber && (
                          <span className="block text-xs text-slate-500">
                            {user.phoneNumber}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-slate-500">{t('ownerManagement.userEligibilityNote')}</p>
              {formErrors.userId && (
                <p className="text-xs text-red-700" role="alert">
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
