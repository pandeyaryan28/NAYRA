import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext.js';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  Activity,
  Timer, 
  Flame, 
  StickyNote, 
  Bot, 
  RefreshCw,
  GraduationCap,
  Cpu,
  Settings,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

interface NavGroupItem {
  to?: string;
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeHighlight?: boolean;
  onClick?: () => void;
}

interface NavGroup {
  name: string;
  items: NavGroupItem[];
}

export const Sidebar: React.FC = () => {
  const { 
    tasks, 
    calendarEvents, 
    notes, 
    habits, 
    nutritionData, 
    authStatus,
    isSyncing, 
    syncGoogleTasks,
    syncGoogleCalendar,
    connectGoogle,
    setIsSettingsOpen,
    isSidebarCollapsed,
    toggleSidebar,
    toggleAssistant
  } = useApp();

  const pendingTasksCount = tasks.filter(t => !t.archived && t.status !== 'completed').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayEventsCount = calendarEvents.filter(e => e.startTime.startsWith(todayStr)).length;
  const remainingCalories = nutritionData?.summary?.remainingCalories ?? 0;
  const uncompletedHabitsToday = habits.filter(h => !h.completedDates?.includes(todayStr)).length;

  const groups: NavGroup[] = [
    {
      name: 'Command',
      items: [
        { to: '/', id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { 
          id: 'assistant', 
          label: 'Assistant AI', 
          icon: Bot, 
          onClick: toggleAssistant,
          badge: '⌘J' 
        },
      ]
    },
    {
      name: 'Work & Planning',
      items: [
        { to: '/tasks', id: 'tasks', label: 'Tasks & Kanban', icon: CheckSquare, badge: pendingTasksCount > 0 ? pendingTasksCount : undefined },
        { to: '/calendar', id: 'calendar', label: 'Calendar Agenda', icon: CalendarIcon, badge: todayEventsCount > 0 ? todayEventsCount : undefined },
        { to: '/notes', id: 'notes', label: 'Keep Notes', icon: StickyNote, badge: notes.length > 0 ? notes.length : undefined },
      ]
    },
    {
      name: 'Performance & Health',
      items: [
        { to: '/focus', id: 'focus', label: 'Focus & Pomodoro', icon: Timer },
        { 
          to: '/habits', 
          id: 'habits', 
          label: 'Daily Habits', 
          icon: Activity, 
          badge: uncompletedHabitsToday > 0 ? `${uncompletedHabitsToday} due` : (habits.length > 0 ? '✓' : undefined),
          badgeHighlight: uncompletedHabitsToday === 0 && habits.length > 0
        },
        { 
          to: '/nutrition', 
          id: 'nutrition', 
          label: 'Nutrition & Macros', 
          icon: Flame, 
          badge: remainingCalories > 0 ? `${remainingCalories} kcal` : undefined 
        },
      ]
    },
    {
      name: 'Dedicated Intel',
      items: [
        { to: '/ca-tracker', id: 'ca-tracker', label: 'CA Tracker', icon: GraduationCap, badge: 'Live' },
        { to: '/chipchain', id: 'chipchain', label: 'ChipChain 360', icon: Cpu, badge: '34 Nodes' },
      ]
    }
  ];

  const handleSyncAll = async () => {
    await syncGoogleTasks();
    await syncGoogleCalendar();
  };

  return (
    <aside 
      className={`bg-slate-50 dark:bg-[#0c0c0e] border-r border-slate-200 dark:border-zinc-800 flex flex-col justify-between shrink-0 select-none z-20 transition-all duration-200 ease-in-out ${
        isSidebarCollapsed ? 'w-14' : 'w-60'
      }`}
    >
      {/* Top Header & Brand */}
      <div className="flex flex-col min-h-0">
        <div className={`py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center ${
          isSidebarCollapsed ? 'px-2.5 justify-center' : 'px-4 justify-between'
        }`}>
          <NavLink 
            to="/" 
            className="flex items-center gap-2.5 text-slate-900 dark:text-zinc-100 hover:opacity-90 transition-opacity"
            title="NAYRA Command Center"
          >
            <div className="w-6 h-6 rounded-md bg-slate-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-950 font-bold text-xs tracking-tighter shadow-2xs shrink-0">
              N
            </div>
            {!isSidebarCollapsed && (
              <span className="font-semibold text-xs tracking-tight">
                NAYRA
              </span>
            )}
          </NavLink>

          {!isSidebarCollapsed && (
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-200/60 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
              title="Collapse sidebar (Cmd+B)"
            >
              <PanelLeftClose className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Scrollable Navigation Groups */}
        <nav className="p-2 space-y-4 overflow-y-auto no-scrollbar flex-1">
          {groups.map(group => (
            <div key={group.name} className="space-y-1">
              {!isSidebarCollapsed && (
                <div className="px-2 pt-1 pb-0.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-medium">
                  {group.name}
                </div>
              )}

              {group.items.map(item => {
                const Icon = item.icon;
                
                // If item has no route, render button (e.g. Assistant AI drawer)
                if (!item.to) {
                  return (
                    <button
                      key={item.id}
                      onClick={item.onClick}
                      title={isSidebarCollapsed ? `${item.label} (${item.badge || ''})` : undefined}
                      className={`w-full flex items-center rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900/60 ${
                        isSidebarCollapsed ? 'p-2 justify-center' : 'px-2.5 py-1.5 justify-between'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 shrink-0 text-slate-400 dark:text-zinc-500" />
                        {!isSidebarCollapsed && <span>{item.label}</span>}
                      </div>
                      {!isSidebarCollapsed && item.badge !== undefined && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-200/70 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-medium">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                }

                return (
                  <NavLink
                    key={item.id}
                    to={item.to}
                    end={item.to === '/'}
                    title={isSidebarCollapsed ? item.label : undefined}
                    className={({ isActive }) => `w-full flex items-center rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                      isSidebarCollapsed ? 'p-2 justify-center' : 'px-2.5 py-1.5 justify-between'
                    } ${
                      isActive
                        ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white border border-slate-200/80 dark:border-zinc-700/50 shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900/60'
                    }`}
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-zinc-500'}`} />
                          {!isSidebarCollapsed && <span>{item.label}</span>}
                        </div>
                        {!isSidebarCollapsed && item.badge !== undefined && (
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                            item.badgeHighlight
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold'
                              : 'bg-slate-200/70 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Area: Sync, Settings & Rail Toggle */}
      <div className={`border-t border-slate-200 dark:border-zinc-800 space-y-1.5 ${
        isSidebarCollapsed ? 'p-2 flex flex-col items-center' : 'p-3'
      }`}>
        {/* Sync Google Button */}
        <button
          onClick={authStatus?.googleConnected ? handleSyncAll : connectGoogle}
          disabled={isSyncing}
          title={authStatus?.googleConnected ? 'Sync Google Tasks & Calendar' : 'Connect Google Account'}
          className={`rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 transition-colors cursor-pointer shadow-2xs ${
            isSidebarCollapsed 
              ? 'p-2 w-full flex items-center justify-center' 
              : 'w-full flex items-center justify-center gap-2 py-1.5 px-3'
          }`}
        >
          {authStatus?.googleConnected ? (
            <>
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-500 shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
              {!isSidebarCollapsed && <span>{isSyncing ? 'Syncing...' : 'Sync Cloud'}</span>}
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-xs bg-amber-400 shrink-0" />
              {!isSidebarCollapsed && <span>Connect Google</span>}
            </>
          )}
        </button>

        {/* Settings NavLink */}
        <NavLink
          to="/settings"
          title={isSidebarCollapsed ? "Appearance & Settings (Cmd+,)" : undefined}
          className={({ isActive }) => `rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
            isSidebarCollapsed 
              ? 'p-2 w-full flex items-center justify-center' 
              : 'w-full flex items-center justify-between py-1.5 px-3'
          } ${
            isActive
              ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white border border-slate-200/80 dark:border-zinc-700/50 shadow-2xs font-semibold'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900/60'
          }`}
        >
          {({ isActive }) => (
            <>
              <div className="flex items-center gap-2">
                <Settings className={`w-3.5 h-3.5 ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-zinc-500'}`} />
                {!isSidebarCollapsed && <span>Settings</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">⌘,</span>
              )}
            </>
          )}
        </NavLink>

        {/* Expand rail button when collapsed */}
        {isSidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            title="Expand sidebar (Cmd+B)"
            className="p-2 w-full flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <PanelLeftOpen className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Google Status Indicator */}
        {!isSidebarCollapsed && (
          <div className="flex items-center justify-between px-1 pt-1 text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-xs ${authStatus?.googleConnected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <span>{authStatus?.googleConnected ? 'Cloud Active' : 'Standalone'}</span>
            </span>
            <span>Cockpit</span>
          </div>
        )}
      </div>
    </aside>
  );
};
