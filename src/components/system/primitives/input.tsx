import { ComponentProps } from 'react';
import { Input as UIInput } from '../../ui/input';
import { cn } from '../../../lib/utils';

export interface InputProps extends ComponentProps<typeof UIInput> {
  // Add any custom props here if needed
}

export function Input({ className, ...props }: InputProps) {
  return (
    <UIInput
      className={cn(
        'rounded-full bg-white/50 dark:bg-charcoal/50 border border-line-strong focus-visible:ring-ink dark:focus-visible:ring-primary',
        className
      )}
      {...props}
    />
  );
}
