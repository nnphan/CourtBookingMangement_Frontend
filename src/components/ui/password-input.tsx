import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Field, FieldError, FieldLabel, FieldShell } from '@/components/ui/field';

export interface PasswordInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type'
> {
  id: string;
  label: string;
  error?: string;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ id, label, error, ...props }, ref) => {
    const { t } = useTranslation();
    const [visible, setVisible] = React.useState(false);
    const errorId = `${id}-error`;
    const Icon = visible ? Eye : EyeOff;
    const describedBy = [props['aria-describedby'], error ? errorId : undefined]
      .filter(Boolean)
      .join(' ');

    return (
      <Field>
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <FieldShell invalid={!!error} disabled={props.disabled}>
          <input
            id={id}
            ref={ref}
            type={visible ? 'text' : 'password'}
            autoComplete={props.autoComplete ?? 'current-password'}
            aria-invalid={!!error || undefined}
            className="text-content-primary min-w-0 flex-1 bg-transparent px-4 text-[15px] outline-none disabled:cursor-not-allowed"
            {...props}
            aria-describedby={describedBy || undefined}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-pressed={visible}
            aria-label={visible ? t('common.hidePassword') : t('common.showPassword')}
            className="text-brand-600 grid w-12 place-items-center transition-opacity hover:opacity-80"
          >
            <Icon aria-hidden className="size-[22px]" strokeWidth={1.75} />
          </button>
        </FieldShell>
        <FieldError id={errorId} message={error} />
      </Field>
    );
  },
);
PasswordInput.displayName = 'PasswordInput';
