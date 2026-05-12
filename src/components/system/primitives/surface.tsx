import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../../lib/utils';

export interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'panel' | 'raised' | 'overlay' | 'alert' | 'insight' | 'context' | 'utility';
  radius?: 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Surface = forwardRef<HTMLDivElement, SurfaceProps>(({ 
  variant = 'panel', 
  radius = 'md', 
  padding = 'md',
  className, 
  children, 
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'relative overflow-hidden border',
        // Variants
        variant === 'panel' && 'bg-panel dark:bg-charcoal border-line dark:border-dark-border',
        variant === 'raised' && 'bg-panel-strong dark:bg-charcoal-2 border-line-strong dark:border-dark-border shadow-soft',
        variant === 'overlay' && 'bg-white/90 dark:bg-charcoal-3 border-line-strong dark:border-dark-border-strong shadow-strong backdrop-blur-xl',
        variant === 'alert' && 'bg-coral text-ink border-transparent',
        variant === 'insight' && 'bg-violet text-white border-transparent',
        variant === 'context' && 'bg-butter text-ink border-transparent',
        variant === 'utility' && 'bg-sky text-ink border-transparent',
        // Radius
        radius === 'sm' && 'rounded-[var(--radius-sm)]',
        radius === 'md' && 'rounded-[var(--radius-md)]',
        radius === 'lg' && 'rounded-[var(--radius-lg)]',
        radius === 'xl' && 'rounded-[var(--radius-xl)]',
        // Padding
        padding === 'none' && 'p-0',
        padding === 'sm' && 'p-3',
        padding === 'md' && 'p-[18px]',
        padding === 'lg' && 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
