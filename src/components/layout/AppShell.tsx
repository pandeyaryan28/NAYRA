import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppShell: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // macOS Keyboard Shortcuts (⌘1 - ⌘9 for views, ⌘B for sidebar toggle)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Meta (Mac ⌘) or Ctrl (Windows/Linux)
      if (e.metaKey || e.ctrlKey) {
        if (e.key.toLowerCase() === 'b') {
          e.preventDefault();
          setCollapsed((prev) => !prev);
          return;
        }

        const routeMap: Record<string, string> = {
          '1': '/',
          '2': '/calendar',
          '3': '/tasks',
          '4': '/focus',
          '5': '/habits',
          '6': '/calories',
          '7': '/ca-tracker',
          '8': '/scint-engine',
          '9': '/analytics',
        };

        if (routeMap[e.key]) {
          e.preventDefault();
          navigate(routeMap[e.key]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-gradient-to-br from-[#f8f9fc] via-[#f1f2f6] to-[#e8eaf0] dark:from-[#111113] dark:via-[#161619] dark:to-[#0f0f11] font-sans text-zinc-900 dark:text-zinc-100 select-none">
      {/* Ambient background refraction depth (multi-point optical blur) */}
      <div className="pointer-events-none fixed -top-28 -left-28 w-96 h-96 rounded-[999px] bg-blue-500/12 dark:bg-blue-600/12 blur-[100px] z-0" />
      <div className="pointer-events-none fixed top-1/4 -right-28 w-[30rem] h-[30rem] rounded-[999px] bg-indigo-500/10 dark:bg-indigo-600/10 blur-[120px] z-0" />
      <div className="pointer-events-none fixed -bottom-28 left-1/3 w-96 h-96 rounded-[999px] bg-sky-400/10 dark:bg-sky-500/10 blur-[100px] z-0" />
      <div className="pointer-events-none fixed top-2/3 left-10 w-80 h-80 rounded-[999px] bg-purple-500/8 dark:bg-purple-600/8 blur-[110px] z-0" />

      {/* Main macOS Sequoia / visionOS Desktop Window Shell */}
      <div className="relative flex w-full h-full overflow-hidden z-10 border border-black/[0.06] dark:border-white/[0.08] shadow-[0_24px_70px_rgba(0,0,0,0.1)] dark:shadow-[0_28px_80px_rgba(0,0,0,0.7)]">
        {/* macOS Finder / Reminders Translucent Sidebar */}
        <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />

        {/* Main Content Area with Unified Toolbar */}
        <div className="relative flex flex-col flex-1 min-w-0 overflow-hidden z-10 bg-white/40 dark:bg-black/20 backdrop-blur-md">
          <Header />
          <main className="flex-1 overflow-y-auto">
            <div key={location.pathname} className="view-enter min-h-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
