import React from 'react';
import { cn } from '@/lib/utils';

export type StackSpacing = 0 | 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;
export type HorizontalAlignment = 'leading' | 'center' | 'trailing';
export type VerticalAlignment = 'top' | 'center' | 'bottom' | 'baseline';

const spacingMap: Record<StackSpacing, string> = {
  0: 'gap-0',
  0.5: 'gap-0.5',
  1: 'gap-1',
  1.5: 'gap-1.5',
  2: 'gap-2',
  2.5: 'gap-2.5',
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  6: 'gap-6',
  8: 'gap-8',
  10: 'gap-10',
  12: 'gap-12',
  16: 'gap-16',
};

const vAlignMap: Record<VerticalAlignment, string> = {
  top: 'items-start',
  center: 'items-center',
  bottom: 'items-end',
  baseline: 'items-baseline',
};

const hAlignMap: Record<HorizontalAlignment, string> = {
  leading: 'items-start',
  center: 'items-center',
  trailing: 'items-end',
};

export interface HStackProps extends React.HTMLAttributes<HTMLDivElement> {
  alignment?: VerticalAlignment;
  spacing?: StackSpacing;
  wrap?: boolean;
}

export const HStack: React.FC<HStackProps> = ({
  alignment = 'center',
  spacing = 3,
  wrap = false,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex flex-row',
        vAlignMap[alignment],
        spacingMap[spacing],
        wrap && 'flex-wrap',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export interface VStackProps extends React.HTMLAttributes<HTMLDivElement> {
  alignment?: HorizontalAlignment;
  spacing?: StackSpacing;
}

export const VStack: React.FC<VStackProps> = ({
  alignment = 'leading',
  spacing = 3,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex flex-col',
        hAlignMap[alignment],
        spacingMap[spacing],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export interface ZStackProps extends React.HTMLAttributes<HTMLDivElement> {
  alignment?: 'center' | 'topLeading' | 'topTrailing' | 'bottomLeading' | 'bottomTrailing';
}

export const ZStack: React.FC<ZStackProps> = ({
  alignment = 'center',
  className,
  children,
  ...props
}) => {
  const alignClass = {
    center: 'items-center justify-center',
    topLeading: 'items-start justify-start',
    topTrailing: 'items-start justify-end',
    bottomLeading: 'items-end justify-start',
    bottomTrailing: 'items-end justify-end',
  }[alignment];

  return (
    <div className={cn('relative grid grid-cols-1 grid-rows-1', alignClass, className)} {...props}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return (
          <div className={cn('col-start-1 row-start-1 w-full h-full flex', alignClass)}>
            {child}
          </div>
        );
      })}
    </div>
  );
};

export const Spacer: React.FC<{ className?: string }> = ({ className }) => {
  return <div className={cn('flex-1 min-w-0 min-h-0 self-stretch', className)} aria-hidden="true" />;
};

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  inset?: boolean;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  inset = false,
  className,
  ...props
}) => {
  if (orientation === 'vertical') {
    return (
      <div
        className={cn(
          'w-px self-stretch bg-black/[0.08] dark:bg-white/[0.1] my-0.5',
          inset && 'my-2',
          className
        )}
        role="separator"
        aria-orientation="vertical"
        {...props}
      />
    );
  }

  return (
    <div
      className={cn(
        'h-px w-full bg-black/[0.08] dark:bg-white/[0.1]',
        inset && 'ml-4',
        className
      )}
      role="separator"
      aria-orientation="horizontal"
      {...props}
    />
  );
};
