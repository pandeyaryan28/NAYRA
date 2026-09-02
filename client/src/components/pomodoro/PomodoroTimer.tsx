import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext.js';
import { TimeEntryLogger } from './TimeEntryLogger.js';
import { 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  CheckCircle2, 
  Flame, 
  Clock, 
  History,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api.js';
import confetti from 'canvas-confetti';

type SessionType = 'focus' | 'deep_focus' | 'short_break' | 'long_break';

const PRESETS: Record<SessionType, { label: string; minutes: number; color: string; border: string }> = {
  focus: { label: 'Focus (25m)', minutes: 25, color: 'text-cyan-400', border: 'border-cyan-500' },
  deep_focus: { label: 'Deep Focus (50m)', minutes: 50, color: 'text-purple-400', border: 'border-purple-500' },
  short_break: { label: 'Short Break (5m)', minutes: 5, color: 'text-emerald-400', border: 'border-emerald-500' },
  long_break: { label: 'Long Break (15m)', minutes: 15, color: 'text-amber-400', border: 'border-amber-500' }
};

export const PomodoroTimer: React.FC = () => {
  const { tasks, timeLogs, refreshAll, showToast } = useApp();
  const [sessionType, setSessionType] = useState<SessionType>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const timerRef = useRef<any>(null);

  const currentPreset = PRESETS[sessionType];
  const totalSeconds = currentPreset.minutes * 60;
  const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  useEffect(() => {
    setTimeLeft(currentPreset.minutes * 60);
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [sessionType]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handleComplete = async () => {
    setIsRunning(false);
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });

    const selectedTask = tasks.find(t => t.id === selectedTaskId);
    const durationMinutes = currentPreset.minutes;

    try {
      await api.logTime({
        taskId: selectedTaskId || undefined,
        taskTitle: selectedTask?.title || `${currentPreset.label} Session`,
        durationMinutes,
        sessionType: sessionType.includes('break') ? 'short_break' : 'pomodoro',
        timestamp: new Date().toISOString()
      });
      showToast(`Pomodoro complete! 🎉 Logged ${durationMinutes} mins.`, 'success');
      await refreshAll();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(currentPreset.minutes * 60);
  };

  const minutesDisplay = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secondsDisplay = (timeLeft % 60).toString().padStart(2, '0');

  // Stats calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = timeLogs.filter(l => l.timestamp.startsWith(todayStr));
  const totalFocusMinutes = todayLogs.reduce((acc, l) => acc + (l.durationMinutes || 0), 0);
  const totalPomodoros = todayLogs.filter(l => l.sessionType === 'pomodoro').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Timer className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Pomodoro & Focus Command</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track focused work intervals, record task time logs, and build productivity momentum.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">Today:</span>
            <span className="text-white font-mono font-bold">{totalFocusMinutes} min</span>
            <span className="text-slate-500">({totalPomodoros} focus blocks)</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Timer on Left, Manual Log & History on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Pomodoro Clock */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/60 border border-slate-800 p-8 glass-panel flex flex-col items-center justify-center space-y-8">
          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
            {(Object.keys(PRESETS) as SessionType[]).map(type => (
              <button
                key={type}
                onClick={() => setSessionType(type)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  sessionType === type
                    ? 'bg-slate-800 text-cyan-300 shadow-md border border-cyan-500/40 glow-cyan'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {PRESETS[type].label}
              </button>
            ))}
          </div>

          {/* Task Link Selector */}
          <div className="w-full max-w-sm">
            <label className="block text-[11px] text-slate-400 text-center mb-1">
              Link Session to Active Task:
            </label>
            <select
              value={selectedTaskId}
              onChange={e => setSelectedTaskId(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 text-center"
            >
              <option value="">-- General Focus --</option>
              {tasks.filter(t => t.status !== 'completed').map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>

          {/* Circular Countdown Ring */}
          <div className="relative flex items-center justify-center w-64 h-64">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="110"
                stroke="currentColor"
                strokeWidth="10"
                className="text-slate-800/80 fill-transparent"
              />
              <circle
                cx="128"
                cy="128"
                r="110"
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 110}
                strokeDashoffset={2 * Math.PI * 110 * (1 - progressPercent / 100)}
                strokeLinecap="round"
                className={`transition-all duration-500 fill-transparent ${
                  sessionType.includes('break') ? 'text-emerald-400' : 'text-cyan-400'
                }`}
              />
            </svg>

            {/* Inner Digits */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <div className="text-5xl font-mono font-bold tracking-tight text-white glow-text">
                {minutesDisplay}:{secondsDisplay}
              </div>
              <div className="text-xs uppercase font-mono tracking-widest text-slate-400 mt-2">
                {sessionType.replace('_', ' ')}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleReset}
              className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-8 py-4 rounded-2xl text-white font-bold text-sm flex items-center gap-2.5 transition-all shadow-xl ${
                isRunning
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-95'
                  : 'bg-gradient-to-r from-cyan-500 via-sky-500 to-purple-600 hover:opacity-95 glow-cyan'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" /> Start Focus
                </>
              )}
            </button>

            <button
              onClick={handleComplete}
              className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors"
              title="Finish / Log Session"
            >
              <FastForward className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right 1 Col: Manual Logger & History */}
        <div className="space-y-6">
          <TimeEntryLogger />

          {/* Focus History */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-4 glass-panel">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white tracking-wide">Recent Focus Logs</h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">{timeLogs.length} total</span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {timeLogs.slice().reverse().slice(0, 5).map(log => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-medium text-slate-200">{log.taskTitle || 'Focus Session'}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {log.sessionType}
                    </div>
                  </div>
                  <span className="font-mono text-cyan-400 font-bold">
                    +{log.durationMinutes}m
                  </span>
                </div>
              ))}

              {timeLogs.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-500">
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
