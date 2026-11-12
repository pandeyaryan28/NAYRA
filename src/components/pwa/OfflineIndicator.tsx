import React, { useState, useEffect, useRef } from 'react';
import { WifiOff, Wifi, CheckCircle2 } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOffline, setIsOffline] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
      return !navigator.onLine;
    }
    return false;
  });

  const [showRestoredToast, setShowRestoredToast] = useState<boolean>(false);
  const previousOfflineState = useRef<boolean>(isOffline);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleOffline = () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      setShowRestoredToast(false);
      setIsOffline(true);
      previousOfflineState.current = true;
    };

    const handleOnline = () => {
      setIsOffline(false);
      if (previousOfflineState.current) {
        // Trigger recovery toast only when transitioning from offline -> online
        setShowRestoredToast(true);
        if (toastTimeoutRef.current) {
          clearTimeout(toastTimeoutRef.current);
        }
        toastTimeoutRef.current = setTimeout(() => {
          setShowRestoredToast(false);
        }, 3600);
      }
      previousOfflineState.current = false;
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    window.addEventListener('sw-offline', handleOffline);
    window.addEventListener('sw-online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('sw-offline', handleOffline);
      window.removeEventListener('sw-online', handleOnline);
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  if (!isOffline && !showRestoredToast) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] animate-slide-down"
      style={{
        top: 'calc(0.75rem + env(safe-area-inset-top, 0px))',
      }}
    >
      {isOffline ? (
        <div className="flex items-center gap-2 rounded-full border border-amber-500/30 dark:border-amber-400/25 bg-amber-50/85 dark:bg-amber-950/75 px-3.5 py-1.5 text-xs font-medium text-amber-800 dark:text-amber-200 shadow-[0_8px_24px_rgba(245,158,11,0.18),inset_0_1px_1px_rgba(255,255,255,0.6)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-xl">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          <WifiOff className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          <span>Offline Mode • Local Cache Active</span>
        </div>
      ) : showRestoredToast ? (
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 dark:border-emerald-400/25 bg-emerald-50/85 dark:bg-emerald-950/75 px-3.5 py-1.5 text-xs font-medium text-emerald-800 dark:text-emerald-200 shadow-[0_8px_24px_rgba(16,185,129,0.18),inset_0_1px_1px_rgba(255,255,255,0.6)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-xl">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Back Online • Synchronized</span>
        </div>
      ) : null}
    </div>
  );
};
