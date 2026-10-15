import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  CheckSquare,
  Clock,
  Flame,
  UtensilsCrossed,
  ArrowRight,
  Play,
  BookOpen,
  Cpu,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useFocus } from '@/context/FocusContext';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { HStack, VStack, Spacer } from '@/components/swiftui/SwiftUIStack';
import { SwiftUIGauge, RingData } from '@/components/swiftui/SwiftUIGauge';
import { formatTimeRange, formatSecondsToHoursMinutes, getTodayDateString } from '@/lib/utils';

export const DashboardView: React.FC = () => {
  const navigate = useNavigate();
  const { events, tasks, habits, calorieEntries, settings, toggleTaskComplete, focusStats, toggleHabitDate } = useData();
  const { timerState, remainingSeconds, startTimer, selectTask } = useFocus();

  const todayStr = getTodayDateString();

  // Filter today's items
  const todayEvents = events
    .filter((e) => e.start.startsWith(todayStr))
    .sort((a, b) => a.start.localeCompare(b.start));

  const pendingTasks = tasks.filter((t) => t.status === 'needsAction').slice(0, 5);
  const todayHabits = habits.slice(0, 4);

  // Calorie calculations
  const todayCalories = calorieEntries
    .filter((c) => c.date === todayStr)
    .reduce((acc, c) => acc + c.calories, 0);
  const todayProtein = calorieEntries
    .filter((c) => c.date === todayStr)
    .reduce((acc, c) => acc + c.proteinGrams, 0);
  const todayCarbs = calorieEntries
    .filter((c) => c.date === todayStr)
    .reduce((acc, c) => acc + c.carbsGrams, 0);
  const todayFat = calorieEntries
    .filter((c) => c.date === todayStr)
    .reduce((acc, c) => acc + c.fatGrams, 0);

  const remainingCalories = Math.max(0, settings.dailyCalorieTarget - todayCalories);
  const caloriePercentage = Math.min(100, Math.round((todayCalories / settings.dailyCalorieTarget) * 100));

  // Apple Health concentric activity rings data
  const activityRings: RingData[] = [
    { label: 'Calories', current: todayCalories, target: settings.dailyCalorieTarget, color: '#ef4444' },
    { label: 'Protein', current: todayProtein, target: settings.proteinTargetGrams, color: '#3b82f6' },
    { label: 'Carbs', current: todayCarbs, target: settings.carbsTargetGrams, color: '#f59e0b' },
    { label: 'Fat', current: todayFat, target: settings.fatTargetGrams, color: '#10b981' },
  ];

  const handleStartTaskFocus = (task: any) => {
    selectTask(task);
    navigate('/focus');
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 select-none">
      {/* Top Banner / Hero Command Tile (visionOS Bento Hero) */}
      <div className="p-6 rounded-2xl apple-card-surface liquid-glass-card liquid-glass-interactive backdrop-blur-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-zinc-900/75 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 card-enter interactive-card">
        <VStack alignment="leading" spacing={1}>
          <HStack spacing={2}>
            <span className="text-xs font-mono font-medium text-zinc-500 uppercase tracking-wider">
              Productivity State
            </span>
            <Badge variant={timerState === 'running' ? 'success' : 'default'}>
              {timerState === 'running' ? 'Focus Active' : 'System Ready'}
            </Badge>
          </HStack>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {timerState === 'running'
              ? `Deep Focus Session in Progress (${Math.floor(remainingSeconds / 60)}m left)`
              : 'Command & Execution Center'}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xl">
            Today: {focusStats.todayPomodoroCount} Pomodoro{focusStats.todayPomodoroCount === 1 ? '' : 's'} completed ({formatSecondsToHoursMinutes(focusStats.todayFocusSeconds)} focus time). {focusStats.streakDays > 0 ? `${focusStats.streakDays}-day active streak.` : 'Ready to start your focus streak.'}
          </p>
        </VStack>

        <HStack spacing={3} className="w-full md:w-auto">
          {timerState !== 'running' ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                navigate('/focus');
                startTimer();
              }}
              className="gap-2 w-full md:w-auto transition-transform active:scale-95 swiftui-press"
            >
              <Play className="h-4 w-4 fill-current" />
              Start Focus Session
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/focus')}
              className="gap-2 w-full md:w-auto transition-transform active:scale-95 swiftui-press"
            >
              <Clock className="h-4 w-4" />
              Open Focus Lab
            </Button>
          )}
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/assistant')}
            className="w-full md:w-auto transition-transform active:scale-95 swiftui-press"
          >
            Ask Assistant
          </Button>
        </HStack>
      </div>

      {/* Grid: Calendar + Priority Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule (Apple Calendar Style) */}
        <div className="rounded-2xl apple-card-surface liquid-glass-card liquid-glass-interactive backdrop-blur-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-zinc-900/75 p-5 space-y-4 card-enter stagger-1 interactive-card">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.05] dark:border-white/[0.06]">
            <HStack spacing={2}>
              <Calendar className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Today's Schedule
              </h3>
              <span className="text-xs text-zinc-400 font-mono">({todayEvents.length})</span>
            </HStack>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/calendar')}
              className="text-xs text-zinc-500 gap-1"
            >
              View Calendar <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="space-y-2.5">
            {todayEvents.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-400">
                No events scheduled for today.
              </div>
            ) : (
              todayEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-start justify-between p-3 rounded-xl border border-black/[0.05] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] backdrop-blur-md hover:bg-white/80 dark:hover:bg-white/[0.07] transition-all duration-150 swiftui-press shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100 block">
                      {ev.title}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                      {formatTimeRange(ev.start, ev.end, ev.allDay)}
                      {ev.location && ` • ${ev.location}`}
                    </span>
                  </div>
                  <Badge variant="outline">{ev.allDay ? 'All Day' : 'Google Cal'}</Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Priority Tasks (Apple Reminders Style) */}
        <div className="rounded-2xl apple-card-surface liquid-glass-card liquid-glass-interactive backdrop-blur-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-zinc-900/75 p-5 space-y-4 card-enter stagger-2 interactive-card">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.05] dark:border-white/[0.06]">
            <HStack spacing={2}>
              <CheckSquare className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Top Priority Tasks
              </h3>
              <span className="text-xs text-zinc-400 font-mono">({pendingTasks.length})</span>
            </HStack>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/tasks')}
              className="text-xs text-zinc-500 gap-1 transition-transform active:scale-95 swiftui-press"
            >
              All Tasks <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="space-y-2">
            {pendingTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-400">
                All priority tasks completed. Good work!
              </div>
            ) : (
              pendingTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-black/[0.05] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] backdrop-blur-md hover:bg-white/80 dark:hover:bg-white/[0.07] transition-all duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => toggleTaskComplete(t.id)}
                      className="h-4 w-4 rounded-sm border border-zinc-400 dark:border-zinc-600 hover:border-zinc-800 dark:hover:border-zinc-200 transition-colors shrink-0 task-checkbox-pop"
                    />
                    <div className="truncate">
                      <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 block truncate">
                        {t.title}
                      </span>
                      {t.due && (
                        <span className="text-[10px] text-zinc-400 font-mono">
                          Due: {t.due}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStartTaskFocus(t)}
                      className="h-7 text-[11px] px-2 text-zinc-600 dark:text-zinc-300 gap-1 transition-transform active:scale-95 swiftui-press"
                      title="Start Focus Session on this task"
                    >
                      <Clock className="h-3 w-3" /> Focus
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Habits + Calories Activity Rings Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Habit Trackers */}
        <div className="rounded-2xl apple-card-surface liquid-glass-card liquid-glass-interactive backdrop-blur-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-zinc-900/75 p-5 space-y-4 card-enter stagger-3 interactive-card">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.05] dark:border-white/[0.06]">
            <HStack spacing={2}>
              <Flame className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Daily Habit Consistency
              </h3>
            </HStack>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/habits')}
              className="text-xs text-zinc-500 gap-1 transition-transform active:scale-95 swiftui-press"
            >
              Manage <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="space-y-2">
            {todayHabits.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-400">
                No active habits yet. Add your daily habits in Habits.
              </div>
            ) : (
              todayHabits.map((h) => {
                const isDone = Boolean(h.completions[todayStr]);
                return (
                  <div
                    key={h.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-black/[0.05] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] backdrop-blur-md hover:bg-white/80 dark:hover:bg-white/[0.07] transition-all duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                  >
                    <div className="space-y-0.5 truncate mr-2">
                      <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 block truncate">
                        {h.title}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        Streak: {h.currentStreak} days (Best: {h.bestStreak})
                      </span>
                    </div>
                    <Button
                      variant={isDone ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => toggleHabitDate(h.id, todayStr)}
                      className="h-7 text-xs px-2.5 transition-transform active:scale-95 swiftui-press"
                    >
                      {isDone ? 'Completed' : 'Mark Done'}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Nutrition Activity Rings (Apple Health Concentric Rings) */}
        <div className="rounded-2xl apple-card-surface liquid-glass-card liquid-glass-interactive backdrop-blur-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-zinc-900/75 p-5 space-y-4 card-enter stagger-4 interactive-card">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.05] dark:border-white/[0.06]">
            <HStack spacing={2}>
              <UtensilsCrossed className="h-4 w-4 text-emerald-500" />
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Daily Nutrition Gauge
              </h3>
            </HStack>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/calories')}
              className="text-xs text-zinc-500 gap-1 transition-transform active:scale-95 swiftui-press"
            >
              Log Meals <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Concentric Apple Health Rings */}
            <div className="shrink-0">
              <SwiftUIGauge
                rings={activityRings}
                size={140}
                strokeWidth={10}
                ringGap={3}
                centerContent={
                  <div className="text-center font-mono">
                    <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      {caloriePercentage}%
                    </span>
                    <span className="text-[9px] text-zinc-400 block -mt-0.5 uppercase tracking-wider">
                      Target
                    </span>
                  </div>
                }
              />
            </div>

            {/* Macro Stats */}
            <div className="flex-1 w-full space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
                    {todayCalories}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono"> / {settings.dailyCalorieTarget} kcal</span>
                </div>
                <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                  {remainingCalories} kcal remaining
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full bg-black/[0.06] dark:bg-white/[0.08] rounded-sm overflow-hidden">
                <div
                  className="h-full bg-zinc-900 dark:bg-zinc-100 progress-bar-animated"
                  style={{ width: `${caloriePercentage}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono text-xs">
                <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] backdrop-blur-md shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  <span className="text-[10px] text-blue-500 dark:text-blue-400 block uppercase font-semibold">Protein</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {todayProtein}g
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] backdrop-blur-md shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  <span className="text-[10px] text-amber-500 dark:text-amber-400 block uppercase font-semibold">Carbs</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {todayCarbs}g
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] backdrop-blur-md shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  <span className="text-[10px] text-emerald-500 dark:text-emerald-400 block uppercase font-semibold">Fat</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {todayFat}g
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Integrated Special Modules Launcher */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div
          onClick={() => navigate('/ca-tracker')}
          className="p-5 rounded-2xl apple-card-surface liquid-glass-card liquid-glass-interactive backdrop-blur-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-zinc-900/75 hover:border-zinc-400/80 dark:hover:border-zinc-600/80 transition-all cursor-pointer flex items-center justify-between group interactive-card card-enter stagger-5 swiftui-press"
        >
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-white/80 dark:bg-white/[0.08] border border-black/[0.05] dark:border-white/[0.1] text-zinc-800 dark:text-zinc-200 flex items-center justify-center transition-transform group-hover:scale-105 shadow-[0_2px_6px_rgba(0,0,0,0.04)]">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-500 transition-colors">
                CA Foundation Exam Tracker
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                4-Paper ICAI syllabus blueprint, 40/50% threshold pass engine & spaced revisions.
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:translate-x-1.5 transition-transform" />
        </div>

        <div
          onClick={() => navigate('/scint-engine')}
          className="p-5 rounded-2xl apple-card-surface liquid-glass-card liquid-glass-interactive backdrop-blur-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-zinc-900/75 hover:border-zinc-400/80 dark:hover:border-zinc-600/80 transition-all cursor-pointer flex items-center justify-between group interactive-card card-enter stagger-6 swiftui-press"
        >
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-white/80 dark:bg-white/[0.08] border border-black/[0.05] dark:border-white/[0.1] text-zinc-800 dark:text-zinc-200 flex items-center justify-center transition-transform group-hover:scale-105 shadow-[0_2px_6px_rgba(0,0,0,0.04)]">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-500 transition-colors">
                SCInt Semiconductor Diligence
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                34-Node techno-economic venture blueprints, 6-tier supply chain & ISM 2.0 subsidies.
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:translate-x-1.5 transition-transform" />
        </div>
      </div>
    </div>
  );
};
