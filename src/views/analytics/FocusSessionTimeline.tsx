import React, { useMemo, useState } from 'react';
import {
  CalendarClock,
  Clock,
  Trash2,
  AlertTriangle,
  Search,
  Tag,
  CheckCircle2,
  Circle,
  Filter,
} from 'lucide-react';
import { FocusSession, TaskItem } from '@/types';
import { formatSecondsToHoursMinutes } from '@/lib/utils';
import { formatSessionDate, formatSessionTimeRange } from './analyticsUtils';
import { useData } from '@/context/DataContext';
import { TimeHorizon } from '@/views/AnalyticsView';

interface FocusSessionTimelineProps {
  sessions: FocusSession[];
  tasks: TaskItem[];
  timeHorizon: TimeHorizon;
}

export const FocusSessionTimeline: React.FC<FocusSessionTimelineProps> = ({
  sessions,
  tasks,
  timeHorizon,
}) => {
  const { deleteFocusSession } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDuplicatesOnly, setShowDuplicatesOnly] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Map task IDs and titles for fast lookup
  const taskMap = useMemo(() => {
    const map = new Map<string, TaskItem>();
    tasks.forEach((t) => map.set(t.id, t));
    return map;
  }, [tasks]);

  // Sort focus-only sessions descending by completion/start time
  const focusSessionsDesc = useMemo(() => {
    return [...sessions]
      .filter((s) => s.mode === 'focus')
      .sort((a, b) => {
        const timeB = new Date(b.completedAt || b.startedAt || 0).getTime();
        const timeA = new Date(a.completedAt || a.startedAt || 0).getTime();
        return timeB - timeA;
      });
  }, [sessions]);

  // Check if a session has potential duplicates/overlaps with other sessions in the list
  const isDuplicateSession = (session: FocusSession, allSessions: FocusSession[]) => {
    const sTime = new Date(session.completedAt || session.startedAt || 0).getTime();
    if (!sTime) return false;

    return allSessions.some((other) => {
      if (other.id === session.id) return false;
      const oTime = new Date(other.completedAt || other.startedAt || 0).getTime();
      if (!oTime) return false;

      // Check proximity within 15 mins
      const proximity = Math.abs(sTime - oTime) < 15 * 60 * 1000;
      if (!proximity) return false;

      // Check same task or common tags
      const sameTask =
        (session.taskId && other.taskId && session.taskId === other.taskId) ||
        (session.taskTitle && other.taskTitle && session.taskTitle.trim().toLowerCase() === other.taskTitle.trim().toLowerCase());

      return sameTask || (!session.taskId && !other.taskId);
    });
  };

  // Filter sessions by search & duplicate mode
  const filteredSessions = useMemo(() => {
    return focusSessionsDesc.filter((s) => {
      if (showDuplicatesOnly && !isDuplicateSession(s, focusSessionsDesc)) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const taskTitle = s.taskId ? taskMap.get(s.taskId)?.title || '' : s.taskTitle || '';
        const matchesTitle = taskTitle.toLowerCase().includes(query);
        const matchesTags = s.tags && s.tags.some((t) => t.toLowerCase().includes(query));
        const matchesTime = (s.completedAt || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesTags && !matchesTime) return false;
      }

      return true;
    });
  }, [focusSessionsDesc, showDuplicatesOnly, searchQuery, taskMap]);

  const duplicateCount = useMemo(() => {
    return focusSessionsDesc.filter((s) => isDuplicateSession(s, focusSessionsDesc)).length;
  }, [focusSessionsDesc]);

  const handleDelete = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (!window.confirm('Delete this focus session? This will remove the duplicate interval and reconcile task metrics.')) {
      return;
    }
    setDeletingId(sessionId);
    try {
      await deleteFocusSession(sessionId);
    } catch (err) {
      console.error('Failed to delete session:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const totalFilteredSeconds = useMemo(() => {
    return filteredSessions.reduce((acc, s) => acc + (s.durationSeconds || 1500), 0);
  }, [filteredSessions]);

  return (
    <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4 card-enter interactive-card">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-sky-500" />
            <span>Focus Session Log & Timeline</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Exact start and completion timestamps for all sessions in this horizon. Track intervals and eliminate double entries.
          </p>
        </div>

        {/* Counter and Duplicates Filter */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {duplicateCount > 0 && (
            <button
              type="button"
              onClick={() => setShowDuplicatesOnly(!showDuplicatesOnly)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all swiftui-press ${
                showDuplicatesOnly
                  ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 shadow-xs'
                  : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-amber-600'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              <span>{duplicateCount} Potential {duplicateCount === 1 ? 'Duplicate' : 'Duplicates'}</span>
            </button>
          )}

          <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
            {filteredSessions.length} {filteredSessions.length === 1 ? 'session' : 'sessions'} • {formatSecondsToHoursMinutes(totalFilteredSeconds)}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter sessions by task title, tags, or timestamp..."
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

      {/* Session Timeline List */}
      {filteredSessions.length === 0 ? (
        <div className="py-10 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-1.5">
          <Clock className="h-6 w-6 mx-auto text-zinc-300 dark:text-zinc-600 mb-1" />
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">No focus sessions found.</p>
          <p className="text-[11px] text-zinc-400">
            {showDuplicatesOnly
              ? 'No duplicate session intervals detected in this time horizon.'
              : 'Focus sessions recorded during this period will appear with exact timestamps.'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 max-h-[460px] overflow-y-auto pr-1">
          {filteredSessions.map((session) => {
            const timeRange = formatSessionTimeRange(session.startedAt, session.completedAt);
            const dateStr = formatSessionDate(session.completedAt || session.startedAt);
            const durationMin = Math.round((session.durationSeconds || 1500) / 60);
            const isDupe = isDuplicateSession(session, focusSessionsDesc);
            const isDeleting = deletingId === session.id;

            // Resolve linked task title
            let linkedTaskTitle: string | null = session.taskTitle || null;
            if (session.taskId && taskMap.has(session.taskId)) {
              linkedTaskTitle = taskMap.get(session.taskId)?.title || null;
            }

            return (
              <div
                key={session.id}
                className="py-2.5 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 rounded-xl transition-colors group"
              >
                {/* Left: Timestamps & Task Context */}
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Timestamp Range */}
                    <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {timeRange || 'Focus Session'}
                    </span>

                    {/* Date */}
                    <span className="text-[11px] text-zinc-400">
                      • {dateStr}
                    </span>

                    {/* Duplicate Indicator */}
                    {isDupe && (
                      <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/60">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        <span>Potential Double Entry</span>
                      </span>
                    )}
                  </div>

                  {/* Linked Task & Tags */}
                  <div className="flex items-center gap-2 flex-wrap text-xs text-zinc-600 dark:text-zinc-400">
                    <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-xs sm:max-w-md">
                      {linkedTaskTitle ? `Task: ${linkedTaskTitle}` : 'Standalone Focus Session'}
                    </span>

                    {session.tags && session.tags.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        {session.tags.map((tg) => (
                          <span
                            key={tg}
                            className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                          >
                            #{tg.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Duration & Delete Action */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <span className="font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    {durationMin} min
                  </span>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, session.id)}
                    disabled={isDeleting}
                    className="p-1.5 rounded-lg border border-transparent hover:border-red-200 dark:hover:border-red-900 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all swiftui-press"
                    title="Delete this session and heal any inflated task metrics"
                  >
                    <Trash2 className={`w-3.5 h-3.5 ${isDeleting ? 'animate-pulse text-red-500' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default FocusSessionTimeline;
