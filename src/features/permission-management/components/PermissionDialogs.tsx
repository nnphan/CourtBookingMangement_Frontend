import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { toast } from '@/lib/toast';
import { useLocaleFormatters } from '@/hooks/useLocaleFormatters';
import type { ApiErrorShape } from '@/types/api';
import { createPermission, deletePermission, getPermissionById, updatePermission } from '../api/permission.api';
import { PERMISSION_QUERY_KEYS } from '../api/permission.query';
import type {
  CreatePermissionRequest,
  Permission,
  UpdatePermissionRequest,
} from '../types/permission.types';

interface PermissionDialogProps {
  permission: Permission;
  onClose: () => void;
}

interface PermissionFormDialogProps {
  mode: 'create' | 'edit';
  permission?: Permission;
  onClose: () => void;
  onCreated?: () => void;
}

interface PermissionFormValues {
  code: string;
  name: string;
  description: string;
}

type SaveVariables =
  | { mode: 'create'; request: CreatePermissionRequest }
  | { mode: 'edit'; id: string; request: UpdatePermissionRequest };

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

export const PermissionFormDialog = ({
  mode,
  permission,
  onClose,
  onCreated,
}: PermissionFormDialogProps) => {
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
          .min(1, t('permission.validation.codeRequired'))
          .max(100, t('permission.validation.codeMax')),
        name: z
          .string()
          .trim()
          .min(1, t('permission.validation.nameRequired'))
          .max(150, t('permission.validation.nameMax')),
        description: z.string().trim(),
      }),
    [t],
  );
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<PermissionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: permission?.code ?? '',
      name: permission?.name ?? '',
      description: permission?.description ?? '',
    },
  });

  const saveMutation = useMutation({
    mutationFn: (variables: SaveVariables) =>
      variables.mode === 'create'
        ? createPermission(variables.request)
        : updatePermission(variables.id, variables.request),
    retry: false,
    onSuccess: async (_saved, variables) => {
      await queryClient.invalidateQueries({ queryKey: PERMISSION_QUERY_KEYS.lists() });
      if (variables.mode === 'edit') {
        await queryClient.invalidateQueries({
          queryKey: PERMISSION_QUERY_KEYS.detail(variables.id),
        });
      } else {
        onCreated?.();
      }
      toast.success(
        t('permission.successTitle'),
        t(variables.mode === 'create' ? 'permission.create.success' : 'permission.edit.success'),
      );
      onClose();
    },
    onError: (error) => {
      const details = getApiError(error);
      let hasKnownField = false;
      const unknownFields: string[] = [];

      for (const [field, message] of Object.entries(details.fields ?? {})) {
        const normalized = field.toLowerCase().replace(/[^a-z]/g, '');
        if (normalized === 'code') {
          setError('code', { type: 'server', message });
          hasKnownField = true;
        } else if (normalized === 'name') {
          setError('name', { type: 'server', message });
          hasKnownField = true;
        } else if (normalized === 'description') {
          setError('description', { type: 'server', message });
          hasKnownField = true;
        } else {
          unknownFields.push(message);
        }
      }

      const safeMessage =
        details.status !== undefined && details.status >= 500
          ? t(isEditing ? 'permission.error.update' : 'permission.error.create')
          : details.message ||
            t(isEditing ? 'permission.error.update' : 'permission.error.create');
      setFormError(unknownFields.join(' ') || (!hasKnownField ? safeMessage : ''));
      toast.error(t('permission.saveErrorTitle'), safeMessage);
    },
  });

  const submit = (values: PermissionFormValues) => {
    setFormError('');
    clearErrors();
    if (mode === 'create') {
      saveMutation.mutate({
        mode,
        request: {
          code: values.code.trim(),
          name: values.name.trim(),
          description: values.description.trim() || null,
        },
      });
      return;
    }

    if (!permission) return;
    saveMutation.mutate({
      mode,
      id: permission.id,
      request: {
        name: values.name.trim(),
        description: values.description.trim() || null,
      },
    });
  };

  const isPending = saveMutation.isPending;
  const codeError = errors.code?.message;
  const nameError = errors.name?.message;
  const descriptionError = errors.description?.message;

  return (
    <Dialog open onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent closeDisabled={isPending} className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t(isEditing ? 'permission.edit.title' : 'permission.create.title')}
          </DialogTitle>
          <DialogDescription>
            {t(isEditing ? 'permission.edit.description' : 'permission.create.description')}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(submit)}
          onChange={() => {
            if (formError) setFormError('');
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <label htmlFor="permission-code" className="text-sm font-medium text-slate-700">
              {t('permission.fields.code')}
            </label>
            <input
              id="permission-code"
              maxLength={100}
              readOnly={isEditing}
              aria-invalid={Boolean(codeError)}
              aria-describedby={codeError ? 'permission-code-error' : 'permission-code-help'}
              {...register('code')}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 read-only:bg-slate-50 read-only:text-slate-500"
              placeholder={t('permission.create.codePlaceholder')}
            />
            {codeError ? (
              <p id="permission-code-error" className="text-xs text-red-700" role="alert">
                {codeError}
              </p>
            ) : (
              <p id="permission-code-help" className="text-xs text-slate-500">
                {t('permission.create.codeHelp')}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="permission-name" className="text-sm font-medium text-slate-700">
              {t('permission.fields.name')}
            </label>
            <input
              id="permission-name"
              maxLength={150}
              aria-invalid={Boolean(nameError)}
              aria-describedby={nameError ? 'permission-name-error' : undefined}
              {...register('name')}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder={t('permission.create.namePlaceholder')}
            />
            {nameError && (
              <p id="permission-name-error" className="text-xs text-red-700" role="alert">
                {nameError}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="permission-description" className="text-sm font-medium text-slate-700">
              {t('permission.fields.description')}
            </label>
            <textarea
              id="permission-description"
              rows={3}
              aria-invalid={Boolean(descriptionError)}
              aria-describedby={descriptionError ? 'permission-description-error' : undefined}
              {...register('description')}
              className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder={t('permission.create.descriptionPlaceholder')}
            />
            {descriptionError && (
              <p id="permission-description-error" className="text-xs text-red-700" role="alert">
                {descriptionError}
              </p>
            )}
          </div>
          {formError && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">
              {formError}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              {t('permission.actions.cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 aria-hidden className="size-4 animate-spin" />
                  {t(isEditing ? 'permission.actions.saving' : 'permission.actions.creating')}
                </>
              ) : (
                t(isEditing ? 'permission.actions.save' : 'permission.actions.createSubmit')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const PermissionDetailDialog = ({ permission, onClose }: PermissionDialogProps) => {
  const { t } = useTranslation();
  const { formatDate } = useLocaleFormatters();
  const queryClient = useQueryClient();
  const notFoundHandled = useRef(false);
  const permissionQuery = useQuery({
    queryKey: PERMISSION_QUERY_KEYS.detail(permission.id),
    queryFn: ({ signal }) => getPermissionById(permission.id, signal),
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
  const details = permissionQuery.data;

  useEffect(() => {
    if (!permissionQuery.isError || !isNotFound(permissionQuery.error) || notFoundHandled.current) {
      return;
    }
    notFoundHandled.current = true;
    void queryClient.invalidateQueries({ queryKey: PERMISSION_QUERY_KEYS.lists() });
    toast.error(t('permission.detail.title'), t('permission.error.notFound'));
    onClose();
  }, [onClose, permissionQuery.error, permissionQuery.isError, queryClient, t]);

  const fields: Array<[string, string]> = details
    ? [
        [t('permission.fields.code'), details.code || '—'],
        [t('permission.fields.name'), details.name || '—'],
        [t('permission.fields.description'), details.description || '—'],
        [t('permission.fields.roleCount'), t('permission.roleCount', { count: details.roleCount })],
        [t('permission.fields.createdAt'), formatDate(details.createdAt, { withTime: true })],
        [t('permission.fields.updatedAt'), formatDate(details.updatedAt, { withTime: true })],
      ]
    : [];
  const traceId = getApiError(permissionQuery.error).traceId;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('permission.detail.title')}</DialogTitle>
          <DialogDescription>{permission.name}</DialogDescription>
        </DialogHeader>
        {permissionQuery.isLoading && (
          <p className="flex items-center gap-2 text-sm text-slate-500" role="status">
            <Loader2 aria-hidden className="size-4 animate-spin" />
            {t('permission.detail.loading')}
          </p>
        )}
        {permissionQuery.isError && !isNotFound(permissionQuery.error) && (
          <div className="space-y-2 rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">
            <p>{t('permission.error.detail')}</p>
            {traceId && <p className="text-xs">{t('permission.error.traceId', { traceId })}</p>}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => permissionQuery.refetch()}
            >
              {t('permission.actions.retry')}
            </Button>
          </div>
        )}
        {details && (
          <dl className="grid gap-3 sm:grid-cols-2">
            {fields.map(([label, value]) => (
              <div key={label} className="min-w-0 rounded-lg bg-slate-50 p-3">
                <dt className="text-xs font-medium text-slate-500">{label}</dt>
                <dd className="mt-1 break-words text-sm text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t('permission.actions.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const DeletePermissionDialog = ({
  permission,
  onClose,
  onDeleted,
}: PermissionDialogProps & { onDeleted: () => void }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: () => deletePermission(permission.id),
    retry: false,
    onSuccess: async () => {
      onDeleted();
      queryClient.removeQueries({ queryKey: PERMISSION_QUERY_KEYS.detail(permission.id) });
      await queryClient.invalidateQueries({ queryKey: PERMISSION_QUERY_KEYS.lists() });
      toast.success(t('permission.successTitle'), t('permission.delete.success'));
      onClose();
    },
    onError: async (error) => {
      const details = getApiError(error);
      const isInUse =
        details.status === 409 ||
        details.code?.toLowerCase() === 'permission.inuse' ||
        details.code?.toLowerCase() === 'permission_in_use';
      if (isInUse) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: PERMISSION_QUERY_KEYS.lists() }),
          queryClient.invalidateQueries({
            queryKey: PERMISSION_QUERY_KEYS.detail(permission.id),
          }),
        ]);
      }
      const message = isInUse
        ? details.message || t('permission.delete.inUseError')
        : details.status !== undefined && details.status >= 500
          ? t('permission.error.delete')
          : details.message || t('permission.error.delete');
      toast.error(t('permission.delete.errorTitle'), message);
    },
  });
  const isPending = deleteMutation.isPending;
  const inUse = permission.roleCount > 0;

  return (
    <Dialog open onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent closeDisabled={isPending}>
        <DialogHeader>
          <DialogTitle>{t('permission.delete.title')}</DialogTitle>
          <DialogDescription>
            {t(inUse ? 'permission.delete.inUseDescription' : 'permission.delete.description', {
              name: permission.name,
              code: permission.code,
              count: permission.roleCount,
            })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            {t('permission.actions.cancel')}
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
                {t('permission.actions.deleting')}
              </>
            ) : (
              t('permission.actions.delete')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
