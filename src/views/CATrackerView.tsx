import React, { useState } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Video,
  FileSpreadsheet,
  RotateCw,
  Database,
  Settings,
  Cloud,
  Flame,
  Clock,
  BookOpen,
} from 'lucide-react';
import { useCATracker } from '@/context/CATrackerContext';
import { CADashboardTab } from './ca-tracker/CADashboardTab';
import { CAChecklistTab } from './ca-tracker/CAChecklistTab';
import { CAScheduleTab } from './ca-tracker/CAScheduleTab';
import { CALecturesTab } from './ca-tracker/CALecturesTab';
import { CATestsTab } from './ca-tracker/CATestsTab';
import { CARevisionsTab } from './ca-tracker/CARevisionsTab';
import { CADataHubTab } from './ca-tracker/CADataHubTab';
import { CASettingsTab } from './ca-tracker/CASettingsTab';

export type CATabId =
  | 'dashboard'
  | 'checklist'
  | 'schedule'
  | 'lectures'
  | 'tests'
  | 'revisions'
  | 'data-hub'
  | 'settings';

interface NavigationItem {
  id: CATabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

export const CATrackerView: React.FC = () => {
  const { metrics, settings, revisions, lectures, isCloudConnected } = useCATracker();
  const [activeTab, setActiveTab] = useState<CATabId>('dashboard');
  const [checklistFilter, setChecklistFilter] = useState<string | undefined>(undefined);

  // Derived counts for tab badges
  const dueRevisionsCount = revisions.filter(
    (r) => r.nextTargetDate === new Date().toISOString().split('T')[0]
  ).length;

  const unwatchedLecturesCount = lectures.filter((l) => !l.watched).length;

  const navItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Command Center',
      icon: LayoutDashboard,
    },
    {
      id: 'checklist',
      label: 'Syllabus Checklist',
      icon: CheckSquare,
      badge: `${metrics.completedTopics}/${metrics.totalTopics}`,
    },
    {
      id: 'schedule',
      label: 'Study Calendar',
      icon: Calendar,
    },
    {
      id: 'lectures',
      label: 'Video Lectures',
      icon: Video,
      badge: unwatchedLecturesCount > 0 ? unwatchedLecturesCount : undefined,
    },
    {
      id: 'tests',
      label: 'Mock Test Series',
      icon: FileSpreadsheet,
      badge: metrics.totalTestsLogged > 0 ? metrics.totalTestsLogged : undefined,
    },
    {
      id: 'revisions',
      label: 'Spaced Revisions',
      icon: RotateCw,
      badge: dueRevisionsCount > 0 ? dueRevisionsCount : undefined,
    },
    {
      id: 'data-hub',
      label: 'Data Hub',
      icon: Database,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  const handleNavigateTab = (tab: string, filter?: string) => {
    setActiveTab(tab as CATabId);
    if (tab === 'checklist' && filter) {
      setChecklistFilter(filter);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 select-none animate-in fade-in duration-200">
      {/* Top Banner & Quick Status Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                CA Foundation Command Center
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Official ICAI syllabus blueprint, 40% paper & 50% aggregate pass rules, spaced repetition & multi-device cloud sync.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Persistent KPI Strip */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          {/* Exam Countdown */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-800 dark:text-zinc-200">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            <span className="font-semibold tabular-nums">{metrics.daysUntilExam}</span>
            <span className="text-zinc-500">Days to Exam</span>
          </div>

          {/* Study Streak */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-amber-900 dark:text-amber-200">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-semibold tabular-nums">{metrics.currentStreakDays}</span>
            <span className="text-amber-700 dark:text-amber-300">Days Streak</span>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200">
            <span className="font-semibold tabular-nums">{metrics.overallProgressPercentage}%</span>
            <span className="text-emerald-700 dark:text-emerald-300">Complete</span>
          </div>

          {/* Cloud Sync Status */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-700 dark:text-zinc-300">
            <Cloud className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-medium text-[11px]">
              {isCloudConnected ? 'Cloud Synced' : 'Syncing...'}
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigateTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`ml-0.5 px-1.5 py-0.5 text-[10px] font-semibold rounded-md ${
                      isActive
                        ? 'bg-zinc-800 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-800'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Active Tab View Body */}
      <div className="pt-2">
        {activeTab === 'dashboard' && <CADashboardTab onNavigateTab={handleNavigateTab} />}
        {activeTab === 'checklist' && <CAChecklistTab initialSubjectId={checklistFilter} />}
        {activeTab === 'schedule' && <CAScheduleTab />}
        {activeTab === 'lectures' && <CALecturesTab />}
        {activeTab === 'tests' && <CATestsTab />}
        {activeTab === 'revisions' && <CARevisionsTab onNavigateTab={handleNavigateTab} />}
        {activeTab === 'data-hub' && <CADataHubTab />}
        {activeTab === 'settings' && <CASettingsTab />}
      </div>
    </div>
  );
};
