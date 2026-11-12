import React, { useState, useEffect, useCallback } from 'react';
import { Download, X, Share2, PlusSquare, Sparkles } from 'lucide-react';
import { isPWAInstalled, isIOS, BeforeInstallPromptEvent } from '@/lib/pwa';

const DISMISSED_STORAGE_KEY = 'nayra_pwa_install_dismissed_at';
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days cooldown

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [isiOSPrompt, setIsiOSPrompt] = useState<boolean>(false);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);

  // Check whether the user recently dismissed the prompt
  const isDismissedRecently = useCallback((): boolean => {
    try {
      const dismissedAt = localStorage.getItem(DISMISSED_STORAGE_KEY);
      if (!dismissedAt) return false;
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      return elapsed < DISMISS_COOLDOWN_MS;
    } catch {
      return false;
    }
  }, []);

  const handleDismiss = useCallback(() => {
    try {
      localStorage.setItem(DISMISSED_STORAGE_KEY, Date.now().toString());
    } catch {
      // Ignore localStorage exceptions in private browsing
    }
    setShowPrompt(false);
  }, []);

  useEffect(() => {
    // If already installed in standalone mode, do not show any install prompt
    if (isPWAInstalled()) {
      return;
    }

    if (isDismissedRecently()) {
      return;
    }

    // 1. Android / Desktop Chromium beforeinstallprompt handler
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsiOSPrompt(false);
      setShowPrompt(true);
    };

    // 2. Browser appinstalled handler
    const handleAppInstalled = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // 3. iOS Safari detection (where beforeinstallprompt does not exist)
    if (isIOS() && !isPWAInstalled() && !isDismissedRecently()) {
      // Delay slightly for smooth page entrance animation
      const timer = setTimeout(() => {
        setIsiOSPrompt(true);
        setShowPrompt(true);
      }, 1800);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isDismissedRecently]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setShowPrompt(false);
        setDeferredPrompt(null);
      } else {
        handleDismiss();
      }
    } catch (err) {
      console.warn('[PWA] Prompt trigger error:', err);
    } finally {
      setIsInstalling(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <aside
      role="region"
      aria-label="Install NAYRA Application"
      className="fixed z-50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] animate-spring-scale"
      style={{
        bottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))',
        right: 'calc(1.25rem + env(safe-area-inset-right, 0px))',
        left: 'calc(1.25rem + env(safe-area-inset-left, 0px))',
        maxWidth: '26rem',
        marginInlineStart: 'auto',
      }}
    >
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/40 dark:border-white/10 bg-white/80 dark:bg-zinc-900/85 backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.7)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.12)] p-4 sm:p-4.5 select-none">
        {/* Subtle Ambient Radial Highlight */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-cyan-500/10 dark:bg-cyan-400/10 blur-2xl" />

        <div className="flex items-start gap-3.5">
          {/* NAYRA Squircle Icon */}
          <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-0.5 shadow-md ring-1 ring-white/20">
            <svg
              className="h-6 w-6"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="prism-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00E5FF" />
                  <stop offset="50%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
              <path
                d="M 28 72 L 28 28 L 72 72 L 72 28"
                stroke="url(#prism-gradient)"
                strokeWidth="11"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Prompt Content */}
          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                Install NAYRA
              </h4>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <Sparkles className="h-2.5 w-2.5" /> PWA
              </span>
            </div>

            {isiOSPrompt ? (
              <div className="mt-1 space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
                <p className="leading-snug">Install on your iPhone/iPad Home Screen:</p>
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span>1. Tap Share</span>
                  <Share2 className="h-3.5 w-3.5 text-blue-500 inline" />
                  <span>in Safari toolbar</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span>2. Tap Add to Home Screen</span>
                  <PlusSquare className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-300 inline" />
                </div>
              </div>
            ) : (
              <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                Add to your home screen or desktop dock for instant offline access and native multitasking.
              </p>
            )}
          </div>

          {/* Close / Dismiss Button */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss install prompt"
            className="absolute top-3.5 right-3.5 flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors swiftui-press active:scale-[0.94] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mt-3.5 flex items-center justify-end gap-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">
          <button
            type="button"
            onClick={handleDismiss}
            className="px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors swiftui-press active:scale-[0.98] cursor-pointer"
          >
            Not Now
          </button>

          {isiOSPrompt ? (
            <button
              type="button"
              onClick={handleDismiss}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-[0_2px_8px_-1px_rgba(0,0,0,0.18)] dark:shadow-[0_2px_8px_-1px_rgba(255,255,255,0.2)] transition-all swiftui-press active:scale-[0.97] cursor-pointer"
            >
              Got It
            </button>
          ) : (
            <button
              type="button"
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-[0_2px_8px_-1px_rgba(0,0,0,0.18)] dark:shadow-[0_2px_8px_-1px_rgba(255,255,255,0.2)] transition-all swiftui-press active:scale-[0.97] cursor-pointer disabled:opacity-60"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{isInstalling ? 'Installing…' : 'Install NAYRA'}</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
