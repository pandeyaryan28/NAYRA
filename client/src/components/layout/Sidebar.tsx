import React from 'react';
import { useApp } from '../../context/AppContext.js';
import type { TabType } from '../../context/AppContext.js';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  Timer, 
  Flame, 
  StickyNote, 
  Bot, 
  RefreshCw
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, tasks, calendarEvents, notes, nutritionData, isSyncing, syncGoogleTasks } = useApp();

  const pendingTasksCount = tasks.filter(t => t.status !== 'completed').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayEventsCount = calendarEvents.filter(e => e.startTime.startsWith(todayStr)).length;
  const remainingCalories = nutritionData?.summary?.remainingCalories ?? 0;

  const navItems: { id: TabType; label: string; icon: any; badge?: string | number }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: pendingTasksCount > 0 ? pendingTasksCount : undefined },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon, badge: todayEventsCount > 0 ? todayEventsCount : undefined },
    { id: 'pomodoro', label: 'Focus & Pomodoro', icon: Timer },
    { id: 'nutrition', label: 'Nutrition & Calories', icon: Flame, badge: remainingCalories > 0 ? `${remainingCalories} kcal` : undefined },
    { id: 'keep', label: 'Notes', icon: StickyNote, badge: notes.length > 0 ? notes.length : undefined },
    { id: 'assistant', label: 'Assistant AI', icon: Bot },
  ];

  return (
    <aside className="w-60 bg-slate-50 dark:bg-[#0c0c0e] border-r border-slate-200 dark:border-zinc-800 flex flex-col justify-between shrink-0 select-none z-20 transition-colors duration-150">
      {/* Brand Header */}
      <div>
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-slate-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-950 font-bold text-xs tracking-tighter shadow-2xs">
              N
            </div>
            <span className="font-semibold text-sm tracking-tight text-slate-900 dark:text-zinc-100">
              NAYRA
            </span>
          </div>
          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
            v1.0
          </span>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white border border-slate-200/80 dark:border-zinc-700/50 shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-zinc-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Sync Button */}
      <div className="p-3 border-t border-slate-200 dark:border-zinc-800 space-y-2">
        <button
          onClick={syncGoogleTasks}
          disabled={isSyncing}
          className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 transition-colors cursor-pointer shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : '2-Way Google Sync'}</span>
        </button>

        <div className="flex items-center justify-between px-1 text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Cloud Synced
          </span>
          <span>nayra-ap28</span>
        </div>
      </div>
    </aside>
  );
};
