import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import { 
  Search, 
  Command, 
  Sun, 
  Moon, 
  RefreshCw, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';

export const Header: React.FC = () => {
  const { 
    theme, 
    toggleTheme, 
    authStatus, 
    isSyncing, 
    refreshAll, 
    setIsCommandPaletteOpen, 
    setIsNayraChatOpen,
    notification
  } = useApp();

  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-14 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md px-6 flex items-center justify-between z-10 transition-colors duration-200">
      {/* Left: Quick Search / Command Trigger */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 text-xs transition-all w-64 md:w-80 group cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200" />
          <span className="flex-1 text-left">Search or run command...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-500 dark:text-zinc-400 shadow-2xs">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </button>
      </div>

      {/* Center: Minimal HUD Date/Time */}
      <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-zinc-400">
        <span>{format(currentTime, 'EEE, MMM d')}</span>
        <span>•</span>
        <span className="font-semibold text-zinc-800 dark:text-zinc-200">{format(currentTime, 'HH:mm:ss')}</span>
      </div>

      {/* Right: Actions, Theme Toggle & Account */}
      <div className="flex items-center gap-2.5">
        {/* Toast Notification */}
        {notification && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="text-[11px] font-medium">{notification.message}</span>
          </div>
        )}

        {/* Sync / Refresh */}
        <button
          onClick={refreshAll}
          title="Refresh Data"
          className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-zinc-800 dark:text-zinc-200' : ''}`} />
        </button>

        {/* Dark / Light Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-zinc-700" />
          )}
        </button>

        {/* Ask Nayra AI Trigger */}
        <button
          onClick={() => setIsNayraChatOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask Nayra</span>
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-zinc-800">
          <img
            src={authStatus?.user?.picture || 'https://api.dicebear.com/7.x/bottts/svg?seed=NayraCommander'}
            alt="Commander"
            className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
          />
        </div>
      </div>
    </header>
  );
};
