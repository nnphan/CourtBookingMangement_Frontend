import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius-field)] font-semibold transition-colors duration-150 ease-[var(--ease-standard)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-brand-600 text-content-onbrand hover:bg-brand-700 active:bg-brand-800',
        outline:
          'border border-line bg-surface text-content-primary hover:bg-surface-muted active:bg-line/40',
        ghost: 'text-content-link hover:bg-brand-50 active:bg-brand-100',
        link: 'text-content-link underline-offset-2 hover:underline',
        danger: 'bg-danger text-content-onbrand hover:brightness-95',
      },
      size: {
        sm: 'h-10 px-4 text-sm',
        md: 'h-12 px-5 text-base',
        lg: 'h-[var(--spacing-action)] px-6 text-base tracking-[0.02em]',
        icon: 'size-10',
      },
      block: { true: 'w-full', false: '' },
    },
    defaultVariants: { variant: 'primary', size: 'lg', block: false },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, block, asChild = false, loading = false, children, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        data-loading={loading || undefined}
        aria-busy={loading || undefined}
        disabled={asChild ? undefined : loading || props.disabled}
        className={cn(buttonVariants({ variant, size, block }), className)}
        {...props}
      >
        {loading ? <Loader2 aria-hidden className="size-5 animate-spin" /> : null}
        {children}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };
