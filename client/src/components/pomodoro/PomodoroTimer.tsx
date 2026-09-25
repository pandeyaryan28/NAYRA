import React from 'react';
import { useApp } from '../../context/AppContext.js';
import { TimeEntryLogger } from './TimeEntryLogger.js';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward,
  Timer
} from 'lucide-react';
import type { FocusSessionType } from '../../context/AppContext.js';

const PRESETS: Record<FocusSessionType, { label: string; minutes: number }> = {
  focus: { label: 'Focus 25m', minutes: 25 },
  deep_focus: { label: 'Deep 50m', minutes: 50 },
  short_break: { label: 'Break 5m', minutes: 5 },
  long_break: { label: 'Break 15m', minutes: 15 }
};

export const PomodoroTimer: React.FC = () => {
  const { tasks, timeLogs, focusTimer } = useApp();

  const currentPreset = PRESETS[focusTimer.sessionType];
  const totalSeconds = currentPreset.minutes * 60;
  const progressPercent = Math.min(100, Math.max(0, ((totalSeconds - focusTimer.timeLeft) / totalSeconds) * 100));

  const minutesDisplay = Math.floor(focusTimer.timeLeft / 60).toString().padStart(2, '0');
  const secondsDisplay = (focusTimer.timeLeft % 60).toString().padStart(2, '0');

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = timeLogs.filter(l => l.timestamp.startsWith(todayStr));
  const totalFocusMinutes = todayLogs.reduce((acc, l) => acc + (l.durationMinutes || 0), 0);

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-6 transition-colors duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
              Focus & Pomodoro
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800/60 font-medium">
              Ambient Active
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Minimalist distraction-free interval workstation • Ambient countdown syncs with persistent top bar.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-700 dark:text-zinc-300 shadow-2xs">
          <span>Today's Total: </span>
          <strong className="text-slate-900 dark:text-zinc-100 tabular-nums">{totalFocusMinutes} min</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Minimalist Clock */}
        <div className="lg:col-span-2 rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 p-8 shadow-2xs flex flex-col items-center justify-center space-y-8 min-h-[480px]">
          {/* Preset Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-md bg-slate-100 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/50">
            {(Object.keys(PRESETS) as FocusSessionType[]).map(type => (
              <button
                key={type}
                onClick={() => focusTimer.setSessionType(type)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  focusTimer.sessionType === type
                    ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                {PRESETS[type].label}
              </button>
            ))}
          </div>

          {/* Minimal Task Link */}
          <div className="w-full max-w-xs">
            <select
              value={focusTimer.selectedTaskId}
              onChange={e => focusTimer.setSelectedTaskId(e.target.value)}
              className="w-full px-3 py-1.5 rounded-md bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-700 dark:text-zinc-300 focus:outline-none text-center cursor-pointer font-sans"
            >
              <option value="">General Focus / Untracked</option>
              {tasks.filter(t => !t.archived && t.status !== 'completed').map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>

          {/* Circular Countdown */}
          <div className="relative flex items-center justify-center w-56 h-56">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="112"
                cy="112"
                r="96"
                stroke="currentColor"
                strokeWidth="5"
                className="text-slate-100 dark:text-zinc-800/80 fill-transparent"
              />
              <circle
                cx="112"
                cy="112"
                r="96"
                stroke="currentColor"
                strokeWidth="5"
                strokeDasharray={2 * Math.PI * 96}
                strokeDashoffset={2 * Math.PI * 96 * (1 - progressPercent / 100)}
                strokeLinecap="round"
                className="text-slate-900 dark:text-zinc-100 transition-all duration-300 fill-transparent"
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center text-center">
              <div className="text-4xl font-mono font-bold tracking-tight text-slate-900 dark:text-zinc-100 tabular-nums">
                {minutesDisplay}:{secondsDisplay}
              </div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 dark:text-zinc-500 mt-1">
                {focusTimer.sessionType.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={focusTimer.resetTimer}
              className="p-3 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors cursor-pointer shadow-2xs"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={focusTimer.toggleTimer}
              className="px-6 py-2.5 rounded-lg bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-2 shadow-2xs"
            >
              {focusTimer.isRunning ? (
                <>
                  <Pause className="w-4 h-4" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> Start
                </>
              )}
            </button>

            <button
              onClick={focusTimer.completeTimer}
              className="p-3 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors cursor-pointer shadow-2xs"
              title="Finish & Log session"
            >
              <FastForward className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right 1 Col: Manual Logger & History */}
        <div className="space-y-6">
          <TimeEntryLogger />

          {/* History */}
          <div className="p-6 rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-violet-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-100 font-mono">
                  Recent Sessions
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400 dark:text-zinc-500">{timeLogs.length} total</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {timeLogs.slice().reverse().slice(0, 5).map(log => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800/60 flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-slate-800 dark:text-zinc-200 truncate">{log.taskTitle || 'Focus'}</span>
                  <span className="font-mono text-slate-900 dark:text-zinc-100 font-semibold shrink-0 tabular-nums">+{log.durationMinutes}m</span>
                </div>
              ))}

              {timeLogs.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-400 dark:text-zinc-500">
                  No sessions logged yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
