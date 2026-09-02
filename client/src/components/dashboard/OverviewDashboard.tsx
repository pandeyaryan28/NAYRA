import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import { 
  CheckSquare, 
  Calendar as CalendarIcon, 
  Timer, 
  Flame, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Plus, 
  TrendingUp,
  Zap,
  RefreshCw,
  Send
} from 'lucide-react';
import { api } from '../../services/api.js';
import confetti from 'canvas-confetti';

export const OverviewDashboard: React.FC = () => {
  const { 
    tasks, 
    calendarEvents, 
    nutritionData, 
    timeLogs, 
    setActiveTab, 
    syncGoogleTasks, 
    syncGoogleCalendar,
    isSyncing,
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
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      showToast(`Completed: ${task.title}`, 'success');
      await refreshAll();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome / AI Briefing Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 p-6 glass-panel glow-cyan">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Nayra Intelligence Hub</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {briefing?.greeting || 'Good day'}, Commander Aryan
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {briefing?.summaryText || `All systems online. You have ${pendingTasks.length} active tasks, ${todayEvents.length} calendar events, and ${consumedCalories} kcal logged today.`}
            </p>
          </div>

          {/* Quick Nayra Command Bar */}
          <form onSubmit={handleQuickCommand} className="flex items-center gap-2 w-full lg:w-96 bg-slate-950/80 border border-slate-700/80 rounded-xl p-1.5 shadow-inner">
            <input
              type="text"
              placeholder="Tell Nayra: 'I ate 2 eggs for breakfast' or 'add task...'"
              value={quickInput}
              onChange={e => setQuickInput(e.target.value)}
              className="w-full bg-transparent px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isProcessing || !quickInput.trim()}
              className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* 4 Major Metric HUD Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Pending Tasks */}
        <div 
          onClick={() => setActiveTab('tasks')}
          className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-4.5 glass-panel glass-panel-hover cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Tasks in Flight</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold text-white font-mono">{pendingTasks.length}</div>
            <span className="text-[11px] font-mono text-cyan-400/80 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {urgentTasks.length} high priority
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-cyan-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${tasks.length > 0 ? (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        {/* Metric 2: Google Calendar Events */}
        <div 
          onClick={() => setActiveTab('calendar')}
          className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-4.5 glass-panel glass-panel-hover cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Today's Schedule</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <CalendarIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold text-white font-mono">{todayEvents.length}</div>
            <span className="text-[11px] font-mono text-purple-400/80">
              {todayEvents.length > 0 ? `${todayEvents.length} events` : 'All clear'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            {todayEvents[0] ? `Next: ${todayEvents[0].title}` : 'No upcoming meetings'}
          </div>
        </div>

        {/* Metric 3: Pomodoro Focus */}
        <div 
          onClick={() => setActiveTab('pomodoro')}
          className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-4.5 glass-panel glass-panel-hover cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Focus Logged</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Timer className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold text-white font-mono">{focusMinutesToday} <span className="text-sm font-normal text-slate-400">min</span></div>
            <span className="text-[11px] font-mono text-amber-400">
              {Math.round(focusMinutesToday / 25)} pomodoros
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            Target: 120 min daily focus
          </div>
        </div>

        {/* Metric 4: Calories & Nutrition */}
        <div 
          onClick={() => setActiveTab('nutrition')}
          className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-4.5 glass-panel glass-panel-hover cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Calorie Energy</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold text-white font-mono">{consumedCalories} <span className="text-sm font-normal text-slate-400">/ {targetCalories}</span></div>
            <span className="text-[11px] font-mono text-emerald-400">{caloriePercent}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-emerald-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${caloriePercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Split View: Priority Tasks & Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Priority Tasks & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Priority Tasks List */}
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 glass-panel space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white tracking-wide">Priority & Urgent Tasks</h3>
              </div>
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium group"
              >
                <span>View Kanban Board</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <div className="space-y-2">
              {pendingTasks.slice(0, 4).map(task => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-cyan-500/30 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleTaskComplete(task.id)}
                      className="w-5 h-5 rounded-md border border-slate-600 hover:border-cyan-400 flex items-center justify-center text-transparent hover:text-cyan-400 transition-colors"
                      title="Mark complete"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                    <div>
                      <div className="text-xs font-medium text-slate-200 group-hover:text-cyan-300 transition-colors">
                        {task.title}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                        {task.projectName && (
                          <span className="text-slate-400">{task.projectName}</span>
                        )}
                        {task.dueDate && (
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-2.5 h-2.5" /> {task.dueDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                      task.priority === 'urgent' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      task.priority === 'high' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}

              {pendingTasks.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-500">
                  🎉 No pending tasks! All caught up.
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => setActiveTab('tasks')}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 text-xs font-medium text-slate-300 hover:text-cyan-300 transition-all group"
            >
              <Plus className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span>New Task</span>
            </button>

            <button
              onClick={() => setActiveTab('pomodoro')}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 text-xs font-medium text-slate-300 hover:text-purple-300 transition-all group"
            >
              <Timer className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <span>Start Timer</span>
            </button>

            <button
              onClick={() => setActiveTab('nutrition')}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 text-xs font-medium text-slate-300 hover:text-emerald-300 transition-all group"
            >
              <Flame className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Log Meal</span>
            </button>

            <button
              onClick={() => { syncGoogleTasks(); syncGoogleCalendar(); }}
              disabled={isSyncing}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 text-xs font-medium text-slate-300 hover:text-sky-300 transition-all group"
            >
              <RefreshCw className={`w-4 h-4 text-sky-400 ${isSyncing ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform`} />
              <span>2-Way Sync</span>
            </button>
          </div>
        </div>

        {/* Right 1 Col: Today's Schedule & Nutrition Peek */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 glass-panel space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-semibold text-white tracking-wide">Google Calendar</h3>
              </div>
              <button
                onClick={() => setActiveTab('calendar')}
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium"
              >
                <span>Full Agenda</span>
              </button>
            </div>

            <div className="space-y-2">
              {todayEvents.length > 0 ? (
                todayEvents.map(event => (
                  <div
                    key={event.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1"
                  >
                    <div className="text-xs font-medium text-slate-200">{event.title}</div>
                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                      <Clock className="w-3 h-3 text-purple-400" />
                      <span>{event.isAllDay ? 'All Day' : new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {event.location && <span className="text-slate-500">| {event.location}</span>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-500">
                  No Google Calendar events today.
                </div>
              )}
            </div>
          </div>

          {/* Daily Nutrition Macro Breakdown Card */}
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 glass-panel space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white tracking-wide">Macro Target</h3>
              </div>
              <span className="text-xs font-mono text-emerald-400">
                {consumedCalories} / {targetCalories} kcal
              </span>
            </div>

            {/* Protein, Carbs, Fat Bars */}
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Protein</span>
                  <span className="font-mono text-slate-200">{nutritionData?.summary?.consumedProtein || 0}g / {nutritionData?.summary?.targetProtein || 140}g</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-cyan-400 h-full rounded-full" 
                    style={{ width: `${Math.min(100, ((nutritionData?.summary?.consumedProtein || 0) / (nutritionData?.summary?.targetProtein || 140)) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Carbohydrates</span>
                  <span className="font-mono text-slate-200">{nutritionData?.summary?.consumedCarbs || 0}g / {nutritionData?.summary?.targetCarbs || 220}g</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-amber-400 h-full rounded-full" 
                    style={{ width: `${Math.min(100, ((nutritionData?.summary?.consumedCarbs || 0) / (nutritionData?.summary?.targetCarbs || 220)) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Fats</span>
                  <span className="font-mono text-slate-200">{nutritionData?.summary?.consumedFat || 0}g / {nutritionData?.summary?.targetFat || 65}g</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-rose-400 h-full rounded-full" 
                    style={{ width: `${Math.min(100, ((nutritionData?.summary?.consumedFat || 0) / (nutritionData?.summary?.targetFat || 65)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
