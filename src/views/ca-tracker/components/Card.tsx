import React, { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        'apple-card-surface liquid-glass-card rounded-xl p-4 sm:p-6 transition-all duration-200',
        'bg-white/75 dark:bg-zinc-900/75 backdrop-blur-2xl border border-white/80 dark:border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.03)]',
        hoverEffect &&
          'hover:border-white dark:hover:border-white/20 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer swiftui-press active:scale-[0.995]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
