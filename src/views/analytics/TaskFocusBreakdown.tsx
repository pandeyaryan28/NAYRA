import React, { useMemo, useState } from 'react';
import {
  Clock,
  Search,
  CheckCircle2,
  Circle,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Calendar,
  Check,
} from 'lucide-react';
import { TaskPeriodFocusItem } from './types';
import { formatSecondsToHoursMinutes } from '@/lib/utils';
import { TimeHorizon } from '@/views/AnalyticsView';
import { useData } from '@/context/DataContext';
import { formatSessionDate, formatSessionTimeRange } from './analyticsUtils';
import { FocusSession } from '@/types';

interface TaskFocusBreakdownProps {
  taskPeriodItems: TaskPeriodFocusItem[];
  timeHorizon: TimeHorizon;
  activeTagFilter: string | null;
  setActiveTagFilter: (tag: string | null) => void;
  horizonTotalFocusSec: number;
}

export const TaskFocusBreakdown: React.FC<TaskFocusBreakdownProps> = ({
  taskPeriodItems,
  timeHorizon,
  activeTagFilter,
  setActiveTagFilter,
  horizonTotalFocusSec,
}) => {
  const { deleteFocusSession, reconcileTaskFocusMetrics } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'focused_only' | 'all'>('focused_only');
  const [sortBy, setSortBy] = useState<'focus' | 'pomodoros' | 'name' | 'status'>('focus');
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set());
  const [isReconciling, setIsReconciling] = useState(false);
  const [reconcileStatus, setReconcileStatus] = useState<string | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

  const toggleTaskExpanded = (taskId: string) => {
    setExpandedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const handleReconcile = async () => {
    setIsReconciling(true);
    setReconcileStatus(null);
    try {
      const fixedCount = await reconcileTaskFocusMetrics();
      if (fixedCount > 0) {
        setReconcileStatus(`Healed ${fixedCount} task${fixedCount > 1 ? 's' : ''} with inflated focus metrics.`);
      } else {
        setReconcileStatus('Task focus metrics verified and synchronized.');
      }
      setTimeout(() => setReconcileStatus(null), 4000);
    } catch (err) {
      console.error('Failed to reconcile focus metrics:', err);
      setReconcileStatus('Reconciliation error.');
      setTimeout(() => setReconcileStatus(null), 3000);
    } finally {
      setIsReconciling(false);
    }
  };

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (!window.confirm('Delete this focus session? This will subtract its time from the task and remove duplicate records.')) {
      return;
    }
    setDeletingSessionId(sessionId);
    try {
      await deleteFocusSession(sessionId);
    } catch (err) {
      console.error('Failed to delete session:', err);
    } finally {
      setDeletingSessionId(null);
    }
  };

  const isDuplicateInterval = (session: FocusSession, taskSessions?: FocusSession[]) => {
    if (!taskSessions || taskSessions.length <= 1) return false;
    const sTime = session.completedAt ? new Date(session.completedAt).getTime() : 0;
    if (!sTime) return false;
    return taskSessions.some((other) => {
      if (other.id === session.id) return false;
      const oTime = other.completedAt ? new Date(other.completedAt).getTime() : 0;
      if (!oTime) return false;
      return Math.abs(sTime - oTime) < 15 * 60 * 1000;
    });
  };

  // Filter items based on search, filterMode, and activeTagFilter
  const filteredItems = useMemo(() => {
    return taskPeriodItems.filter(({ task, periodFocusSeconds }) => {
      // 1. Focused only vs all
      if (filterMode === 'focused_only' && periodFocusSeconds <= 0) {
        return false;
      }

      // 2. Tag filter
      if (activeTagFilter) {
        const hasTag = task.tags && task.tags.some((t) => t.trim().toLowerCase() === activeTagFilter.toLowerCase());
        if (!hasTag) return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesTag = task.tags && task.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesTag) return false;
      }

      return true;
    });
  }, [taskPeriodItems, filterMode, activeTagFilter, searchQuery]);

  // Sort items
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      switch (sortBy) {
        case 'focus':
          return b.periodFocusSeconds - a.periodFocusSeconds;
        case 'pomodoros':
          return b.periodPomodoroCount - a.periodPomodoroCount;
        case 'name':
          return a.task.title.localeCompare(b.task.title);
        case 'status':
          // Completed first
          const aDone = a.task.status === 'completed' || a.task.archived ? 1 : 0;
          const bDone = b.task.status === 'completed' || b.task.archived ? 1 : 0;
          return bDone - aDone;
        default:
          return b.periodFocusSeconds - a.periodFocusSeconds;
      }
    });
  }, [filteredItems, sortBy]);

  const focusedCount = taskPeriodItems.filter((i) => i.periodFocusSeconds > 0).length;

  return (
    <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4 card-enter interactive-card">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-500" />
            <span>Task Focus Breakdown</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Focus duration and Pomodoro cycles logged for each individual task in the selected horizon.
          </p>
        </div>

        {/* View mode toggle, reconcile button and counter */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleReconcile}
            disabled={isReconciling}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[11px] font-medium text-zinc-600 dark:text-zinc-300 hover:text-sky-600 dark:hover:text-sky-400 hover:border-sky-300 dark:hover:border-sky-700 transition-all swiftui-press shadow-xs"
            title="Recalculate task focus time from verified session records to heal double-counted time"
          >
            <RefreshCw className={`w-3 h-3 ${isReconciling ? 'animate-spin text-sky-500' : 'text-zinc-400'}`} />
            <span>Audit & Reconcile</span>
          </button>

          <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
            {sortedItems.length} {sortedItems.length === 1 ? 'task' : 'tasks'}
          </span>
          <div className="flex items-center p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 text-xs">
            <button
              type="button"
              onClick={() => setFilterMode('focused_only')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all swiftui-press ${
                filterMode === 'focused_only'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Focused Only ({focusedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all swiftui-press ${
                filterMode === 'all'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              All Tasks ({taskPeriodItems.length})
            </button>
          </div>
        </div>
      </div>

      {/* Reconcile feedback notification */}
      {reconcileStatus && (
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-50/90 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800/80 text-xs text-sky-800 dark:text-sky-200 animate-fadeIn">
          <Check className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
          <span className="font-medium">{reconcileStatus}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks by title or tag..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-800/70 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              ✕
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-600 dark:text-zinc-300">
          <ArrowUpDown className="w-3 h-3 text-zinc-400" />
          <span className="text-[11px] text-zinc-400">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent text-xs font-semibold text-zinc-800 dark:text-zinc-200 border-0 focus:outline-none cursor-pointer"
          >
            <option value="focus">Focus Time (High to Low)</option>
            <option value="pomodoros">Pomodoro Cycles (High to Low)</option>
            <option value="name">Task Name (A-Z)</option>
            <option value="status">Status (Completed First)</option>
          </select>
        </div>
      </div>

      {/* Task List Table */}
      {sortedItems.length === 0 ? (
        <div className="py-10 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-1.5">
          <Clock className="h-6 w-6 mx-auto text-zinc-300 dark:text-zinc-600 mb-1" />
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">No matching tasks found.</p>
          <p className="text-[11px] text-zinc-400">
            {filterMode === 'focused_only'
              ? 'No focus time logged on tasks for this time horizon. Switch to "All Tasks" or select another horizon.'
              : 'Try clearing your search query or tag filter.'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 max-h-[520px] overflow-y-auto pr-1">
          {sortedItems.map(({ task, periodFocusSeconds, periodPomodoroCount, percentOfTotalFocus, sessions }) => {
            const isCompleted = task.status === 'completed' || task.archived;
            const formattedTime = formatSecondsToHoursMinutes(periodFocusSeconds);
            const isExpanded = expandedTaskIds.has(task.id);
            const hasSessions = !!(sessions && sessions.length > 0);

            return (
              <div key={task.id} className="py-3 px-2 rounded-xl transition-colors group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Status, Title, Tags, Expand Toggle */}
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <div className="mt-0.5 shrink-0 text-zinc-400">
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Circle className="w-4 h-4 text-zinc-300 dark:text-zinc-600" />
                      )}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-medium truncate ${
                            isCompleted
                              ? 'line-through text-zinc-400 dark:text-zinc-500'
                              : 'text-zinc-900 dark:text-zinc-100'
                          }`}
                          title={task.title}
                        >
                          {task.title}
                        </span>

                        {task.priority === 'high' && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-900/50">
                            HIGH
                          </span>
                        )}
                        {task.priority === 'medium' && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/50">
                            MED
                          </span>
                        )}
                      </div>

                      {/* Tags */}
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          {task.tags.map((tg) => {
                            const isTagSelected = activeTagFilter === tg.trim().toLowerCase();
                            return (
                              <button
                                key={tg}
                                type="button"
                                onClick={() => setActiveTagFilter(isTagSelected ? null : tg.trim().toLowerCase())}
                                className={`text-[10px] font-mono px-1.5 py-0.2 rounded transition-colors ${
                                  isTagSelected
                                    ? 'bg-sky-600 text-white font-medium'
                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                                }`}
                              >
                                #{tg.trim()}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Focus Time, Pomodoros, Bar & Expand Button */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 sm:w-64">
                    {/* Progress bar */}
                    <div className="flex-1 hidden sm:block">
                      <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-sm overflow-hidden">
                        <div
                          className="h-full bg-sky-500 rounded-sm transition-all duration-300"
                          style={{ width: `${Math.min(100, percentOfTotalFocus)}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-zinc-400 font-mono block text-right mt-0.5">
                        {percentOfTotalFocus}% of period
                      </span>
                    </div>

                    {/* Numbers */}
                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs font-bold font-mono block ${
                          periodFocusSeconds > 0
                            ? 'text-zinc-900 dark:text-zinc-100'
                            : 'text-zinc-400 dark:text-zinc-600'
                        }`}
                      >
                        {periodFocusSeconds > 0 ? formattedTime : '--'}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono block">
                        {periodPomodoroCount} {periodPomodoroCount === 1 ? 'cycle' : 'cycles'}
                      </span>
                    </div>

                    {/* Expand/Collapse Timestamps Button */}
                    {hasSessions && (
                      <button
                        type="button"
                        onClick={() => toggleTaskExpanded(task.id)}
                        className={`p-1.5 rounded-lg border transition-all swiftui-press ${
                          isExpanded
                            ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400'
                            : 'border-zinc-200/80 dark:border-zinc-700/80 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                        title={isExpanded ? 'Hide timestamps' : 'View session timestamps and audit discrepancies'}
                      >
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Session Timestamps Breakdown */}
                {isExpanded && hasSessions && (
                  <div className="mt-2.5 ml-2 sm:ml-6 p-3 rounded-xl bg-zinc-50/90 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 space-y-2 card-enter">
                    <div className="flex items-center justify-between text-[11px] font-medium text-zinc-500 dark:text-zinc-400 border-b border-zinc-200/50 dark:border-zinc-700/50 pb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-sky-500" />
                        <span>Contributing Focus Sessions ({sessions!.length})</span>
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">Exact Intervals & Audit</span>
                    </div>

                    <div className="divide-y divide-zinc-200/40 dark:divide-zinc-700/40">
                      {sessions!.map((sess) => {
                        const timeRange = formatSessionTimeRange(sess.startedAt, sess.completedAt);
                        const sessionDate = formatSessionDate(sess.completedAt || sess.startedAt);
                        const durationMin = Math.round((sess.durationSeconds || 1500) / 60);
                        const isDupe = isDuplicateInterval(sess, sessions);
                        const isDeleting = deletingSessionId === sess.id;

                        return (
                          <div
                            key={sess.id}
                            className="py-1.5 px-2 flex items-center justify-between gap-3 text-xs hover:bg-white/80 dark:hover:bg-zinc-800/80 rounded-lg transition-colors group/sess"
                          >
                            <div className="flex items-center gap-2 flex-wrap min-w-0">
                              <span className="font-mono text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">
                                {timeRange || 'Focus Session'}
                              </span>
                              <span className="text-[11px] text-zinc-400">
                                • {sessionDate}
                              </span>
                              {isDupe && (
                                <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/60">
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  <span>Duplicate interval</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2.5 shrink-0">
                              <span className="font-mono text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                                {durationMin} min
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteSession(e, sess.id)}
                                disabled={isDeleting}
                                className="p-1 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors swiftui-press"
                                title="Delete this session entry and deduct time from task"
                              >
                                <Trash2 className={`w-3.5 h-3.5 ${isDeleting ? 'animate-pulse text-red-500' : ''}`} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default TaskFocusBreakdown;
