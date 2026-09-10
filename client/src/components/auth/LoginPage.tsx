import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.js';
import { 
  ShieldCheck, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Sun, 
  Moon, 
  Key, 
  Terminal, 
  ArrowRight,
  RefreshCw,
  Cpu,
  Calendar,
  CheckSquare
} from 'lucide-react';
import { 
  GOOGLE_CLOUD_PROJECT_ID, 
  GOOGLE_API_ENABLE_LINKS, 
  getEffectiveClientId, 
  setCustomClientId 
} from '../../services/googleClientSync.js';

export const LoginPage: React.FC = () => {
  const { 
    theme, 
    toggleTheme, 
    connectGoogle, 
    connectGoogleManual, 
    enterGuestMode, 
    showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'google' | 'token' | 'config'>('google');
  const [manualToken, setManualToken] = useState('');
  const [customClientId, setCustomClientIdInput] = useState(() => getEffectiveClientId());
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await connectGoogle();
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMessage(err.message || 'Failed to authenticate with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await connectGoogleManual(manualToken.trim());
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid or expired Google access token.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCustomClientId = (e: React.FormEvent) => {
    e.preventDefault();
    if (customClientId.trim()) {
      setCustomClientId(customClientId.trim());
      showToast('Client ID saved! Click Sign in with Google to test.', 'success');
      setActiveTab('google');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 font-sans selection:bg-indigo-500/20 selection:text-indigo-700 dark:selection:text-indigo-300 relative overflow-x-hidden transition-colors duration-200">
      {/* Subtle Dot Grid Pattern - No glowing blur orbs */}
      <div 
        className="absolute inset-0 opacity-40 dark:opacity-20 pointer-events-none bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px]" 
      />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-slate-200/60 dark:border-zinc-800/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 shadow-xs">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-wider text-sm text-slate-900 dark:text-white">NAYRA</span>
              <span className="px-1.5 py-0.5 text-[9px] font-mono font-medium rounded bg-slate-200/70 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-300/60 dark:border-zinc-700/60">
                v2.4 CORE
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">Autonomous Command Center</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[11px] font-mono text-slate-600 dark:text-zinc-400 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>GCP: {GOOGLE_CLOUD_PROJECT_ID}</span>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shadow-2xs"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>
      </header>

      {/* Main Login / Hero Section */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-6">
          
          {/* Hero Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-400 text-xs font-mono mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Executive Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Command Terminal
            </h1>
            <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
              Authenticate with your Google Account for real-time 2-way sync with Google Tasks and Calendar, or enter offline mode.
            </p>
          </div>

          {/* Auth Card */}
          <div className="bg-white dark:bg-[#121217] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-6 transition-colors">
            
            {/* Tabs */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-zinc-900 p-1 border border-slate-200 dark:border-zinc-800 text-xs font-medium">
              <button
                onClick={() => setActiveTab('google')}
                className={`flex-1 py-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'google'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                <span>Google Sign-In</span>
              </button>
              <button
                onClick={() => setActiveTab('token')}
                className={`flex-1 py-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'token'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                <Key className="w-3 h-3" />
                <span>Access Token</span>
              </button>
              <button
                onClick={() => setActiveTab('config')}
                className={`flex-1 py-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'config'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                <Terminal className="w-3 h-3" />
                <span>Client ID</span>
              </button>
            </div>

            {/* Tab 1: 1-Click Google OAuth */}
            {activeTab === 'google' && (
              <div className="space-y-4">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-zinc-950 font-semibold text-sm flex items-center justify-center gap-3 transition-colors shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.94H1.24v3.15C3.26 21.36 7.34 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.26c-.25-.72-.38-1.49-.38-2.26s.13-1.54.38-2.26V6.59H1.24C.45 8.16 0 9.97 0 12s.45 3.84 1.24 5.41l4.04-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.24 6.59l4.04 3.15c.95-2.84 3.6-4.99 6.72-4.99z"
                      />
                    </svg>
                  )}
                  <span>{isLoading ? 'Connecting to Google Cloud...' : 'Sign in with Google'}</span>
                </button>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-zinc-400">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Live Google Tasks Sync</span>
                    </span>
                    <span className="font-mono text-slate-400 dark:text-zinc-500">Read / Write</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-zinc-400">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Live Google Calendar Sync</span>
                    </span>
                    <span className="font-mono text-slate-400 dark:text-zinc-500">Read / Write</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-zinc-400">
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Client-Side Token Security</span>
                    </span>
                    <span className="font-mono text-slate-400 dark:text-zinc-500">Encrypted Local</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Manual Access Token */}
            {activeTab === 'token' && (
              <form onSubmit={handleManualTokenSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                    OAuth2 Access Token (starts with ya29.)
                  </label>
                  <textarea
                    rows={3}
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="ya29.a0AfH6SM..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-zinc-500">
                    Directly inject an access token from Google OAuth Playground or CLI.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !manualToken.trim()}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-2xs"
                >
                  {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
                  <span>Authorize Access Token</span>
                </button>
              </form>
            )}

            {/* Tab 3: Client ID Configuration */}
            {activeTab === 'config' && (
              <form onSubmit={handleSaveCustomClientId} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                    Google OAuth Client ID
                  </label>
                  <input
                    type="text"
                    value={customClientId}
                    onChange={(e) => setCustomClientIdInput(e.target.value)}
                    placeholder="906360138563-...apps.googleusercontent.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-zinc-500">
                    Current active project: <span className="text-slate-800 dark:text-zinc-300 font-mono">{GOOGLE_CLOUD_PROJECT_ID}</span>
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 text-white font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
                >
                  Save Client ID
                </button>
              </form>
            )}

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-rose-800 dark:text-rose-200">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Authentication Notice</span>
                </div>
                <p className="text-[11px] leading-relaxed">{errorMessage}</p>
                {errorMessage.includes('API') && (
                  <div className="pt-1 flex gap-3">
                    <a
                      href={GOOGLE_API_ENABLE_LINKS.tasks}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-indigo-600 dark:text-indigo-300 underline hover:text-indigo-800 dark:hover:text-indigo-200"
                    >
                      Enable Tasks API &rarr;
                    </a>
                    <a
                      href={GOOGLE_API_ENABLE_LINKS.calendar}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-indigo-600 dark:text-indigo-300 underline hover:text-indigo-800 dark:hover:text-indigo-200"
                    >
                      Enable Calendar API &rarr;
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-zinc-800" />
              </div>
              <span className="relative px-3 bg-white dark:bg-[#121217] text-[10px] font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                Or Continue Offline
              </span>
            </div>

            {/* Offline / Guest Mode Bypass Button */}
            <button
              onClick={enterGuestMode}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900/90 dark:hover:bg-zinc-800/90 border border-slate-200 dark:border-zinc-800 text-slate-700 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer group shadow-2xs"
            >
              <Terminal className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
              <span>Enter Offline Command Center</span>
              <ArrowRight className="w-3 h-3 text-slate-400 dark:text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
            </button>

          </div>

          {/* Quick API Status & Production Links */}
          <div className="bg-white/80 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 text-[11px] text-slate-600 dark:text-zinc-400 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 dark:text-zinc-300 font-mono text-[10px] uppercase tracking-wider">
                GCP Sync Status ({GOOGLE_CLOUD_PROJECT_ID})
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">1-Click Setup</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <a
                href={GOOGLE_API_ENABLE_LINKS.tasks}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900/80 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <CheckSquare className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                <span className="truncate">Tasks API</span>
                <ExternalLink className="w-2.5 h-2.5 ml-auto text-slate-400 dark:text-zinc-500" />
              </a>
              <a
                href={GOOGLE_API_ENABLE_LINKS.calendar}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900/80 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <Calendar className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                <span className="truncate">Calendar API</span>
                <ExternalLink className="w-2.5 h-2.5 ml-auto text-slate-400 dark:text-zinc-500" />
              </a>
            </div>
          </div>

        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 text-center text-[11px] font-mono text-slate-500 dark:text-zinc-600 border-t border-slate-200/60 dark:border-zinc-800/60">
        NAYRA System • Clear to Commander Aryan Pandey • nyra-ap28-2026
      </footer>
    </div>
  );
};
