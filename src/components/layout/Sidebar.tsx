import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Clock,
  Flame,
  UtensilsCrossed,
  BookOpen,
  Cpu,
  Activity,
  Bot,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFocus } from '@/context/FocusContext';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const { timerState, remainingSeconds } = useFocus();
  const navigate = useNavigate();
  const location = useLocation();

  const handleCreateTaskCTA = () => {
    if (location.pathname === '/tasks') {
      window.dispatchEvent(new CustomEvent('nayra-focus-task-input'));
    } else {
      navigate('/tasks?create=true');
    }
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/calendar', label: 'Calendar', icon: Calendar },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
    {
      to: '/focus',
      label: 'Focus Lab',
      icon: Clock,
      badge:
        timerState === 'running'
          ? `${Math.floor(remainingSeconds / 60)}m`
          : undefined,
    },
    { to: '/habits', label: 'Habits', icon: Flame },
    { to: '/calories', label: 'Nutrition', icon: UtensilsCrossed },
    { to: '/ca-tracker', label: 'CA Tracker', icon: BookOpen },
    { to: '/scint-engine', label: 'SCInt Engine', icon: Cpu },
    { to: '/analytics', label: 'Analytics', icon: Activity },
    { to: '/assistant', label: 'Assistant', icon: Bot },
  ];

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md transition-all duration-200 select-none z-30',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-zinc-200 dark:border-zinc-800">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold text-sm tracking-wider shadow-[0_2px_5px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.3)] dark:shadow-[0_2px_5px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.8)]">
              N
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-zinc-900 dark:text-zinc-100">
                NAYRA
              </span>
              <span className="text-[11px] text-zinc-400 block -mt-0.5 tracking-wider uppercase font-medium">
                Personal OS
              </span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto h-8 w-8 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold text-sm shadow-[0_2px_5px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.3)] dark:shadow-[0_2px_5px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.8)]">
            N
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Primary Action CTA (Google Tasks Style Prominent Create Button) */}
      <div className={collapsed ? 'p-2 flex justify-center' : 'px-3 pt-3 pb-1'}>
        {collapsed ? (
          <button
            type="button"
            onClick={handleCreateTaskCTA}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-[0.98] transition-all duration-150 cursor-pointer"
            title="Create New Task"
          >
            <Plus className="h-5 w-5 stroke-[2.5]" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCreateTaskCTA}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold text-sm shadow-[0_2px_8px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.2)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.8)] hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-[0.98] transition-all duration-150 cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5 stroke-[2.5]" />
            <span>New Task</span>
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-2 px-2.5 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-[0.98] min-h-[42px]',
                  isActive
                    ? 'bg-white dark:bg-zinc-800/90 text-zinc-950 dark:text-zinc-50 font-semibold border border-zinc-200/80 dark:border-zinc-700/60 shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06),inset_0_1px_0_0_rgba(255,255,255,0.9)] dark:shadow-[0_2px_6px_-1px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.08)]'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100/70 dark:hover:bg-zinc-900/60'
                )
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0 text-zinc-500 dark:text-zinc-400" />
              {!collapsed && (
                <span className="flex-1 truncate">{item.label}</span>
              )}
              {!collapsed && item.badge && (
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Settings Footer */}
      <div className="p-2.5 border-t border-zinc-200 dark:border-zinc-800">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 active:scale-[0.98] min-h-[42px]',
              isActive
                ? 'bg-white dark:bg-zinc-800/90 text-zinc-950 dark:text-zinc-50 font-semibold border border-zinc-200/80 dark:border-zinc-700/60 shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06),inset_0_1px_0_0_rgba(255,255,255,0.9)] dark:shadow-[0_2px_6px_-1px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.08)]'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100/70 dark:hover:bg-zinc-900/60'
            )
          }
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings className="h-5 w-5 shrink-0 text-zinc-500 dark:text-zinc-400" />
          {!collapsed && <span>Settings</span>}
        </NavLink>
      </div>
    </aside>
  );
};

