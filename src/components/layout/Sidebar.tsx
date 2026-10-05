import React from 'react';
import { NavLink } from 'react-router-dom';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFocus } from '@/context/FocusContext';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const { timerState, remainingSeconds } = useFocus();

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
      <div className="flex items-center justify-between h-14 px-4 border-b border-zinc-200 dark:border-zinc-800">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold text-xs tracking-wider">
              N
            </div>
            <div>
              <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
                NAYRA
              </span>
              <span className="text-[10px] text-zinc-400 block -mt-0.5 tracking-wider uppercase">
                Personal OS
              </span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto h-7 w-7 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold text-xs">
            N
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-50 font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                )
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0 text-zinc-500 dark:text-zinc-400" />
              {!collapsed && (
                <span className="flex-1 truncate">{item.label}</span>
              )}
              {!collapsed && item.badge && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Settings Footer */}
      <div className="p-2 border-t border-zinc-200 dark:border-zinc-800">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors',
              isActive
                ? 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-50 font-semibold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900'
            )
          }
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings className="h-4 w-4 shrink-0 text-zinc-500 dark:text-zinc-400" />
          {!collapsed && <span>Settings</span>}
        </NavLink>
      </div>
    </aside>
  );
};
