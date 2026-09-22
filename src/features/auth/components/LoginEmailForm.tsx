import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/ui/text-input';
import { PasswordInput } from '@/components/ui/password-input';
import { FormAlert } from '@/features/auth/components/FormAlert';
import { loginEmailSchema, type LoginEmailValues } from '@/features/auth/schemas/auth.schema';
import { useLoginWithEmail } from '@/features/auth/hooks/useAuthMutations';
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage';

export const LoginEmailForm = () => {
  const { t } = useTranslation();
  const toMessage = useApiErrorMessage();
  const { mutate, isPending, error } = useLoginWithEmail();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginEmailValues>({
    resolver: zodResolver(loginEmailSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  });

  return (
    <form noValidate onSubmit={handleSubmit((values) => mutate(values))} className="space-y-5">
      <FormAlert message={toMessage(error)} />

      <TextInput
        id="login-email"
        type="email"
        inputMode="email"
        autoComplete="email"
        clearable
        onClear={() => setValue('email', '', { shouldValidate: true })}
        label={t('auth.fields.emailLabel')}
        placeholder={t('auth.fields.emailPlaceholder')}
        disabled={isPending}
        error={errors.email ? t(errors.email.message ?? '') : undefined}
        {...register('email')}
      />

      <PasswordInput
        id="login-email-password"
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
