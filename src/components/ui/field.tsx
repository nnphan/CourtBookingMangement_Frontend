import * as React from 'react';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------- FieldLabel */
export const FieldLabel = ({
  htmlFor,
  children,
  className,
}: {
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <label
    htmlFor={htmlFor}
    className={cn('mb-2 block text-[15px] font-bold text-content-primary', className)}
  >
    {children}
  </label>
);

/* -------------------------------------------------------------- FieldError */
export const FieldError = ({ id, message }: { id: string; message?: string }) =>
  message ? (
    <p id={id} role="alert" className="mt-1.5 text-sm font-medium text-danger">
      {message}
    </p>
  ) : null;

/* -------------------------------------------------------------- FieldShell */
/** Shared 1px-border control shell so every field lines up to the same pixels. */
export const FieldShell = ({
  invalid,
  disabled,
  className,
  children,
}: {
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) => (
  <div
    data-invalid={invalid || undefined}
    data-disabled={disabled || undefined}
    className={cn(
      'flex h-[var(--spacing-field)] w-full items-stretch overflow-hidden rounded-[var(--radius-field)] border border-line bg-surface transition-colors duration-150',
      'focus-within:border-brand-600',
      'data-[invalid]:border-danger data-[disabled]:bg-surface-muted',
      className,
    )}
  >
    {children}
  </div>
);

/* ------------------------------------------------------------- Field group */
export const Field = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('w-full', className)}>{children}</div>
);
