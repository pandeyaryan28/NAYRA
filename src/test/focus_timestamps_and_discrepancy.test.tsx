import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  formatSessionTimeRange,
  formatSessionDate,
  calculateTaskPeriodFocus,
} from '../views/analytics/analyticsUtils';
import { TaskFocusBreakdown } from '../views/analytics/TaskFocusBreakdown';
import { FocusSessionTimeline } from '../views/analytics/FocusSessionTimeline';
import { TaskPeriodFocusItem } from '../views/analytics/types';
import { FocusSession, TaskItem } from '../types';
import { DataContext } from '../context/DataContext';

describe('Focus Timestamps & Discrepancy Tracking (v2.11.1)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  describe('1. Timestamp Formatting Utilities', () => {
    it('formats exact session time intervals accurately', () => {
      // 10:00:00 UTC = exact test ISO
      const startIso = '2026-10-19T10:00:00.000Z';
      const endIso = '2026-10-19T10:25:00.000Z';

      const timeRange = formatSessionTimeRange(startIso, endIso);
      expect(timeRange).toContain('–');
      expect(timeRange.length).toBeGreaterThan(5);

      const dateStr = formatSessionDate(endIso);
      expect(dateStr).toContain('2026');
      expect(dateStr).toContain('Oct');
    });

    it('gracefully falls back when start time is omitted', () => {
      const endIso = '2026-10-19T10:25:00.000Z';
      const timeRange = formatSessionTimeRange(undefined, endIso);
      expect(timeRange).toContain('–');
    });
  });

  describe('2. Contributing Sessions Attachment in calculateTaskPeriodFocus', () => {
    it('attaches contributing sessions to the corresponding task breakdown item', () => {
      const tasks: TaskItem[] = [
        {
          id: 'dsa-task-1',
          taskListId: '@default',
          title: 'dsa task',
          status: 'needsAction',
          completed: false,
          priority: 'high',
          totalFocusSeconds: 1500,
          pomodoroCount: 1,
          createdAt: '2026-10-19T08:00:00.000Z',
          updatedAt: '2026-10-19T08:00:00.000Z',
        },
      ];

      const sessions: FocusSession[] = [
        {
          id: 'sess-dsa-1',
          taskId: 'dsa-task-1',
          taskTitle: 'dsa task',
          mode: 'focus',
          durationSeconds: 1500,
          startedAt: '2026-10-19T10:00:00.000Z',
          completedAt: '2026-10-19T10:25:00.000Z',
          interrupted: false,
        },
      ];

      const breakdown = calculateTaskPeriodFocus(tasks, sessions, 'today');
      expect(breakdown).toHaveLength(1);
      expect(breakdown[0].sessions).toBeDefined();
      expect(breakdown[0].sessions).toHaveLength(1);
      expect(breakdown[0].sessions![0].id).toBe('sess-dsa-1');
    });
  });

  describe('3. TaskFocusBreakdown Expandable Timestamps & Discrepancy UI', () => {
    it('renders task, shows expand button, reveals session timestamps and detects double entries', async () => {
      const deleteFocusSessionMock = vi.fn().mockResolvedValue(undefined);
      const reconcileTaskFocusMetricsMock = vi.fn().mockResolvedValue(1);

      const mockTask: TaskItem = {
        id: 'dsa-task',
        taskListId: '@default',
        title: 'dsa task',
        status: 'needsAction',
        completed: false,
        priority: 'high',
        totalFocusSeconds: 3000,
        pomodoroCount: 2,
        createdAt: '2026-10-19T08:00:00.000Z',
        updatedAt: '2026-10-19T08:00:00.000Z',
      };

      // Two sessions close together (duplicate interval)
      const mockSessions: FocusSession[] = [
        {
          id: 'sess-1',
          taskId: 'dsa-task',
          taskTitle: 'dsa task',
          mode: 'focus',
          durationSeconds: 1500,
          startedAt: '2026-10-19T10:00:00.000Z',
          completedAt: '2026-10-19T10:25:00.000Z',
          interrupted: false,
        },
        {
          id: 'sess-2',
          taskId: 'dsa-task',
          taskTitle: 'dsa task',
          mode: 'focus',
          durationSeconds: 1500,
          startedAt: '2026-10-19T10:02:00.000Z',
          completedAt: '2026-10-19T10:27:00.000Z',
          interrupted: false,
        },
      ];

      const taskPeriodItems: TaskPeriodFocusItem[] = [
        {
          task: mockTask,
          periodFocusSeconds: 3000,
          periodPomodoroCount: 2,
          percentOfTotalFocus: 100,
          sessions: mockSessions,
        },
      ];

      render(
        <DataContext.Provider
          value={
            {
              tasks: [mockTask],
              focusSessions: mockSessions,
              deleteFocusSession: deleteFocusSessionMock,
              reconcileTaskFocusMetrics: reconcileTaskFocusMetricsMock,
            } as any
          }
        >
          <TaskFocusBreakdown
            taskPeriodItems={taskPeriodItems}
            timeHorizon="today"
            activeTagFilter={null}
            setActiveTagFilter={() => {}}
            horizonTotalFocusSec={3000}
          />
        </DataContext.Provider>
      );

      // Task title should be rendered
      expect(screen.getByText('dsa task')).toBeDefined();

      // Find expand button
      const expandBtn = screen.getByTitle('View session timestamps and audit discrepancies');
      expect(expandBtn).toBeDefined();

      // Click to expand timestamps
      fireEvent.click(expandBtn);

      // Contributing focus sessions section header should appear
      expect(screen.getByText(/Contributing Focus Sessions/)).toBeDefined();

      // Duplicate interval warning badge should appear
      const dupeBadges = screen.getAllByText('Duplicate interval');
      expect(dupeBadges.length).toBeGreaterThanOrEqual(1);

      // Audit & Reconcile button in header
      const reconcileBtn = screen.getByTitle(
        'Recalculate task focus time from verified session records to heal double-counted time'
      );
      fireEvent.click(reconcileBtn);

      await waitFor(() => {
        expect(reconcileTaskFocusMetricsMock).toHaveBeenCalled();
      });
    });
  });

  describe('4. FocusSessionTimeline Component', () => {
    it('renders chronological session intervals and duplicate alerts', () => {
      const deleteFocusSessionMock = vi.fn().mockResolvedValue(undefined);

      const tasks: TaskItem[] = [
        {
          id: 'dsa-1',
          taskListId: '@default',
          title: 'dsa task',
          status: 'needsAction',
          completed: false,
          priority: 'high',
          totalFocusSeconds: 1500,
          pomodoroCount: 1,
          createdAt: '2026-10-19T08:00:00.000Z',
          updatedAt: '2026-10-19T08:00:00.000Z',
        },
      ];

      const sessions: FocusSession[] = [
        {
          id: 'sess-timeline-1',
          taskId: 'dsa-1',
          taskTitle: 'dsa task',
          mode: 'focus',
          durationSeconds: 1500,
          startedAt: '2026-10-19T11:00:00.000Z',
          completedAt: '2026-10-19T11:25:00.000Z',
          interrupted: false,
        },
        {
          id: 'sess-timeline-2',
          taskId: 'dsa-1',
          taskTitle: 'dsa task',
          mode: 'focus',
          durationSeconds: 1500,
          startedAt: '2026-10-19T11:03:00.000Z',
          completedAt: '2026-10-19T11:28:00.000Z',
          interrupted: false,
        },
      ];

      render(
        <DataContext.Provider
          value={
            {
              tasks,
              focusSessions: sessions,
              deleteFocusSession: deleteFocusSessionMock,
            } as any
          }
        >
          <FocusSessionTimeline sessions={sessions} tasks={tasks} timeHorizon="today" />
        </DataContext.Provider>
      );

      expect(screen.getByText('Focus Session Log & Timeline')).toBeDefined();
      expect(screen.getByText(/Potential Duplicate/)).toBeDefined();
      expect(screen.getAllByText('Task: dsa task').length).toBe(2);
    });
  });
});
