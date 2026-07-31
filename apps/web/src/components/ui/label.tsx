import { forwardRef, type LabelHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean };

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('mb-1.5 block text-sm font-medium text-ink-900', className)}
      {...props}
    >
      {children}
      {required ? <span className="text-danger-500"> *</span> : null}
    </label>
  ),
);
Label.displayName = 'Label';
