import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppTheme } from '../types';
import { STORAGE_KEYS } from '../lib/constants';
import { AppContext } from '../../context/AppContext.js';

interface ThemeContextType {
  theme: AppTheme;
  resolvedTheme: 'dark' | 'light';
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const CaThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const appState = useContext(AppContext);

  // Fallback state if used standalone
  const [localTheme, setLocalTheme] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME) as AppTheme | null;
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved;
      }
    } catch {}
    return 'dark';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>(() => {
    if (appState) return appState.theme;
    if (localTheme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return localTheme === 'light' ? 'light' : 'dark';
  });

  // Keep in sync with global theme and handle system theme
  useEffect(() => {
    if (appState) {
      setResolvedTheme(appState.theme);
      if (localTheme !== 'system') {
        setLocalTheme(appState.theme as AppTheme);
      }
    }
  }, [appState?.theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (localTheme === 'system') {
        const sysTheme = e.matches ? 'dark' : 'light';
        setResolvedTheme(sysTheme);
        if (appState) {
          appState.setTheme(sysTheme);
        } else {
          const root = document.documentElement;
          if (sysTheme === 'dark') root.classList.add('dark');
          else root.classList.remove('dark');
        }
      }
    };

    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, [localTheme, appState]);

  const setTheme = (newTheme: AppTheme) => {
    setLocalTheme(newTheme);
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    } catch {}

    let targetTheme: 'dark' | 'light';
    if (newTheme === 'system') {
      targetTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      targetTheme = newTheme;
    }

    setResolvedTheme(targetTheme);
    if (appState) {
      appState.setTheme(targetTheme);
    } else {
      const root = document.documentElement;
      if (targetTheme === 'dark') root.classList.add('dark');
      else root.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const next: 'dark' | 'light' = (appState ? appState.theme : resolvedTheme) === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  const activeTheme = localTheme === 'system' ? 'system' : (appState ? (appState.theme as AppTheme) : localTheme);
  const activeResolved = appState ? appState.theme : resolvedTheme;

  return (
    <ThemeContext.Provider value={{ theme: activeTheme, resolvedTheme: activeResolved, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a CaThemeProvider');
  }
  return context;
}
