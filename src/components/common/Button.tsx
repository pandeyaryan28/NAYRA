import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-medium transition-all duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-[0.98] active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer';

    const variants = {
      primary: 'bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-[0_3px_8px_-1px_rgba(0,0,0,0.18),inset_0_1px_0_0_rgba(255,255,255,0.25),inset_0_-1px_0_0_rgba(0,0,0,0.2)] dark:shadow-[0_3px_8px_-1px_rgba(0,0,0,0.35),inset_0_1px_0_0_rgba(255,255,255,0.7),inset_0_-1px_0_0_rgba(0,0,0,0.1)] active:shadow-[0_1px_2px_0_rgba(0,0,0,0.15),inset_0_2px_4px_0_rgba(0,0,0,0.3)]',
      secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200/90 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700/90 border border-zinc-200/60 dark:border-zinc-700/60 shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06),inset_0_1px_0_0_rgba(255,255,255,0.9)] dark:shadow-[0_2px_6px_-1px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.08)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)]',
      outline: 'border border-zinc-300/80 dark:border-zinc-700/80 bg-white/70 dark:bg-zinc-900/70 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-[0_1px_3px_rgba(0,0,0,0.04),inset_0_1px_0_0_rgba(255,255,255,0.8)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3),inset_0_1px_0_0_rgba(255,255,255,0.06)]',
      ghost: 'bg-transparent text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80',
      danger: 'bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-600 shadow-[0_3px_8px_-1px_rgba(225,29,72,0.35),inset_0_1px_0_0_rgba(255,255,255,0.3)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)]',
    };

    const sizes = {
      sm: 'h-8 px-2.5 text-xs rounded-md gap-1.5',
      md: 'h-9 px-3.5 text-sm rounded-md gap-2',
      lg: 'h-11 px-5 text-base rounded-md gap-2.5',
      icon: 'h-9 w-9 p-0 rounded-md',
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
