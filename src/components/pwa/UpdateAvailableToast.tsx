import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, X } from 'lucide-react';
import { SWUpdatedEventDetail, skipWaitingAndReload } from '@/lib/pwa';

export const UpdateAvailableToast: React.FC = () => {
  const [updateInfo, setUpdateInfo] = useState<SWUpdatedEventDetail | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    const handleSWUpdated = (event: CustomEvent<SWUpdatedEventDetail>) => {
      if (event.detail) {
        setUpdateInfo(event.detail);
        setDismissed(false);
      }
    };

    window.addEventListener('sw-updated', handleSWUpdated as EventListener);
    return () => {
      window.removeEventListener('sw-updated', handleSWUpdated as EventListener);
    };
  }, []);

  const handleUpdate = () => {
    setIsUpdating(true);
    skipWaitingAndReload(updateInfo?.registration ?? null);
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  if (!updateInfo || dismissed) {
    return null;
  }

  return (
    <aside
      role="alert"
      aria-live="assertive"
      className="fixed z-50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] animate-spring-scale"
      style={{
        top: 'calc(1.25rem + env(safe-area-inset-top, 0px))',
        right: 'calc(1.25rem + env(safe-area-inset-right, 0px))',
        left: 'calc(1.25rem + env(safe-area-inset-left, 0px))',
        maxWidth: '24rem',
        marginInlineStart: 'auto',
      }}
    >
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/40 dark:border-white/10 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.14),inset_0_1px_1px_rgba(255,255,255,0.7)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.12)] p-4 select-none">
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-blue-500/15 dark:bg-blue-400/15 blur-xl" />

        <div className="flex items-start gap-3">
          {/* Frosted Icon Capsule */}
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-400/15 dark:text-blue-300 border border-blue-500/20">
            <RefreshCw className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
          </div>

          {/* Text Info */}
          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                Update Available
              </h4>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400">
                <Sparkles className="h-2.5 w-2.5" /> New
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              A newer version of NAYRA is ready. Refresh now to experience the latest features and improvements.
            </p>
          </div>

          {/* Dismiss Button */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss update alert"
            className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors swiftui-press active:scale-[0.94] cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Action Row */}
        <div className="mt-3 flex items-center justify-end gap-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">
          <button
            type="button"
            onClick={handleDismiss}
            className="px-2.5 py-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors swiftui-press active:scale-[0.98] cursor-pointer"
          >
            Later
          </button>
          <button
            type="button"
            onClick={handleUpdate}
            disabled={isUpdating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-[0_2px_8px_-1px_rgba(0,0,0,0.18)] dark:shadow-[0_2px_8px_-1px_rgba(255,255,255,0.2)] transition-all swiftui-press active:scale-[0.97] cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`h-3 w-3 ${isUpdating ? 'animate-spin' : ''}`} />
            <span>{isUpdating ? 'Updating…' : 'Update Now'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
