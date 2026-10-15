import React from 'react';
import { cn } from '@/lib/utils';

export interface SwiftUITextFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

export const SwiftUITextField = React.forwardRef<HTMLInputElement, SwiftUITextFieldProps>(
  (
    {
      className,
      label,
      error,
      hint,
      leadingIcon,
      trailingIcon,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 select-none">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold tracking-tight text-zinc-700 dark:text-zinc-300"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leadingIcon && (
            <div className="absolute left-2.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
              {leadingIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={cn(
              'flex h-9 w-full rounded-xl border border-black/[0.08] dark:border-white/[0.1]',
              'bg-black/[0.025] dark:bg-white/[0.04] px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100',
              'placeholder:text-zinc-400 dark:placeholder:text-zinc-500',
              'shadow-[0_1px_2px_rgba(0,0,0,0.03),inset_0_1px_0_0_rgba(255,255,255,0.7)]',
              'dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.06)]',
              'focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:border-[#007AFF]',
              'focus:bg-white dark:focus:bg-[#1c1c1e]',
              'disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150 swiftui-press',
              leadingIcon && 'pl-8',
              trailingIcon && 'pr-8',
              error && 'border-rose-500 focus:ring-rose-500/30 focus:border-rose-500',
              className
            )}
            {...props}
          />
          {trailingIcon && (
            <div className="absolute right-2.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
              {trailingIcon}
            </div>
          )}
        </div>
        {hint && !error && (
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">{hint}</p>
        )}
        {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
      </div>
    );
  }
);

SwiftUITextField.displayName = 'SwiftUITextField';
