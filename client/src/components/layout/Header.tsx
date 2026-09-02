import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import { 
  Search, 
  Command, 
  Sun, 
  Moon, 
  RefreshCw, 
  Sparkles
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
    <header className="h-14 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121215] px-6 flex items-center justify-between z-10 transition-colors duration-150">
      {/* Left: Quick Search / Command Trigger */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 text-xs transition-all w-64 md:w-80 group cursor-pointer shadow-2xs"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-200" />
          <span className="flex-1 text-left font-normal">Search or run command...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded text-slate-500 dark:text-zinc-400 shadow-2xs">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </button>
      </div>

      {/* Center: Live HUD Date/Time */}
      <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-zinc-400">
        <span>{format(currentTime, 'EEE, MMM d')}</span>
        <span>•</span>
        <span className="font-semibold text-slate-800 dark:text-zinc-200">{format(currentTime, 'HH:mm:ss')}</span>
      </div>

      {/* Right: Actions, Theme Toggle & Account */}
      <div className="flex items-center gap-2">
        {/* Toast Notification */}
        {notification && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-slate-100 dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 animate-in fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="text-[11px] font-medium">{notification.message}</span>
          </div>
        )}

        {/* Sync / Refresh */}
        <button
          onClick={refreshAll}
          title="Refresh Data"
          className="p-2 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-slate-800 dark:text-zinc-200' : ''}`} />
        </button>

        {/* Dark / Light Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="p-2 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* Ask Nayra AI Trigger */}
        <button
          onClick={() => setIsNayraChatOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity cursor-pointer shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask Nayra</span>
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-zinc-800">
          <img
            src={authStatus?.user?.picture || 'https://api.dicebear.com/7.x/bottts/svg?seed=NayraCommander'}
            alt="Commander"
            className="w-7 h-7 rounded-full bg-slate-200 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700"
          />
        </div>
      </div>
    </header>
  );
};
