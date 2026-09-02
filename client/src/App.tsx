import React from 'react';
import { AppProvider, useApp } from './context/AppContext.js';
import { Sidebar } from './components/layout/Sidebar.js';
import { Header } from './components/layout/Header.js';
import { QuickCommandPalette } from './components/layout/QuickCommandPalette.js';
import { NayraOrb } from './components/layout/NayraOrb.js';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard.js';
import { TaskManager } from './components/tasks/TaskManager.js';
import { CalendarView } from './components/calendar/CalendarView.js';
import { PomodoroTimer } from './components/pomodoro/PomodoroTimer.js';
import { CalorieTracker } from './components/nutrition/CalorieTracker.js';
import { KeepNotesView } from './components/keep/KeepNotesView.js';
import { NayraChatModal } from './components/assistant/NayraChatModal.js';

const MainContent: React.FC = () => {
  const { activeTab, isLoading } = useApp();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-[#fafafa] dark:bg-[#09090b]">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-2 text-zinc-400 dark:text-zinc-500">
              <div className="w-6 h-6 border-2 border-zinc-900 dark:border-zinc-100 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-mono">Loading NAYRA...</p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && <OverviewDashboard />}
              {activeTab === 'tasks' && <TaskManager />}
              {activeTab === 'calendar' && <CalendarView />}
              {activeTab === 'pomodoro' && <PomodoroTimer />}
              {activeTab === 'nutrition' && <CalorieTracker />}
              {activeTab === 'keep' && <KeepNotesView />}
              {activeTab === 'assistant' && <OverviewDashboard />}
            </>
          )}
        </main>
      </div>

      <QuickCommandPalette />
      <NayraOrb />
      <NayraChatModal />
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
