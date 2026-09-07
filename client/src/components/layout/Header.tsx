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
  ExternalLink,
  LogOut,
  Key,
  ShieldCheck
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
    connectGoogleManual,
    disconnectGoogle,
    syncGoogleTasks,
    syncGoogleCalendar,
    submitManualGoogleCode,
    setIsCommandPaletteOpen, 
    setIsNayraChatOpen,
    notification
  } = useApp();

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authTab, setAuthTab] = useState<'oneclick' | 'token' | 'code'>('oneclick');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOneClickConnect = async () => {
    setIsSubmitting(true);
    try {
      await connectGoogle();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    setIsSubmitting(true);
    try {
      await connectGoogleManual(manualToken.trim());
      setManualToken('');
      setIsGoogleModalOpen(false);
    } catch (e) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    setIsSubmitting(true);
    try {
      await submitManualGoogleCode(manualCode.trim());
      setManualCode('');
      setIsGoogleModalOpen(false);
    } catch (e) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnectGoogle();
    setIsGoogleModalOpen(false);
  };

  const handleManualSync = async () => {
    await syncGoogleTasks();
    await syncGoogleCalendar();
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
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 flex items-start gap-3">
                    <img
                      src={authStatus?.user?.picture || 'https://api.dicebear.com/7.x/bottts/svg?seed=AryanPandey'}
                      alt="Google User"
                      className="w-10 h-10 rounded-full border border-emerald-300 dark:border-emerald-700 mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <p className="font-semibold text-emerald-900 dark:text-emerald-200 text-xs">
                          {authStatus?.user?.name || 'Google Connected'}
                        </p>
                      </div>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono truncate mt-0.5">
                        {authStatus?.user?.email || 'aaryanpandey28@gmail.com'}
                      </p>
                      <p className="text-[10px] text-emerald-600/80 dark:text-emerald-500 mt-1">
                        ✓ 2-Way Google Tasks & Calendar Sync Active
                      </p>
                    </div>
                  </div>

                  <p className="text-slate-500 dark:text-zinc-400 text-[11px] leading-relaxed">
                    All tasks and calendar events created or updated in Nayra are synchronized with your real Google account in real time.
                  </p>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleManualSync}
                      disabled={isSyncing}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-medium transition-colors cursor-pointer text-xs"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDisconnect}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-400 font-medium border border-rose-200 dark:border-rose-800/40 transition-colors cursor-pointer text-xs"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Disconnect</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Tab switch */}
                  <div className="flex p-0.5 bg-slate-100 dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setAuthTab('oneclick')}
                      className={`flex-1 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
                        authTab === 'oneclick'
                          ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-2xs'
                          : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      1-Click Sign-In
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthTab('token')}
                      className={`flex-1 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
                        authTab === 'token'
                          ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-2xs'
                          : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      Instant Token
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthTab('code')}
                      className={`flex-1 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
                        authTab === 'code'
                          ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-2xs'
                          : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      OAuth Code
                    </button>
                  </div>

                  {authTab === 'oneclick' && (
                    <div className="space-y-3">
                      <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                        Sign in directly with your Google account to grant access to <span className="font-semibold text-slate-800 dark:text-zinc-200">Google Tasks</span> and <span className="font-semibold text-slate-800 dark:text-zinc-200">Google Calendar</span>.
                      </p>

                      <button
                        onClick={handleOneClickConnect}
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-lg bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-medium hover:opacity-90 transition-opacity cursor-pointer shadow-2xs text-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{isSubmitting ? 'Opening Google...' : 'Sign in with Google'}</span>
                      </button>

                      <div className="p-2.5 rounded-lg bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/40 text-[11px] text-sky-800 dark:text-sky-300">
                        <p className="font-medium flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                          <span>Authorized Origin Setup</span>
                        </p>
                        <p className="mt-1 text-[10px] leading-relaxed text-sky-700 dark:text-sky-400">
                          If Google displays an origin mismatch, add <code className="px-1 py-0.5 rounded bg-sky-100 dark:bg-sky-900/60 font-mono text-[10px]">https://nayra-command-center.vercel.app</code> to <strong>Authorized JavaScript origins</strong> in Google Cloud Console, or use the <strong>Instant Token</strong> tab.
                        </p>
                      </div>
                    </div>
                  )}

                  {authTab === 'token' && (
                    <form onSubmit={handleManualTokenSubmit} className="space-y-3">
                      <p className="text-slate-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                        Paste a valid Google OAuth Access Token (starts with <code className="font-mono text-[10px] bg-slate-100 dark:bg-zinc-800 px-1 py-0.5 rounded">ya29...</code>) to link your account immediately:
                      </p>
                      <div className="space-y-2">
                        <textarea
                          rows={3}
                          value={manualToken}
                          onChange={e => setManualToken(e.target.value)}
                          placeholder="ya29.a0AcM612..."
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 font-mono focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                        />
                        <button
                          type="submit"
                          disabled={isSubmitting || !manualToken.trim()}
                          className="w-full py-2 px-3 rounded-lg bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-medium hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer text-xs flex items-center justify-center gap-1.5"
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>{isSubmitting ? 'Verifying...' : 'Link with Access Token'}</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {authTab === 'code' && (
                    <form onSubmit={handleManualCodeSubmit} className="space-y-3">
                      <p className="text-slate-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                        If running a backend callback or OAuth Playground, paste your Google OAuth authorization code:
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={manualCode}
                          onChange={e => setManualCode(e.target.value)}
                          placeholder="4/0AWtgzh..."
                          className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-sky-500 font-mono"
                        />
                        <button
                          type="submit"
                          disabled={isSubmitting || !manualCode.trim()}
                          className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-medium hover:bg-slate-300 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 cursor-pointer text-xs"
                        >
                          {isSubmitting ? 'Linking...' : 'Connect'}
                        </button>
                      </div>
                    </form>
                  )}
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
