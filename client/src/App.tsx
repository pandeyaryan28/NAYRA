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
    <div className="flex h-screen w-screen overflow-hidden bg-[#080c14] text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-radial from-slate-900/40 to-[#080c14]">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-mono text-cyan-400">Initializing NAYRA Core Systems...</p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && <OverviewDashboard />}
              {activeTab === 'tasks' && <TaskManager />}
              {activeTab === 'calendar' && <CalendarView />}
              {activeTab === 'pomodoro' && <PomodoroTimer />}
              {activeTab === 'nutrition' && <CalorieTracker />}
              {activeTab === 'keep' && <KeepNotesView />}
              {activeTab === 'assistant' && (
                <div className="p-6">
                  <OverviewDashboard />
                </div>
              )}
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
