import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.js';
import { 
  Sun, 
  Moon, 
  RefreshCw, 
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
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

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [customClientId, setCustomClientIdInput] = useState(() => getEffectiveClientId());

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
      setShowAdvanced(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 font-sans relative px-4 transition-colors duration-200">
      {/* Subtle background texture */}
      <div 
        className="absolute inset-0 opacity-30 dark:opacity-15 pointer-events-none bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px]" 
      />

      {/* Top-right theme toggle */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shadow-xs"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
      </div>

      {/* Main Minimal Box */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Brand Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-900 font-bold text-lg tracking-tight shadow-sm">
            N
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            NAYRA
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Sign in to access your personal command center
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm dark:shadow-2xl space-y-4">
          {/* Primary Action: Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 font-medium text-xs flex items-center justify-center gap-2.5 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-xs"
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
            <span>{isLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>

          {/* Secondary Action: Guest Mode */}
          <button
            onClick={enterGuestMode}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-800 text-slate-700 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white font-medium text-xs transition-colors cursor-pointer"
          >
            Continue as Guest
          </button>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Collapsible Advanced Options for Devs */}
          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/60">
            <button
              onClick={() => setShowAdvanced(prev => !prev)}
              type="button"
              className="w-full text-center text-[11px] text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 flex items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <span>Advanced options</span>
              {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-3 animate-in fade-in duration-150">
                <form onSubmit={handleManualTokenSubmit} className="space-y-2">
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400">
                    Direct Access Token
                  </label>
                  <input
                    type="text"
                    value={manualToken}
                    onChange={e => setManualToken(e.target.value)}
                    placeholder="ya29.a0AfH6SM..."
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={!manualToken.trim()}
                    className="w-full py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-40"
                  >
                    Authorize Token
                  </button>
                </form>

                <form onSubmit={handleSaveCustomClientId} className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800/60">
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400">
                    Google OAuth Client ID
                  </label>
                  <input
                    type="text"
                    value={customClientId}
                    onChange={e => setCustomClientIdInput(e.target.value)}
                    placeholder="...apps.googleusercontent.com"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={!customClientId.trim()}
                    className="w-full py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-40"
                  >
                    Save Client ID
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
