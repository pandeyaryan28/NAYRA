import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  CheckSquare, 
  Film, 
  FileSpreadsheet, 
  RotateCw, 
  FolderSync, 
  Settings, 
  Flame, 
  Clock, 
  RefreshCw
} from 'lucide-react';
import { CaDataProvider, useData } from './context/CaDataContext';
import { CaThemeProvider } from './context/CaThemeContext';
import { NavigationTab } from './types';
import { DashboardView } from './components/dashboard/DashboardView';
import { ScheduleView } from './components/schedule/ScheduleView';
import { ChecklistView } from './components/checklist/ChecklistView';
import { LecturesView } from './components/lectures/LecturesView';
import { TestsView } from './components/tests/TestsView';
import { RevisionsView } from './components/revision/RevisionsView';
import { IngestionView } from './components/ingestion/IngestionView';
import { SettingsView } from './components/settings/SettingsView';
import { cn } from './lib/utils';

const SUB_NAV_ITEMS: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'checklist', label: 'Checklist', icon: CheckSquare },
  { id: 'lectures', label: 'Lectures', icon: Film },
  { id: 'tests', label: 'Test Series', icon: FileSpreadsheet },
  { id: 'revisions', label: 'Revisions', icon: RotateCw },
  { id: 'ingestion', label: 'Ingestion Hub', icon: FolderSync },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const CaTrackerContent: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<NavigationTab>('dashboard');
  const { metrics, isSyncing, isCloudConnected, syncWithCloud } = useData();

  const renderActiveView = () => {
    switch (activeSubTab) {
      case 'dashboard':
        return <DashboardView onNavigate={setActiveSubTab} />;
      case 'schedule':
        return <ScheduleView />;
      case 'checklist':
        return <ChecklistView />;
      case 'lectures':
        return <LecturesView />;
      case 'tests':
        return <TestsView />;
      case 'revisions':
        return <RevisionsView />;
      case 'ingestion':
        return <IngestionView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onNavigate={setActiveSubTab} />;
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Top Secondary Navigation Header */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800/80 px-4 sm:px-6 py-2.5 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Sub-tab Pill Navigation */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            <div className="flex items-center gap-1.5 mr-2 pr-2 border-r border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-900 dark:text-zinc-100 shrink-0">
              <div className="w-5 h-5 rounded-md bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center text-white text-[10px] font-bold shadow-xs">
                CA
              </div>
              <span className="hidden sm:inline">Tracker</span>
            </div>

            {SUB_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeSubTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSubTab(item.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 shrink-0 cursor-pointer',
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800/60'
                  )}
                >
                  <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-white dark:text-zinc-900' : 'text-slate-400 dark:text-zinc-500')} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Metrics & Cloud Status */}
          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            {/* Cloud Sync Status Pill */}
            <div
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium select-none transition-colors',
                isSyncing
                  ? 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'
                  : isCloudConnected
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400'
              )}
              title={
                isSyncing
                  ? 'Syncing changes with ca-tracker-ap28-2026...'
                  : isCloudConnected
                  ? 'Connected live with ca-tracker-ap28-2026 cloud database'
                  : 'Operating in local offline cache'
              }
            >
              {isSyncing ? (
                <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />
              ) : (
                <span className={cn('w-1.5 h-1.5 rounded-full', isCloudConnected ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400')} />
              )}
              <span className="text-[11px] font-mono">
                {isSyncing ? 'Syncing...' : isCloudConnected ? 'Cloud Synced' : 'Local'}
              </span>
            </div>

            {/* Streak Pill */}
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-semibold tabular-nums select-none"
              title={`Study Streak: ${metrics.currentStreakDays} days (Best: ${metrics.bestStreakDays})`}
            >
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500/20" />
              <span>{metrics.currentStreakDays}d</span>
            </div>

            {/* Exam Countdown Pill */}
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-medium tabular-nums select-none"
              title={`Exam date countdown`}
            >
              <Clock className="w-3 h-3 text-slate-500 dark:text-zinc-400" />
              <span className="font-semibold text-slate-900 dark:text-zinc-100 text-[11px]">
                {metrics.daysUntilExam > 0 ? `${metrics.daysUntilExam}d left` : 'Exam Today!'}
              </span>
            </div>

            {/* Manual Sync Trigger */}
            <button
              onClick={() => syncWithCloud?.()}
              disabled={isSyncing}
              title="Force Sync with Firebase Cloud"
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', isSyncing ? 'animate-spin text-emerald-500' : '')} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Sub-view Content Body */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-16 animate-fade-in">
        {renderActiveView()}
      </div>
    </div>
  );
};

export const CaTrackerView: React.FC = () => {
  return (
    <CaThemeProvider>
      <CaDataProvider>
        <CaTrackerContent />
      </CaDataProvider>
    </CaThemeProvider>
  );
};

export default CaTrackerView;
