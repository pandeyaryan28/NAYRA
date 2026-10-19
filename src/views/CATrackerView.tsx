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
  HelpCircle,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useCATracker } from '@/context/CATrackerContext';
import { CADashboardTab } from './ca-tracker/CADashboardTab';
import { CAChecklistTab } from './ca-tracker/CAChecklistTab';
import { CAScheduleTab } from './ca-tracker/CAScheduleTab';
import { CALecturesTab } from './ca-tracker/CALecturesTab';
import { CATestsTab } from './ca-tracker/CATestsTab';
import { CARevisionsTab } from './ca-tracker/CARevisionsTab';
import { CAExercisesTab } from './ca-tracker/CAExercisesTab';
import { CADataHubTab } from './ca-tracker/CADataHubTab';
import { CASettingsTab } from './ca-tracker/CASettingsTab';

export type CAHubId = 'dashboard' | 'syllabus' | 'exercises' | 'schedule';

interface HubNavigationItem {
  id: CAHubId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

export const CATrackerView: React.FC = () => {
  const { metrics, settings, revisions, lectures, isCloudConnected } = useCATracker();

  // Primary 4-Hub active state
  const [activeHub, setActiveHub] = useState<CAHubId>('dashboard');

  // Sub-tab toggles within each hub
  const [syllabusSubTab, setSyllabusSubTab] = useState<'checklist' | 'lectures'>('checklist');
  const [exercisesSubTab, setExercisesSubTab] = useState<'exercises' | 'tests'>('exercises');
  const [scheduleSubTab, setScheduleSubTab] = useState<'calendar' | 'revisions'>('calendar');

  // Settings & Data Hub modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsModalTab, setSettingsModalTab] = useState<'settings' | 'data-hub'>('settings');

  const [checklistFilter, setChecklistFilter] = useState<string | undefined>(undefined);
  const [exerciseTarget, setExerciseTarget] = useState<{
    chapterNumber?: number;
    unitNumber?: number;
    subjectId?: string;
    timestamp?: number;
  } | undefined>(undefined);

  // Derived counts for hub badges
  const dueRevisionsCount = revisions.filter(
    (r) => r.nextTargetDate === new Date().toISOString().split('T')[0]
  ).length;

  const unwatchedLecturesCount = lectures.filter((l) => !l.watched).length;

  const hubItems: HubNavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Command Center',
      icon: LayoutDashboard,
    },
    {
      id: 'syllabus',
      label: 'Syllabus & Lectures',
      icon: BookOpen,
      badge: `${metrics.completedTopics}/${metrics.totalTopics}`,
    },
    {
      id: 'exercises',
      label: 'Exercises & Tests',
      icon: HelpCircle,
      badge: '2,547 Qs',
    },
    {
      id: 'schedule',
      label: 'Schedule & Revisions',
      icon: Calendar,
      badge: dueRevisionsCount > 0 ? `${dueRevisionsCount} due` : undefined,
    },
  ];

  // Inter-tab programmatic navigation handler with backward compatibility
  const handleNavigateTab = (tab: string, filter?: string) => {
    switch (tab) {
      case 'dashboard':
        setActiveHub('dashboard');
        break;
      case 'checklist':
        setActiveHub('syllabus');
        setSyllabusSubTab('checklist');
        if (filter) setChecklistFilter(filter);
        break;
      case 'lectures':
        setActiveHub('syllabus');
        setSyllabusSubTab('lectures');
        break;
      case 'exercises':
        setActiveHub('exercises');
        setExercisesSubTab('exercises');
        break;
      case 'tests':
        setActiveHub('exercises');
        setExercisesSubTab('tests');
        break;
      case 'schedule':
        setActiveHub('schedule');
        setScheduleSubTab('calendar');
        break;
      case 'revisions':
        setActiveHub('schedule');
        setScheduleSubTab('revisions');
        break;
      case 'settings':
        setSettingsModalTab('settings');
        setIsSettingsOpen(true);
        break;
      case 'data-hub':
        setSettingsModalTab('data-hub');
        setIsSettingsOpen(true);
        break;
      default:
        setActiveHub('dashboard');
    }
  };

  const handleNavigateToExercise = (chapterNum?: number, unitNum?: number, subjectId?: string) => {
    if (chapterNum) {
      setExerciseTarget({
        chapterNumber: chapterNum,
        unitNumber: unitNum,
        subjectId: subjectId,
        timestamp: Date.now(),
      });
    } else {
      setExerciseTarget(subjectId ? { subjectId, timestamp: Date.now() } : undefined);
    }
    setActiveHub('exercises');
    setExercisesSubTab('exercises');
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 select-none animate-in fade-in duration-200">
      {/* Top Banner & Quick Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center shadow-sm shrink-0">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              CA Foundation Command Center
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Official ICAI syllabus blueprint, 40% paper & 50% aggregate pass rules, spaced repetition & multi-device sync.
            </p>
          </div>
        </div>

        {/* Quick Persistent KPI Strip & Settings Trigger (Apple Dynamic Island Style) */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2 text-xs">
          {/* Exam Countdown */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-500/10 border border-black/5 dark:border-white/10 text-zinc-800 dark:text-zinc-200 shadow-xs swiftui-press">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            <span className="font-semibold tabular-nums">{metrics.daysUntilExam}</span>
            <span className="text-zinc-500">Days to Exam</span>
          </div>

          {/* Study Streak */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 shadow-xs swiftui-press">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-semibold tabular-nums">{metrics.currentStreakDays}</span>
            <span className="text-amber-700 dark:text-amber-300">Days Streak</span>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200 shadow-xs swiftui-press">
            <span className="font-semibold tabular-nums">{metrics.overallProgressPercentage}%</span>
            <span className="text-emerald-700 dark:text-emerald-300">Complete</span>
          </div>

          {/* Cloud Sync Status */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-500/10 border border-black/5 dark:border-white/10 text-zinc-700 dark:text-zinc-300 shadow-xs swiftui-press">
            <Cloud className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-medium text-[11px]">
              {isCloudConnected ? 'Cloud Synced' : 'Syncing...'}
            </span>
          </div>

          {/* Dedicated Settings & Backup Action Button */}
          <button
            type="button"
            onClick={() => {
              setSettingsModalTab('settings');
              setIsSettingsOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white dark:hover:bg-zinc-700 transition-all shadow-xs swiftui-press"
            title="Open Exam Target Date, Intervals, and Data Backup"
          >
            <Settings className="w-3.5 h-3.5 text-zinc-500" />
            <span className="font-medium text-xs">Settings & Backup</span>
          </button>
        </div>
      </div>

      {/* Streamlined 4-Hub Navigation Bar (Apple Sliding Pill) */}
      <div className="p-1 rounded-2xl bg-zinc-200/60 dark:bg-zinc-800/60 backdrop-blur-2xl border border-black/[0.04] dark:border-white/10 shadow-inner">
        <nav className="flex space-x-1 sm:space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
          {hubItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeHub === item.id;

            return (
              <button
                key={item.id}
                type="button"
                data-testid={`ca-nav-tab-${item.id}`}
                aria-label={item.badge !== undefined ? `${item.label} (${item.badge})` : item.label}
                onClick={() => setActiveHub(item.id)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] swiftui-press ${
                  isActive
                    ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-zinc-50 shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`ml-0.5 px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                      isActive
                        ? 'bg-zinc-200/80 text-zinc-900 dark:bg-zinc-600 dark:text-zinc-100'
                        : 'bg-zinc-300/50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
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

      {/* Active Hub View Body */}
      <div className="pt-1">
        {/* Hub 1: Dashboard / Command Center */}
        {activeHub === 'dashboard' && (
          <CADashboardTab
            onNavigateTab={handleNavigateTab}
            onNavigateToExercise={handleNavigateToExercise}
          />
        )}

        {/* Hub 2: Syllabus & Curriculum (Checklist + Lectures) */}
        {activeHub === 'syllabus' && (
          <div className="space-y-4">
            {/* Contextual Sub-Tab Toggle */}
            <div className="flex items-center justify-start pb-1">
              <div className="inline-flex p-1 rounded-full bg-zinc-500/10 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-xs">
                <button
                  type="button"
                  onClick={() => setSyllabusSubTab('checklist')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] swiftui-press ${
                    syllabusSubTab === 'checklist'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Checklist & Chapters</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSyllabusSubTab('lectures')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] swiftui-press ${
                    syllabusSubTab === 'lectures'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Curriculum Lectures</span>
                  {unwatchedLecturesCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 text-[9px] bg-red-500/10 text-red-600 dark:text-red-400 rounded-full font-medium">
                      {unwatchedLecturesCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {syllabusSubTab === 'checklist' ? (
              <CAChecklistTab
                initialSubjectId={checklistFilter}
                onNavigateToExercise={handleNavigateToExercise}
              />
            ) : (
              <CALecturesTab />
            )}
          </div>
        )}

        {/* Hub 3: Exercises & Tests (Digital MCQs + Mock Tests) */}
        {activeHub === 'exercises' && (
          <div className="space-y-4">
            {/* Contextual Sub-Tab Toggle */}
            <div className="flex items-center justify-start pb-1">
              <div className="inline-flex p-1 rounded-full bg-zinc-500/10 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-xs">
                <button
                  type="button"
                  onClick={() => setExercisesSubTab('exercises')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] swiftui-press ${
                    exercisesSubTab === 'exercises'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Digital Exercises (2,547 Qs)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setExercisesSubTab('tests')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] swiftui-press ${
                    exercisesSubTab === 'tests'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Mock Test Series & Trajectory</span>
                  {metrics.totalTestsLogged > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 text-[9px] bg-zinc-200 dark:bg-zinc-700 rounded-full font-medium">
                      {metrics.totalTestsLogged}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {exercisesSubTab === 'exercises' ? (
              <CAExercisesTab
                initialSubjectId={exerciseTarget?.subjectId}
                initialChapterNumber={exerciseTarget?.chapterNumber}
                initialUnitNumber={exerciseTarget?.unitNumber}
                navTimestamp={exerciseTarget?.timestamp}
                onClearNavigationTarget={() => setExerciseTarget(undefined)}
              />
            ) : (
              <CATestsTab />
            )}
          </div>
        )}

        {/* Hub 4: Schedule & Revisions (Calendar + Spaced Repetition R1-R4) */}
        {activeHub === 'schedule' && (
          <div className="space-y-4">
            {/* Contextual Sub-Tab Toggle */}
            <div className="flex items-center justify-start pb-1">
              <div className="inline-flex p-1 rounded-full bg-zinc-500/10 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-xs">
                <button
                  type="button"
                  onClick={() => setScheduleSubTab('calendar')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] swiftui-press ${
                    scheduleSubTab === 'calendar'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Study Calendar & Agenda</span>
                </button>

                <button
                  type="button"
                  onClick={() => setScheduleSubTab('revisions')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] swiftui-press ${
                    scheduleSubTab === 'revisions'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Spaced Repetition (R1–R4)</span>
                  {dueRevisionsCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 text-[9px] bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-full font-medium">
                      {dueRevisionsCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {scheduleSubTab === 'calendar' ? (
              <CAScheduleTab />
            ) : (
              <CARevisionsTab onNavigateTab={handleNavigateTab} />
            )}
          </div>
        )}
      </div>

      {/* Settings & Data Hub Slide-Over Modal / Sheet */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Sheet Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    CA Tracker Administration & Backup
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Exam target date, spaced repetition multipliers, cloud sync, and JSON/CSV backup.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="inline-flex p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs">
                  <button
                    type="button"
                    onClick={() => setSettingsModalTab('settings')}
                    className={`px-3 py-1 rounded-md font-semibold transition-all ${
                      settingsModalTab === 'settings'
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    Preferences
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettingsModalTab('data-hub')}
                    className={`px-3 py-1 rounded-md font-semibold transition-all ${
                      settingsModalTab === 'data-hub'
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    Data Hub & Backup
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  aria-label="Close settings"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sheet Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              {settingsModalTab === 'settings' ? <CASettingsTab /> : <CADataHubTab />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
