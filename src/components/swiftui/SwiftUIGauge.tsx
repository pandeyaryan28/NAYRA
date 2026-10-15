import React from 'react';
import { cn } from '@/lib/utils';

export interface RingData {
  label: string;
  current: number;
  target: number;
  color: string; // Hex or CSS color
  bgColor?: string;
  unit?: string;
}

export interface SwiftUIGaugeProps {
  rings: RingData[];
  size?: number;
  strokeWidth?: number;
  ringGap?: number;
  centerContent?: React.ReactNode;
  className?: string;
}

export const SwiftUIGauge: React.FC<SwiftUIGaugeProps> = ({
  rings,
  size = 180,
  strokeWidth = 14,
  ringGap = 4,
  centerContent,
  className,
}) => {
  const center = size / 2;

  return (
    <div className={cn('relative inline-flex items-center justify-center select-none', className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90 origin-center"
      >
        {rings.map((ring, index) => {
          // Radius calculation for each concentric ring from outside inward
          const radius = center - strokeWidth / 2 - index * (strokeWidth + ringGap);
          if (radius <= 0) return null;

          const circumference = 2 * Math.PI * radius;
          const percentage = ring.target > 0 ? Math.min(ring.current / ring.target, 1) : 0;
          const strokeDashoffset = circumference - percentage * circumference;

          return (
            <g key={ring.label}>
              {/* Ring Background Track */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={ring.bgColor || ring.color}
                strokeOpacity={0.16}
                strokeWidth={strokeWidth}
              />
              {/* Ring Active Progress */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={ring.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              />
            </g>
          );
        })}
      </svg>

      {centerContent && (
        <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
          {centerContent}
        </div>
      )}
    </div>
  );
};

export interface SwiftUIDialProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  label?: string;
  valueText?: string;
  className?: string;
}

export const SwiftUIDial: React.FC<SwiftUIDialProps> = ({
  percentage,
  size = 120,
  strokeWidth = 10,
  color = '#3b82f6',
  bgColor,
  label,
  valueText,
  className,
}) => {
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(percentage, 0), 100);
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center select-none', className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90 origin-center"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={bgColor || color}
          strokeOpacity={0.15}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {valueText && <span className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{valueText}</span>}
        {label && <span className="text-[10px] uppercase font-semibold text-zinc-400 dark:text-zinc-500 tracking-wider mt-0.5">{label}</span>}
      </div>
    </div>
  );
};
