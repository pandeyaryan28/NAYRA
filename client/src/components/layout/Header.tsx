import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import { 
  Search, 
  Command, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  Globe,
  Bell
} from 'lucide-react';
import { format } from 'date-fns';

export const Header: React.FC = () => {
  const { 
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
    <header className="h-16 bg-[#0c121e]/80 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between z-10">
      {/* Search / Command Launcher Bar */}
      <div className="flex items-center gap-4 w-96">
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 text-slate-400 hover:text-slate-200 text-xs transition-all shadow-inner group"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
            <span>Search or trigger Nayra actions...</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">
            <Command className="w-2.5 h-2.5" /> K
          </div>
        </button>
      </div>

      {/* Center Live HUD Clock */}
      <div className="hidden md:flex items-center gap-3 font-mono text-xs text-slate-400">
        <span className="text-cyan-400 font-semibold">{format(currentTime, 'HH:mm:ss')}</span>
        <span className="text-slate-600">|</span>
        <span>{format(currentTime, 'EEEE, MMM do, yyyy')}</span>
      </div>

      {/* Right Actions & Account Status */}
      <div className="flex items-center gap-3">
        {/* Toast Notification Notification Pill */}
        {notification && (
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-cyan-950/80 text-cyan-300 border border-cyan-700/50 animate-bounce">
            <Bell className="w-3.5 h-3.5 text-cyan-400" />
            <span>{notification.message}</span>
          </div>
        )}

        {/* Reload button */}
        <button
          onClick={refreshAll}
          title="Refresh Data"
          className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
        </button>

        {/* Nayra AI Orb Trigger */}
        <button
          onClick={() => setIsNayraChatOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-medium transition-all shadow-sm glow-cyan"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          <span>Ask Nayra</span>
        </button>

        {/* Google User Status */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="relative">
            <img
              src={authStatus?.user?.picture || 'https://api.dicebear.com/7.x/bottts/svg?seed=NayraCommander'}
              alt="Commander"
              className="w-8 h-8 rounded-full border border-cyan-500/50 bg-slate-800"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900" title="Google Sync Active"></span>
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-medium text-slate-200 flex items-center gap-1">
              {authStatus?.user?.name || 'Aryan Pandey'}
            </div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-2.5 h-2.5" /> 2-Way Connected
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
