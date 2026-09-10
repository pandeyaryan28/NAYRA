import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import { 
  CheckSquare, 
  Timer, 
  Flame, 
  Activity,
  ArrowRight, 
  Check
} from 'lucide-react';
import { api } from '../../services/api.js';

export const OverviewDashboard: React.FC = () => {
  const { 
    tasks, 
    calendarEvents, 
    habits,
    nutritionData, 
    timeLogs, 
    setActiveTab, 
    toggleHabit,
    refreshAll,
    showToast
  } = useApp();

  const [briefing, setBriefing] = useState<any>(null);

  useEffect(() => {
    api.getBriefing().then(res => setBriefing(res)).catch(() => {});
  }, [tasks, calendarEvents, habits, nutritionData]);

  const todayStr = new Date().toISOString().split('T')[0];
  // Only count tasks that are truly active (not archived and not completed)
  const pendingTasks = tasks.filter(t => !t.archived && t.status !== 'completed');
  const urgentTasks = pendingTasks.filter(t => t.priority === 'urgent' || t.priority === 'high');
  const todayEvents = calendarEvents.filter(e => e.startTime.startsWith(todayStr));
  const focusMinutesToday = timeLogs
    .filter(l => l.timestamp.startsWith(todayStr))
    .reduce((acc, l) => acc + (l.durationMinutes || 0), 0);

  const completedHabitsToday = habits.filter(h => h.completedDates?.includes(todayStr)).length;
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);

  const consumedCalories = nutritionData?.summary?.consumedCalories || 0;
  const targetCalories = nutritionData?.summary?.targetCalories || 2200;
  const caloriePercent = Math.min(100, Math.round((consumedCalories / targetCalories) * 100));

  const handleTaskComplete = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      await api.updateTask(taskId, { 
        ...task, 
        status: 'completed', 
        archived: true,
        completedAt: new Date().toISOString() 
      });
      showToast(`Completed and archived: ${task.title}`, 'success');
      await refreshAll();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-6 transition-colors duration-150">
      {/* Top Greeting */}
      <div className="pb-4 border-b border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-zinc-100">
            {briefing?.greeting || 'Welcome back'}, Aryan
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            {briefing?.summaryText || `${pendingTasks.length} active tasks, ${completedHabitsToday}/${habits.length} habits completed, and ${todayEvents.length} events scheduled today.`}
          </p>
        </div>
      </div>

      {/* 4 Focused Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tasks Card */}
        <div 
          onClick={() => setActiveTab('tasks')}
          className="p-4 rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700 transition-all cursor-pointer space-y-2 shadow-2xs"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-medium">
            <span>Active Tasks</span>
            <CheckSquare className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-semibold text-slate-900 dark:text-zinc-100 font-mono">
            {pendingTasks.length}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-zinc-500">
            {urgentTasks.length > 0 ? `${urgentTasks.length} high priority` : 'None urgent'}
          </div>
        </div>

        {/* Habits Card */}
        <div 
          onClick={() => setActiveTab('habits')}
          className="p-4 rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700 transition-all cursor-pointer space-y-2 shadow-2xs"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-medium">
            <span>Daily Habits</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-semibold text-slate-900 dark:text-zinc-100 font-mono">
            {completedHabitsToday} <span className="text-xs font-normal text-slate-400">/ {habits.length}</span>
          </div>
          <div className="text-[11px] text-amber-500 font-medium flex items-center gap-1 font-mono">
            <Flame className="w-3 h-3 fill-amber-500" />
            <span>{bestStreak}d streak</span>
          </div>
        </div>

        {/* Focus Card */}
        <div 
          onClick={() => setActiveTab('pomodoro')}
          className="p-4 rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700 transition-all cursor-pointer space-y-2 shadow-2xs"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-medium">
            <span>Focus Time</span>
            <Timer className="w-4 h-4 text-violet-500" />
          </div>
          <div className="text-2xl font-semibold text-slate-900 dark:text-zinc-100 font-mono">
            {focusMinutesToday} <span className="text-xs font-normal text-slate-400 dark:text-zinc-500">min</span>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-zinc-500">
            {focusMinutesToday > 0 ? `${Math.round(focusMinutesToday / 25)} blocks completed` : 'Start a session'}
          </div>
        </div>

        {/* Calorie Card */}
        <div 
          onClick={() => setActiveTab('nutrition')}
          className="p-4 rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700 transition-all cursor-pointer space-y-2 shadow-2xs"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-medium">
            <span>Calories</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-semibold text-slate-900 dark:text-zinc-100 font-mono">
            {consumedCalories} <span className="text-xs font-normal text-slate-400 dark:text-zinc-500">/ {targetCalories}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-slate-900 dark:bg-zinc-200 h-full rounded-full transition-all duration-300" style={{ width: `${caloriePercent}%` }}></div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Active Tasks & Today's Routine */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Tasks Section */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Today's Priority Tasks</h3>
            <button
              onClick={() => setActiveTab('tasks')}
              className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100 flex items-center gap-1 cursor-pointer"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-1.5">
            {pendingTasks.slice(0, 6).map(task => (
              <div
                key={task.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    onClick={() => handleTaskComplete(task.id)}
                    className="w-4 h-4 rounded border border-slate-300 dark:border-zinc-700 hover:border-slate-900 dark:hover:border-zinc-300 flex items-center justify-center text-transparent hover:text-slate-900 dark:hover:text-zinc-100 transition-colors cursor-pointer shrink-0"
                    title="Complete & archive"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <span className="text-xs text-slate-800 dark:text-zinc-200 font-medium truncate">
                    {task.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-zinc-500 font-mono shrink-0 ml-2">
                  {task.dueDate && <span>{task.dueDate}</span>}
                  <span className={`w-2 h-2 rounded-full ${
                    task.priority === 'urgent' ? 'bg-red-500' :
                    task.priority === 'high' ? 'bg-amber-500' :
                    'bg-slate-300 dark:bg-zinc-700'
                  }`} title={`Priority: ${task.priority}`}></span>
                </div>
              </div>
            ))}

            {pendingTasks.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400 dark:text-zinc-500">
                All tasks completed! Great work.
              </div>
            )}
          </div>
        </div>

        {/* Habits & Events Column */}
        <div className="space-y-4">
          {/* Habits Section */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Daily Habits</h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                  {completedHabitsToday}/{habits.length}
                </span>
              </div>
              <button
                onClick={() => setActiveTab('habits')}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100 flex items-center gap-1 cursor-pointer"
              >
                <span>Manage</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-1.5">
              {habits.slice(0, 4).map(habit => {
                const isDone = habit.completedDates?.includes(todayStr);
                return (
                  <div
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id, todayStr)}
                    className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                      isDone
                        ? 'border-emerald-200/80 dark:border-emerald-950 bg-emerald-50/30 dark:bg-emerald-950/20'
                        : 'border-slate-200/80 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                        isDone ? 'bg-emerald-500 text-white' : 'border border-slate-300 dark:border-zinc-700'
                      }`}>
                        {isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <span className={`text-xs font-medium ${isDone ? 'line-through text-slate-400 dark:text-zinc-500' : 'text-slate-800 dark:text-zinc-200'}`}>
                        {habit.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-mono text-amber-500">
                      <Flame className="w-3 h-3 fill-amber-500" />
                      <span>{habit.streak || 0}d</span>
                    </div>
                  </div>
                );
              })}

              {habits.length === 0 && (
                <div className="text-center py-4 text-xs text-slate-400 dark:text-zinc-500">
                  No habits tracked yet.
                </div>
              )}
            </div>
          </div>

          {/* Schedule Section */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Today's Schedule</h3>
              <button
                onClick={() => setActiveTab('calendar')}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100 flex items-center gap-1 cursor-pointer"
              >
                <span>Calendar</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-1.5">
              {todayEvents.slice(0, 3).map(event => (
                <div
                  key={event.id}
                  className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800/60 flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-slate-800 dark:text-zinc-200 truncate">{event.title}</span>
                  <span className="text-slate-400 font-mono text-[11px] shrink-0 ml-2">
                    {event.isAllDay ? 'All Day' : new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}

              {todayEvents.length === 0 && (
                <div className="text-center py-3 text-xs text-slate-400 dark:text-zinc-500">
                  No upcoming events today.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
