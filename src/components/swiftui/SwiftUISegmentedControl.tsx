import React from 'react';
import { cn } from '@/lib/utils';

export interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface SwiftUISegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  ariaLabel?: string;
}

export function SwiftUISegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  size = 'md',
  className,
  ariaLabel = 'Segmented control',
}: SwiftUISegmentedControlProps<T>) {
  const sizeClasses = {
    sm: 'p-0.5 text-xs rounded-lg gap-0.5',
    md: 'p-1 text-xs sm:text-sm rounded-xl gap-1',
    lg: 'p-1.5 text-sm sm:text-base rounded-xl gap-1.5',
  };

  const itemSizeClasses = {
    sm: 'px-2 py-1 rounded-md min-h-[26px]',
    md: 'px-3 py-1.5 rounded-lg min-h-[30px]',
    lg: 'px-4 py-2 rounded-lg min-h-[36px]',
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center liquid-glass-segmented select-none transition-all duration-200',
        sizeClasses[size],
        className
      )}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={isSelected}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'relative flex items-center justify-center gap-1.5 font-medium transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer swiftui-press active:scale-[0.97]',
              itemSizeClasses[size],
              isSelected
                ? 'liquid-glass-segment-active text-zinc-950 dark:text-zinc-50 font-semibold shadow-[0_2px_8px_-1px_rgba(0,0,0,0.12),inset_0_1px_0_0_rgba(255,255,255,0.9)]'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
            )}
          >
            {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
            <span className="truncate">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
