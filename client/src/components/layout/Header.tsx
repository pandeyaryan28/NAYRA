import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import { 
  Search, 
  Command, 
  Sun, 
  Moon, 
  RefreshCw, 
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
  X,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';

export const Header: React.FC = () => {
  const { 
    theme, 
    toggleTheme, 
    authStatus, 
    isSyncing, 
    refreshAll, 
    connectGoogle,
    submitManualGoogleCode,
    setIsCommandPaletteOpen, 
    setIsNayraChatOpen,
    notification
  } = useApp();

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleManualCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    setIsSubmittingCode(true);
    try {
      await submitManualGoogleCode(manualCode.trim());
      setManualCode('');
      setIsGoogleModalOpen(false);
    } catch (e) {
    } finally {
      setIsSubmittingCode(false);
    }
  };

  return (
    <>
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

          {/* Google Ecosystem Status Button */}
          <button
            onClick={() => setIsGoogleModalOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer shadow-2xs ${
              authStatus?.googleConnected
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                : 'bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:bg-slate-200/80 dark:hover:bg-zinc-800'
            }`}
          >
            {authStatus?.googleConnected ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Google Linked</span>
              </>
            ) : (
              <>
                <LinkIcon className="w-3 h-3 text-slate-400" />
                <span>Connect Google</span>
              </>
            )}
          </button>

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

      {/* Google Link Modal */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-sky-500" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Google Ecosystem Integration
                </h3>
              </div>
              <button
                onClick={() => setIsGoogleModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {authStatus?.googleConnected ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                        Google Account Connected
                      </p>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                        Connected as <span className="font-mono">{authStatus?.user?.email || 'aryan@nayra.command'}</span>. 2-way sync with Google Tasks and Google Calendar is active.
                      </p>
                    </div>
                  </div>
                  <p className="text-slate-500 dark:text-zinc-400">
                    All new tasks and calendar events created in Nayra are automatically mirrored to Google Cloud, and remote updates are pulled on sync.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-slate-600 dark:text-zinc-400">
                    Link your actual Google Account to enable continuous 2-way synchronization with <span className="font-semibold text-slate-800 dark:text-zinc-200">Google Tasks</span> and <span className="font-semibold text-slate-800 dark:text-zinc-200">Google Calendar</span>.
                  </p>

                  <button
                    onClick={connectGoogle}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-medium hover:opacity-90 transition-opacity cursor-pointer shadow-2xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Authorize with Google Account</span>
                  </button>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200 dark:border-zinc-800"></div>
                    <span className="flex-shrink mx-3 text-[10px] font-mono text-slate-400 dark:text-zinc-500 uppercase">Or manual authorization code</span>
                    <div className="flex-grow border-t border-slate-200 dark:border-zinc-800"></div>
                  </div>

                  <form onSubmit={handleManualCodeSubmit} className="space-y-2">
                    <label className="block text-[11px] text-slate-500 dark:text-zinc-400">
                      Paste OAuth authorization code:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={manualCode}
                        onChange={e => setManualCode(e.target.value)}
                        placeholder="4/0AWtgzh..."
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                      />
                      <button
                        type="submit"
                        disabled={isSubmittingCode || !manualCode.trim()}
                        className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-medium hover:bg-slate-300 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {isSubmittingCode ? 'Linking...' : 'Connect'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 flex justify-end">
              <button
                onClick={() => setIsGoogleModalOpen(false)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
