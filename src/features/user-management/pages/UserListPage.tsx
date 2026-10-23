import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Pencil, Search, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FilterPanel,
  FilterSearchInput,
  ManagementEmptyState,
  PageHeader,
  StatusBadge,
  TableSkeleton,
  tableStyles,
} from '@/components/management';
import { getRoles, getUsers } from '../api/user.api';
import { ROLE_QUERY_KEYS, USER_QUERY_KEYS } from '../api/user.query';
import type { UserListItem } from '../types/user.types';
import { AssignUserRolesDialog } from '../components/AssignUserRolesDialog';
import { DeleteUserDialog } from '../components/DeleteUserDialog';
import { RoleBadges } from '../components/RoleBadges';

type UserStatusFilter = 'all' | 'active' | 'inactive';

const EMPTY_USERS: UserListItem[] = [];

const getUserSearchText = (user: UserListItem) =>
  [
    user.fullName,
    user.email,
    user.phoneNumber,
    ...user.roles.flatMap((role) => [role.code, role.name]),
  ]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase();

export const UserListPage = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<UserStatusFilter>('all');
  const [roleId, setRoleId] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserListItem | null>(null);

  const usersQuery = useQuery({
    queryKey: USER_QUERY_KEYS.list(),
    queryFn: getUsers,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
  const rolesQuery = useQuery({
    queryKey: ROLE_QUERY_KEYS.list(),
    queryFn: getRoles,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const users = usersQuery.data ?? EMPTY_USERS;
  const roles = rolesQuery.data ?? [];
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const matchesSearch =
          !normalizedSearch || getUserSearchText(user).includes(normalizedSearch);
        const matchesStatus = status === 'all' || user.isActive === (status === 'active');
        const matchesRole = roleId === 'all' || user.roles.some((role) => role.id === roleId);
        return matchesSearch && matchesStatus && matchesRole;
      }),
    [normalizedSearch, roleId, status, users],
  );
  const hasFilters = Boolean(normalizedSearch) || status !== 'all' || roleId !== 'all';

  const clearFilters = () => {
    setSearch('');
    setStatus('all');
    setRoleId('all');
  };

  return (
    <div className="w-full space-y-6">
      <PageHeader
        icon={Users}
        title={t('userManagement.title')}
        description={t('userManagement.description')}
        badge={
          usersQuery.data
            ? t('userManagement.userCount', { count: usersQuery.data.length })
            : undefined
        }
      />

      <FilterPanel
        title={t('userManagement.filters')}
        resetLabel={t('userManagement.clearFilters')}
        onReset={hasFilters ? clearFilters : undefined}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <FilterSearchInput
            value={search}
            onChange={setSearch}
            aria-label={t('userManagement.searchAria')}
            placeholder={t('userManagement.searchPlaceholder')}
            className="lg:max-w-lg"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:w-auto">
            <Select value={status} onValueChange={(value) => setStatus(value as UserStatusFilter)}>
              <SelectTrigger aria-label={t('userManagement.statusFilter')} className="min-w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('userManagement.allStatuses')}</SelectItem>
                <SelectItem value="active">{t('userManagement.active')}</SelectItem>
                <SelectItem value="inactive">{t('userManagement.inactive')}</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={roleId}
              onValueChange={setRoleId}
              disabled={rolesQuery.isLoading || rolesQuery.isError}
            >
              <SelectTrigger aria-label={t('userManagement.roleFilter')} className="min-w-44">
                <SelectValue placeholder={t('userManagement.allRoles')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('userManagement.allRoles')}</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {rolesQuery.isError && (
          <div className="flex flex-wrap items-center gap-2 text-sm text-red-700" role="status">
            <span>{t('userManagement.rolesFilterError')}</span>
            <Button type="button" variant="outline" size="sm" onClick={() => rolesQuery.refetch()}>
              {t('userManagement.retry')}
            </Button>
          </div>
        )}
        {usersQuery.data && (
          <p className="text-muted-foreground text-sm" aria-live="polite">
            {t('userManagement.filterSummary', {
              filtered: filteredUsers.length,
              total: users.length,
            })}
          </p>
        )}
      </FilterPanel>

      {usersQuery.isLoading ? (
        <TableSkeleton />
      ) : usersQuery.isError ? (
        <ManagementEmptyState
          icon={<Users aria-hidden className="size-7" />}
          title={t('userManagement.usersLoadError')}
          description={t('userManagement.tryAgainLater')}
          actions={
            <Button type="button" variant="outline" onClick={() => usersQuery.refetch()}>
              {t('userManagement.retry')}
            </Button>
          }
        />
      ) : users.length === 0 ? (
        <ManagementEmptyState
          icon={<Users aria-hidden className="size-7" />}
          title={t('userManagement.noUsers')}
          description={t('userManagement.emptyUsers')}
        />
      ) : filteredUsers.length === 0 ? (
        <ManagementEmptyState
          icon={<Search aria-hidden className="size-7" />}
          title={t('userManagement.noMatches')}
          description={t('userManagement.noMatchesDescription')}
          actions={
            <Button type="button" variant="outline" onClick={clearFilters}>
              {t('userManagement.clearFilters')}
            </Button>
          }
        />
      ) : (
        <UserTable users={filteredUsers} onEdit={setSelectedUser} onDelete={setDeleteTarget} />
      )}

      {deleteTarget && (
        <DeleteUserDialog
          key={deleteTarget.id}
          user={deleteTarget}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {selectedUser && (
        <AssignUserRolesDialog
          key={selectedUser.id}
          user={selectedUser}
          isOpen
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

interface UserTableProps {
  users: UserListItem[];
  onEdit: (user: UserListItem) => void;
  onDelete: (user: UserListItem) => void;
}

const UserTable = ({ users, onEdit, onDelete }: UserTableProps) => {
  const { t } = useTranslation();
  const missingValue = t('userManagement.missing');

  return (
    <div className={`${tableStyles.container} overflow-x-auto`}>
      <table className="w-full min-w-[760px] border-collapse text-left">
        <thead className={tableStyles.head}>
          <tr>
            <th scope="col" className={`${tableStyles.th} min-w-48`}>
              {t('userManagement.userColumn')}
            </th>
            <th scope="col" className={`${tableStyles.th} min-w-52`}>
              {t('userManagement.emailColumn')}
            </th>
            <th scope="col" className={`${tableStyles.th} whitespace-nowrap`}>
              {t('userManagement.phoneColumn')}
            </th>
            <th scope="col" className={`${tableStyles.th} min-w-40`}>
              {t('userManagement.rolesColumn')}
            </th>
            <th scope="col" className={`${tableStyles.th} whitespace-nowrap`}>
              {t('userManagement.statusColumn')}
            </th>
            <th scope="col" className={`${tableStyles.th} text-right`}>
              {t('userManagement.actionsColumn')}
            </th>
          </tr>
        </thead>
        <tbody className={tableStyles.body}>
          {users.map((user) => (
            <tr key={user.id} className={tableStyles.row}>
              <td className={tableStyles.td}>
                <p className="font-semibold text-slate-900">{user.fullName || missingValue}</p>
              </td>
              <td
                className={`${tableStyles.td} max-w-64 truncate text-slate-600`}
                title={user.email}
              >
                {user.email || missingValue}
              </td>
              <td className={`${tableStyles.td} font-mono whitespace-nowrap text-slate-600`}>
                {user.phoneNumber?.trim() || missingValue}
              </td>
              <td className={tableStyles.td}>
                <RoleBadges roles={user.roles} />
              </td>
              <td className={tableStyles.td}>
                <StatusBadge status={user.isActive ? 'active' : 'inactive'}>
                  {user.isActive ? t('userManagement.active') : t('userManagement.inactive')}
                </StatusBadge>
              </td>
              <td className={`${tableStyles.td} text-right`}>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(user)}
                    aria-label={t('userManagement.editUser', {
                      user: user.fullName || user.email,
                    })}
                  >
                    <Pencil aria-hidden className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(user)}
                    aria-label={t('userManagement.deleteUser', {
                      user: user.fullName || user.email,
                    })}
                  >
                    <Trash2 aria-hidden className="size-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserListPage;
