import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { PhoneInput } from '@/components/ui/phone-input';
import { PasswordInput } from '@/components/ui/password-input';
import { FormAlert } from '@/features/auth/components/FormAlert';
import { loginPhoneSchema, type LoginPhoneValues } from '@/features/auth/schemas/auth.schema';
import { useLoginWithPhone } from '@/features/auth/hooks/useAuthMutations';
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage';

export const LoginPhoneForm = () => {
  const { t } = useTranslation();
  const toMessage = useApiErrorMessage();
  const { mutate, isPending, error } = useLoginWithPhone();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginPhoneValues>({
    resolver: zodResolver(loginPhoneSchema),
    defaultValues: { dialCode: '+84', phone: '', password: '' },
    mode: 'onTouched',
  });

  return (
    <form noValidate onSubmit={handleSubmit((values) => mutate(values))} className="space-y-5">
      <FormAlert message={toMessage(error)} />

      <Controller
        control={control}
        name="phone"
        render={({ field }) => (
          <Controller
            control={control}
            name="dialCode"
            render={({ field: dial }) => (
              <PhoneInput
                id="login-phone"
                name={field.name}
                label={t('auth.fields.phoneLabel')}
                placeholder={t('auth.fields.phonePlaceholder')}
                value={field.value}
                dialCode={dial.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                onDialCodeChange={dial.onChange}
                disabled={isPending}
                error={errors.phone ? t(errors.phone.message ?? '') : undefined}
              />
            )}
          />
        )}
      />

      <PasswordInput
        id="login-password"
        label={t('auth.fields.passwordLabel')}
        placeholder={t('auth.fields.passwordPlaceholder')}
        autoComplete="current-password"
        disabled={isPending}
        error={errors.password ? t(errors.password.message ?? '') : undefined}
        {...register('password')}
      />

      <Button type="submit" block loading={isPending} className="mt-1 font-bold">
        {t('auth.login.submit')}
      </Button>
    </form>
  );
};
