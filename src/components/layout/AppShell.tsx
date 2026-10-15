import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppShell: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-gradient-to-br from-[#f8f9fc] via-[#f1f2f6] to-[#e8eaf0] dark:from-[#111113] dark:via-[#161619] dark:to-[#0f0f11] font-sans text-zinc-900 dark:text-zinc-100">
      {/* Ambient background refraction depth (static, non-interactive) */}
      <div className="pointer-events-none fixed -top-28 -left-28 w-96 h-96 rounded-[999px] bg-blue-500/10 dark:bg-blue-600/10 blur-[100px] z-0" />
      <div className="pointer-events-none fixed top-1/3 -right-28 w-96 h-96 rounded-[999px] bg-indigo-500/10 dark:bg-indigo-600/10 blur-[110px] z-0" />
      <div className="pointer-events-none fixed -bottom-28 left-1/3 w-80 h-80 rounded-[999px] bg-sky-400/10 dark:bg-sky-500/10 blur-[90px] z-0" />

      {/* Persistent Navigation Sidebar */}
      <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />

      {/* Main Content Area */}
      <div className="relative flex flex-col flex-1 min-w-0 overflow-hidden z-10">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div key={location.pathname} className="view-enter min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
