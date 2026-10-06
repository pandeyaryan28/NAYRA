import React, { useState } from 'react';
import {
  Play,
  Pause,
  Square,
  SkipForward,
  Clock,
  CheckCircle2,
  ListTodo,
  Calendar,
  Flame,
  Award,
} from 'lucide-react';
import { useFocus } from '@/context/FocusContext';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { Select } from '@/components/common/Select';
import {
  formatSecondsToTimer,
  formatSecondsToHoursMinutes,
  formatDateString,
} from '@/lib/utils';
import { parseISO } from 'date-fns';

export const FocusView: React.FC = () => {
  const {
    mode,
    timerState,
    remainingSeconds,
    totalDurationSeconds,
    progressPercentage,
    currentCycle,
    selectedTask,
    selectTask,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    skipSession,
    setMode,
  } = useFocus();

  const { tasks, focusSessions, focusStats, settings } = useData();
  const [isTaskPickerOpen, setIsTaskPickerOpen] = useState(false);

  const pendingTasks = tasks.filter((t) => t.status === 'needsAction');

  const strokeDashoffset = 283 - (283 * progressPercentage) / 100;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-8 select-none">
      {/* Title & Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 gap-4 card-enter">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Focus Lab
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Focus To-Do inspired deep work engine with task association and synthesized chimes.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center rounded-md border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-50 dark:bg-zinc-900">
          <button
            onClick={() => setMode('focus')}
            className={`px-3 py-1 text-xs font-medium rounded-sm transition-all duration-200 ${
              mode === 'focus'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs font-semibold scale-[1.02]'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            Focus ({settings.defaultFocusMinutes || 25}m)
          </button>
          <button
            onClick={() => setMode('shortBreak')}
            className={`px-3 py-1 text-xs font-medium rounded-sm transition-all duration-200 ${
              mode === 'shortBreak'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs font-semibold scale-[1.02]'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            Short Break ({settings.shortBreakMinutes || 5}m)
          </button>
          <button
            onClick={() => setMode('longBreak')}
            className={`px-3 py-1 text-xs font-medium rounded-sm transition-all duration-200 ${
              mode === 'longBreak'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs font-semibold scale-[1.02]'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            Long Break ({settings.longBreakMinutes || 15}m)
          </button>
        </div>
      </div>

      {/* Main Timer Dial */}
      <div className="flex flex-col items-center justify-center py-6 card-enter stagger-1">
        <div className={`relative flex items-center justify-center h-72 w-72 transition-transform duration-500 ${timerState === 'running' ? 'animate-dial-pulse' : ''}`}>
          {/* Circular SVG Ring */}
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              className="stroke-zinc-200 dark:stroke-zinc-800"
              strokeWidth="4"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              className="stroke-zinc-900 dark:stroke-zinc-100 dial-ring-svg"
              strokeWidth="4"
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Center Digital Clock */}
          <div className="absolute flex flex-col items-center justify-center text-center space-y-1">
            <span className="text-5xl font-mono font-bold tracking-tight text-zinc-900 dark:text-zinc-50 tabular-nums transition-transform duration-150">
              {formatSecondsToTimer(remainingSeconds)}
            </span>
            <span className="text-xs uppercase tracking-wider text-zinc-400 font-medium">
              {mode === 'focus' ? 'Focus Session' : mode === 'shortBreak' ? 'Short Rest' : 'Long Rest'}
            </span>

            {/* Cycle Pips */}
            <div className="flex items-center gap-1.5 pt-2">
              {Array.from({ length: settings.longBreakInterval || 4 }, (_, i) => {
                const isCompleted = (currentCycle - 1) % (settings.longBreakInterval || 4) > i;
                const isCurrent = (currentCycle - 1) % (settings.longBreakInterval || 4) === i && mode === 'focus';
                return (
                  <span
                    key={i}
                    className={`h-2 w-2 rounded-sm transition-all duration-300 ${
                      isCompleted
                        ? 'bg-zinc-900 dark:bg-zinc-100 scale-100'
                        : isCurrent
                        ? 'bg-zinc-500 ring-1 ring-zinc-400 scale-110'
                        : 'bg-zinc-200 dark:bg-zinc-800'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Timer Action Buttons */}
        <div className="flex items-center gap-3 mt-8">
          {timerState === 'idle' && (
            <Button
              variant="primary"
              size="lg"
              onClick={startTimer}
              className="gap-2 px-8 shadow-sm transition-transform duration-150 active:scale-95"
            >
              <Play className="h-5 w-5 fill-current" />
              <span>Start Focus</span>
            </Button>
          )}

          {timerState === 'running' && (
            <>
              <Button
                variant="primary"
                size="lg"
                onClick={pauseTimer}
                className="gap-2 px-6"
              >
                <Pause className="h-5 w-5 fill-current" />
                <span>Pause</span>
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={stopTimer}
                className="gap-2"
                title="Stop and Reset"
              >
                <Square className="h-4 w-4" />
                <span>Stop</span>
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={skipSession}
                className="gap-2"
                title="Skip to next session"
              >
                <SkipForward className="h-4 w-4" />
                <span>Skip</span>
              </Button>
            </>
          )}

          {timerState === 'paused' && (
            <>
              <Button
                variant="primary"
                size="lg"
                onClick={resumeTimer}
                className="gap-2 px-6"
              >
                <Play className="h-5 w-5 fill-current" />
                <span>Resume</span>
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={stopTimer}
                className="gap-2"
              >
                <Square className="h-4 w-4" />
                <span>Reset</span>
              </Button>
            </>
          )}
        </div>

        {/* Associated Task Card */}
        <div className="mt-8 w-full max-w-md p-4 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between interactive-card">
          <div className="min-w-0 pr-3">
            <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block">
              Associated Task
            </span>
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate block">
              {selectedTask ? selectedTask.title : 'No Task Linked'}
            </span>
            {selectedTask?.totalFocusSeconds ? (
              <span className="text-xs text-zinc-500 font-mono block">
                Total Focus: {formatSecondsToHoursMinutes(selectedTask.totalFocusSeconds)} ({selectedTask.pomodoroCount} pomodoros)
              </span>
            ) : null}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTaskPickerOpen(true)}
            className="text-xs shrink-0 transition-transform active:scale-95"
          >
            {selectedTask ? 'Change Task' : 'Link Task'}
          </Button>
        </div>
      </div>

      {/* Focus Productivity Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 interactive-card card-enter stagger-1">
          <span className="text-[11px] text-zinc-400 font-mono uppercase block">Today Focus</span>
          <span className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1 block">
            {formatSecondsToHoursMinutes(focusStats.todayFocusSeconds)}
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 interactive-card card-enter stagger-2">
          <span className="text-[11px] text-zinc-400 font-mono uppercase block">Pomodoros Today</span>
          <span className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1 block">
            {focusStats.todayPomodoroCount}
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 interactive-card card-enter stagger-3">
          <span className="text-[11px] text-zinc-400 font-mono uppercase block">Weekly Focus</span>
          <span className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1 block">
            {formatSecondsToHoursMinutes(focusStats.weekFocusSeconds)}
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 interactive-card card-enter stagger-4">
          <span className="text-[11px] text-zinc-400 font-mono uppercase block">Focus Streak</span>
          <span className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1 block">
            {focusStats.streakDays} days
          </span>
        </div>
      </div>

      {/* Recent Session History */}
      <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4 interactive-card card-enter stagger-2">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Recent Focus Sessions
          </h3>
          <span className="text-xs text-zinc-400 font-mono">
            {focusSessions.filter((s) => s.mode === 'focus').length} total logged
          </span>
        </div>

        <div className="space-y-2">
          {focusSessions
            .filter((s) => s.mode === 'focus')
            .slice(0, 6)
            .map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 rounded-md border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 transition-colors"
              >
                <div className="space-y-0.5 truncate mr-3">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate block">
                    {s.taskTitle || 'Autonomous Focus Block'}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {formatDateString(s.completedAt, 'MMM d, h:mm a')} • {s.mode}
                  </span>
                </div>
                <Badge variant="default" className="font-mono shrink-0">
                  {Math.round(s.durationSeconds / 60)} min
                </Badge>
              </div>
            ))}
        </div>
      </div>

      {/* Task Picker Modal */}
      <Modal
        isOpen={isTaskPickerOpen}
        onClose={() => setIsTaskPickerOpen(false)}
        title="Select Task for Focus Session"
        description="Link this session to update task metrics and analytics."
      >
        <div className="space-y-2 max-h-80 overflow-y-auto">
          <button
            onClick={() => {
              selectTask(null);
              setIsTaskPickerOpen(false);
            }}
            className="w-full text-left p-3 rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs transition-colors"
          >
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              None (Unlinked General Focus)
            </span>
          </button>
          {pendingTasks.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                selectTask(t);
                setIsTaskPickerOpen(false);
              }}
              className="w-full text-left p-3 rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs transition-colors flex items-center justify-between"
            >
              <div className="truncate mr-2">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 block truncate">
                  {t.title}
                </span>
                {t.due && (
                  <span className="text-[10px] text-zinc-400 font-mono">Due: {t.due}</span>
                )}
              </div>
              {t.totalFocusSeconds > 0 && (
                <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                  {formatSecondsToHoursMinutes(t.totalFocusSeconds)}
                </span>
              )}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
};
