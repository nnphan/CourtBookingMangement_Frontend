import * as React from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Field, FieldError, FieldLabel, FieldShell } from '@/components/ui/field';

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  /** Shows the circular clear affordance from the register screen. */
  clearable?: boolean;
  onClear?: () => void;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ id, label, error, clearable = false, onClear, className, ...props }, ref) => {
    const { t } = useTranslation();
    const errorId = `${id}-error`;

    return (
      <Field>
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <FieldShell invalid={!!error} disabled={props.disabled}>
          <input
            id={id}
            ref={ref}
            aria-invalid={!!error || undefined}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              'min-w-0 flex-1 bg-transparent px-4 text-[15px] text-content-primary outline-none disabled:cursor-not-allowed',
              className,
            )}
            {...props}
          />
          {clearable ? (
            <button
              type="button"
              onClick={onClear}
              tabIndex={-1}
              aria-label={t('common.clear')}
              className="grid w-12 place-items-center text-brand-600 transition-opacity hover:opacity-80"
            >
              <span className="grid size-[22px] place-items-center rounded-full bg-brand-600 text-content-onbrand">
                <X aria-hidden className="size-3.5" strokeWidth={3} />
              </span>
            </button>
          ) : null}
        </FieldShell>
        <FieldError id={errorId} message={error} />
      </Field>
    );
  },
);
TextInput.displayName = 'TextInput';
