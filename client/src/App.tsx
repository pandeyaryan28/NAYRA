import React from 'react';
import { AppProvider, useApp } from './context/AppContext.js';
import { Sidebar } from './components/layout/Sidebar.js';
import { Header } from './components/layout/Header.js';
import { QuickCommandPalette } from './components/layout/QuickCommandPalette.js';
import { NayraOrb } from './components/layout/NayraOrb.js';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard.js';
import { TaskManager } from './components/tasks/TaskManager.js';
import { CalendarView } from './components/calendar/CalendarView.js';
import { HabitsView } from './components/habits/HabitsView.js';
import { PomodoroTimer } from './components/pomodoro/PomodoroTimer.js';
import { CalorieTracker } from './components/nutrition/CalorieTracker.js';
import { KeepNotesView } from './components/keep/KeepNotesView.js';
import { NayraChatModal } from './components/assistant/NayraChatModal.js';
import { SettingsModal } from './components/settings/SettingsModal.js';
import { LoginPage } from './components/auth/LoginPage.js';

const MainContent: React.FC = () => {
  const { activeTab, isLoading, isAuthenticated } = useApp();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center space-y-3 bg-[#0a0a0d] text-zinc-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-mono tracking-widest text-zinc-400">INITIALIZING NAYRA COMMAND CENTER...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-[#fafafa] dark:bg-[#09090b]">
          {activeTab === 'overview' && <OverviewDashboard />}
          {activeTab === 'tasks' && <TaskManager />}
          {activeTab === 'calendar' && <CalendarView />}
          {activeTab === 'habits' && <HabitsView />}
          {activeTab === 'pomodoro' && <PomodoroTimer />}
          {activeTab === 'nutrition' && <CalorieTracker />}
          {activeTab === 'keep' && <KeepNotesView />}
          {activeTab === 'assistant' && <OverviewDashboard />}
        </main>
      </div>

      <QuickCommandPalette />
      <NayraOrb />
      <NayraChatModal />
      <SettingsModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
