import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.js';
import { Header } from './Header.js';
import { QuickCommandPalette } from './QuickCommandPalette.js';
import { AssistantDrawer } from '../assistant/AssistantDrawer.js';
import { SettingsModal } from '../settings/SettingsModal.js';

export const AppLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      {/* Persistent Collapsible Sidebar */}
      <Sidebar />

      {/* Main Viewport Shell */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Persistent Breadcrumb & Telemetry Header */}
        <Header />

        {/* Dynamic Route Viewport */}
        <main className="flex-1 overflow-y-auto bg-[#fafafa] dark:bg-[#09090b]">
          <Outlet />
        </main>
      </div>

      {/* Global Interactive Modals & Slide-over Drawers */}
      <QuickCommandPalette />
      <AssistantDrawer />
      <SettingsModal />
    </div>
  );
};

export default AppLayout;
