import React from 'react';
import { Tag, ArrowUpDown, CheckSquare, Layers, AlertTriangle } from 'lucide-react';
import { TagAnalyticsItem, TaskItem } from '@/types';
import { formatSecondsToHoursMinutes } from '@/lib/utils';

interface TaskVelocitySectionProps {
  tagAnalytics: TagAnalyticsItem[];
  sortedTagAnalytics: TagAnalyticsItem[];
  tagSortBy: 'focus' | 'tasks' | 'completion' | 'name';
  setTagSortBy: (sort: 'focus' | 'tasks' | 'completion' | 'name') => void;
  activeTagFilter: string | null;
  setActiveTagFilter: (tag: string | null) => void;
  mostFocusedTag: TagAnalyticsItem | null;
  highestVelocityTag: TagAnalyticsItem | null;
  totalTaggedFocusSeconds: number;
  tasks: TaskItem[];
}

export const TaskVelocitySection: React.FC<TaskVelocitySectionProps> = ({
  tagAnalytics,
  sortedTagAnalytics,
  tagSortBy,
  setTagSortBy,
  activeTagFilter,
  setActiveTagFilter,
  mostFocusedTag,
  highestVelocityTag,
  totalTaggedFocusSeconds,
  tasks,
}) => {
  // Priority breakdown
  const highPriorityTasks = tasks.filter((t) => t.priority === 'high');
  const mediumPriorityTasks = tasks.filter((t) => t.priority === 'medium');
  const lowPriorityTasks = tasks.filter((t) => t.priority === 'low');

  const highCompleted = highPriorityTasks.filter((t) => t.status === 'completed' || t.archived).length;
  const mediumCompleted = mediumPriorityTasks.filter((t) => t.status === 'completed' || t.archived).length;
  const lowCompleted = lowPriorityTasks.filter((t) => t.status === 'completed' || t.archived).length;

  return (
    <div className="space-y-6 card-enter">
      {/* Priority Velocity Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-red-200/50 dark:border-red-900/40 bg-white/70 dark:bg-zinc-900/70 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-600 dark:text-red-400">
              High Priority Throughput
            </span>
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
              {highCompleted}/{highPriorityTasks.length}
            </span>
            <span className="text-xs font-mono text-zinc-500">
              {highPriorityTasks.length > 0
                ? Math.round((highCompleted / highPriorityTasks.length) * 100)
                : 0}% throughput
            </span>
          </div>
          <div className="h-1.5 w-full bg-red-100 dark:bg-red-950/60 rounded-sm overflow-hidden">
            <div
              className="h-full bg-red-500 transition-all duration-300"
              style={{
                width: `${
                  highPriorityTasks.length > 0 ? (highCompleted / highPriorityTasks.length) * 100 : 0
                }%`,
              }}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-amber-200/50 dark:border-amber-900/40 bg-white/70 dark:bg-zinc-900/70 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              Medium Priority Throughput
            </span>
            <Layers className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
              {mediumCompleted}/{mediumPriorityTasks.length}
            </span>
            <span className="text-xs font-mono text-zinc-500">
              {mediumPriorityTasks.length > 0
                ? Math.round((mediumCompleted / mediumPriorityTasks.length) * 100)
                : 0}% throughput
            </span>
          </div>
          <div className="h-1.5 w-full bg-amber-100 dark:bg-amber-950/60 rounded-sm overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-300"
              style={{
                width: `${
                  mediumPriorityTasks.length > 0 ? (mediumCompleted / mediumPriorityTasks.length) * 100 : 0
                }%`,
              }}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              Low Priority Throughput
            </span>
            <CheckSquare className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
              {lowCompleted}/{lowPriorityTasks.length}
            </span>
            <span className="text-xs font-mono text-zinc-500">
              {lowPriorityTasks.length > 0
                ? Math.round((lowCompleted / lowPriorityTasks.length) * 100)
                : 0}% throughput
            </span>
          </div>
          <div className="h-1.5 w-full bg-zinc-200/70 dark:bg-zinc-800 rounded-sm overflow-hidden">
            <div
              className="h-full bg-zinc-600 dark:bg-zinc-400 transition-all duration-300"
              style={{
                width: `${
                  lowPriorityTasks.length > 0 ? (lowCompleted / lowPriorityTasks.length) * 100 : 0
                }%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Tag Performance & Time Allocation Section */}
      <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/75 dark:bg-zinc-900/75 backdrop-blur-2xl p-5 space-y-5 card-enter stagger-3 interactive-card apple-card-surface">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 gap-3">
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Tag className="h-4 w-4 text-sky-500" />
              <span>Tag Performance & Time Allocation</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Task distribution, completion velocity, and deep work time mapped by Pomodoro session tracking. Click any tag to filter.
            </p>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 border border-black/5 dark:border-white/10 rounded-lg px-2.5 py-1.5 bg-zinc-100/80 dark:bg-zinc-800/80 backdrop-blur-md shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] self-start sm:self-auto swiftui-press">
            <ArrowUpDown className="h-3.5 w-3.5 text-zinc-400" />
            <select
              value={tagSortBy}
              onChange={(e) => setTagSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-zinc-800 dark:text-zinc-200 border-0 focus:outline-none cursor-pointer"
            >
              <option value="focus">Sort: Focus Time</option>
              <option value="tasks">Sort: Total Tasks</option>
              <option value="completion">Sort: Completion Rate</option>
              <option value="name">Sort: Tag Name</option>
            </select>
          </div>
        </div>

        {/* Tag Summary Mini-Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-zinc-400 block">Total Distinct Tags</span>
            <span className="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100 block">
              {tagAnalytics.length}
            </span>
          </div>

          <div className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-zinc-400 block">Top Focused Tag</span>
            <span className="text-sm font-semibold truncate text-zinc-900 dark:text-zinc-100 block">
              {mostFocusedTag ? `#${mostFocusedTag.tag}` : 'None'}
            </span>
            {mostFocusedTag && (
              <span className="text-[10px] font-mono text-zinc-500 block">
                {formatSecondsToHoursMinutes(mostFocusedTag.totalFocusSeconds)}
              </span>
            )}
          </div>

          <div className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-zinc-400 block">Highest Completion</span>
            <span className="text-sm font-semibold truncate text-zinc-900 dark:text-zinc-100 block">
              {highestVelocityTag ? `#${highestVelocityTag.tag}` : 'None'}
            </span>
            {highestVelocityTag && (
              <span className="text-[10px] font-mono text-zinc-500 block">
                {highestVelocityTag.completionRate}% complete
              </span>
            )}
          </div>

          <div className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-zinc-400 block">Tagged Deep Work</span>
            <span className="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100 block">
              {totalTaggedFocusSeconds > 0 ? formatSecondsToHoursMinutes(totalTaggedFocusSeconds) : '0 min'}
            </span>
          </div>
        </div>

        {/* Tag Analytics Breakdown Table / List */}
        {tagAnalytics.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
            <Tag className="h-6 w-6 mx-auto mb-2 text-zinc-300 dark:text-zinc-600" />
            <p className="font-medium text-zinc-600 dark:text-zinc-300">No task tags tracked yet.</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Assign tags like #work, #study, or #project in Tasks to see tag-based velocity and Pomodoro focus attribution.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {sortedTagAnalytics.map((item) => {
              const isTagFiltered = activeTagFilter === item.tag;
              return (
                <div
                  key={item.tag}
                  onClick={() => setActiveTagFilter(isTagFiltered ? null : item.tag)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer swiftui-row ${
                    isTagFiltered
                      ? 'border-sky-500/60 bg-sky-50/50 dark:bg-sky-950/30 shadow-xs'
                      : 'border-zinc-100/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/50 hover:bg-white/80 dark:hover:bg-zinc-800/60'
                  } flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                  title={`Click to filter dashboard by #${item.tag}`}
                >
                  {/* Tag Badge & Task Counts */}
                  <div className="space-y-1 min-w-0 sm:w-1/3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full border shadow-xs ${
                          isTagFiltered
                            ? 'bg-sky-600 text-white border-sky-600'
                            : 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-800 dark:border-zinc-200'
                        }`}
                      >
                        #{item.tag}
                      </span>
                      {item.aliases && item.aliases.length > 0 && (
                        <span
                          className="text-[10px] font-mono text-zinc-400 bg-zinc-100 dark:bg-white/[0.06] px-1.5 py-0.5 rounded-full border border-black/5 dark:border-white/5"
                          title={`Includes similar tags: ${item.aliases.map((a) => `#${a}`).join(', ')}`}
                        >
                          +{item.aliases.length} similar
                        </span>
                      )}
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">
                        {item.completedTasks} of {item.totalTasks} completed
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 block">
                      {item.pendingTasks} pending tasks
                    </span>
                  </div>

                  {/* Completion Velocity Bar */}
                  <div className="space-y-1 sm:w-1/3">
                    <div className="flex justify-between text-[11px] font-mono text-zinc-500">
                      <span>Completion Rate</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{item.completionRate}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-200/70 dark:bg-zinc-800 rounded-sm overflow-hidden">
                      <div
                        className="h-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-300"
                        style={{ width: `${item.completionRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Focus Time & Pomodoro Count */}
                  <div className="text-left sm:text-right sm:w-1/3">
                    <span className="text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100 block">
                      {formatSecondsToHoursMinutes(
                        item.periodFocusSeconds !== undefined && item.periodFocusSeconds > 0
                          ? item.periodFocusSeconds
                          : item.totalFocusSeconds
                      )}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono block">
                      {item.periodFocusSeconds !== undefined &&
                      item.periodFocusSeconds > 0 &&
                      item.periodFocusSeconds !== item.totalFocusSeconds ? (
                        <>
                          <span className="text-zinc-500 font-medium">in horizon</span> •{' '}
                          {formatSecondsToHoursMinutes(item.totalFocusSeconds)} all-time ({item.pomodoroCount}{' '}
                          {item.pomodoroCount === 1 ? 'pomo' : 'pomos'})
                        </>
                      ) : (
                        <>
                          {item.pomodoroCount} {item.pomodoroCount === 1 ? 'pomodoro' : 'pomodoros'} logged
                        </>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
