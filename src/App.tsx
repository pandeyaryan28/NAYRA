import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import { FocusProvider } from '@/context/FocusContext';

import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { LoginView } from '@/views/LoginView';
import { DashboardView } from '@/views/DashboardView';
import { CalendarView } from '@/views/CalendarView';
import { TasksView } from '@/views/TasksView';
import { FocusView } from '@/views/FocusView';
import { HabitsView } from '@/views/HabitsView';
import { CaloriesView } from '@/views/CaloriesView';
import { CATrackerView } from '@/views/CATrackerView';
import { SCIntView } from '@/views/SCIntView';
import { AnalyticsView } from '@/views/AnalyticsView';
import { AssistantView } from '@/views/AssistantView';
import { SettingsView } from '@/views/SettingsView';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <FocusProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Authentication Route */}
                <Route path="/login" element={<LoginView />} />

                {/* Authenticated Application Shell & Modules */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<AppShell />}>
                    <Route index element={<DashboardView />} />
                    <Route path="calendar" element={<CalendarView />} />
                    <Route path="tasks" element={<TasksView />} />
                    <Route path="focus" element={<FocusView />} />
                    <Route path="habits" element={<HabitsView />} />
                    <Route path="calories" element={<CaloriesView />} />
                    <Route path="ca-tracker" element={<CATrackerView />} />
                    <Route path="scint-engine" element={<SCIntView />} />
                    <Route path="analytics" element={<AnalyticsView />} />
                    <Route path="assistant" element={<AssistantView />} />
                    <Route path="settings" element={<SettingsView />} />
                  </Route>
                </Route>

                {/* Wildcard Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </FocusProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
