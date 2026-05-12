import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../../lib/utils';

export interface MotionRevealProps extends HTMLAttributes<HTMLDivElement> {
  delay?: number;
  duration?: 'fast' | 'normal' | 'slow';
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  children: ReactNode;
}

export function MotionReveal({
  delay = 0,
  duration = 'normal',
  direction = 'up',
  className,
  children,
  ...props
}: MotionRevealProps) {
  // Map our motion tokens to actual Tailwind utility classes for animation
  // In a real app we'd use Framer Motion or specific keyframes, 
  // but here we align with the "tw-animate-css" or internal CSS vars.
  
  return (
    <div
      className={cn(
        'animate-in fade-in fill-mode-both ease-out',
        direction === 'up' && 'slide-in-from-bottom-4',
        direction === 'down' && 'slide-in-from-top-4',
        direction === 'left' && 'slide-in-from-right-4',
        direction === 'right' && 'slide-in-from-left-4',
        duration === 'fast' && 'duration-[180ms]',
        duration === 'normal' && 'duration-[300ms]',
        duration === 'slow' && 'duration-[900ms]',
        className
      )}
      style={{
        animationDelay: `${delay}ms`,
        ...props.style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
