import React, { createContext, useContext, useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { PomodoroMode, TimerState, TaskItem } from '@/types';
import { useData } from './DataContext';
import { playSessionCompleteSound, playBreakCompleteSound } from '@/lib/audio';
import { safeLocalStorageGet, safeLocalStorageSet } from '@/lib/utils';

export interface FocusContextValue {
  mode: PomodoroMode;
  timerState: TimerState;
  remainingSeconds: number;
  totalDurationSeconds: number;
  progressPercentage: number;
  currentCycle: number;
  selectedTask: TaskItem | null;
  selectedTasks: TaskItem[];
  activeTaskIds: string[];
  taskTimeAllocations: Record<string, number>;
  selectTask: (task: TaskItem | null) => void;
  selectTasks: (tasks: TaskItem[]) => void;
  addSessionTask: (task: TaskItem) => void;
  removeSessionTask: (taskId: string) => void;
  getTaskLiveSeconds: (taskId: string) => number;
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
  activeTaskIds?: string[];
  taskTimeAllocations?: Record<string, number>;
  lastSliceTime?: number | null;
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

  // Dynamic multi-task tracking
  const [activeTaskIds, setActiveTaskIds] = useState<string[]>(() => {
    if (initialStored?.activeTaskIds && Array.isArray(initialStored.activeTaskIds)) {
      return initialStored.activeTaskIds;
    }
    return initialStored?.selectedTaskId ? [initialStored.selectedTaskId] : [];
  });

  const [taskTimeAllocations, setTaskTimeAllocations] = useState<Record<string, number>>(
    initialStored?.taskTimeAllocations || {}
  );

  const activeTaskIdsRef = useRef<string[]>(activeTaskIds);
  activeTaskIdsRef.current = activeTaskIds;

  const taskAllocationsRef = useRef<Record<string, number>>(taskTimeAllocations);
  taskAllocationsRef.current = taskTimeAllocations;

  const lastSliceTimeRef = useRef<number | null>(
    initialStored?.timerState === 'running' && initialStored?.targetEndTime && Date.now() < initialStored.targetEndTime
      ? initialStored.lastSliceTime || Date.now()
      : null
  );

  const totalDurationSeconds = getDurationForMode(mode);
  const progressPercentage = Math.min(
    100,
    Math.max(0, Math.round(((totalDurationSeconds - remainingSeconds) / totalDurationSeconds) * 100))
  );

  const selectedTasks = useMemo(() => {
    return tasks.filter((t) => activeTaskIds.includes(t.id));
  }, [tasks, activeTaskIds]);

  const selectedTask = useMemo(() => {
    if (selectedTaskId) {
      const found = tasks.find((t) => t.id === selectedTaskId);
      if (found) return found;
    }
    return selectedTasks[0] || null;
  }, [selectedTaskId, tasks, selectedTasks]);

  const isExpiringRef = useRef<boolean>(false);
  const hasProcessedMountRef = useRef<boolean>(false);

  // Synchronously flushes elapsed interval since last slice and attributes it to current active tasks
  const flushSliceSync = useCallback((now: number = Date.now()): Record<string, number> => {
    if (lastSliceTimeRef.current && lastSliceTimeRef.current < now) {
      const elapsedSec = Math.max(0, Math.round((now - lastSliceTimeRef.current) / 1000));
      if (elapsedSec > 0 && activeTaskIdsRef.current.length > 0) {
        const next: Record<string, number> = { ...taskAllocationsRef.current };
        for (const tid of activeTaskIdsRef.current) {
          next[tid] = (next[tid] || 0) + elapsedSec;
        }
        taskAllocationsRef.current = next;
        setTaskTimeAllocations(next);
      }
      lastSliceTimeRef.current = now;
    }
    return taskAllocationsRef.current;
  }, []);

  // Sync to localStorage
  useEffect(() => {
    const payload: StoredFocusState = {
      mode,
      timerState,
      remainingSeconds,
      targetEndTime,
      currentCycle,
      selectedTaskId,
      activeTaskIds,
      taskTimeAllocations,
      lastSliceTime: lastSliceTimeRef.current,
    };
    safeLocalStorageSet(FOCUS_STORAGE_KEYS.STATE, payload);
  }, [mode, timerState, remainingSeconds, targetEndTime, currentCycle, selectedTaskId, activeTaskIds, taskTimeAllocations]);

  // Clean up any stale/expired timer state from an abandoned session on initial mount
  useEffect(() => {
    if (hasProcessedMountRef.current) return;
    hasProcessedMountRef.current = true;

    if (initialStored?.timerState === 'running' && initialStored.targetEndTime) {
      if (Date.now() >= initialStored.targetEndTime) {
        setTargetEndTime(null);
        setTimerState('idle');
        lastSliceTimeRef.current = null;
        taskAllocationsRef.current = {};
        setTaskTimeAllocations({});
        const defaultDur = getDurationForMode(initialStored.mode || 'focus');
        setRemainingSeconds(defaultDur);
        safeLocalStorageSet(FOCUS_STORAGE_KEYS.STATE, {
          ...initialStored,
          timerState: 'idle',
          targetEndTime: null,
          remainingSeconds: defaultDur,
          taskTimeAllocations: {},
          lastSliceTime: null,
        });
      }
    }
  }, [initialStored, getDurationForMode]);

  const handleTimerExpiry = useCallback(() => {
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

      // Flush final slice
      const flushedAllocations = flushSliceSync();
      lastSliceTimeRef.current = null;

      // Consolidate allocations
      const allLinkedIds = Array.from(
        new Set([...Object.keys(flushedAllocations), ...activeTaskIdsRef.current])
      );
      const linkedTasks = tasks.filter((t) => allLinkedIds.includes(t.id));

      const finalAllocations: Record<string, number> = { ...flushedAllocations };
      // Active tasks receive recorded credit; if no time was recorded across the entire session, fallback to duration
      for (const tid of activeTaskIdsRef.current) {
        if (finalAllocations[tid] === undefined) {
          if (Object.keys(flushedAllocations).length === 0) {
            finalAllocations[tid] = duration;
          } else {
            finalAllocations[tid] = 0;
          }
        } else {
          finalAllocations[tid] = Math.min(duration, finalAllocations[tid]);
        }
      }

      const allSessionTags = Array.from(
        new Set(linkedTasks.flatMap((t) => t.tags || []))
      );

      const primary = linkedTasks[0] || null;

      logFocusSession({
        taskId: primary?.id || null,
        taskTitle: primary?.title || null,
        taskIds: allLinkedIds,
        taskTitles: linkedTasks.map((t) => t.title),
        tags: allSessionTags,
        taskTimeAllocations: finalAllocations,
        mode: 'focus',
        durationSeconds: duration,
        startedAt: new Date(Date.now() - duration * 1000).toISOString(),
        completedAt: nowIso,
        interrupted: false,
      });

      // Reset allocations for subsequent session
      taskAllocationsRef.current = {};
      setTaskTimeAllocations({});
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
        lastSliceTimeRef.current = Date.now();
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
        lastSliceTimeRef.current = Date.now();
        setTargetEndTime(Date.now() + nextDuration * 1000);
        setTimerState('running');
      } else {
        setTargetEndTime(null);
        setTimerState('idle');
      }
    }
  }, [mode, currentCycle, flushSliceSync, getDurationForMode, logFocusSession, settings, tasks]);

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
  }, [timerState, targetEndTime, handleTimerExpiry]);

  const startTimer = useCallback(() => {
    isExpiringRef.current = false;
    lastSliceTimeRef.current = Date.now();
    const target = Date.now() + remainingSeconds * 1000;
    setTargetEndTime(target);
    setTimerState('running');
  }, [remainingSeconds]);

  const pauseTimer = useCallback(() => {
    isExpiringRef.current = false;
    flushSliceSync();
    lastSliceTimeRef.current = null;
    if (targetEndTime) {
      const secLeft = Math.max(0, Math.round((targetEndTime - Date.now()) / 1000));
      setRemainingSeconds(secLeft);
    }
    setTargetEndTime(null);
    setTimerState('paused');
  }, [flushSliceSync, targetEndTime]);

  const resumeTimer = useCallback(() => {
    isExpiringRef.current = false;
    lastSliceTimeRef.current = Date.now();
    const target = Date.now() + remainingSeconds * 1000;
    setTargetEndTime(target);
    setTimerState('running');
  }, [remainingSeconds]);

  const stopTimer = useCallback(() => {
    isExpiringRef.current = false;
    lastSliceTimeRef.current = null;
    setTimerState('idle');
    setTargetEndTime(null);
    setRemainingSeconds(getDurationForMode(mode));
    taskAllocationsRef.current = {};
    setTaskTimeAllocations({});
  }, [getDurationForMode, mode]);

  const skipSession = useCallback(() => {
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
  }, [currentCycle, getDurationForMode, mode, settings.longBreakInterval, stopTimer]);

  const setMode = useCallback((newMode: PomodoroMode) => {
    isExpiringRef.current = false;
    stopTimer();
    setModeState(newMode);
    setRemainingSeconds(getDurationForMode(newMode));
  }, [getDurationForMode, stopTimer]);

  const selectTask = useCallback((task: TaskItem | null) => {
    if (timerState === 'running') {
      flushSliceSync();
    }
    if (task) {
      activeTaskIdsRef.current = [task.id];
      setActiveTaskIds([task.id]);
      setSelectedTaskId(task.id);
    } else {
      activeTaskIdsRef.current = [];
      setActiveTaskIds([]);
      setSelectedTaskId(null);
    }
  }, [flushSliceSync, timerState]);

  const selectTasks = useCallback((taskList: TaskItem[]) => {
    if (timerState === 'running') {
      flushSliceSync();
    }
    const ids = Array.from(new Set(taskList.map((t) => t.id)));
    activeTaskIdsRef.current = ids;
    setActiveTaskIds(ids);
    setSelectedTaskId(ids[0] || null);
  }, [flushSliceSync, timerState]);

  const addSessionTask = useCallback((task: TaskItem) => {
    if (timerState === 'running') {
      flushSliceSync();
    }
    const next = activeTaskIdsRef.current.includes(task.id)
      ? activeTaskIdsRef.current
      : [...activeTaskIdsRef.current, task.id];
    activeTaskIdsRef.current = next;
    setActiveTaskIds(next);
    setSelectedTaskId((prev) => prev || task.id);
  }, [flushSliceSync, timerState]);

  const removeSessionTask = useCallback((taskId: string) => {
    if (timerState === 'running') {
      flushSliceSync();
    }
    const filtered = activeTaskIdsRef.current.filter((id) => id !== taskId);
    activeTaskIdsRef.current = filtered;
    setActiveTaskIds(filtered);
    setSelectedTaskId((prev) => (prev === taskId ? null : prev));
  }, [flushSliceSync, timerState]);

  const getTaskLiveSeconds = useCallback((taskId: string): number => {
    const base = taskTimeAllocations[taskId] || 0;
    if (timerState === 'running' && activeTaskIds.includes(taskId) && lastSliceTimeRef.current) {
      const runningSlice = Math.max(0, Math.round((Date.now() - lastSliceTimeRef.current) / 1000));
      return base + runningSlice;
    }
    return base;
  }, [activeTaskIds, taskTimeAllocations, timerState]);

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
        selectedTasks,
        activeTaskIds,
        taskTimeAllocations,
        selectTask,
        selectTasks,
        addSessionTask,
        removeSessionTask,
        getTaskLiveSeconds,
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
