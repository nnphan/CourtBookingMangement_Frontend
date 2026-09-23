import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/ui/text-input';
import { PasswordInput } from '@/components/ui/password-input';
import { registerSchema, type RegisterFormValues } from '@/features/auth/schemas/register.schema';
import { useRegisterMutation } from '@/features/auth/hooks/useRegisterMutation';

export const RegisterForm = () => {
  const { t } = useTranslation();
  const { mutate, isPending } = useRegisterMutation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      fullName: '',
      password: '',
      phoneNumber: '',
    },
    mode: 'onTouched',
  });

  return (
    <form noValidate onSubmit={handleSubmit((values) => mutate(values))} className="space-y-5">
      <TextInput
        id="register-email"
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

      <TextInput
        id="register-fullName"
        autoComplete="name"
        clearable
        onClear={() => setValue('fullName', '', { shouldValidate: true })}
        label={t('auth.fields.fullNameLabel')}
        placeholder={t('auth.fields.fullNamePlaceholder')}
        disabled={isPending}
        error={errors.fullName ? t(errors.fullName.message ?? '') : undefined}
        {...register('fullName')}
      />

      <TextInput
        id="register-phoneNumber"
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        clearable
        onClear={() => setValue('phoneNumber', '', { shouldValidate: true })}
        label={t('auth.fields.phoneLabel')}
        placeholder={t('auth.fields.phonePlaceholder')}
        disabled={isPending}
        error={errors.phoneNumber ? t(errors.phoneNumber.message ?? '') : undefined}
        {...register('phoneNumber')}
      />

      <PasswordInput
        id="register-password"
        label={t('auth.fields.passwordLabel')}
        placeholder={t('auth.fields.passwordPlaceholder')}
        autoComplete="new-password"
        disabled={isPending}
        error={errors.password ? t(errors.password.message ?? '') : undefined}
        {...register('password')}
      />

      <Button type="submit" block loading={isPending} className="mt-2 font-bold">
        {t('auth.register.submit')}
      </Button>
    </form>
  );
};
