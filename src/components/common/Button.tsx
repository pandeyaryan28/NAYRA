import React from 'react';
import {
  SwiftUIButton,
  SwiftUIButtonVariant,
  SwiftUIButtonSize,
} from '@/components/swiftui/SwiftUIButton';
import { cn } from '@/lib/utils';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | SwiftUIButtonVariant;

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  variant?: ButtonVariant;
  size?: SwiftUIButtonSize;
  glass?: boolean;
}

const variantMap: Record<string, SwiftUIButtonVariant> = {
  primary: 'borderedProminent',
  secondary: 'bordered',
  outline: 'bordered',
  ghost: 'borderless',
  danger: 'destructive',
  borderedProminent: 'borderedProminent',
  bordered: 'bordered',
  borderless: 'borderless',
  plain: 'plain',
  destructive: 'destructive',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', glass, ...props }, ref) => {
    const swiftUIVariant = variantMap[variant] || 'borderedProminent';

    const extraClasses = cn(
      variant === 'secondary' &&
        'border-zinc-200/60 dark:border-zinc-700/60 shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06),inset_0_1px_0_0_rgba(255,255,255,0.9)]',
      variant === 'outline' &&
        'border border-zinc-300/80 dark:border-zinc-700/80 bg-white/70 dark:bg-zinc-900/70 text-zinc-800 dark:text-zinc-200 shadow-[0_1px_3px_rgba(0,0,0,0.04),inset_0_1px_0_0_rgba(255,255,255,0.8)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3),inset_0_1px_0_0_rgba(255,255,255,0.06)]',
      className
    );

    return (
      <SwiftUIButton
        ref={ref}
        variant={swiftUIVariant}
        size={size}
        glass={glass}
        className={extraClasses}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
