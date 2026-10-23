import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import type { UserRoleSummary } from '../types/user.types';

export const RoleBadges = ({ roles }: { roles: UserRoleSummary[] }) => {
  const { t } = useTranslation();
  if (roles.length === 0) {
    return <span className="text-sm text-slate-500">{t('userManagement.noRoles')}</span>;
  }

  const visibleRoles = roles.slice(0, 2);
  const remainingRoles = roles.slice(2);

  return (
    <div className="flex max-w-56 flex-wrap gap-1.5">
      {visibleRoles.map((role) => (
        <Badge
          key={role.id}
          variant="secondary"
          title={role.name || role.code || t('userManagement.unknownRole')}
          aria-label={`${role.code || t('userManagement.unknownRole')}: ${role.name || t('userManagement.missing')}`}
        >
          {role.code || t('userManagement.unknownRole')}
        </Badge>
      ))}
      {remainingRoles.length > 0 && (
        <Badge
          variant="outline"
          title={remainingRoles.map((role) => `${role.code}: ${role.name}`).join(', ')}
          aria-label={t('userManagement.rolesRemaining', {
            count: remainingRoles.length,
            roles: remainingRoles.map((role) => role.name || role.code).join(', '),
          })}
        >
          +{remainingRoles.length}
        </Badge>
      )}
    </div>
  );
};
