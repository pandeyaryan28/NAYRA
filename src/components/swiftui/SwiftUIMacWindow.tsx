import React, { useState } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SwiftUIMacWindowProps {
  title?: string;
  subtitle?: string;
  toolbarActions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  showTrafficLights?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  onZoom?: () => void;
}

export const SwiftUIMacWindow: React.FC<SwiftUIMacWindowProps> = ({
  title,
  subtitle,
  toolbarActions,
  children,
  className,
  showTrafficLights = true,
  onClose,
  onMinimize,
  onZoom,
}) => {
  const [trafficHover, setTrafficHover] = useState(false);

  return (
    <div
      className={cn(
        'relative flex flex-col w-full h-full overflow-hidden select-none',
        'bg-white/80 dark:bg-[#141417]/85 backdrop-blur-3xl',
        'border border-black/[0.08] dark:border-white/[0.12]',
        'shadow-[0_24px_64px_-12px_rgba(0,0,0,0.12),0_4px_16px_-2px_rgba(0,0,0,0.06),inset_0_1px_1.5px_0_rgba(255,255,255,0.95),inset_0_-1px_1px_0_rgba(0,0,0,0.02)]',
        'dark:shadow-[0_28px_72px_-12px_rgba(0,0,0,0.7),0_6px_20px_-2px_rgba(0,0,0,0.5),inset_0_1px_1.5px_0_rgba(255,255,255,0.15),inset_0_-1px_1px_0_rgba(0,0,0,0.4)]',
        className
      )}
    >
      {/* Unified Window Titlebar & Toolbar */}
      <div className="relative h-11 shrink-0 px-4 flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02]">
        {/* Left: Traffic Lights */}
        {showTrafficLights ? (
          <div
            className="flex items-center gap-2 group cursor-pointer"
            onMouseEnter={() => setTrafficHover(true)}
            onMouseLeave={() => setTrafficHover(false)}
            aria-label="macOS window controls"
          >
            {/* Close (Red) */}
            <button
              type="button"
              onClick={onClose}
              className="h-3 w-3 rounded-[999px] bg-[#ff5f56] border border-[#e0443e] flex items-center justify-center transition-all duration-150 active:scale-90"
              title="Close"
              aria-label="Close window"
            >
              {trafficHover && <X className="h-2 w-2 text-[#4d0000] stroke-[2.5]" />}
            </button>
            {/* Minimize (Yellow) */}
            <button
              type="button"
              onClick={onMinimize}
              className="h-3 w-3 rounded-[999px] bg-[#ffbd2e] border border-[#dea123] flex items-center justify-center transition-all duration-150 active:scale-90"
              title="Minimize"
              aria-label="Minimize window"
            >
              {trafficHover && <Minus className="h-2 w-2 text-[#5a3a00] stroke-[2.5]" />}
            </button>
            {/* Zoom / Fullscreen (Green) */}
            <button
              type="button"
              onClick={onZoom}
              className="h-3 w-3 rounded-[999px] bg-[#27c93f] border border-[#1aab29] flex items-center justify-center transition-all duration-150 active:scale-90"
              title="Zoom"
              aria-label="Zoom window"
            >
              {trafficHover && <Plus className="h-2 w-2 text-[#004d0f] stroke-[2.5]" />}
            </button>
          </div>
        ) : (
          <div className="w-12" />
        )}

        {/* Center: Title & Subtitle */}
        {title && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <span className="text-xs font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 block truncate max-w-xs">
              {title}
            </span>
            {subtitle && (
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block -mt-0.5 truncate max-w-xs">
                {subtitle}
              </span>
            )}
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {toolbarActions}
        </div>
      </div>

      {/* Window Body */}
      <div className="flex-1 min-h-0 overflow-auto">{children}</div>
    </div>
  );
};
