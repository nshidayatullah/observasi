import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-display text-sm font-semibold transition-transform active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'border-[3px] border-ink-900 bg-primary-500 text-ink-900 shadow-raised',
        secondary: 'border-[3px] border-ink-900 bg-white text-ink-900 shadow-raised',
        ghost: 'text-ink-900',
        danger: 'border-[3px] border-ink-900 bg-danger-500 text-ink-900 shadow-raised',
      },
      size: {
        default: 'h-11 px-4 lg:h-10',
        full: 'h-11 w-full px-4 lg:h-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = 'Button';
