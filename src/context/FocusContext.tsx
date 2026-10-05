import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { PomodoroMode, TimerState, TaskItem } from '@/types';
import { useData } from './DataContext';
import { playSessionCompleteSound, playBreakCompleteSound } from '@/lib/audio';
import { safeLocalStorageGet, safeLocalStorageSet } from '@/lib/utils';

interface FocusContextValue {
  mode: PomodoroMode;
  timerState: TimerState;
  remainingSeconds: number;
  totalDurationSeconds: number;
  progressPercentage: number;
  currentCycle: number;
  selectedTask: TaskItem | null;
  selectTask: (task: TaskItem | null) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  skipSession: () => void;
  setMode: (mode: PomodoroMode) => void;
}

const FocusContext = createContext<FocusContextValue | undefined>(undefined);

const FOCUS_STORAGE_KEYS = {
  STATE: 'nayra_focus_engine_state',
};

interface StoredFocusState {
  mode: PomodoroMode;
  timerState: TimerState;
  remainingSeconds: number;
  targetEndTime: number | null;
  currentCycle: number;
  selectedTaskId: string | null;
}

export const FocusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, logFocusSession, tasks } = useData();

  const getDurationForMode = useCallback(
    (targetMode: PomodoroMode): number => {
      switch (targetMode) {
        case 'focus':
          return (settings.defaultFocusMinutes || 25) * 60;
        case 'shortBreak':
          return (settings.shortBreakMinutes || 5) * 60;
        case 'longBreak':
          return (settings.longBreakMinutes || 15) * 60;
      }
    },
    [settings]
  );

  const initialStored = safeLocalStorageGet<StoredFocusState | null>(FOCUS_STORAGE_KEYS.STATE, null);

  const [mode, setModeState] = useState<PomodoroMode>(initialStored?.mode || 'focus');
  const [timerState, setTimerState] = useState<TimerState>(() => {
    if (initialStored?.timerState === 'running' && initialStored.targetEndTime) {
      const now = Date.now();
      if (now >= initialStored.targetEndTime) {
        return 'idle'; // Expired while away
      }
      return 'running';
    }
    return initialStored?.timerState || 'idle';
  });

  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    if (initialStored?.timerState === 'running' && initialStored.targetEndTime) {
      const diffSec = Math.max(0, Math.round((initialStored.targetEndTime - Date.now()) / 1000));
      return diffSec;
    }
    return initialStored?.remainingSeconds || getDurationForMode('focus');
  });

  const [targetEndTime, setTargetEndTime] = useState<number | null>(() => {
    if (initialStored?.timerState === 'running' && initialStored.targetEndTime) {
      return initialStored.targetEndTime;
    }
    return null;
  });

  const [currentCycle, setCurrentCycle] = useState<number>(initialStored?.currentCycle || 1);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(initialStored?.selectedTaskId || null);

  const totalDurationSeconds = getDurationForMode(mode);
  const progressPercentage = Math.min(
    100,
    Math.max(0, Math.round(((totalDurationSeconds - remainingSeconds) / totalDurationSeconds) * 100))
  );

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || null;

  const isExpiringRef = useRef<boolean>(false);
  const hasProcessedMountRef = useRef<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    const payload: StoredFocusState = {
      mode,
      timerState,
      remainingSeconds,
      targetEndTime,
      currentCycle,
      selectedTaskId,
    };
    safeLocalStorageSet(FOCUS_STORAGE_KEYS.STATE, payload);
  }, [mode, timerState, remainingSeconds, targetEndTime, currentCycle, selectedTaskId]);

  // High-accuracy drift-proof ticker
  useEffect(() => {
    if (timerState !== 'running' || !targetEndTime) return;

    const checkAndTick = () => {
      if (isExpiringRef.current) return;

      const now = Date.now();
      const diffMs = targetEndTime - now;
      const secLeft = Math.max(0, Math.round(diffMs / 1000));

      setRemainingSeconds(secLeft);

      if (diffMs <= 0) {
        isExpiringRef.current = true;
        handleTimerExpiry();
      }
    };

    const interval = setInterval(checkAndTick, 250);

    // Immediate check on tab visibility change or window focus
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && !isExpiringRef.current) {
        checkAndTick();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, [timerState, targetEndTime, mode, currentCycle, selectedTask, settings]);

  // Clean up any stale/expired timer state from an abandoned session on initial mount
  useEffect(() => {
    if (hasProcessedMountRef.current) return;
    hasProcessedMountRef.current = true;

    if (initialStored?.timerState === 'running' && initialStored.targetEndTime) {
      if (Date.now() >= initialStored.targetEndTime) {
        // Timer expired while the browser tab was closed or asleep.
        // We cleanly reset to idle without injecting unverified focus time into analytics.
        setTargetEndTime(null);
        setTimerState('idle');
        const defaultDur = getDurationForMode(initialStored.mode || 'focus');
        setRemainingSeconds(defaultDur);
        safeLocalStorageSet(FOCUS_STORAGE_KEYS.STATE, {
          ...initialStored,
          timerState: 'idle',
          targetEndTime: null,
          remainingSeconds: defaultDur,
        });
      }
    }
  }, [initialStored, getDurationForMode]);

  const handleTimerExpiry = () => {
    // 1. Play synthesized Web Audio chime
    if (settings.soundEnabled) {
      if (mode === 'focus') {
        playSessionCompleteSound();
      } else {
        playBreakCompleteSound();
      }
    }

    // 2. Desktop notification
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      const notifTitle = mode === 'focus' ? 'Focus Session Completed' : 'Break Completed';
      const notifBody = mode === 'focus'
        ? 'Great work! Time for a short break.'
        : 'Break is over. Ready for your next focus session?';
      try {
        new Notification(notifTitle, { body: notifBody });
      } catch {
        // Notification fallback
      }
    }

    // 3. Record completed session ONLY for focus intervals (never log breaks as focus sessions)
    if (mode === 'focus') {
      const duration = getDurationForMode('focus');
      const nowIso = new Date().toISOString();
      logFocusSession({
        taskId: selectedTask?.id || null,
        taskTitle: selectedTask?.title || null,
        mode: 'focus',
        durationSeconds: duration,
        startedAt: new Date(Date.now() - duration * 1000).toISOString(),
        completedAt: nowIso,
        interrupted: false,
      });
    }

    // 4. Cycle progression respecting auto-start settings
    if (mode === 'focus') {
      const isLongBreak = currentCycle % (settings.longBreakInterval || 4) === 0;
      const nextMode: PomodoroMode = isLongBreak ? 'longBreak' : 'shortBreak';
      setModeState(nextMode);
      const nextDuration = getDurationForMode(nextMode);
      setRemainingSeconds(nextDuration);

      if (settings.autoStartBreaks) {
        isExpiringRef.current = false;
        setTargetEndTime(Date.now() + nextDuration * 1000);
        setTimerState('running');
      } else {
        setTargetEndTime(null);
        setTimerState('idle');
      }
    } else {
      // Completed break
      setModeState('focus');
      setCurrentCycle((prev) => prev + 1);
      const nextDuration = getDurationForMode('focus');
      setRemainingSeconds(nextDuration);

      if (settings.autoStartPomodoros) {
        isExpiringRef.current = false;
        setTargetEndTime(Date.now() + nextDuration * 1000);
        setTimerState('running');
      } else {
        setTargetEndTime(null);
        setTimerState('idle');
      }
    }
  };

  const startTimer = () => {
    isExpiringRef.current = false;
    const target = Date.now() + remainingSeconds * 1000;
    setTargetEndTime(target);
    setTimerState('running');
  };

  const pauseTimer = () => {
    isExpiringRef.current = false;
    if (targetEndTime) {
      const secLeft = Math.max(0, Math.round((targetEndTime - Date.now()) / 1000));
      setRemainingSeconds(secLeft);
    }
    setTargetEndTime(null);
    setTimerState('paused');
  };

  const resumeTimer = () => {
    isExpiringRef.current = false;
    const target = Date.now() + remainingSeconds * 1000;
    setTargetEndTime(target);
    setTimerState('running');
  };

  const stopTimer = () => {
    isExpiringRef.current = false;
    setTimerState('idle');
    setTargetEndTime(null);
    setRemainingSeconds(getDurationForMode(mode));
  };

  const skipSession = () => {
    isExpiringRef.current = false;
    stopTimer();
    if (mode === 'focus') {
      const isLongBreak = currentCycle % (settings.longBreakInterval || 4) === 0;
      const nextMode: PomodoroMode = isLongBreak ? 'longBreak' : 'shortBreak';
      setModeState(nextMode);
      setRemainingSeconds(getDurationForMode(nextMode));
    } else {
      setModeState('focus');
      setCurrentCycle((prev) => prev + 1);
      setRemainingSeconds(getDurationForMode('focus'));
    }
  };

  const setMode = (newMode: PomodoroMode) => {
    isExpiringRef.current = false;
    stopTimer();
    setModeState(newMode);
    setRemainingSeconds(getDurationForMode(newMode));
  };

  const selectTask = (task: TaskItem | null) => {
    setSelectedTaskId(task ? task.id : null);
  };

  return (
    <FocusContext.Provider
      value={{
        mode,
        timerState,
        remainingSeconds,
        totalDurationSeconds,
        progressPercentage,
        currentCycle,
        selectedTask,
        selectTask,
        startTimer,
        pauseTimer,
        resumeTimer,
        stopTimer,
        skipSession,
        setMode,
      }}
    >
      {children}
    </FocusContext.Provider>
  );
};

export function useFocus(): FocusContextValue {
  const context = useContext(FocusContext);
  if (!context) {
    throw new Error('useFocus must be used within a FocusProvider');
  }
  return context;
}
