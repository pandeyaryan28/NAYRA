import React from 'react';
import { useApp, TabType } from '../../context/AppContext.js';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  Timer, 
  Flame, 
  StickyNote, 
  Bot, 
  RefreshCw, 
  Sparkles,
  Zap,
  Activity
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, tasks, calendarEvents, notes, nutritionData, isSyncing, syncGoogleTasks } = useApp();

  const pendingTasksCount = tasks.filter(t => t.status !== 'completed').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayEventsCount = calendarEvents.filter(e => e.startTime.startsWith(todayStr)).length;
  const remainingCalories = nutritionData?.summary?.remainingCalories ?? 0;

  const navItems: { id: TabType; label: string; icon: any; badge?: string | number; badgeColor?: string }[] = [
    { id: 'overview', label: 'Overview HUD', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks & Projects', icon: CheckSquare, badge: pendingTasksCount, badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' },
    { id: 'calendar', label: 'Calendar Schedule', icon: CalendarIcon, badge: todayEventsCount > 0 ? todayEventsCount : undefined, badgeColor: 'bg-purple-500/20 text-purple-300 border border-purple-500/30' },
    { id: 'pomodoro', label: 'Pomodoro Focus', icon: Timer },
    { id: 'nutrition', label: 'Nutrition & Calories', icon: Flame, badge: remainingCalories > 0 ? `${remainingCalories} kcal` : undefined, badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' },
    { id: 'keep', label: 'Keep Notes & Memos', icon: StickyNote, badge: notes.length > 0 ? notes.length : undefined, badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' },
    { id: 'assistant', label: 'Nayra Intelligence', icon: Bot, badge: 'AI', badgeColor: 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-sm' },
  ];

  return (
    <aside className="w-64 bg-[#0c121e]/90 border-r border-slate-800/80 flex flex-col justify-between shrink-0 select-none z-20">
      {/* Brand & AI Core Status */}
      <div>
        <div className="p-5 flex items-center gap-3 border-b border-slate-800/60">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-sky-600 to-purple-600 shadow-lg glow-cyan">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-lg tracking-wider text-white bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                NYRA
              </h1>
              <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/50 font-mono">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400">Personal Command Center</p>
          </div>
        </div>

        {/* Quick System Metric Pill */}
        <div className="px-4 py-3 mx-3 my-3 rounded-lg bg-slate-900/60 border border-slate-800/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Core Status:</span>
          </div>
          <span className="text-emerald-400 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active
          </span>
        </div>

        {/* Navigation List */}
        <nav className="px-3 space-y-1 mt-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-900/40 to-purple-900/30 text-white border border-cyan-500/40 shadow-sm glow-cyan'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Quick Actions & Sync */}
      <div className="p-4 border-t border-slate-800/60 space-y-2">
        <button
          onClick={syncGoogleTasks}
          disabled={isSyncing}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 hover:border-cyan-500/40 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing Ecosystem...' : '2-Way Google Sync'}</span>
        </button>

        <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500 font-mono">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" /> Firebase Connected
          </span>
          <span className="text-cyan-400/80 font-mono">nayra-ap28</span>
        </div>
      </div>
    </aside>
  );
};
