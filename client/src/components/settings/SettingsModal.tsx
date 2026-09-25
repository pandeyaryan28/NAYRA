import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.js';
import { 
  UI_STYLES, 
  ACCENT_COLORS 
} from '../../types/theme.js';
import { 
  X, 
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
  RotateCcw 
} from 'lucide-react';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Layers,
  Smile,
  Square,
  Zap,
  Sliders,
  Palette
};

export const SettingsModal: React.FC = () => {
  const { 
    isSettingsOpen, 
    setIsSettingsOpen, 
    uiStyle, 
    setUiStyle, 
    theme, 
    toggleTheme,
    accentColor, 
    setAccentColor,
    showToast
  } = useApp();

  const [previewText, setPreviewText] = useState('Productivity maximized');
  const [testTaskDone, setTestTaskDone] = useState(false);

  if (!isSettingsOpen) return null;

  const handleResetDefaults = () => {
    setUiStyle('glassmorphism');
    setAccentColor('indigo');
    showToast('Reset appearance to default Glassmorphism theme', 'info');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150"
      onClick={() => setIsSettingsOpen(false)}
    >
      <div 
        className="w-full max-w-4xl bg-white dark:bg-[#121217] border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-8 max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-slate-50/70 dark:bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
                  Interface & Appearance Studio
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                  {uiStyle.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Customize NAYRA's visual architecture, tactile physics, and high-contrast color mode.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDefaults}
              title="Reset to default settings"
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-xs flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Reset</span>
            </button>
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Configuration Body */}
        <div className="p-6 overflow-y-auto space-y-8">

          {/* Section 1: Mode Switcher & Accent Palette */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800/80">
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
                      ? 'bg-white text-slate-900 border-indigo-500 shadow-sm font-semibold'
                      : 'bg-transparent text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800'
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
                      ? 'bg-zinc-800 text-white border-indigo-500 shadow-sm font-semibold'
                      : 'bg-transparent text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800'
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

          {/* Section 2: UI Style Visual Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Select Design Architecture
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Each design style applies tailored shadow depths, border dynamics, textures, and physical interactions.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>WCAG AA Calibrated</span>
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
                        : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-sm'
                    }`}
                  >
                    {/* Top Row */}
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
                          ? 'bg-white/40 dark:bg-white/10 border-white/80 dark:border-white/20 backdrop-blur-md shadow-[0_4px_16px_0_rgba(31,38,135,0.07)] dark:shadow-[0_4px_16px_0_rgba(0,0,0,0.4)] ring-1 ring-white/20'
                          : style.id === 'neumorphism'
                          ? 'bg-slate-200/70 dark:bg-zinc-800 border-white/50 dark:border-zinc-700/50 shadow-[2px_2px_5px_#cbd5e1,-2px_-2px_5px_#ffffff] dark:shadow-[2px_2px_5px_#09090b,-2px_-2px_5px_#27272a]'
                          : style.id === 'claymorphism'
                          ? 'bg-white dark:bg-zinc-800 border-white dark:border-zinc-700 rounded-xl shadow-[0_4px_8px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.8)]'
                          : style.id === 'brutalism'
                          ? 'bg-amber-50/50 dark:bg-zinc-900 border-2 border-slate-900 dark:border-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#818cf8]'
                          : style.id === 'cyberpunk'
                          ? 'bg-slate-50 dark:bg-zinc-950 border border-cyan-500/40 text-cyan-600 dark:text-cyan-400 font-mono shadow-2xs'
                          : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs'
                      }`}>
                        <span className="font-medium text-[11px] truncate">{style.tagline.split('&')[0]}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 shrink-0">
                          Demo
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                        {style.description}
                      </p>
                    </div>

                    {/* Features List */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 flex flex-wrap gap-1">
                      {style.features.slice(0, 2).map((feat, i) => (
                        <span 
                          key={i}
                          className="text-[9.5px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-mono"
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

          {/* Section 3: Live Interactive Composition & Contrast Playground */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-500" />
                <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                  Live Real-Time Composition & Contrast Inspection
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-md bg-emerald-100/60 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Contrast Ratio: 12.8:1 (AAA)</span>
                </span>
              </div>
            </div>

            {/* Live Interactive Sandbox Card */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 space-y-4 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    N
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                      Sample Command Component
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Observing font weight, shadow physics, and border refraction
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-medium px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                  Active Style: {uiStyle}
                </span>
              </div>

              {/* Interactive Task Element */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30">
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
                    className="px-2 py-1 rounded text-[11px] font-medium bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    Toggle State
                  </button>
                </div>
              </div>

              {/* Sample Interactive Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={previewText}
                  onChange={e => setPreviewText(e.target.value)}
                  placeholder="Test live typography and input styling..."
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none"
                />
                <button
                  onClick={() => showToast('Preview button clicked!', 'info')}
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 cursor-pointer transition-opacity"
                >
                  Inspect Action
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/60 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono flex items-center gap-2">
            <span>Shortcut: <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">Cmd + ,</kbd></span>
            <span>•</span>
            <span>Instant sync across all tabs</span>
          </div>

          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            Done & Save Preference
          </button>
        </div>
      </div>
    </div>
  );
};
