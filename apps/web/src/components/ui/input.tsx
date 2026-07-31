import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type InputProps = InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean };

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-12 w-full rounded-md border-[3px] border-ink-900 bg-white px-3 text-base text-ink-900 outline-none placeholder:text-ink-500 focus:shadow-card',
        hasError && 'bg-danger-100',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
