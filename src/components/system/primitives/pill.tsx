import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../../lib/utils';

export interface PillProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'dark' | 'coral' | 'violet' | 'butter' | 'sky';
  size?: 'sm' | 'default';
  children: ReactNode;
}

export function Pill({ 
  variant = 'default', 
  size = 'default',
  className, 
  children, 
  ...props 
}: PillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-bold uppercase tracking-wider',
        // Size
        size === 'sm' && 'min-h-6 px-2 text-[10px]',
        size === 'default' && 'min-h-[30px] px-3 text-[11px]',
        // Variants
        variant === 'default' && 'bg-white/50 dark:bg-charcoal/50 border border-line-strong text-ink dark:text-primary',
        variant === 'dark' && 'bg-[#221e1b]/92 border-white/10 text-[#f5f1eb]',
        variant === 'coral' && 'bg-coral border-transparent text-[#2a1714]',
        variant === 'violet' && 'bg-violet border-transparent text-[#f7f5ff]',
        variant === 'butter' && 'bg-butter border-transparent text-[#312719]',
        variant === 'sky' && 'bg-sky border-transparent text-[#1f1b18]',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
