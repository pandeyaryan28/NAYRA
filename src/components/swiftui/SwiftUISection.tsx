import React from 'react';
import { cn } from '@/lib/utils';

export interface SwiftUISectionProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  cardClassName?: string;
  variant?: 'insetGrouped' | 'plain' | 'glass';
}

export const SwiftUISection: React.FC<SwiftUISectionProps> = ({
  header,
  footer,
  cardClassName,
  variant = 'insetGrouped',
  className,
  children,
  ...props
}) => {
  const cardStyles = {
    insetGrouped:
      'clay-surface rounded-2xl p-4 sm:p-5 border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/90 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]',
    glass:
      'liquid-glass-card rounded-2xl p-4 sm:p-5',
    plain:
      'p-1',
  };

  return (
    <div className={cn('w-full', className)} {...props}>
      {header && (
        <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2 px-1">
          {header}
        </div>
      )}
      <div className={cn(cardStyles[variant], cardClassName)}>
        {children}
      </div>
      {footer && (
        <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 px-1 leading-relaxed">
          {footer}
        </div>
      )}
    </div>
  );
};

export interface SwiftUIFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  spacing?: 'sm' | 'md' | 'lg';
}

export const SwiftUIForm: React.FC<SwiftUIFormProps> = ({
  spacing = 'md',
  className,
  children,
  ...props
}) => {
  const spacingClasses = {
    sm: 'space-y-4',
    md: 'space-y-6',
    lg: 'space-y-8',
  };

  return (
    <form className={cn('w-full', spacingClasses[spacing], className)} {...props}>
      {children}
    </form>
  );
};
