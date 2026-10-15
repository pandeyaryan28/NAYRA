import React from 'react';
import { cn } from '@/lib/utils';

export interface SwiftUIToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  color?: 'blue' | 'green' | 'indigo';
  className?: string;
  id?: string;
}

export const SwiftUIToggle: React.FC<SwiftUIToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  color = 'blue',
  className,
  id,
}) => {
  const toggleId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const activeColors = {
    blue: 'bg-blue-600 dark:bg-blue-500',
    green: 'bg-emerald-600 dark:bg-emerald-500',
    indigo: 'bg-indigo-600 dark:bg-indigo-500',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 py-2 select-none',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
    >
      {(label || description) && (
        <div className="flex-1 min-w-0 pr-2">
          {label && (
            <label
              htmlFor={toggleId}
              className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 cursor-pointer"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        role="switch"
        id={toggleId}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-[999px] p-0.5 transition-colors duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
          'shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)] dark:shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]',
          checked
            ? activeColors[color]
            : 'bg-zinc-200/90 dark:bg-zinc-700/80 hover:bg-zinc-300 dark:hover:bg-zinc-600'
        )}
      >
        <span
          className={cn(
            'pointer-events-none block h-5 w-5 rounded-[999px] bg-white transform transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
            'shadow-[0_2px_4px_rgba(0,0,0,0.2),0_0_1px_rgba(0,0,0,0.15)]',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  );
};
