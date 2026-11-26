import { useId, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PasswordInput } from '@/components/ui/password-input';
import { TextInput } from '@/components/ui/text-input';
import { provisionUser } from '../api/user.api';
import type { RoleListItem } from '../types/user.types';

interface CreateUserDialogProps {
  roles: RoleListItem[];
  canAssignRoles: boolean;
  rolesUnavailable: boolean;
  onClose: () => void;
  onCreated: (email: string) => void;
}

export const CreateUserDialog = ({
  roles,
  canAssignRoles,
  rolesUnavailable,
  onClose,
  onCreated,
}: CreateUserDialogProps) => {
  const { t } = useTranslation();
  const id = useId();
  const [roleIds, setRoleIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const needsPhone = roles.some((role) => role.code === 'CUSTOMER' && roleIds.includes(role.id));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const form = new FormData(event.currentTarget);
    const email = String(form.get('email')).trim();
    setError(undefined);
    setIsSubmitting(true);
    try {
      await provisionUser({
        fullName: String(form.get('fullName')).trim(),
        email,
        phoneNumber: String(form.get('phoneNumber')).trim() || null,
        password: String(form.get('password')),
        isActive: form.get('isActive') === 'true',
        roleIds: canAssignRoles ? roleIds : [],
      });
      onCreated(email);
    } catch (error) {
      const code = typeof error === 'object' && error && 'code' in error ? error.code : undefined;
      const status =
        typeof error === 'object' && error && 'status' in error ? error.status : undefined;
      const errorMessages: Record<string, string> = {
        AUTH_EMAIL_ALREADY_EXISTS: 'userManagement.create.emailTaken',
        AUTH_PHONE_ALREADY_EXISTS: 'userManagement.create.phoneTaken',
        'Role.NotFound': 'userManagement.create.rolesUnavailable',
        'User.CustomerPhoneRequired': 'userManagement.create.phoneRequired',
      };
      setError(
        t(
          errorMessages[String(code)] ??
            (status === 403
              ? 'userManagement.forbidden'
              : status === 400
                ? 'userManagement.invalidRequest'
                : 'userManagement.create.failed'),
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent
        closeDisabled={isSubmitting}
        className="max-h-[90dvh] overflow-y-auto sm:max-w-xl"
      >
        <DialogHeader>
          <DialogTitle>{t('userManagement.create.title')}</DialogTitle>
          <DialogDescription>{t('userManagement.create.description')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <fieldset disabled={isSubmitting} className="grid gap-4 sm:grid-cols-2">
            <TextInput
              id={`${id}-name`}
              name="fullName"
              label={t('userManagement.create.name')}
              required
              maxLength={150}
            />
            <TextInput
              id={`${id}-email`}
              name="email"
              label="Email"
              type="email"
              required
              maxLength={100}
            />
            <TextInput
              id={`${id}-phone`}
              name="phoneNumber"
              label={t('userManagement.create.phone')}
              type="tel"
              required={needsPhone}
              maxLength={20}
            />
            <PasswordInput
              id={`${id}-password`}
              name="password"
              label={t('userManagement.create.password')}
              autoComplete="new-password"
              defaultValue="12345678"
              required
              minLength={8}
              maxLength={72}
            />
            <label className="grid gap-1 text-sm font-medium">
              {t('userManagement.statusColumn')}
              <select
                name="isActive"
                defaultValue="true"
                className="border-line bg-surface h-11 rounded-lg border px-3"
              >
                <option value="true">{t('userManagement.active')}</option>
                <option value="false">{t('userManagement.inactive')}</option>
              </select>
            </label>
          </fieldset>

          {canAssignRoles && (
            <fieldset
              disabled={isSubmitting}
              className="border-line space-y-2 rounded-xl border p-3"
            >
              <legend className="px-1 text-sm font-medium">
                {t('userManagement.create.roles')}
              </legend>
              {rolesUnavailable ? (
                <p className="text-sm">{t('userManagement.create.rolesUnavailable')}</p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {roles
                    .filter((role) => role.isActive)
                    .map((role) => (
                      <label key={role.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={roleIds.includes(role.id)}
                          className="accent-brand-600"
                          onChange={(event) => {
                            const checked = event.target.checked;
                            setRoleIds((previous) =>
                              checked
                                ? [...previous, role.id]
                                : previous.filter((value) => value !== role.id),
                            );
                          }}
                        />
                        {role.code}
                      </label>
                    ))}
                </div>
              )}
            </fieldset>
          )}

          {error && (
            <p role="alert" className="text-danger text-sm">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" disabled={isSubmitting} onClick={onClose}>
              {t('userManagement.create.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {t(isSubmitting ? 'userManagement.create.saving' : 'userManagement.create.title')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
