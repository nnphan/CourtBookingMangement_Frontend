import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Field, FieldError, FieldLabel, FieldShell } from '@/components/ui/field';
import { formatPhone, normalizePhone } from '@/lib/utils';

export interface Country {
  iso2: string;
  dialCode: string;
  name: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  { iso2: 'VN', dialCode: '+84', name: 'Việt Nam', flag: '🇻🇳' },
  { iso2: 'SG', dialCode: '+65', name: 'Singapore', flag: '🇸🇬' },
  { iso2: 'TH', dialCode: '+66', name: 'ไทย', flag: '🇹🇭' },
  { iso2: 'MY', dialCode: '+60', name: 'Malaysia', flag: '🇲🇾' },
  { iso2: 'KR', dialCode: '+82', name: '대한민국', flag: '🇰🇷' },
  { iso2: 'JP', dialCode: '+81', name: '日本', flag: '🇯🇵' },
  { iso2: 'US', dialCode: '+1', name: 'United States', flag: '🇺🇸' },
];

export interface PhoneInputProps {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  dialCode: string;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  onChange: (digits: string) => void;
  onDialCodeChange: (dialCode: string) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  name?: string;
}

/**
 * Split control: country dial-code select on the left, national number on the
 * right. Digits are stored unformatted and displayed grouped.
 */
export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      id,
      label,
      placeholder,
      value,
      dialCode,
      error,
      disabled,
      autoFocus,
      onChange,
      onDialCodeChange,
      onBlur,
      name,
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const errorId = `${id}-error`;
    const country = COUNTRIES.find((c) => c.dialCode === dialCode) ?? COUNTRIES[0];

    return (
      <Field>
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <FieldShell invalid={!!error} disabled={disabled}>
          <div className="relative flex shrink-0 items-center gap-1.5 pl-3 pr-2">
            <span aria-hidden className="text-[18px] leading-none">
              {country.flag}
            </span>
            <span className="whitespace-nowrap text-[15px] text-content-primary">
              {country.dialCode.replace('+', '+ ')}
            </span>
            <ChevronDown aria-hidden className="size-4 text-content-placeholder" />
            <select
              aria-label={t('auth.fields.dialCode')}
              value={dialCode}
              disabled={disabled}
              onChange={(e) => onDialCodeChange(e.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
            >
              {COUNTRIES.map((c) => (
                <option key={c.iso2} value={c.dialCode}>
                  {c.flag} {c.name} ({c.dialCode})
                </option>
              ))}
            </select>
          </div>

          <span aria-hidden className="my-2.5 w-px bg-line" />

          <input
            id={id}
            name={name}
            ref={ref}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            autoFocus={autoFocus}
            disabled={disabled}
            placeholder={placeholder}
            value={formatPhone(value)}
            onChange={(e) => onChange(normalizePhone(e.target.value).slice(0, 10))}
            onBlur={onBlur}
            aria-invalid={!!error || undefined}
            aria-describedby={error ? errorId : undefined}
            className="min-w-0 flex-1 bg-transparent px-3 text-[15px] text-content-primary outline-none disabled:cursor-not-allowed"
          />
        </FieldShell>
        <FieldError id={errorId} message={error} />
      </Field>
    );
  },
);
PhoneInput.displayName = 'PhoneInput';
