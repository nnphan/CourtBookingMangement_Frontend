import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { StatusBadge } from '@/components/management';
import { toast } from '@/lib/toast';
import { useLocaleFormatters } from '@/hooks/useLocaleFormatters';
import type { ApiErrorShape } from '@/types/api';
import { createRole, deleteRole, getRoleById, updateRole } from '../api/role.api';
import { ROLE_QUERY_KEYS } from '../api/role.query';
import type { Role, RolePermissionSummary } from '../types/role.types';
import { RolePermissionSelector } from './RolePermissionSelector';

interface RoleDialogProps {
  role: Role;
  onClose: () => void;
}

interface RoleFormDialogProps {
  mode: 'create' | 'edit';
  role?: Role;
  onClose: () => void;
  onCreated?: () => void;
}

interface RoleFormValues {
  code: string;
  name: string;
  description: string;
  isActive: boolean;
  permissions: RolePermissionSummary[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getApiError = (error: unknown): Partial<ApiErrorShape> => {
  if (!isRecord(error)) return {};
  return {
    status: typeof error.status === 'number' ? error.status : undefined,
    code: typeof error.code === 'string' ? error.code : undefined,
    message: typeof error.message === 'string' ? error.message : undefined,
    fields: isRecord(error.fields)
      ? Object.fromEntries(
          Object.entries(error.fields).filter(
            (entry): entry is [string, string] => typeof entry[1] === 'string',
          ),
        )
      : undefined,
    traceId: typeof error.traceId === 'string' ? error.traceId : undefined,
  };
};

const isNotFound = (error: unknown) => getApiError(error).status === 404;

const uniqueIds = (permissions: RolePermissionSummary[]) => [
  ...new Set(permissions.map((permission) => permission.id)),
];

const groupByPrefix = (permissions: RolePermissionSummary[]) => {
  const groups = new Map<string, RolePermissionSummary[]>();
  for (const permission of permissions) {
    const index = permission.code.indexOf('.');
    const key = index > 0 ? permission.code.slice(0, index) : '';
    groups.set(key, [...(groups.get(key) ?? []), permission]);
  }
  return [...groups.entries()];
};

const SERVER_FIELD_MAP: Record<string, 'code' | 'name' | 'description' | 'isActive' | 'permissions'> =
  {
    code: 'code',
    name: 'name',
    description: 'description',
    isactive: 'isActive',
    permissionids: 'permissions',
  };

interface RoleFormProps {
  mode: 'create' | 'edit';
  role?: Role;
  onClose: () => void;
  onCreated?: () => void;
}

const RoleForm = ({ mode, role, onClose, onCreated }: RoleFormProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isEditing = mode === 'edit';
  const [formError, setFormError] = useState('');
  const schema = useMemo(
    () =>
      z.object({
        code: z
          .string()
          .trim()
          .min(1, t('role.validation.codeRequired'))
          .max(100, t('role.validation.codeMax')),
        name: z
          .string()
          .trim()
          .min(1, t('role.validation.nameRequired'))
          .max(150, t('role.validation.nameMax')),
        description: z.string().trim(),
        isActive: z.boolean(),
        permissions: z.array(
          z.object({
            id: z.string().uuid(t('role.validation.invalidPermission')),
            code: z.string(),
            name: z.string(),
            description: z.string().nullable(),
          }),
        ),
      }),
    [t],
  );
  const {
    register,
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: role?.code ?? '',
      name: role?.name ?? '',
      description: role?.description ?? '',
      isActive: role?.isActive ?? true,
      permissions: role?.permissions ?? [],
    },
  });

  const saveMutation = useMutation({
    mutationFn: (request: {
      code: string;
      name: string;
      description: string | null;
      isActive: boolean;
      permissionIds: string[];
    }) => (isEditing && role ? updateRole(role.id, request) : createRole(request)),
    retry: false,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ROLE_QUERY_KEYS.lists() });
      if (isEditing && role) {
        await queryClient.invalidateQueries({ queryKey: ROLE_QUERY_KEYS.detail(role.id) });
      } else {
        onCreated?.();
      }
      toast.success(
        t('role.successTitle'),
        t(isEditing ? 'role.edit.success' : 'role.create.success'),
      );
      onClose();
    },
    onError: (error) => {
      const details = getApiError(error);
      let hasKnownField = false;
      const unknownMessages: string[] = [];

      for (const [field, message] of Object.entries(details.fields ?? {})) {
        const target = SERVER_FIELD_MAP[field.toLowerCase().replace(/[^a-z]/g, '')];
        if (target === 'permissions') {
          unknownMessages.push(message);
        } else if (target) {
          setError(target, { type: 'server', message });
          hasKnownField = true;
        } else {
          unknownMessages.push(message);
        }
      }

      const fallback = t(isEditing ? 'role.error.update' : 'role.error.create');
      const safeMessage =
        details.status !== undefined && details.status >= 500
          ? fallback
          : details.message || fallback;
      setFormError(unknownMessages.join(' ') || (!hasKnownField ? safeMessage : ''));
      toast.error(t('role.saveErrorTitle'), safeMessage);
    },
  });

  const submit = (values: RoleFormValues) => {
    setFormError('');
    clearErrors();
    saveMutation.mutate({
      code: values.code.trim(),
      name: values.name.trim(),
      description: values.description.trim() || null,
      isActive: values.isActive,
      permissionIds: uniqueIds(values.permissions),
    });
  };

  const isPending = saveMutation.isPending;
  const codeError = errors.code?.message;
  const nameError = errors.name?.message;
  const descriptionError = errors.description?.message;
  const permissionsError = errors.permissions
    ? t('role.validation.invalidPermission')
    : undefined;

  return (
    <form
      onSubmit={handleSubmit(submit)}
      onChange={() => {
        if (formError) setFormError('');
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="role-code" className="text-sm font-medium text-slate-700">
            {t('role.fields.code')}
          </label>
          <input
            id="role-code"
            maxLength={100}
            readOnly={isEditing}
            aria-invalid={Boolean(codeError)}
            aria-describedby={codeError ? 'role-code-error' : 'role-code-help'}
            {...register('code')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 read-only:bg-slate-50 read-only:text-slate-500"
            placeholder={t('role.create.codePlaceholder')}
          />
          {codeError ? (
            <p id="role-code-error" className="text-xs text-red-700" role="alert">
              {codeError}
            </p>
          ) : (
            <p id="role-code-help" className="text-xs text-slate-500">
              {t(isEditing ? 'role.edit.codeHelp' : 'role.create.codeHelp')}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <label htmlFor="role-name" className="text-sm font-medium text-slate-700">
            {t('role.fields.name')}
          </label>
          <input
            id="role-name"
            maxLength={150}
            aria-invalid={Boolean(nameError)}
            aria-describedby={nameError ? 'role-name-error' : undefined}
            {...register('name')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder={t('role.create.namePlaceholder')}
          />
          {nameError && (
            <p id="role-name-error" className="text-xs text-red-700" role="alert">
              {nameError}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-1.5">
        <label htmlFor="role-description" className="text-sm font-medium text-slate-700">
          {t('role.fields.description')}
        </label>
        <textarea
          id="role-description"
          rows={3}
          aria-invalid={Boolean(descriptionError)}
          aria-describedby={descriptionError ? 'role-description-error' : undefined}
          {...register('description')}
          className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          placeholder={t('role.create.descriptionPlaceholder')}
        />
        {descriptionError && (
          <p id="role-description-error" className="text-xs text-red-700" role="alert">
            {descriptionError}
          </p>
        )}
      </div>
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          className="size-4 accent-emerald-600"
          {...register('isActive')}
        />
        {t('role.fields.isActive')}
      </label>

      <Controller
        control={control}
        name="permissions"
        render={({ field }) => (
          <RolePermissionSelector
            value={field.value}
            onChange={field.onChange}
            disabled={isPending}
          />
        )}
      />
      {permissionsError && (
        <p className="text-xs text-red-700" role="alert">
          {permissionsError}
        </p>
      )}

      {formError && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">
          {formError}
        </p>
      )}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
          {t('role.actions.cancel')}
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 aria-hidden className="size-4 animate-spin" />
              {t(isEditing ? 'role.actions.saving' : 'role.actions.creating')}
            </>
          ) : (
            t(isEditing ? 'role.actions.save' : 'role.actions.createSubmit')
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

export const RoleFormDialog = ({ mode, role, onClose, onCreated }: RoleFormDialogProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isEditing = mode === 'edit';
  const notFoundHandled = useRef(false);
  const detailQuery = useQuery({
    queryKey: ROLE_QUERY_KEYS.detail(role?.id ?? ''),
    queryFn: ({ signal }) => getRoleById(role?.id ?? '', signal),
    enabled: isEditing && Boolean(role),
    retry: 1,
  });

  useEffect(() => {
    if (!detailQuery.isError || !isNotFound(detailQuery.error) || notFoundHandled.current) return;
    notFoundHandled.current = true;
    void queryClient.invalidateQueries({ queryKey: ROLE_QUERY_KEYS.lists() });
    toast.error(t('role.edit.title'), t('role.error.notFound'));
    onClose();
  }, [detailQuery.error, detailQuery.isError, onClose, queryClient, t]);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t(isEditing ? 'role.edit.title' : 'role.create.title')}</DialogTitle>
          <DialogDescription>
            {t(isEditing ? 'role.edit.description' : 'role.create.description')}
          </DialogDescription>
        </DialogHeader>
        {!isEditing ? (
          <RoleForm mode="create" onClose={onClose} onCreated={onCreated} />
        ) : detailQuery.data ? (
          <RoleForm mode="edit" role={detailQuery.data} onClose={onClose} />
        ) : detailQuery.isError ? (
          <div className="space-y-2 rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">
            <p>{t('role.error.detail')}</p>
            <Button type="button" variant="outline" size="sm" onClick={() => detailQuery.refetch()}>
              {t('role.actions.retry')}
            </Button>
          </div>
        ) : (
          <p className="flex items-center gap-2 text-sm text-slate-500" role="status">
            <Loader2 aria-hidden className="size-4 animate-spin" />
            {t('role.detail.loading')}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export const RoleDetailDialog = ({ role, onClose }: RoleDialogProps) => {
  const { t } = useTranslation();
  const { formatDate } = useLocaleFormatters();
  const queryClient = useQueryClient();
  const notFoundHandled = useRef(false);
  const roleQuery = useQuery({
    queryKey: ROLE_QUERY_KEYS.detail(role.id),
    queryFn: ({ signal }) => getRoleById(role.id, signal),
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
  const details = roleQuery.data;

  useEffect(() => {
    if (!roleQuery.isError || !isNotFound(roleQuery.error) || notFoundHandled.current) return;
    notFoundHandled.current = true;
    void queryClient.invalidateQueries({ queryKey: ROLE_QUERY_KEYS.lists() });
    toast.error(t('role.detail.title'), t('role.error.notFound'));
    onClose();
  }, [onClose, roleQuery.error, roleQuery.isError, queryClient, t]);

  const fields: Array<[string, React.ReactNode]> = details
    ? [
        [t('role.fields.code'), details.code || '—'],
        [t('role.fields.name'), details.name || '—'],
        [t('role.fields.description'), details.description || '—'],
        [
          t('role.fields.isActive'),
          <StatusBadge status={details.isActive ? 'active' : 'inactive'}>
            {t(details.isActive ? 'role.status.active' : 'role.status.inactive')}
          </StatusBadge>,
        ],
        [t('role.fields.userCount'), t('role.userCount', { count: details.userCount })],
        [
          t('role.fields.permissionCount'),
          t('role.permissionCount', { count: details.permissionCount }),
        ],
        [t('role.fields.createdAt'), formatDate(details.createdAt, { withTime: true })],
        [t('role.fields.updatedAt'), formatDate(details.updatedAt, { withTime: true })],
      ]
    : [];
  const traceId = getApiError(roleQuery.error).traceId;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('role.detail.title')}</DialogTitle>
          <DialogDescription>{role.name}</DialogDescription>
        </DialogHeader>
        {roleQuery.isLoading && (
          <p className="flex items-center gap-2 text-sm text-slate-500" role="status">
            <Loader2 aria-hidden className="size-4 animate-spin" />
            {t('role.detail.loading')}
          </p>
        )}
        {roleQuery.isError && !isNotFound(roleQuery.error) && (
          <div className="space-y-2 rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">
            <p>{t('role.error.detail')}</p>
            {traceId && <p className="text-xs">{t('role.error.traceId', { traceId })}</p>}
            <Button type="button" variant="outline" size="sm" onClick={() => roleQuery.refetch()}>
              {t('role.actions.retry')}
            </Button>
          </div>
        )}
        {details && (
          <>
            <dl className="grid gap-3 sm:grid-cols-2">
              {fields.map(([label, value]) => (
                <div key={label} className="min-w-0 rounded-lg bg-slate-50 p-3">
                  <dt className="text-xs font-medium text-slate-500">{label}</dt>
                  <dd className="mt-1 break-words text-sm text-slate-900">{value}</dd>
                </div>
              ))}
            </dl>
            <section aria-labelledby="role-detail-permissions" className="space-y-2">
              <h3 id="role-detail-permissions" className="text-sm font-semibold text-slate-900">
                {t('role.detail.permissionsTitle')}
              </h3>
              {details.permissions.length === 0 ? (
                <p className="text-sm text-slate-500">{t('role.detail.noPermissions')}</p>
              ) : (
                <div className="max-h-64 space-y-3 overflow-y-auto">
                  {groupByPrefix(details.permissions).map(([group, permissions]) => (
                    <div key={group || 'other'}>
                      <p className="mb-1 text-xs font-semibold uppercase text-slate-500">
                        {group || t('role.permissions.otherGroup')}
                      </p>
                      <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                        {permissions.map((permission) => (
                          <li key={permission.id} className="px-3 py-2">
                            <p className="text-sm font-medium text-slate-900">{permission.name}</p>
                            <code className="font-mono text-xs text-slate-600">
                              {permission.code}
                            </code>
                            {permission.description && (
                              <p className="text-xs text-slate-500">{permission.description}</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t('role.actions.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const DeleteRoleDialog = ({
  role,
  onClose,
  onDeleted,
}: RoleDialogProps & { onDeleted: () => void }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: () => deleteRole(role.id),
    retry: false,
    onSuccess: async () => {
      onDeleted();
      queryClient.removeQueries({ queryKey: ROLE_QUERY_KEYS.detail(role.id) });
      await queryClient.invalidateQueries({ queryKey: ROLE_QUERY_KEYS.lists() });
      toast.success(t('role.successTitle'), t('role.delete.success'));
      onClose();
    },
    onError: async (error) => {
      const details = getApiError(error);
      const isInUse = details.status === 409;
      if (isInUse) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ROLE_QUERY_KEYS.lists() }),
          queryClient.invalidateQueries({ queryKey: ROLE_QUERY_KEYS.detail(role.id) }),
        ]);
      }
      const message = isInUse
        ? details.message || t('role.delete.inUseError')
        : details.status !== undefined && details.status >= 500
          ? t('role.error.delete')
          : details.message || t('role.error.delete');
      toast.error(t('role.delete.errorTitle'), message);
    },
  });
  const isPending = deleteMutation.isPending;
  const inUse = role.userCount > 0;

  return (
    <Dialog open onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent closeDisabled={isPending}>
        <DialogHeader>
          <DialogTitle>{t('role.delete.title')}</DialogTitle>
          <DialogDescription>
            {t(inUse ? 'role.delete.inUseDescription' : 'role.delete.description', {
              name: role.name,
              code: role.code,
              count: role.userCount,
            })}
          </DialogDescription>
        </DialogHeader>
        {role.permissionCount > 0 && (
          <p className="text-sm text-slate-600">
            {t('role.delete.permissionImpact', { count: role.permissionCount })}
          </p>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            {t('role.actions.cancel')}
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => deleteMutation.mutate()}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 aria-hidden className="size-4 animate-spin" />
                {t('role.actions.deleting')}
              </>
            ) : (
              t('role.actions.delete')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
