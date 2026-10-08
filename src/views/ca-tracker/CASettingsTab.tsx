import React, { useState } from 'react';
import {
  Cloud,
  RefreshCw,
  CheckCircle2,
  Laptop,
  Smartphone,
  BookOpen,
  ExternalLink,
  Calendar,
  Clock,
  Trophy,
  Bell,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useCATracker } from '@/context/CATrackerContext';
import { Card } from './components/Card';
import { Button } from './components/Button';

export const CASettingsTab: React.FC = () => {
  const {
    settings,
    updateSettings,
    isSyncing,
    isCloudConnected,
    lastSyncedAt,
    syncWithCloud,
  } = useCATracker();

  const [syncSuccess, setSyncSuccess] = useState(false);

  const handleManualSync = async () => {
    if (syncWithCloud) {
      await syncWithCloud();
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
          <span>App Preferences & Settings</span>
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Configure exam date, real-time cloud synchronization, daily targets, and syllabus blueprint options.
        </p>
      </div>

      {/* Cloud Backend Synchronization Card */}
      <Card className="p-5 space-y-4 border-emerald-500/30 dark:border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/10">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Multi-Device Cloud Sync
              </h3>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Your syllabus progress, test marks, and spaced revisions are synchronized in real-time across both NAYRA and the standalone CA-Tracker website.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 select-none self-start shrink-0">
            <span className="w-1.5 h-1.5 rounded-sm bg-emerald-600 dark:bg-emerald-400" />
            {isCloudConnected ? 'Connected & Active' : 'Connecting...'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
          <div className="flex items-center gap-2.5 p-3 rounded-md bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/60 dark:border-zinc-800">
            <Laptop className="w-4 h-4 text-zinc-500" />
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">Project Backend</p>
              <p className="text-[11px] text-zinc-500 font-mono">nayra-platform-2026</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-md bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/60 dark:border-zinc-800">
            <Smartphone className="w-4 h-4 text-zinc-500" />
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">Last Synchronized</p>
              <p className="text-[11px] text-zinc-500">
                {lastSyncedAt
                  ? new Date(lastSyncedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })
                  : 'Real-time active'}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-[11px] text-zinc-500">
            Changes auto-save immediately to Cloud Firestore. You can also force a full re-sync anytime.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="gap-1.5 text-xs font-semibold w-full sm:w-auto shrink-0"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Syncing...</span>
              </>
            ) : syncSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Synced!</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Force Cloud Re-sync</span>
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Target Date & Goals */}
      <Card className="p-5 space-y-6">
        {/* Exam Target Date */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="settings-exam-date"
              className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4 text-zinc-500" />
              <span>CA Foundation Exam Target Date</span>
            </label>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
              <Cloud className="w-3 h-3" /> Cloud Synced
            </span>
          </div>
          <input
            id="settings-exam-date"
            type="date"
            value={settings.examDate}
            onChange={(e) => {
              if (e.target.value && e.target.value.trim()) {
                updateSettings({ examDate: e.target.value.trim() });
              }
            }}
            className="p-2.5 text-xs rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
          />
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Used to calculate the live exam countdown and daily study pace requirements. Automatically saved and synchronized to Cloud Firestore.
          </p>
        </div>

        <div className="border-t border-zinc-200 dark:border-zinc-800" />

        {/* Daily Study Goal */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-zinc-500" />
            <span>Daily Study Goal (Hours)</span>
          </label>
          <input
            type="number"
            min="1"
            max="16"
            step="0.5"
            value={settings.dailyGoalHours}
            onChange={(e) => updateSettings({ dailyGoalHours: parseFloat(e.target.value) || 6 })}
            className="w-32 p-2.5 text-xs rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
          />
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Target daily study duration utilized for pacing metrics and radial gauge progress.
          </p>
        </div>

        <div className="border-t border-zinc-200 dark:border-zinc-800" />

        {/* Celebration & Micro-interactions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Celebration Confetti
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.confettiEnabled}
              onChange={(e) => updateSettings({ confettiEnabled: e.target.checked })}
              className="w-4 h-4 rounded accent-zinc-900 dark:accent-zinc-100"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-zinc-500" />
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Micro-interaction Audio
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
              className="w-4 h-4 rounded accent-zinc-900 dark:accent-zinc-100"
            />
          </div>
        </div>
      </Card>

      {/* Official ICAI Study Material Portal Card */}
      <Card className="p-5 space-y-4 border-blue-500/30 dark:border-blue-500/20 bg-blue-50/30 dark:bg-blue-950/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Official ICAI BoS Knowledge Portal (New Scheme)
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                All 46 chapters & 99 units/chapters are aligned with official PDF study materials and blueprints.
              </p>
            </div>
          </div>
          <a
            href="https://www.icai.org/post/foundation-nset"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shrink-0"
          >
            <span>Visit ICAI Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </Card>
    </div>
  );
};
