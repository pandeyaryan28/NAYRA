import React from 'react';
import { Flame, Award, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { Habit } from '@/types';
import { TimeHorizon } from '@/views/AnalyticsView';
import { subDays, format } from 'date-fns';

interface HabitsAnalyticsSectionProps {
  habits: Habit[];
  timeHorizon: TimeHorizon;
  todayStr: string;
}

export const HabitsAnalyticsSection: React.FC<HabitsAnalyticsSectionProps> = ({
  habits,
  timeHorizon,
  todayStr,
}) => {
  const activeHabits = habits.filter((h) => !h.archived);
  const totalCompletions = habits.reduce(
    (sum, h) => sum + Object.keys(h.completions || {}).length,
    0
  );
  const bestOverallStreak = habits.reduce((max, h) => Math.max(max, h.bestStreak || 0), 0);
  const avgStreak =
    activeHabits.length > 0
      ? Math.round(activeHabits.reduce((sum, h) => sum + (h.currentStreak || 0), 0) / activeHabits.length)
      : 0;

  // Past 7 days date strings for adherence micro-grid
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    return format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
  });

  // Category breakdown
  const categoryMap = new Map<string, number>();
  activeHabits.forEach((h) => {
    categoryMap.set(h.category, (categoryMap.get(h.category) || 0) + 1);
  });

  return (
    <div className="space-y-6 card-enter">
      {/* Top Habit Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 space-y-1">
          <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold block">
            Active Habits
          </span>
          <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 block">
            {activeHabits.length}
          </span>
          <span className="text-[10px] text-zinc-500 block">Tracked routines</span>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 space-y-1">
          <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold block">
            Average Streak
          </span>
          <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 block">
            {avgStreak}d
          </span>
          <span className="text-[10px] text-zinc-500 block">Across active habits</span>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 space-y-1">
          <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold block">
            Best Overall Streak
          </span>
          <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 block">
            {bestOverallStreak}d
          </span>
          <span className="text-[10px] text-zinc-500 block">All-time record</span>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 space-y-1">
          <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold block">
            Total Check-ins
          </span>
          <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 block">
            {totalCompletions}
          </span>
          <span className="text-[10px] text-zinc-500 block">Lifetime completions</span>
        </div>
      </div>

      {/* Habit Consistency Table */}
      <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4 card-enter interactive-card">
        <div className="pb-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Habit Consistency & 7-Day Adherence Grid</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Daily execution status for all active habits over the last 7 days.
            </p>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">
            {activeHabits.length} routines
          </span>
        </div>

        {activeHabits.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
            <Flame className="h-6 w-6 mx-auto mb-2 text-zinc-300 dark:text-zinc-600" />
            <p className="font-medium text-zinc-600 dark:text-zinc-300">No active habits configured.</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Create daily habits in the Habits tab to track streak continuity and discipline analytics.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeHabits.map((habit) => {
              const completions7d = past7Days.filter((d) => habit.completions?.[d]).length;
              const rate7d = Math.round((completions7d / 7) * 100);

              return (
                <div
                  key={habit.id}
                  className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 sm:w-1/3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-sm"
                        style={{ backgroundColor: habit.color || '#f59e0b' }}
                      />
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {habit.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono block uppercase">
                      {habit.category} • {habit.frequency}
                    </span>
                  </div>

                  {/* 7-Day micro squares */}
                  <div className="flex items-center gap-1.5 sm:w-1/3 justify-start sm:justify-center">
                    {past7Days.map((d) => {
                      const isDone = Boolean(habit.completions?.[d]);
                      return (
                        <div
                          key={d}
                          title={`${d}: ${isDone ? 'Completed' : 'Missed'}`}
                          className={`w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-mono transition-colors ${
                            isDone
                              ? 'bg-emerald-600 text-white font-bold'
                              : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500'
                          }`}
                        >
                          {d.slice(-2)}
                        </div>
                      );
                    })}
                  </div>

                  {/* Streak & Rate */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 sm:w-1/3 text-right">
                    <div>
                      <span className="text-xs font-bold font-mono text-zinc-900 dark:text-zinc-100 block">
                        {habit.currentStreak || 0}d streak
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono block">
                        Best: {habit.bestStreak || 0}d
                      </span>
                    </div>
                    <div className="w-12 text-right">
                      <span className="text-xs font-semibold font-mono text-zinc-800 dark:text-zinc-200 block">
                        {rate7d}%
                      </span>
                      <span className="text-[9px] text-zinc-400 block">7d rate</span>
                    </div>
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
