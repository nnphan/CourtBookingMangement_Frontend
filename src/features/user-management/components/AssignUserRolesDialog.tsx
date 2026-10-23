import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Check, Loader2, ShieldCheck } from 'lucide-react';
import dayjs from '@/lib/dayjs';
import { Badge } from '@/components/ui/badge';
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
import { assignUserRoles, getRoles, getUserRoles } from '../api/user.api';
import { ROLE_QUERY_KEYS, USER_QUERY_KEYS } from '../api/user.query';
import type { RoleListItem, UserListItem } from '../types/user.types';
import { RoleBadges } from './RoleBadges';

interface AssignUserRolesDialogProps {
  user: UserListItem;
  isOpen: boolean;
  onClose: () => void;
}

export const AssignUserRolesDialog = ({
  user,
  isOpen,
  onClose,
}: AssignUserRolesDialogProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(() => new Set());
  const rolesQuery = useQuery({
    queryKey: ROLE_QUERY_KEYS.list(),
    queryFn: getRoles,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
  const userRolesQuery = useQuery({
    queryKey: USER_QUERY_KEYS.roles(user.id),
    queryFn: () => getUserRoles(user.id),
    enabled: isOpen && Boolean(user.id),
    staleTime: 60 * 1000,
    retry: 1,
  });
  const assignMutation = useMutation({
    mutationFn: (roleIds: string[]) => assignUserRoles(user.id, { roleIds }),
    onSuccess: async () => {
      toast.success(t('userManagement.successTitle'), t('userManagement.successDescription'));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.list() }),
        queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.roles(user.id) }),
        queryClient.invalidateQueries({ queryKey: ROLE_QUERY_KEYS.list() }),
      ]);
    },
    onError: (error) => {
      const status = 'status' in error ? error.status : undefined;
      const message =
        status === 403
          ? t('userManagement.forbidden')
          : status === 404
            ? t('userManagement.notFound')
            : status === 409
              ? t('userManagement.conflict')
              : status === 400
                ? t('userManagement.invalidRequest')
                : t('userManagement.assignError');
      toast.error(
        t('userManagement.assignErrorTitle'),
        message,
      );
    },
  });

  const assignedRoleIds = useMemo(
    () =>
      new Set([
        ...user.roles.map((role) => role.id),
        ...(userRolesQuery.data ?? []).map((role) => role.roleId),
      ]),
    [user.roles, userRolesQuery.data],
  );
  const availableRoles = (rolesQuery.data ?? []).filter(
    (role) => role.isActive && !assignedRoleIds.has(role.id),
  );
  const currentDetails = userRolesQuery.data ?? [];
  const canSubmit =
    selectedRoleIds.size > 0 &&
    !rolesQuery.isLoading &&
    !rolesQuery.isError &&
    !userRolesQuery.isLoading &&
    !userRolesQuery.isError &&
    !assignMutation.isPending;

  const toggleRole = (roleId: string, checked: boolean) => {
    setSelectedRoleIds((previous) => {
      const next = new Set(previous);
      if (checked) next.add(roleId);
      else next.delete(roleId);
      return next;
    });
  };

  const submit = async () => {
    if (!canSubmit) return;
    try {
      await assignMutation.mutateAsync([...selectedRoleIds]);
      setSelectedRoleIds(new Set());
      onClose();
    } catch {
      // The mutation reports a safe toast; keep the dialog and selection intact.
    }
  };

  const formatAssignedAt = (value: string | null) =>
    value && dayjs(value).isValid()
      ? dayjs(value).format('DD/MM/YYYY HH:mm')
      : t('userManagement.unassigned');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !assignMutation.isPending && onClose()}>
      <DialogContent
        closeDisabled={assignMutation.isPending}
        className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto p-4 sm:p-6"
      >
        <DialogHeader className="pr-8">
          <DialogTitle>{t('userManagement.dialogTitle')}</DialogTitle>
          <DialogDescription>
            {t('userManagement.dialogDescription', { user: user.fullName || user.email })}
          </DialogDescription>
        </DialogHeader>

        <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-slate-900">
                {user.fullName || t('userManagement.missing')}
              </h3>
              <p className="break-all text-sm text-slate-600">
                {user.email || t('userManagement.missing')}
              </p>
            </div>
            <StatusBadge status={user.isActive ? 'active' : 'inactive'}>
              {user.isActive ? t('userManagement.active') : t('userManagement.inactive')}
            </StatusBadge>
          </div>
          <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t('userManagement.currentRoles')}
            </p>
            <RoleBadges roles={user.roles} />
            {userRolesQuery.isLoading && (
              <p className="text-xs text-slate-500" role="status">
                {t('userManagement.detailsLoading')}
              </p>
            )}
            {userRolesQuery.isError && (
              <div className="flex flex-wrap items-center gap-2 text-sm text-red-700" role="alert">
                <span>{t('userManagement.detailsError')}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => userRolesQuery.refetch()}
                >
                  {t('userManagement.retry')}
                </Button>
              </div>
            )}
            {currentDetails.length > 0 && (
              <ul className="space-y-2">
                {currentDetails.map((role) => (
                  <li key={role.roleId} className="rounded-lg bg-white p-3 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">
                        {role.roleCode || t('userManagement.unknownRole')}
                      </Badge>
                      <span className="font-medium text-slate-800">
                        {role.roleName || t('userManagement.missing')}
                      </span>
                      <StatusBadge status={role.isActive ? 'active' : 'inactive'}>
                        {role.isActive
                          ? t('userManagement.roleActive')
                          : t('userManagement.inactive')}
                      </StatusBadge>
                    </div>
                    {role.description && (
                      <p className="mt-1 text-xs text-slate-600">{role.description}</p>
                    )}
                    <p className="mt-1 text-xs text-slate-500">
                      {t('userManagement.assignedAt', {
                        date: formatAssignedAt(role.assignedAt),
                      })}
                      {role.assignedByName
                        ? ` · ${t('userManagement.assignedBy', { name: role.assignedByName })}`
                        : ''}
                      {` · ${t('userManagement.permissionCount', {
                        count: role.permissionCount,
                      })}`}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section aria-labelledby="available-roles-heading" className="space-y-3">
          <div>
            <h3 id="available-roles-heading" className="font-semibold text-slate-900">
              {t('userManagement.availableRoles')}
            </h3>
            <p className="text-xs text-slate-500">
              {t('userManagement.currentRolesNote')}
            </p>
          </div>
          {rolesQuery.isLoading ? (
            <p className="rounded-lg border border-slate-200 p-4 text-sm text-slate-500" role="status">
              {t('userManagement.rolesLoading')}
            </p>
          ) : rolesQuery.isError ? (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 p-4 text-sm text-red-700" role="alert">
              <span>{t('userManagement.rolesError')}</span>
              <Button type="button" variant="outline" size="sm" onClick={() => rolesQuery.refetch()}>
                {t('userManagement.retry')}
              </Button>
            </div>
          ) : availableRoles.length === 0 ? (
            <p className="rounded-lg border border-slate-200 p-4 text-sm text-slate-500">
              {t('userManagement.noAvailableRoles')}
            </p>
          ) : (
            <ul className="max-h-64 space-y-2 overflow-y-auto overscroll-contain pr-1">
              {availableRoles.map((role) => (
                <RoleOption
                  key={role.id}
                  role={role}
                  checked={selectedRoleIds.has(role.id)}
                  onCheckedChange={(checked) => toggleRole(role.id, checked)}
                />
              ))}
            </ul>
          )}
        </section>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={assignMutation.isPending}
          >
            {t('userManagement.cancel')}
          </Button>
          <Button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            aria-busy={assignMutation.isPending}
          >
            {assignMutation.isPending ? (
              <>
                <Loader2 aria-hidden className="size-4 animate-spin" />
                {t('userManagement.saving')}
              </>
            ) : (
              <>
                <Check aria-hidden className="size-4" />
                {t('userManagement.assignRoles')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface RoleOptionProps {
  role: RoleListItem;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const RoleOption = ({ role, checked, onCheckedChange }: RoleOptionProps) => {
  const { t } = useTranslation();

  return (
    <li>
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 transition-colors hover:bg-slate-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onCheckedChange(event.target.checked)}
          className="mt-1 size-4 shrink-0 accent-emerald-600"
        />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-900">
              {role.name || t('userManagement.missing')}
            </span>
            <Badge variant="secondary">
              {role.code || t('userManagement.unknownRole')}
            </Badge>
          </span>
          <span className="mt-1 block break-words text-xs text-slate-600">
            {role.description || t('userManagement.noDescription')}
          </span>
          <span className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <ShieldCheck aria-hidden className="size-3.5" />
            {t('userManagement.permissionCount', { count: role.permissionCount })}
          </span>
        </span>
      </label>
    </li>
  );
};
