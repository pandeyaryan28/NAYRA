import React, { useState } from 'react';
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
  X,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFocus } from '@/context/FocusContext';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItemDef {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  shortcut?: string;
  accentColor: string;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const { timerState, remainingSeconds } = useFocus();
  const navigate = useNavigate();
  const location = useLocation();
  const [trafficHover, setTrafficHover] = useState(false);

  const handleCreateTaskCTA = () => {
    if (location.pathname === '/tasks') {
      window.dispatchEvent(new CustomEvent('nayra-focus-task-input'));
    } else {
      navigate('/tasks?create=true');
    }
  };

  const navGroups: { group: string; items: NavItemDef[] }[] = [
    {
      group: 'Favorites',
      items: [
        { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true, shortcut: '⌘1', accentColor: 'bg-blue-500' },
        { to: '/calendar', label: 'Calendar', icon: Calendar, shortcut: '⌘2', accentColor: 'bg-red-500' },
        { to: '/tasks', label: 'Tasks', icon: CheckSquare, shortcut: '⌘3', accentColor: 'bg-amber-500' },
      ],
    },
    {
      group: 'Health & Focus',
      items: [
        {
          to: '/focus',
          label: 'Focus Lab',
          icon: Clock,
          shortcut: '⌘4',
          accentColor: 'bg-indigo-500',
          badge:
            timerState === 'running'
              ? `${Math.floor(remainingSeconds / 60)}m`
              : undefined,
        },
        { to: '/habits', label: 'Habits', icon: Flame, shortcut: '⌘5', accentColor: 'bg-orange-500' },
        { to: '/calories', label: 'Nutrition', icon: UtensilsCrossed, shortcut: '⌘6', accentColor: 'bg-emerald-500' },
      ],
    },
    {
      group: 'Academics',
      items: [
        { to: '/ca-tracker', label: 'CA Tracker', icon: BookOpen, shortcut: '⌘7', accentColor: 'bg-sky-500' },
        { to: '/scint-engine', label: 'SCInt Engine', icon: Cpu, shortcut: '⌘8', accentColor: 'bg-purple-500' },
      ],
    },
    {
      group: 'System',
      items: [
        { to: '/analytics', label: 'Analytics', icon: Activity, shortcut: '⌘9', accentColor: 'bg-teal-500' },
        { to: '/assistant', label: 'Assistant', icon: Bot, accentColor: 'bg-pink-500' },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-black/[0.06] dark:border-white/[0.08] bg-white/75 dark:bg-[#161619]/80 backdrop-blur-3xl transition-all duration-200 select-none z-30 shadow-[1px_0_24px_rgba(0,0,0,0.03),inset_-1px_0_0_rgba(255,255,255,0.6)] dark:shadow-[1px_0_28px_rgba(0,0,0,0.45),inset_-1px_0_0_rgba(255,255,255,0.06)]',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* macOS Traffic Lights & Window Controls Header */}
      <div className="flex items-center justify-between h-12 px-4 border-b border-black/[0.05] dark:border-white/[0.06]">
        {/* macOS Traffic Lights */}
        <div
          className="flex items-center gap-2 group cursor-pointer"
          onMouseEnter={() => setTrafficHover(true)}
          onMouseLeave={() => setTrafficHover(false)}
          aria-label="macOS window controls"
        >
          <button
            type="button"
            onClick={() => navigate('/')}
            className="h-3 w-3 rounded-[999px] bg-[#ff5f56] border border-[#e0443e] flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer"
            title="Close / Home"
            aria-label="Close / Home"
          >
            {trafficHover && <X className="h-2 w-2 text-[#4d0000] stroke-[2.5]" />}
          </button>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="h-3 w-3 rounded-[999px] bg-[#ffbd2e] border border-[#dea123] flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer"
            title="Minimize sidebar"
            aria-label="Minimize sidebar"
          >
            {trafficHover && <Minus className="h-2 w-2 text-[#5a3a00] stroke-[2.5]" />}
          </button>
          <button
            type="button"
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen?.().catch(() => {});
              } else {
                document.exitFullscreen?.().catch(() => {});
              }
            }}
            className="h-3 w-3 rounded-[999px] bg-[#27c93f] border border-[#1aab29] flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer"
            title="Toggle Fullscreen"
            aria-label="Toggle Fullscreen"
          >
            {trafficHover && <Plus className="h-2 w-2 text-[#004d0f] stroke-[2.5]" />}
          </button>
        </div>

        {/* Sidebar Collapse Toggle Button */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer swiftui-press"
          title={collapsed ? 'Expand sidebar (⌘B)' : 'Collapse sidebar (⌘B)'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Brand Header */}
      <div className="px-4 py-2.5 flex items-center gap-2.5 border-b border-black/[0.04] dark:border-white/[0.04]">
        <div className="h-7 w-7 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold text-xs tracking-wider shadow-[0_2px_5px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.3)] dark:shadow-[0_2px_5px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.85)] shrink-0">
          N
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100 block truncate">
              NAYRA
            </span>
            <span className="text-[10px] text-zinc-400 block -mt-0.5 tracking-wider uppercase font-medium truncate">
              Personal OS
            </span>
          </div>
        )}
      </div>

      {/* Primary Action CTA (Apple Reminders / Google Tasks Prominent Create Button) */}
      <div className={collapsed ? 'p-2 flex justify-center' : 'px-3 pt-3 pb-2'}>
        {collapsed ? (
          <button
            type="button"
            onClick={handleCreateTaskCTA}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-[0.97] transition-all duration-150 cursor-pointer swiftui-press"
            title="Create New Task"
            aria-label="Create New Task"
          >
            <Plus className="h-4.5 w-4.5 stroke-[2.5]" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCreateTaskCTA}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold text-xs shadow-[0_4px_14px_-2px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.25)] dark:shadow-[0_4px_14px_-2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.9)] hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-[0.97] transition-all duration-150 cursor-pointer swiftui-press"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>New Task</span>
          </button>
        )}
      </div>

      {/* Navigation Groups (macOS Sidebar Sections) */}
      <nav className="flex-1 py-1 px-2 space-y-3 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.group} className="space-y-0.5">
            {!collapsed && (
              <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {group.group}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-[0.98] min-h-[34px] swiftui-tile group',
                      isActive
                        ? 'liquid-glass-segment-active text-zinc-950 dark:text-zinc-50 font-semibold shadow-[0_2px_8px_-1px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-black/[0.04] dark:hover:bg-white/[0.05]'
                    )
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <div
                    className={cn(
                      'h-5 w-5 rounded-md flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-105',
                      item.accentColor,
                      'text-white shadow-[0_1px_2px_rgba(0,0,0,0.15)]'
                    )}
                  >
                    <Icon className="h-3 w-3 stroke-[2.2]" />
                  </div>

                  {!collapsed && (
                    <span className="flex-1 truncate tracking-tight">{item.label}</span>
                  )}

                  {!collapsed && item.badge && (
                    <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      {item.badge}
                    </span>
                  )}

                  {!collapsed && item.shortcut && !item.badge && (
                    <span className="text-[10px] text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                      {item.shortcut}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Settings Footer */}
      <div className="p-2 border-t border-black/[0.05] dark:border-white/[0.06]">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 active:scale-[0.98] min-h-[34px] swiftui-tile group',
              isActive
                ? 'liquid-glass-segment-active text-zinc-950 dark:text-zinc-50 font-semibold shadow-[0_2px_8px_-1px_rgba(0,0,0,0.08)]'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-black/[0.04] dark:hover:bg-white/[0.05]'
            )
          }
          title={collapsed ? 'Settings' : undefined}
        >
          <div className="h-5 w-5 rounded-md bg-zinc-500 text-white flex items-center justify-center shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.15)] group-hover:scale-105 transition-transform">
            <Settings className="h-3 w-3 stroke-[2.2]" />
          </div>
          {!collapsed && <span className="tracking-tight">Settings</span>}
          {!collapsed && (
            <span className="ml-auto text-[10px] font-mono font-medium text-zinc-400 dark:text-zinc-500">
              v2.8.0
            </span>
          )}
        </NavLink>
      </div>
    </aside>
  );
};
