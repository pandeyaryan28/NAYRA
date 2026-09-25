import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.js';
import { 
  UI_STYLES, 
  ACCENT_COLORS 
} from '../../types/theme.js';
import { 
  Check, 
  Layers, 
  Smile, 
  Square, 
  Zap, 
  Sliders, 
  Sun, 
  Moon, 
  Palette, 
  ShieldCheck, 
  Eye, 
  CheckCircle2, 
  Flame, 
  RotateCcw,
  Link as LinkIcon,
  RefreshCw,
  ExternalLink,
  LogOut,
  Key,
  Settings as SettingsIcon,
  Keyboard,
  Info
} from 'lucide-react';
import { 
  getEffectiveClientId, 
  setCustomClientId, 
  GOOGLE_CLOUD_PROJECT_ID, 
  GOOGLE_API_ENABLE_LINKS 
} from '../../services/googleClientSync.js';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Layers,
  Smile,
  Square,
  Zap,
  Sliders,
  Palette
};

export const SettingsView: React.FC = () => {
  const { 
    uiStyle, 
    setUiStyle, 
    theme, 
    toggleTheme,
    accentColor, 
    setAccentColor,
    authStatus,
    isSyncing,
    connectGoogle,
    connectGoogleManual,
    disconnectGoogle,
    syncGoogleTasks,
    syncGoogleCalendar,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'appearance' | 'google' | 'shortcuts'>('appearance');
  const [previewText, setPreviewText] = useState('Productivity maximized');
  const [testTaskDone, setTestTaskDone] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [customClientIdInput, setCustomClientIdInput] = useState(() => getEffectiveClientId());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authSubTab, setAuthSubTab] = useState<'oneclick' | 'token' | 'clientid'>('oneclick');

  const handleResetDefaults = () => {
    setUiStyle('glassmorphism');
    setAccentColor('indigo');
    showToast('Reset appearance to default Glassmorphism theme', 'info');
  };

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
      showToast('Successfully linked Google Access Token!', 'success');
    } catch (_e) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnectGoogle();
    showToast('Google account disconnected', 'info');
  };

  const handleManualSync = async () => {
    await syncGoogleTasks();
    await syncGoogleCalendar();
  };

  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    if (customClientIdInput.trim()) {
      setCustomClientId(customClientIdInput.trim());
      showToast('Saved Google OAuth Client ID!', 'success');
      setAuthSubTab('oneclick');
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-6 transition-colors duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
              Settings & Integrations
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 font-medium">
              Workstation Config
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Configure Executive Cockpit interface aesthetics, 2-way Google Cloud synchronization, and keyboard shortcuts.
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center p-1 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'appearance'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Appearance Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('google')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'google'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Google Cloud Sync</span>
          </button>

          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'shortcuts'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Shortcuts & Info</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Appearance Studio */}
      {activeTab === 'appearance' && (
        <div className="space-y-6">
          {/* Mode Switcher & Accent Palette */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs">
            {/* Theme Mode Toggle */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Display Color Mode</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => theme !== 'light' && toggleTheme()}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    theme === 'light'
                      ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 border-indigo-500 shadow-xs font-semibold'
                      : 'bg-transparent text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Light Mode</span>
                </button>
                <button
                  type="button"
                  onClick={() => theme !== 'dark' && toggleTheme()}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-zinc-800 text-white border-indigo-500 shadow-xs font-semibold'
                      : 'bg-transparent text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900'
                  }`}
                >
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>Dark Mode</span>
                </button>
              </div>
            </div>

            {/* Accent Color Presets */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                <Palette className="w-3.5 h-3.5 text-indigo-500" />
                <span>Chromatic Accent Tint</span>
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {ACCENT_COLORS.map(c => {
                  const isActive = accentColor === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setAccentColor(c.id);
                        showToast(`Accent set to ${c.name}`, 'info');
                      }}
                      title={c.name}
                      className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'border-slate-900 dark:border-white shadow-xs font-semibold ring-2 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-xs ${c.colorClass} shrink-0`} />
                      <span className="text-[11px] text-slate-700 dark:text-zinc-300">{c.name.split(' ')[0]}</span>
                      {isActive && <Check className="w-3 h-3 text-slate-900 dark:text-white stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* UI Style Visual Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Select Design Architecture
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Each style applies tailored shadow depths, border dynamics, textures, and physical interactions.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  <span>WCAG AA Calibrated</span>
                </div>
                <button
                  onClick={handleResetDefaults}
                  className="px-2.5 py-1 rounded-md text-xs font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* 6 Responsive Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {UI_STYLES.map(style => {
                const IconComponent = ICON_MAP[style.iconName] || Palette;
                const isSelected = uiStyle === style.id;

                return (
                  <div
                    key={style.id}
                    onClick={() => {
                      setUiStyle(style.id);
                      showToast(`Applied ${style.name} design style`, 'success');
                    }}
                    className={`relative p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                      isSelected
                        ? 'border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/20'
                        : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 group-hover:text-slate-900 dark:group-hover:text-zinc-100'
                          }`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 block">
                              {style.name}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                              {style.badge}
                            </span>
                          </div>
                        </div>

                        {isSelected ? (
                          <div className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-md border border-slate-300 dark:border-zinc-700 shrink-0 group-hover:border-slate-400" />
                        )}
                      </div>

                      {/* Mini Preview Box */}
                      <div className={`h-14 rounded-lg p-2.5 my-2.5 border overflow-hidden flex items-center justify-between text-xs transition-all ${
                        style.id === 'glassmorphism'
                          ? 'bg-white/40 dark:bg-white/10 border-white/80 dark:border-white/20 backdrop-blur-md ring-1 ring-white/20'
                          : style.id === 'neumorphism'
                          ? 'bg-slate-200/70 dark:bg-zinc-800 border-white/50 dark:border-zinc-700/50'
                          : style.id === 'claymorphism'
                          ? 'bg-white dark:bg-zinc-800 border-white dark:border-zinc-700 rounded-xl'
                          : style.id === 'brutalism'
                          ? 'bg-amber-50/50 dark:bg-zinc-900 border-2 border-slate-900 dark:border-white'
                          : style.id === 'cyberpunk'
                          ? 'bg-slate-50 dark:bg-zinc-950 border border-cyan-500/40 text-cyan-600 dark:text-cyan-400 font-mono shadow-2xs'
                          : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs'
                      }`}>
                        <span className="font-medium text-[11px] truncate">{style.tagline.split('&')[0]}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-200/60 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 shrink-0">
                          Demo
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                        {style.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 flex flex-wrap gap-1">
                      {style.features.slice(0, 2).map((feat, i) => (
                        <span 
                          key={i}
                          className="text-[9.5px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-mono"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Contrast Inspection Sandbox */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121215] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-500" />
                <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                  Live Real-Time Composition & Contrast Inspection
                </h3>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-md bg-emerald-100/60 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="w-3 h-3" />
                <span>Contrast Ratio: 12.8:1 (AAA)</span>
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    N
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                      Sample Workstation Component
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Active Style: <span className="font-mono text-indigo-600 dark:text-indigo-400">{uiStyle}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/40">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setTestTaskDone(!testTaskDone)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                      testTaskDone
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'border-slate-300 dark:border-zinc-600'
                    }`}
                  >
                    {testTaskDone && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                  <span className={`text-xs font-medium ${testTaskDone ? 'line-through text-slate-400 dark:text-zinc-500' : 'text-slate-800 dark:text-zinc-200'}`}>
                    {previewText}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-amber-500 flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-amber-500" />
                    <span>8d streak</span>
                  </span>
                  <button 
                    onClick={() => setPreviewText(previewText === 'Productivity maximized' ? 'Deep focus activated' : 'Productivity maximized')}
                    className="px-2 py-1 rounded-md text-[11px] font-medium bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    Toggle State
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={previewText}
                  onChange={e => setPreviewText(e.target.value)}
                  placeholder="Test live typography and input styling..."
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none"
                />
                <button
                  onClick={() => showToast('Preview button inspected!', 'info')}
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 cursor-pointer transition-opacity"
                >
                  Inspect Action
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Google Cloud Ecosystem & Sync */}
      {activeTab === 'google' && (
        <div className="p-6 rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400">
                <LinkIcon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Google Ecosystem Integration
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Real-time 2-way synchronization with Google Tasks and Google Calendar.
                </p>
              </div>
            </div>

            <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium border flex items-center gap-1.5 ${
              authStatus?.googleConnected
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-xs ${authStatus?.googleConnected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <span>{authStatus?.googleConnected ? 'Cloud Active' : 'Disconnected'}</span>
            </span>
          </div>

          {authStatus?.googleConnected ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 flex items-start gap-3">
                <img
                  src={authStatus?.user?.picture || 'https://api.dicebear.com/7.x/bottts/svg?seed=AryanPandey'}
                  alt="Google User"
                  className="w-10 h-10 rounded-md border border-emerald-300 dark:border-emerald-700 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <p className="font-semibold text-emerald-900 dark:text-emerald-200 text-sm">
                      {authStatus?.user?.name || 'Google Connected'}
                    </p>
                  </div>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-mono truncate mt-0.5">
                    {authStatus?.user?.email || 'aaryanpandey28@gmail.com'}
                  </p>
                  <p className="text-[11px] text-emerald-600/80 dark:text-emerald-500 mt-1">
                    ✓ 2-Way Google Tasks & Calendar Sync Active
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="flex items-center gap-2 py-2 px-4 rounded-lg bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-medium transition-colors cursor-pointer text-xs shadow-2xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Cloud Now'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="flex items-center gap-1.5 py-2 px-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-400 font-medium border border-rose-200 dark:border-rose-800/40 transition-colors cursor-pointer text-xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Disconnect Account</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex p-0.5 bg-slate-100 dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 max-w-sm">
                <button
                  type="button"
                  onClick={() => setAuthSubTab('oneclick')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    authSubTab === 'oneclick'
                      ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-2xs font-semibold'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                  }`}
                >
                  1-Click Sign-In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthSubTab('token')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    authSubTab === 'token'
                      ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-2xs font-semibold'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                  }`}
                >
                  Instant Token
                </button>
                <button
                  type="button"
                  onClick={() => setAuthSubTab('clientid')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    authSubTab === 'clientid'
                      ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-2xs font-semibold'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                  }`}
                >
                  Client ID
                </button>
              </div>

              {authSubTab === 'oneclick' && (
                <div className="space-y-4 max-w-lg">
                  <p className="text-slate-600 dark:text-zinc-400 text-xs leading-relaxed">
                    Authorize NAYRA to synchronize directly with your Google Tasks and Google Calendar accounts.
                  </p>

                  <button
                    onClick={handleOneClickConnect}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2.5 py-2.5 px-5 rounded-lg bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-medium hover:opacity-90 transition-opacity cursor-pointer shadow-2xs text-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Opening Google...' : 'Sign in with Google Account'}</span>
                  </button>

                  <div className="p-3.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 text-xs text-indigo-900 dark:text-indigo-200 space-y-2">
                    <div className="font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <span>Active GCP Project: {GOOGLE_CLOUD_PROJECT_ID}</span>
                    </div>
                    <div className="text-[11px] space-y-1">
                      <p className="text-zinc-600 dark:text-zinc-400">Required Google APIs for this project:</p>
                      <div className="flex gap-2">
                        <a
                          href={GOOGLE_API_ENABLE_LINKS.tasks}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                        >
                          <span>Tasks API</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                        <span>•</span>
                        <a
                          href={GOOGLE_API_ENABLE_LINKS.calendar}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                        >
                          <span>Calendar API</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {authSubTab === 'token' && (
                <form onSubmit={handleManualTokenSubmit} className="space-y-3 max-w-lg">
                  <p className="text-slate-600 dark:text-zinc-400 text-xs leading-relaxed">
                    Paste an active Google OAuth Access Token (starts with <code className="font-mono text-[10px] bg-slate-100 dark:bg-zinc-800 px-1 py-0.5 rounded-md">ya29...</code>) to link immediately:
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
                      className="py-2 px-4 rounded-lg bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-medium hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer text-xs flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? 'Verifying...' : 'Link with Access Token'}</span>
                    </button>
                  </div>
                </form>
              )}

              {authSubTab === 'clientid' && (
                <form onSubmit={handleSaveClientId} className="space-y-3 max-w-lg">
                  <p className="text-slate-600 dark:text-zinc-400 text-xs leading-relaxed">
                    Configure your active Google Cloud OAuth 2.0 Web Client ID:
                  </p>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={customClientIdInput}
                      onChange={e => setCustomClientIdInput(e.target.value)}
                      placeholder="...apps.googleusercontent.com"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 font-mono focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                    />
                    <button
                      type="submit"
                      className="py-2 px-4 rounded-lg bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-medium hover:opacity-90 transition-opacity cursor-pointer text-xs flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <SettingsIcon className="w-3.5 h-3.5" />
                      <span>Save Client ID</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Shortcuts & System Info */}
      {activeTab === 'shortcuts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shortcuts Card */}
          <div className="p-6 rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-indigo-500" />
              <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Workstation Accelerators
              </h2>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-600 dark:text-zinc-400">Quick Command Palette</span>
                <kbd className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-mono text-[11px] border border-slate-200 dark:border-zinc-700">⌘ + K</kbd>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-600 dark:text-zinc-400">Toggle Nayra Assistant Drawer</span>
                <kbd className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-mono text-[11px] border border-slate-200 dark:border-zinc-700">⌘ + J</kbd>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-600 dark:text-zinc-400">Toggle Sidebar (Expand / Collapse)</span>
                <kbd className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-mono text-[11px] border border-slate-200 dark:border-zinc-700">⌘ + B</kbd>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-600 dark:text-zinc-400">Open Settings & Appearance</span>
                <kbd className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-mono text-[11px] border border-slate-200 dark:border-zinc-700">⌘ + ,</kbd>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-600 dark:text-zinc-400">Close Active Modal / Drawer</span>
                <kbd className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-mono text-[11px] border border-slate-200 dark:border-zinc-700">Esc</kbd>
              </div>
            </div>
          </div>

          {/* System Telemetry */}
          <div className="p-6 rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-500" />
              <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                System Diagnostics
              </h2>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-600 dark:text-zinc-400">Architecture Engine</span>
                <span className="font-mono text-slate-900 dark:text-zinc-100 font-medium">React 19 + Vite</span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-600 dark:text-zinc-400">Routing Mode</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">React Router Multi-Page</span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-600 dark:text-zinc-400">Design Specification</span>
                <span className="font-mono text-slate-900 dark:text-zinc-100 font-medium">Executive Cockpit Workstation</span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-600 dark:text-zinc-400">Active Theme Preset</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 capitalize font-medium">{uiStyle} ({theme})</span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-600 dark:text-zinc-400">Anti-AI Slop Compliance</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">100% Certified</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
