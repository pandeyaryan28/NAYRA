import React, { useState, useMemo } from 'react';
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
  X,
  Plus,
} from 'lucide-react';
import { useFocus } from '@/context/FocusContext';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
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
    selectedTasks,
    activeTaskIds,
    taskTimeAllocations,
    selectTask,
    selectTasks,
    addSessionTask,
    removeSessionTask,
    getTaskLiveSeconds,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    skipSession,
    setMode,
  } = useFocus();

  const { tasks, focusSessions, focusStats, settings } = useData();
  const [isTaskPickerOpen, setIsTaskPickerOpen] = useState(false);
  const [pickerSelectedIds, setPickerSelectedIds] = useState<Set<string>>(new Set());
  const [pickerSearch, setPickerSearch] = useState('');

  const handleOpenPicker = () => {
    setPickerSelectedIds(new Set(activeTaskIds));
    setPickerSearch('');
    setIsTaskPickerOpen(true);
  };

  const handleTogglePickerTask = (taskId: string) => {
    setPickerSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const handleApplyPicker = () => {
    const currentSet = new Set(activeTaskIds);
    // Remove tasks no longer in selection
    activeTaskIds.forEach((id) => {
      if (!pickerSelectedIds.has(id)) {
        removeSessionTask(id);
      }
    });
    // Add newly selected tasks
    tasks.forEach((t) => {
      if (pickerSelectedIds.has(t.id) && !currentSet.has(t.id)) {
        addSessionTask(t);
      }
    });
    setIsTaskPickerOpen(false);
  };

  const handleClearAllTasks = () => {
    selectTask(null);
    setPickerSelectedIds(new Set());
    setIsTaskPickerOpen(false);
  };

  const filteredPickerTasks = useMemo(() => {
    const q = pickerSearch.trim().toLowerCase();
    const candidateTasks = tasks.filter((t) => !t.archived && t.status !== 'completed');
    if (!q) return candidateTasks;
    return candidateTasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.tags && t.tags.some((tg) => tg.toLowerCase().includes(q)))
    );
  }, [tasks, pickerSearch]);

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
            Focus To-Do inspired deep work engine with multi-task association and precision per-task time tracking.
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

        {/* Dynamic Multi-Task Pomodoro Panel */}
        <div className="mt-8 w-full max-w-lg p-5 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3.5 interactive-card">
          <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block">
                Associated Task
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Session Linked Tasks ({selectedTasks.length}) • {timerState === 'running'
                  ? 'Real-time focus attribution per active task'
                  : 'Tasks associated with this deep work block'}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenPicker}
              className="text-xs shrink-0 gap-1.5"
            >
              <ListTodo className="h-3.5 w-3.5" />
              <span>{selectedTasks.length === 0 ? 'Link Tasks' : 'Manage Tasks'}</span>
            </Button>
          </div>

          {selectedTasks.length === 0 ? (
            <div className="py-4 text-center">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">
                Autonomous Focus (No Tasks Linked)
              </span>
              <span className="text-[11px] text-zinc-400 block mt-0.5">
                Link tasks to dynamically track per-task deep work duration and velocity.
              </span>
            </div>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {selectedTasks.map((t) => {
                const liveSec = getTaskLiveSeconds(t.id);
                return (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60 text-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate block">
                        {t.title}
                      </span>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400 inline-flex items-center gap-1 bg-zinc-200/60 dark:bg-zinc-800 px-1.5 py-0.2 rounded-md">
                          <Clock className="h-2.5 w-2.5" />
                          {formatSecondsToTimer(liveSec)} in session
                        </span>

                        {t.totalFocusSeconds > 0 && (
                          <span className="text-[10px] font-mono text-zinc-400">
                            Total: {formatSecondsToHoursMinutes(t.totalFocusSeconds)}
                          </span>
                        )}

                        {t.tags && t.tags.length > 0 && (
                          <div className="flex items-center gap-1">
                            {t.tags.map((tg) => (
                              <span
                                key={tg}
                                className="text-[9px] font-mono px-1.5 py-0.2 rounded-md bg-zinc-200/50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300/40 dark:border-zinc-700/40"
                              >
                                #{tg}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeSessionTask(t.id)}
                      className="p-1 text-zinc-400 hover:text-rose-500 rounded-md transition-colors cursor-pointer shrink-0"
                      title="Remove from session (preserves accumulated time)"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
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
                    {s.taskTitles && s.taskTitles.length > 0
                      ? s.taskTitles.join(', ')
                      : s.taskTitle || 'Autonomous Focus Block'}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono flex-wrap">
                    <span>{formatDateString(s.completedAt, 'MMM d, h:mm a')} • {s.mode}</span>
                    {s.tags && s.tags.length > 0 && (
                      <span className="text-zinc-500">
                        {s.tags.map((tg) => `#${tg}`).join(' ')}
                      </span>
                    )}
                  </div>
                </div>
                <Badge variant="default" className="font-mono shrink-0">
                  {Math.round(s.durationSeconds / 60)} min
                </Badge>
              </div>
            ))}
        </div>
      </div>

      {/* Dynamic Multi-Task Picker Modal */}
      <Modal
        isOpen={isTaskPickerOpen}
        onClose={() => setIsTaskPickerOpen(false)}
        title="Manage Session Linked Tasks"
        description="Select multiple tasks to track focus time simultaneously. Mid-session modifications calculate exact elapsed time."
      >
        <div className="space-y-3">
          {/* Search bar inside modal */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search tasks by title or tag..."
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              className="w-full text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-2 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
            />
          </div>

          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {filteredPickerTasks.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-400">
                No active tasks found matching search.
              </div>
            ) : (
              filteredPickerTasks.map((t) => {
                const isChecked = pickerSelectedIds.has(t.id);
                return (
                  <label
                    key={t.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                      isChecked
                        ? 'border-zinc-900 bg-zinc-100/80 dark:border-zinc-200 dark:bg-zinc-800/80'
                        : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleTogglePickerTask(t.id)}
                        className="h-4 w-4 rounded-sm border-zinc-300 dark:border-zinc-700 text-zinc-900 focus:ring-0 cursor-pointer"
                      />
                      <div className="truncate">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 block truncate">
                          {t.title}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {t.due && (
                            <span className="text-[10px] text-zinc-400 font-mono">
                              Due: {t.due}
                            </span>
                          )}
                          {t.tags && t.tags.length > 0 && (
                            <span className="text-[10px] text-zinc-500 font-mono">
                              {t.tags.map((tg) => `#${tg}`).join(' ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {t.totalFocusSeconds > 0 && (
                      <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                        {formatSecondsToHoursMinutes(t.totalFocusSeconds)}
                      </span>
                    )}
                  </label>
                );
              })
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800 gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAllTasks}
              className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Clear All (Autonomous)
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsTaskPickerOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleApplyPicker}
                className="text-xs"
              >
                Apply ({pickerSelectedIds.size} Selected)
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
