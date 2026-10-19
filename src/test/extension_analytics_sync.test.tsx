import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import App from '../App';
import { calculateTaskPeriodFocus } from '../views/analytics/analyticsUtils';
import { toLocalDateString } from '../views/AnalyticsView';
import { FocusSession, TaskItem } from '../types';
import { OPERATOR_UID } from '../lib/firebase';

describe('Extension & Analytics Sync Integration Tests (v2.10.1)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  describe('1. Task Focus Synthesis & Integrity in calculateTaskPeriodFocus', () => {
    it('synthesizes missing tasks from session allocations so linked tasks are never dropped', () => {
      const existingTasks: TaskItem[] = [
        {
          id: 'web-task-1',
          taskListId: '@default',
          title: 'Web Task 1',
          status: 'needsAction',
          completed: false,
          priority: 'high',
          totalFocusSeconds: 0,
          pomodoroCount: 0,
          createdAt: '2026-10-19T08:00:00.000Z',
          updatedAt: '2026-10-19T08:00:00.000Z',
        },
      ];

      const sessions: FocusSession[] = [
        {
          id: 'sess-1',
          taskId: 'web-task-1',
          taskTitle: 'Web Task 1',
          mode: 'focus',
          durationSeconds: 1500,
          startedAt: '2026-10-19T08:00:00.000Z',
          completedAt: '2026-10-19T08:25:00.000Z',
          interrupted: false,
        },
        // Session created in Chrome extension with a task not yet present in webApp tasks
        {
          id: 'sess-ext',
          taskId: 'ext-task-99',
          taskTitle: 'Extension Research & Design',
          taskIds: ['ext-task-99'],
          taskTitles: ['Extension Research & Design'],
          taskTimeAllocations: { 'ext-task-99': 1500 },
          mode: 'focus',
          durationSeconds: 1500,
          startedAt: '2026-10-19T09:00:00.000Z',
          completedAt: '2026-10-19T09:25:00.000Z',
          interrupted: false,
        },
      ];

      const breakdown = calculateTaskPeriodFocus(existingTasks, sessions, '7d');

      expect(breakdown).toHaveLength(2);

      const extItem = breakdown.find((b) => b.task.id === 'ext-task-99');
      expect(extItem).toBeDefined();
      expect(extItem?.task.title).toBe('Extension Research & Design');
      expect(extItem?.periodFocusSeconds).toBe(1500);
      expect(extItem?.periodPomodoroCount).toBe(1);
      expect(extItem?.percentOfTotalFocus).toBe(50);

      const webItem = breakdown.find((b) => b.task.id === 'web-task-1');
      expect(webItem).toBeDefined();
      expect(webItem?.periodFocusSeconds).toBe(1500);
      expect(webItem?.percentOfTotalFocus).toBe(50);
    });

    it('synthesizes multi-task allocations when session has multiple task IDs', () => {
      const existingTasks: TaskItem[] = [];

      const multiTaskSession: FocusSession = {
        id: 'sess-multi',
        taskId: 't-1',
        taskTitle: 'Task One',
        taskIds: ['t-1', 't-2'],
        taskTitles: ['Task One', 'Task Two'],
        taskTimeAllocations: {
          't-1': 900,
          't-2': 600,
        },
        mode: 'focus',
        durationSeconds: 1500,
        startedAt: '2026-10-19T10:00:00.000Z',
        completedAt: '2026-10-19T10:25:00.000Z',
        interrupted: false,
      };

      const breakdown = calculateTaskPeriodFocus(existingTasks, [multiTaskSession], 'today');

      expect(breakdown).toHaveLength(2);
      const item1 = breakdown.find((b) => b.task.id === 't-1');
      const item2 = breakdown.find((b) => b.task.id === 't-2');

      expect(item1?.task.title).toBe('Task One');
      expect(item1?.periodFocusSeconds).toBe(900);
      expect(item1?.percentOfTotalFocus).toBe(60);

      expect(item2?.task.title).toBe('Task Two');
      expect(item2?.periodFocusSeconds).toBe(600);
      expect(item2?.percentOfTotalFocus).toBe(40);
    });
  });

  describe('2. Timezone Date Handling with toLocalDateString', () => {
    it('properly extracts local date string from ISO format', () => {
      const d1 = '2026-10-19T23:30:00.000Z';
      const localStr = toLocalDateString(d1);
      expect(localStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      // Handles invalid/null gracefully
      expect(toLocalDateString(null)).toBe('');
      expect(toLocalDateString(undefined)).toBe('');
    });
  });

  describe('3. Cross-Tab & Extension Broadcast Sync', () => {
    it('receives SESSION_LOGGED from extension BroadcastChannel and registers focus time', async () => {
      // Setup initial empty focus sessions in localStorage for OPERATOR_UID
      localStorage.setItem(`nayra_${OPERATOR_UID}_focus_sessions`, JSON.stringify([]));

      render(<App />);

      // Navigate to Analytics
      const analyticsNav = screen.getAllByText('Analytics');
      fireEvent.click(analyticsNav[0]);

      await waitFor(() => {
        expect(screen.getByText('Productivity & Execution Analytics')).toBeInTheDocument();
      });

      // Simulate nayra-extension broadcasting SESSION_LOGGED
      const extChannel = new BroadcastChannel('nayra_focus_sync');
      const extSessionPayload: FocusSession = {
        id: 'ext-broadcast-sess-1',
        taskId: 'ext-linked-task',
        taskTitle: 'Fix Production Bug via Extension',
        taskIds: ['ext-linked-task'],
        taskTitles: ['Fix Production Bug via Extension'],
        taskTimeAllocations: { 'ext-linked-task': 1500 },
        tags: ['bugfix', 'extension'],
        mode: 'focus',
        durationSeconds: 1500,
        startedAt: new Date(Date.now() - 1500000).toISOString(),
        completedAt: new Date().toISOString(),
        interrupted: false,
      };

      act(() => {
        extChannel.postMessage({
          type: 'SESSION_LOGGED',
          session: extSessionPayload,
          source: 'extension',
        });
      });

      // Verify that Analytics now reflects the session and the linked task
      await waitFor(() => {
        // 1500s = 25m
        expect(screen.getByText('25m')).toBeInTheDocument();
        expect(screen.getByText('Fix Production Bug via Extension')).toBeInTheDocument();
      });

      extChannel.close();
    });
  });

  describe('4. Stale vs Recently Expired Timer Recovery on Mount', () => {
    it('recovers recently completed session (5m ago) on initial mount instead of discarding', async () => {
      const now = Date.now();
      const fiveMinutesAgo = now - 5 * 60 * 1000;
      const twentyFiveMinutesAgo = fiveMinutesAgo - 25 * 60 * 1000;

      // Simulate user closing tab or extension while timer had 5 minutes remaining of 25m focus
      localStorage.setItem(
        'nayra_focus_engine_state',
        JSON.stringify({
          mode: 'focus',
          timerState: 'running',
          remainingSeconds: 0,
          targetEndTime: fiveMinutesAgo,
          currentCycle: 1,
          selectedTaskId: 'recovered-task-id',
          activeTaskIds: ['recovered-task-id'],
          sessionIntention: 'Writing Critical Architecture Document',
          sessionTags: ['architecture'],
        })
      );

      localStorage.setItem(`nayra_${OPERATOR_UID}_focus_sessions`, JSON.stringify([]));

      render(<App />);

      // Navigate to Analytics
      const analyticsNav = screen.getAllByText('Analytics');
      fireEvent.click(analyticsNav[0]);

      await waitFor(() => {
        expect(screen.getByText('Productivity & Execution Analytics')).toBeInTheDocument();
        // Should have logged 25m focus session
        expect(screen.getByText('25m')).toBeInTheDocument();
        expect(screen.getByText('Writing Critical Architecture Document')).toBeInTheDocument();
      });
    });
  });
});
