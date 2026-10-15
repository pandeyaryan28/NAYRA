import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sun,
  Moon,
  RefreshCw,
  LogIn,
  LogOut,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Command,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/common/Button';
import { formatDateString } from '@/lib/utils';

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { user, signInWithGoogle, signOut, continueAsGuest } = useAuth();
  const { isSyncing, syncWithGoogle, reconnectAndSync, isGoogleTokenExpired, lastSyncTime } = useData();
  const [isReconnecting, setIsReconnecting] = useState(false);

  const handleSyncOrReconnect = async () => {
    if (isGoogleTokenExpired) {
      setIsReconnecting(true);
      try {
        await reconnectAndSync();
      } catch (err) {
        console.warn('Reconnect failed:', err);
      } finally {
        setIsReconnecting(false);
      }
    } else {
      await syncWithGoogle();
    }
  };

  const getSectionTitle = (pathname: string): string => {
    switch (pathname) {
      case '/':
        return 'Overview Dashboard';
      case '/calendar':
        return 'Calendar';
      case '/tasks':
        return 'Tasks';
      case '/focus':
        return 'Focus Lab';
      case '/habits':
        return 'Habit Tracker';
      case '/calories':
        return 'Nutrition & Calories';
      case '/ca-tracker':
        return 'CA Foundation Tracker';
      case '/scint-engine':
        return 'SCInt Semiconductor Diligence';
      case '/analytics':
        return 'Productivity Analytics';
      case '/assistant':
        return 'Personal Assistant';
      case '/settings':
        return 'System Settings';
      default:
        return 'NAYRA';
    }
  };

  const todayStr = formatDateString(new Date(), 'EEEE, MMMM d');

  return (
    <header className="h-12 border-b border-black/[0.05] dark:border-white/[0.06] bg-white/70 dark:bg-[#161619]/75 backdrop-blur-3xl px-4 sm:px-6 flex items-center justify-between z-20 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.95)] dark:shadow-[0_2px_16px_-2px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)] select-none">
      {/* Left: Navigation chevrons, Breadcrumbs & Date */}
      <div className="flex items-center gap-3">
        {/* Navigation History Chevrons */}
        <div className="hidden sm:flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="h-7 w-7 rounded-md flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer swiftui-press"
            title="Go back"
            aria-label="Go back"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => navigate(1)}
            className="h-7 w-7 rounded-md flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer swiftui-press"
            title="Go forward"
            aria-label="Go forward"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Breadcrumb Title */}
        <div className="flex items-center text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm tracking-tight">
            {getSectionTitle(location.pathname)}
          </span>
          <span className="mx-2 text-zinc-300 dark:text-zinc-700">/</span>
          <span className="hidden md:inline font-mono text-[11px]">{todayStr}</span>
        </div>
      </div>

      {/* Right: Actions, Sync, Theme, User Auth */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Keyboard shortcut hint */}
        <div className="hidden xl:flex items-center gap-1 px-2 py-1 rounded-md bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] text-[10px] text-zinc-400 font-mono">
          <Command className="h-3 w-3" />
          <span>1-9 tabs</span>
        </div>

        {/* Google Sync Status */}
        {user && !user.isGuest && (
          isGoogleTokenExpired ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncOrReconnect}
              disabled={isReconnecting || isSyncing}
              className="text-xs text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 gap-1.5 rounded-md"
              title="Google OAuth session expired (1-hour token limit). Click to reconnect."
            >
              <AlertCircle className={`h-3.5 w-3.5 shrink-0 ${isReconnecting ? 'animate-spin' : ''}`} />
              <span className="font-medium">
                {isReconnecting ? 'Reconnecting...' : 'Reconnect Google'}
              </span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSyncOrReconnect}
              disabled={isSyncing}
              className="text-xs text-zinc-600 dark:text-zinc-400 gap-1.5 rounded-md"
              title={lastSyncTime ? `Last synced ${lastSyncTime.toLocaleTimeString()}` : 'Sync with Google'}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-sky-500' : ''}`} />
              <span className="hidden md:inline">
                {isSyncing ? 'Syncing...' : 'Google Synced'}
              </span>
            </Button>
          )
        )}

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="h-8 w-8 text-zinc-600 dark:text-zinc-300 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Auth / Profile Area */}
        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-zinc-800">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="h-7 w-7 rounded-md border border-zinc-200 dark:border-zinc-700 object-cover"
              />
            ) : (
              <div className="h-7 w-7 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center text-xs font-semibold">
                {user.displayName?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div className="hidden lg:block text-left">
              <span className="block text-xs font-medium text-zinc-900 dark:text-zinc-100 leading-tight">
                {user.displayName}
              </span>
              <span className="block text-[10px] text-zinc-400">
                {user.isGuest ? 'Guest Mode' : 'Connected to Google'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              title="Sign out"
              aria-label="Sign out"
              className="h-7 w-7 text-zinc-400 hover:text-rose-500 rounded-md"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={continueAsGuest}
              className="text-xs"
            >
              Guest
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={signInWithGoogle}
              className="text-xs gap-1.5"
            >
              <LogIn className="h-3.5 w-3.5" />
              Sign in with Google
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
