import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/ui/text-input';
import { PasswordInput } from '@/components/ui/password-input';
import { PhoneInput } from '@/components/ui/phone-input';
import { FormAlert } from '@/features/auth/components/FormAlert';
import { registerSchema, type RegisterValues } from '@/features/auth/schemas/auth.schema';
import { useRegister } from '@/features/auth/hooks/useAuthMutations';
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage';

export const RegisterForm = () => {
  const { t } = useTranslation();
  const toMessage = useApiErrorMessage();
  const { mutate, isPending, error } = useRegister();

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      dialCode: '+84',
      phone: '',
      email: '',
      fullName: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onTouched',
  });

  const msg = (key?: string) => (key ? t(key) : undefined);

  return (
    <form
      noValidate
      onSubmit={handleSubmit(({ confirmPassword: _confirm, ...values }) => mutate(values))}
      className="space-y-5"
    >
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
                id="register-phone"
                name={field.name}
                label={t('auth.fields.phoneLabel')}
                placeholder={t('auth.fields.phonePlaceholder')}
                value={field.value}
                dialCode={dial.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                onDialCodeChange={dial.onChange}
                disabled={isPending}
                error={msg(errors.phone?.message)}
              />
            )}
          />
        )}
      />

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
        error={msg(errors.email?.message)}
        {...register('email')}
      />

      <TextInput
        id="register-fullname"
        autoComplete="name"
        clearable
        onClear={() => setValue('fullName', '', { shouldValidate: true })}
        label={t('auth.fields.fullNameLabel')}
        placeholder={t('auth.fields.fullNamePlaceholder')}
        disabled={isPending}
        error={msg(errors.fullName?.message)}
        {...register('fullName')}
      />

      <PasswordInput
        id="register-password"
        label={t('auth.fields.passwordLabel')}
        placeholder={t('auth.fields.passwordPlaceholder')}
        autoComplete="new-password"
        disabled={isPending}
        error={msg(errors.password?.message)}
        {...register('password')}
      />

      <PasswordInput
        id="register-confirm"
        label={t('auth.fields.confirmPasswordLabel')}
        placeholder={t('auth.fields.confirmPasswordPlaceholder')}
        autoComplete="new-password"
        disabled={isPending}
        error={msg(errors.confirmPassword?.message)}
        {...register('confirmPassword')}
      />

      <Button type="submit" block loading={isPending} className="mt-2 font-bold">
        {t('auth.register.submit')}
      </Button>
    </form>
  );
};
