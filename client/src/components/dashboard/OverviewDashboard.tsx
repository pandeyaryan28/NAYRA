import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import { 
  CheckSquare, 
  Calendar as CalendarIcon, 
  Timer, 
  Flame, 
  ArrowRight, 
  Check, 
  Clock, 
  Plus, 
  Send
} from 'lucide-react';
import { api } from '../../services/api.js';

export const OverviewDashboard: React.FC = () => {
  const { 
    tasks, 
    calendarEvents, 
    nutritionData, 
    timeLogs, 
    setActiveTab, 
    refreshAll,
    showToast
  } = useApp();

  const [briefing, setBriefing] = useState<any>(null);
  const [quickInput, setQuickInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    api.getBriefing().then(res => setBriefing(res)).catch(() => {});
  }, [tasks, calendarEvents, nutritionData]);

  const todayStr = new Date().toISOString().split('T')[0];
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const urgentTasks = pendingTasks.filter(t => t.priority === 'urgent' || t.priority === 'high');
  const todayEvents = calendarEvents.filter(e => e.startTime.startsWith(todayStr));
  const focusMinutesToday = timeLogs
    .filter(l => l.timestamp.startsWith(todayStr))
    .reduce((acc, l) => acc + (l.durationMinutes || 0), 0);

  const consumedCalories = nutritionData?.summary?.consumedCalories || 0;
  const targetCalories = nutritionData?.summary?.targetCalories || 2200;
  const caloriePercent = Math.min(100, Math.round((consumedCalories / targetCalories) * 100));

  const handleQuickCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim() || isProcessing) return;

    setIsProcessing(true);
    try {
      const res = await api.chatWithNayra(quickInput);
      showToast(res.reply, 'success');
      setQuickInput('');
      await refreshAll();
    } catch (err: any) {
      showToast(err.message || 'Error executing action', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTaskComplete = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      await api.updateTask(taskId, { ...task, status: 'completed', completedAt: new Date().toISOString() });
      showToast(`Completed: ${task.title}`, 'success');
      await refreshAll();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 transition-colors duration-200">
      {/* Top Minimal Greeting & Assistant Input */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {briefing?.greeting || 'Good day'}, Aryan
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {briefing?.summaryText || `You have ${pendingTasks.length} active tasks, ${todayEvents.length} calendar events, and ${consumedCalories} kcal logged today.`}
          </p>
        </div>

        {/* Minimal Command Bar */}
        <form onSubmit={handleQuickCommand} className="flex items-center gap-2 w-full md:w-80">
          <input
            type="text"
            placeholder="Tell Nayra: 'ate 2 eggs' or 'add task...'"
            value={quickInput}
            onChange={e => setQuickInput(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors shadow-2xs"
          />
          <button
            type="submit"
            disabled={isProcessing || !quickInput.trim()}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-medium hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* 4 Minimal Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tasks Card */}
        <div 
          onClick={() => setActiveTab('tasks')}
          className="p-5 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer space-y-2 shadow-2xs"
        >
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span>Pending Tasks</span>
            <CheckSquare className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
            {pendingTasks.length}
          </div>
          <div className="text-[11px] text-zinc-400 dark:text-zinc-500">
            {urgentTasks.length} marked high priority
          </div>
        </div>

        {/* Schedule Card */}
        <div 
          onClick={() => setActiveTab('calendar')}
          className="p-5 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer space-y-2 shadow-2xs"
        >
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span>Today's Events</span>
            <CalendarIcon className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
            {todayEvents.length}
          </div>
          <div className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">
            {todayEvents[0] ? `Next: ${todayEvents[0].title}` : 'No events remaining'}
          </div>
        </div>

        {/* Focus Card */}
        <div 
          onClick={() => setActiveTab('pomodoro')}
          className="p-5 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer space-y-2 shadow-2xs"
        >
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span>Focus Time</span>
            <Timer className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
            {focusMinutesToday} <span className="text-xs font-normal text-zinc-400">min</span>
          </div>
          <div className="text-[11px] text-zinc-400 dark:text-zinc-500">
            {Math.round(focusMinutesToday / 25)} pomodoro blocks
          </div>
        </div>

        {/* Calorie Card */}
        <div 
          onClick={() => setActiveTab('nutrition')}
          className="p-5 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer space-y-2 shadow-2xs"
        >
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span>Energy Intake</span>
            <Flame className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
            {consumedCalories} <span className="text-xs font-normal text-zinc-400">/ {targetCalories} kcal</span>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-zinc-900 dark:bg-zinc-200 h-full rounded-full transition-all duration-300" style={{ width: `${caloriePercent}%` }}></div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Active Tasks & Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks Section */}
        <div className="p-6 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Tasks</h3>
            <button
              onClick={() => setActiveTab('tasks')}
              className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1 cursor-pointer"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-1.5">
            {pendingTasks.slice(0, 5).map(task => (
              <div
                key={task.id}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleTaskComplete(task.id)}
                    className="w-4 h-4 rounded border border-zinc-300 dark:border-zinc-700 hover:border-zinc-900 dark:hover:border-zinc-300 flex items-center justify-center text-transparent hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                    title="Mark complete"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <span className="text-xs text-zinc-800 dark:text-zinc-200 font-medium">
                    {task.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
                  {task.dueDate && <span>{task.dueDate}</span>}
                  <span className={`w-2 h-2 rounded-full ${
                    task.priority === 'urgent' ? 'bg-red-500' :
                    task.priority === 'high' ? 'bg-amber-500' :
                    'bg-zinc-300 dark:bg-zinc-700'
                  }`} title={`Priority: ${task.priority}`}></span>
                </div>
              </div>
            ))}

            {pendingTasks.length === 0 && (
              <div className="text-center py-8 text-xs text-zinc-400 dark:text-zinc-500">
                No active tasks.
              </div>
            )}
          </div>
        </div>

        {/* Schedule & Nutrition Section */}
        <div className="space-y-6">
          {/* Schedule */}
          <div className="p-6 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Schedule</h3>
              <button
                onClick={() => setActiveTab('calendar')}
                className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1 cursor-pointer"
              >
                <span>Calendar</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {todayEvents.map(event => (
                <div
                  key={event.id}
                  className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">{event.title}</span>
                  <span className="text-zinc-400 font-mono text-[11px]">
                    {event.isAllDay ? 'All Day' : new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}

              {todayEvents.length === 0 && (
                <div className="text-center py-6 text-xs text-zinc-400 dark:text-zinc-500">
                  No events today.
                </div>
              )}
            </div>
          </div>

          {/* Macro Breakdown */}
          <div className="p-6 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">Nutrition Breakdown</span>
              <span className="font-mono text-zinc-500 dark:text-zinc-400">{consumedCalories} / {targetCalories} kcal</span>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 text-center">
              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40">
                <div className="text-[10px] text-zinc-400 uppercase font-mono">Protein</div>
                <div className="text-sm font-semibold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5">
                  {nutritionData?.summary?.consumedProtein || 0}g
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40">
                <div className="text-[10px] text-zinc-400 uppercase font-mono">Carbs</div>
                <div className="text-sm font-semibold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5">
                  {nutritionData?.summary?.consumedCarbs || 0}g
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40">
                <div className="text-[10px] text-zinc-400 uppercase font-mono">Fats</div>
                <div className="text-sm font-semibold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5">
                  {nutritionData?.summary?.consumedFat || 0}g
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
