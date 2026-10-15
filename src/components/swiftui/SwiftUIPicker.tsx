import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PickerOption {
  value: string;
  label: string;
}

export interface SwiftUIPickerProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: PickerOption[];
  error?: string;
  hint?: string;
}

export const SwiftUIPicker = React.forwardRef<HTMLSelectElement, SwiftUIPickerProps>(
  ({ className, label, options, error, hint, id, disabled, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 select-none">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold tracking-tight text-zinc-700 dark:text-zinc-300"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={cn(
              'flex h-9 w-full appearance-none rounded-xl border border-black/[0.08] dark:border-white/[0.1]',
              'bg-black/[0.025] dark:bg-white/[0.04] pl-3 pr-8 py-1.5 text-sm text-zinc-900 dark:text-zinc-100',
              'shadow-[0_1px_2px_rgba(0,0,0,0.03),inset_0_1px_0_0_rgba(255,255,255,0.7)]',
              'dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.06)]',
              'focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:border-[#007AFF]',
              'focus:bg-white dark:focus:bg-[#1c1c1e]',
              'disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150 swiftui-press cursor-pointer',
              error && 'border-rose-500 focus:ring-rose-500/30 focus:border-rose-500',
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              >
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-2.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
            <ChevronDown className="h-3.5 w-3.5" />
          </div>
        </div>
        {hint && !error && (
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">{hint}</p>
        )}
        {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
      </div>
    );
  }
);

SwiftUIPicker.displayName = 'SwiftUIPicker';
