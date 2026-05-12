import { ComponentProps, ReactNode } from 'react';
import { Button as UIButton } from '../../ui/button';
import { cn } from '../../../lib/utils';

export interface ButtonProps extends Omit<ComponentProps<typeof UIButton>, 'variant' | 'size'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children?: ReactNode;
  className?: string;
}

export function Button({ variant = 'primary', size = 'default', className, children, ...props }: ButtonProps) {
  // Map our internal variants to the UI component variants if needed,
  // or apply our own visual uplift classes.
  
  // We want the button to be pill-shaped
  const upliftClassName = cn(
    'rounded-full transition-transform duration-[180ms] ease-out hover:-translate-y-[1px]',
    variant === 'primary' && 'bg-ink text-sage-deep hover:bg-ink/90 dark:bg-primary dark:text-primary-foreground',
    variant === 'secondary' && 'bg-panel text-ink border border-line-strong hover:bg-surface-raised dark:bg-secondary dark:text-secondary-foreground',
    className
  );

  return (
    <UIButton
      variant={variant === 'primary' ? 'default' : variant}
      size={size}
      className={upliftClassName}
      {...props}
    >
      {children}
    </UIButton>
  );
}
