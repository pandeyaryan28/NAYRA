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
  Plus,
  BookOpen,
  Cpu,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useFocus } from '@/context/FocusContext';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { formatTimeRange, formatSecondsToHoursMinutes, getTodayDateString } from '@/lib/utils';
import { isToday, parseISO } from 'date-fns';

export const DashboardView: React.FC = () => {
  const navigate = useNavigate();
  const { events, tasks, habits, calorieEntries, settings, toggleTaskComplete, focusStats, toggleHabitDate } = useData();
  const { timerState, remainingSeconds, mode, startTimer, selectTask } = useFocus();

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
  const remainingCalories = Math.max(0, settings.dailyCalorieTarget - todayCalories);
  const caloriePercentage = Math.min(100, Math.round((todayCalories / settings.dailyCalorieTarget) * 100));

  const handleStartTaskFocus = (task: any) => {
    selectTask(task);
    navigate('/focus');
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 select-none">
      {/* Top Banner / Focus Status */}
      <div className="p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 card-enter interactive-card">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium text-zinc-500 uppercase tracking-wider">
              Productivity State
            </span>
            <Badge variant={timerState === 'running' ? 'success' : 'default'}>
              {timerState === 'running' ? 'Focus Active' : 'System Ready'}
            </Badge>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {timerState === 'running'
              ? `Deep Focus Session in Progress (${Math.floor(remainingSeconds / 60)}m left)`
              : 'Command & Execution Center'}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xl">
            Today: {focusStats.todayPomodoroCount} Pomodoro{focusStats.todayPomodoroCount === 1 ? '' : 's'} completed ({formatSecondsToHoursMinutes(focusStats.todayFocusSeconds)} focus time). {focusStats.streakDays > 0 ? `${focusStats.streakDays}-day active streak.` : 'Ready to start your focus streak.'}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {timerState !== 'running' ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                navigate('/focus');
                startTimer();
              }}
              className="gap-2 w-full md:w-auto transition-transform active:scale-95"
            >
              <Play className="h-4 w-4 fill-current" />
              Start Focus Session
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/focus')}
              className="gap-2 w-full md:w-auto transition-transform active:scale-95"
            >
              <Clock className="h-4 w-4" />
              Open Focus Lab
            </Button>
          )}
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/assistant')}
            className="w-full md:w-auto transition-transform active:scale-95"
          >
            Ask Assistant
          </Button>
        </div>
      </div>

      {/* Grid: Calendar + Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule (Google Calendar) */}
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm space-y-4 card-enter stagger-1 interactive-card">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Today's Schedule
              </h3>
              <span className="text-xs text-zinc-400 font-mono">({todayEvents.length})</span>
            </div>
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
                  className="flex items-start justify-between p-3 rounded-md border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 transition-colors"
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

        {/* Priority Tasks (Google Tasks) */}
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm space-y-4 card-enter stagger-2 interactive-card">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Top Priority Tasks
              </h3>
              <span className="text-xs text-zinc-400 font-mono">({pendingTasks.length})</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/tasks')}
              className="text-xs text-zinc-500 gap-1 transition-transform active:scale-95"
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
                  className="flex items-center justify-between p-2.5 rounded-md border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 transition-colors"
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
                      className="h-7 text-[11px] px-2 text-zinc-600 dark:text-zinc-300 gap-1 transition-transform active:scale-95"
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

      {/* Habits + Calories Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Habit Trackers */}
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm space-y-4 card-enter stagger-3 interactive-card">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Daily Habit Consistency
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/habits')}
              className="text-xs text-zinc-500 gap-1 transition-transform active:scale-95"
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
                    className="flex items-center justify-between p-2.5 rounded-md border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 transition-colors"
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
                      className="h-7 text-xs px-2.5 transition-transform active:scale-95"
                    >
                      {isDone ? 'Completed' : 'Mark Done'}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Nutrition Gauge */}
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm space-y-4 card-enter stagger-4 interactive-card">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4 text-emerald-500" />
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Daily Nutrition Gauge
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/calories')}
              className="text-xs text-zinc-500 gap-1 transition-transform active:scale-95"
            >
              Log Meals <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="space-y-3">
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
            <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-sm overflow-hidden">
              <div
                className="h-full bg-zinc-900 dark:bg-zinc-100 progress-bar-animated"
                style={{ width: `${caloriePercentage}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono text-xs">
              <div className="p-2 rounded-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
                <span className="text-[10px] text-zinc-400 block uppercase">Protein</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {calorieEntries
                    .filter((c) => c.date === todayStr)
                    .reduce((acc, c) => acc + c.proteinGrams, 0)}g
                </span>
              </div>
              <div className="p-2 rounded-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
                <span className="text-[10px] text-zinc-400 block uppercase">Carbs</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {calorieEntries
                    .filter((c) => c.date === todayStr)
                    .reduce((acc, c) => acc + c.carbsGrams, 0)}g
                </span>
              </div>
              <div className="p-2 rounded-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
                <span className="text-[10px] text-zinc-400 block uppercase">Fat</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {calorieEntries
                    .filter((c) => c.date === todayStr)
                    .reduce((acc, c) => acc + c.fatGrams, 0)}g
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Integrated Special Modules Launcher */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div
          onClick={() => navigate('/ca-tracker')}
          className="p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all cursor-pointer flex items-center justify-between group shadow-sm interactive-card card-enter stagger-5"
        >
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center transition-transform group-hover:scale-105">
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
          className="p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all cursor-pointer flex items-center justify-between group shadow-sm interactive-card card-enter stagger-6"
        >
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center transition-transform group-hover:scale-105">
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
