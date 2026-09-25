import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext.js';
import { AppLayout } from '../components/layout/AppLayout.js';
import { OverviewDashboard } from '../components/dashboard/OverviewDashboard.js';
import { TaskManager } from '../components/tasks/TaskManager.js';
import { CalendarView } from '../components/calendar/CalendarView.js';
import { HabitsView } from '../components/habits/HabitsView.js';
import { PomodoroTimer } from '../components/pomodoro/PomodoroTimer.js';
import { CalorieTracker } from '../components/nutrition/CalorieTracker.js';
import { KeepNotesView } from '../components/keep/KeepNotesView.js';
import { CaTrackerView } from '../ca-tracker/CaTrackerView.js';
import { LoginPage } from '../components/auth/LoginPage.js';

const ScintEngineView = React.lazy(() => import('../scint-engine/ScintEngineView.js'));

import { SettingsView } from '../components/settings/SettingsView.js';

export const AppRoutes: React.FC = () => {
  const { isLoading, isAuthenticated } = useApp();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center space-y-3 bg-slate-50 dark:bg-[#09090b] text-slate-500 dark:text-zinc-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-mono tracking-widest text-slate-600 dark:text-zinc-400">
          INITIALIZING NAYRA COMMAND CENTER...
        </p>
      </div>
    );
  }

  // If not authenticated and not currently on /login, redirect to /login
  if (!isAuthenticated && location.pathname !== '/login') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If authenticated and on /login, redirect to /
  if (isAuthenticated && location.pathname === '/login') {
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Authenticated Workspace Shell */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<OverviewDashboard />} />
        <Route path="/tasks" element={<TaskManager />} />
        <Route path="/calendar" element={<CalendarView />} />
        <Route path="/habits" element={<HabitsView />} />
        <Route path="/focus" element={<PomodoroTimer />} />
        <Route path="/nutrition" element={<CalorieTracker />} />
        <Route path="/notes" element={<KeepNotesView />} />
        <Route path="/ca-tracker/*" element={<CaTrackerView />} />
        <Route 
          path="/chipchain/*" 
          element={
            <React.Suspense fallback={
              <div className="h-full flex items-center justify-center p-8 text-xs font-mono text-slate-500 dark:text-zinc-400">
                LOADING CHIPCHAIN 360 INTEL...
              </div>
            }>
              <ScintEngineView />
            </React.Suspense>
          } 
        />
        <Route path="/settings" element={<SettingsView />} />
      </Route>

      {/* Catch-all redirect to / */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
