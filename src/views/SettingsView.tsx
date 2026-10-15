import React, { useState, useEffect } from 'react';
import {
  Settings,
  Clock,
  UtensilsCrossed,
  Download,
  CheckCircle2,
  ShieldCheck,
  Bell,
  Trash2,
  AlertCircle,
  RefreshCw,
  KeyRound,
  Check,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {
  linkGoogleOfflineAccess,
  setGoogleOAuthCredentialsOnCloud,
  getGoogleOAuthStatusFromCloud,
} from '@/lib/cloudSync';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import {
  HStack,
  VStack,
  Spacer,
  Divider,
} from '@/components/swiftui/SwiftUIStack';
import { SwiftUIForm, SwiftUISection } from '@/components/swiftui/SwiftUISection';
import { SwiftUIToggle } from '@/components/swiftui/SwiftUIToggle';
import { SwiftUISegmentedControl } from '@/components/swiftui/SwiftUISegmentedControl';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    tasks,
    events,
    habits,
    calorieEntries,
    caTopics,
    resetAllDataToCleanSlate,
  } = useData();
  const { user, signInWithGoogle, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  const [savedNotification, setSavedNotification] = useState(false);
  const [notificationPerm, setNotificationPerm] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  // 24/7 Background Sync State
  const [offlineClientId, setOfflineClientId] = useState<string>(() => {
    return (
      (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
      (typeof localStorage !== 'undefined'
        ? localStorage.getItem('nayra_google_client_id') || ''
        : '')
    );
  });
  const [offlineClientSecret, setOfflineClientSecret] = useState<string>('');
  const [serverOAuthStatus, setServerOAuthStatus] = useState<{
    isConfigured: boolean;
    hasUserLinkedOffline: boolean;
    clientId: string | null;
    isAdmin?: boolean;
  } | null>(null);
  const [isSavingServerCreds, setIsSavingServerCreds] = useState(false);
  const [saveCredsStatus, setSaveCredsStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [saveCredsMessage, setSaveCredsMessage] = useState<string>('');

  const [isLinkingOffline, setIsLinkingOffline] = useState(false);
  const [offlineLinkStatus, setOfflineLinkStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [offlineLinkMessage, setOfflineLinkMessage] = useState<string>('');

  useEffect(() => {
    if (user && !user.isGuest) {
      getGoogleOAuthStatusFromCloud().then((status) => {
        setServerOAuthStatus(status);
        if (status.clientId && !offlineClientId) {
          setOfflineClientId(status.clientId);
        }
      });
    }
  }, [user]);

  const handleSaveServerCredentials = async () => {
    if (!offlineClientId.trim() || !offlineClientSecret.trim()) {
      setSaveCredsStatus('error');
      setSaveCredsMessage('Both Client ID and Client Secret are required.');
      return;
    }

    setIsSavingServerCreds(true);
    setSaveCredsStatus('idle');
    setSaveCredsMessage('');

    try {
      const success = await setGoogleOAuthCredentialsOnCloud(
        offlineClientId.trim(),
        offlineClientSecret.trim()
      );
      if (success) {
        setSaveCredsStatus('success');
        setSaveCredsMessage('OAuth credentials securely saved to Cloud Functions.');
        localStorage.setItem('nayra_google_client_id', offlineClientId.trim());
        const updated = await getGoogleOAuthStatusFromCloud();
        setServerOAuthStatus(updated);
      } else {
        setSaveCredsStatus('error');
        setSaveCredsMessage('Failed to save credentials to Cloud Functions.');
      }
    } catch (err: any) {
      setSaveCredsStatus('error');
      setSaveCredsMessage(err?.message || 'Error saving server credentials.');
    } finally {
      setIsSavingServerCreds(false);
    }
  };

  const handleLinkOfflineSync = async () => {
    setIsLinkingOffline(true);
    setOfflineLinkStatus('idle');
    setOfflineLinkMessage('');

    if (offlineClientId) {
      localStorage.setItem('nayra_google_client_id', offlineClientId.trim());
    }

    try {
      const success = await linkGoogleOfflineAccess(offlineClientId.trim() || undefined);
      if (success) {
        setOfflineLinkStatus('success');
        setOfflineLinkMessage('Permanent offline background sync established successfully.');
        const updated = await getGoogleOAuthStatusFromCloud();
        setServerOAuthStatus(updated);
      } else {
        setOfflineLinkStatus('error');
        setOfflineLinkMessage(
          'Could not link offline access. Please verify your Google Client ID and popup permissions.'
        );
      }
    } catch (err: any) {
      setOfflineLinkStatus('error');
      setOfflineLinkMessage(err?.message || 'Failed to initialize offline access flow.');
    } finally {
      setIsLinkingOffline(false);
    }
  };

  const handleSaveNotification = () => {
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2000);
  };

  const handleRequestNotification = async () => {
    if (typeof Notification !== 'undefined') {
      const res = await Notification.requestPermission();
      setNotificationPerm(res);
      handleSaveNotification();
    }
  };

  const handleExportData = () => {
    const backup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      user,
      settings,
      tasks,
      events,
      habits,
      calorieEntries,
      caTopics,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nayra_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-6 select-none view-enter">
      {/* Header */}
      <HStack alignment="center" className="justify-between pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <VStack spacing={1}>
          <HStack spacing={2}>
            <Settings className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              System Settings & Preferences
            </h2>
          </HStack>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Calibrate focus durations, nutritional targets, appearance, and cloud integration.
          </p>
        </VStack>

        {savedNotification && (
          <HStack spacing={1} className="text-xs text-emerald-600 dark:text-emerald-400 font-mono animate-in fade-in">
            <CheckCircle2 className="h-4 w-4" />
            <span>Preferences Saved</span>
          </HStack>
        )}
      </HStack>

      <SwiftUIForm spacing="md">
        {/* 1. Google Account & Authorization Status */}
        <SwiftUISection
          cardClassName="apple-card-surface liquid-glass-card rounded-2xl p-5 md:p-6 space-y-5 card-enter stagger-1"
        >
          <HStack alignment="center" className="justify-between pb-3.5 border-b border-zinc-100/80 dark:border-zinc-800/80">
            <HStack spacing={3}>
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 shadow-xs">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <VStack spacing={0}>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Google Cloud & Account Integration
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Google Calendar v3 & Google Tasks API synchronization
                </p>
              </VStack>
            </HStack>
            <Badge variant={user && !user.isGuest ? 'success' : 'default'}>
              {user && !user.isGuest ? 'Connected' : 'Local / Guest Mode'}
            </Badge>
          </HStack>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <VStack spacing={1}>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                {user?.email || 'No Google account connected'}
              </span>
              <p className="text-zinc-500 dark:text-zinc-400">
                {user && !user.isGuest
                  ? 'Authorized scopes for Google Calendar v3 and Google Tasks v1 APIs.'
                  : 'Sign in with Google to enable automatic cloud synchronization with your personal Google Calendar and Google Tasks.'}
              </p>
            </VStack>

            <div className="shrink-0">
              {user && !user.isGuest ? (
                <Button variant="outline" size="sm" onClick={signOut} className="swiftui-press">
                  Disconnect Account
                </Button>
              ) : (
                <Button variant="primary" size="sm" onClick={signInWithGoogle} className="swiftui-press">
                  Sign In with Google
                </Button>
              )}
            </div>
          </div>

          {/* Continuous 24/7 Background Synchronization Section */}
          {user && !user.isGuest && (
            <VStack spacing={4} className="pt-4 border-t border-zinc-100/80 dark:border-zinc-800/80 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                <VStack spacing={1}>
                  <HStack spacing={2}>
                    <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <RefreshCw className="h-3.5 w-3.5 text-sky-500" />
                      <span>Continuous 24/7 Background Synchronization</span>
                    </h4>
                    {serverOAuthStatus?.hasUserLinkedOffline ? (
                      <Badge variant="success">Active (Zero Reconnects)</Badge>
                    ) : serverOAuthStatus?.isConfigured ? (
                      <Badge variant="info">Ready to Link</Badge>
                    ) : (
                      <Badge variant="warning">Credentials Needed</Badge>
                    )}
                  </HStack>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {serverOAuthStatus?.hasUserLinkedOffline
                      ? 'Background token renewal is fully active. Nayra syncs tasks and calendar automatically without hourly disconnects.'
                      : 'Eliminates hourly token expirations by delegating silent refresh to serverless Cloud Functions.'}
                  </p>
                </VStack>

                <Button
                  variant={serverOAuthStatus?.hasUserLinkedOffline ? 'outline' : 'primary'}
                  size="sm"
                  onClick={handleLinkOfflineSync}
                  disabled={isLinkingOffline}
                  className="shrink-0 swiftui-press"
                >
                  {isLinkingOffline
                    ? 'Authorizing...'
                    : serverOAuthStatus?.hasUserLinkedOffline
                    ? 'Re-link Offline Access'
                    : 'Authorize 24/7 Offline Sync'}
                </Button>
              </div>

              {offlineLinkStatus === 'success' && (
                <HStack spacing={2} className="p-3 rounded-lg bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-200 shadow-xs w-full">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{offlineLinkMessage}</span>
                </HStack>
              )}

              {offlineLinkStatus === 'error' && (
                <HStack spacing={2} className="p-3 rounded-lg bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-200 shadow-xs w-full">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>{offlineLinkMessage}</span>
                </HStack>
              )}

              {/* Server OAuth Credentials Configuration */}
              {serverOAuthStatus?.isAdmin ? (
                <div className="mt-3 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/50 backdrop-blur-md space-y-3.5 shadow-xs w-full">
                  <HStack spacing={1.5} className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    <KeyRound className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Cloud Functions OAuth Configuration (Administrator Only)</span>
                  </HStack>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="OAuth 2.0 Web Client ID"
                      placeholder="e.g. 413144887088-xxx.apps.googleusercontent.com"
                      value={offlineClientId}
                      onChange={(e) => {
                        setOfflineClientId(e.target.value);
                        if (typeof localStorage !== 'undefined') {
                          localStorage.setItem('nayra_google_client_id', e.target.value.trim());
                        }
                      }}
                    />
                    <Input
                      label="OAuth 2.0 Client Secret"
                      type="password"
                      placeholder="e.g. GOCSPX-xxxxxxxxxxxxxxxx"
                      value={offlineClientSecret}
                      onChange={(e) => setOfflineClientSecret(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Stored securely in Firestore backend (<code className="font-mono text-[10px]">system_config/google_oauth</code>), inaccessible to client browsers.
                    </p>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSaveServerCredentials}
                      disabled={isSavingServerCreds || !offlineClientId.trim() || !offlineClientSecret.trim()}
                      className="shrink-0 swiftui-press"
                    >
                      {isSavingServerCreds ? 'Saving...' : 'Save to Cloud Functions'}
                    </Button>
                  </div>

                  {saveCredsMessage && (
                    <div
                      className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                        saveCredsStatus === 'success'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/60'
                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800/60'
                      }`}
                    >
                      {saveCredsStatus === 'success' ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                      )}
                      <span>{saveCredsMessage}</span>
                    </div>
                  )}
                </div>
              ) : serverOAuthStatus?.isConfigured ? (
                <div className="mt-3 p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/30 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-2 w-full">
                  <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Global OAuth background credentials are configured and managed by your system administrator.</span>
                </div>
              ) : null}
            </VStack>
          )}
        </SwiftUISection>

        {/* 2. Appearance & Theme Mode */}
        <SwiftUISection
          cardClassName="apple-card-surface liquid-glass-card rounded-2xl p-5 md:p-6 space-y-4 card-enter stagger-2"
        >
          <VStack spacing={0.5} className="pb-3 border-b border-zinc-100/80 dark:border-zinc-800/80 w-full">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Appearance & Visual Theme
            </h3>
            <p className="text-xs text-zinc-400">
              Strict dual-theme parity adhering to Anti-AI Slop guidelines.
            </p>
          </VStack>

          <SwiftUISegmentedControl<'light' | 'dark' | 'system'>
            options={[
              { value: 'light', label: 'light Theme' },
              { value: 'dark', label: 'dark Theme' },
              { value: 'system', label: 'system Theme' },
            ]}
            value={theme}
            onChange={(val) => setTheme(val)}
            className="w-full grid grid-cols-3"
            size="md"
          />
        </SwiftUISection>

        {/* 3. Pomodoro Focus Lab Configuration */}
        <SwiftUISection
          cardClassName="apple-card-surface liquid-glass-card rounded-2xl p-5 md:p-6 space-y-5 card-enter stagger-3"
        >
          <HStack spacing={2.5} className="pb-3 border-b border-zinc-100/80 dark:border-zinc-800/80 w-full">
            <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 shadow-xs">
              <Clock className="h-4 w-4" />
            </div>
            <VStack spacing={0}>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Focus / Pomodoro Durations
              </h3>
              <p className="text-[11px] text-zinc-400">
                Interval timings and automated transitions
              </p>
            </VStack>
          </HStack>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Focus Duration (minutes)"
              type="number"
              min={1}
              max={120}
              value={settings.defaultFocusMinutes}
              onChange={(e) => {
                updateSettings({ defaultFocusMinutes: parseInt(e.target.value) || 25 });
                handleSaveNotification();
              }}
            />
            <Input
              label="Short Break (minutes)"
              type="number"
              min={1}
              max={30}
              value={settings.shortBreakMinutes}
              onChange={(e) => {
                updateSettings({ shortBreakMinutes: parseInt(e.target.value) || 5 });
                handleSaveNotification();
              }}
            />
            <Input
              label="Long Break (minutes)"
              type="number"
              min={1}
              max={60}
              value={settings.longBreakMinutes}
              onChange={(e) => {
                updateSettings({ longBreakMinutes: parseInt(e.target.value) || 15 });
                handleSaveNotification();
              }}
            />
          </div>

          <VStack spacing={0} className="pt-2 divide-y divide-zinc-100/80 dark:divide-zinc-800/80 w-full">
            {/* Sound Notification via SwiftUIToggle */}
            <SwiftUIToggle
              checked={settings.soundEnabled}
              onChange={(checked) => {
                updateSettings({ soundEnabled: checked });
                handleSaveNotification();
              }}
              label="Synthesized Web Audio notification chimes"
              description="Play an audible tone when focus intervals and breaks expire."
              color="indigo"
            />

            {/* Auto-start Breaks via SwiftUIToggle */}
            <SwiftUIToggle
              checked={settings.autoStartBreaks}
              onChange={(checked) => {
                updateSettings({ autoStartBreaks: checked });
                handleSaveNotification();
              }}
              label="Auto-start break intervals"
              description="Automatically transition to break timer when a focus block completes."
              color="indigo"
            />

            {/* Auto-start Pomodoros via SwiftUIToggle */}
            <SwiftUIToggle
              checked={settings.autoStartPomodoros}
              onChange={(checked) => {
                updateSettings({ autoStartPomodoros: checked });
                handleSaveNotification();
              }}
              label="Auto-start focus intervals"
              description="Automatically initiate the next focus session when a break concludes."
              color="indigo"
            />

            {/* Desktop Notifications */}
            <div className="flex items-center justify-between text-xs py-3 w-full">
              <VStack spacing={0.5} className="flex-1 pr-2">
                <span className="text-zinc-800 dark:text-zinc-200 font-medium block">
                  Browser Desktop Notifications
                </span>
                <span className="text-[11px] text-zinc-400">
                  {notificationPerm === 'granted'
                    ? 'System notifications active for background timer completions.'
                    : notificationPerm === 'denied'
                    ? 'Permission denied in browser settings.'
                    : 'Receive notifications even if NAYRA is running in another tab.'}
                </span>
              </VStack>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRequestNotification}
                disabled={notificationPerm === 'granted'}
                className="gap-1.5 swiftui-press"
              >
                <Bell className="h-3.5 w-3.5" />
                <span>{notificationPerm === 'granted' ? 'Enabled' : 'Enable Notifications'}</span>
              </Button>
            </div>
          </VStack>
        </SwiftUISection>

        {/* 4. Nutrition & Daily Targets */}
        <SwiftUISection
          cardClassName="apple-card-surface liquid-glass-card rounded-2xl p-5 md:p-6 space-y-4 card-enter stagger-4"
        >
          <HStack spacing={2.5} className="pb-3 border-b border-zinc-100/80 dark:border-zinc-800/80 w-full">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
              <UtensilsCrossed className="h-4 w-4" />
            </div>
            <VStack spacing={0}>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Nutrition & Macro Targets
              </h3>
              <p className="text-[11px] text-zinc-400">
                Daily caloric and macronutrient goals
              </p>
            </VStack>
          </HStack>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Input
              label="Daily Calories (kcal)"
              type="number"
              min={500}
              max={6000}
              value={settings.dailyCalorieTarget}
              onChange={(e) => {
                updateSettings({ dailyCalorieTarget: parseInt(e.target.value) || 2200 });
                handleSaveNotification();
              }}
            />
            <Input
              label="Protein Target (g)"
              type="number"
              min={0}
              value={settings.proteinTargetGrams}
              onChange={(e) => {
                updateSettings({ proteinTargetGrams: parseInt(e.target.value) || 140 });
                handleSaveNotification();
              }}
            />
            <Input
              label="Carbs Target (g)"
              type="number"
              min={0}
              value={settings.carbsTargetGrams}
              onChange={(e) => {
                updateSettings({ carbsTargetGrams: parseInt(e.target.value) || 230 });
                handleSaveNotification();
              }}
            />
            <Input
              label="Fat Target (g)"
              type="number"
              min={0}
              value={settings.fatTargetGrams}
              onChange={(e) => {
                updateSettings({ fatTargetGrams: parseInt(e.target.value) || 70 });
                handleSaveNotification();
              }}
            />
          </div>
        </SwiftUISection>

        {/* 5. Data Export & Backup */}
        <SwiftUISection
          cardClassName="apple-card-surface liquid-glass-card rounded-2xl p-5 md:p-6 card-enter stagger-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
            <VStack spacing={0.5}>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Export Personal Data Backup
              </h3>
              <p className="text-xs text-zinc-400">
                Download complete snapshot of tasks, calendar events, habits, focus logs, and nutrition records in standard JSON.
              </p>
            </VStack>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
              className="gap-1.5 shrink-0 swiftui-press"
            >
              <Download className="h-4 w-4" />
              <span>Export JSON</span>
            </Button>
          </div>
        </SwiftUISection>

        {/* 6. Reset to Clean Slate */}
        <div className="apple-card-surface p-5 md:p-6 rounded-2xl border border-rose-200/90 dark:border-rose-950 bg-rose-50/20 dark:bg-rose-950/10 shadow-[0_4px_12px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 card-enter stagger-6">
          <VStack spacing={0.5}>
            <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5">
              <Trash2 className="h-4 w-4" />
              <span>Reset to Clean Slate</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Permanently clear all local events, tasks, habits, focus logs, and nutrition records to start fresh.
            </p>
          </VStack>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (
                window.confirm(
                  'Are you sure you want to reset all data to a clean slate? This action cannot be undone.'
                )
              ) {
                resetAllDataToCleanSlate();
                setSavedNotification(true);
                setTimeout(() => setSavedNotification(false), 3000);
              }
            }}
            className="border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 shrink-0 swiftui-press"
          >
            <span>Reset All Data</span>
          </Button>
        </div>
      </SwiftUIForm>
    </div>
  );
};
