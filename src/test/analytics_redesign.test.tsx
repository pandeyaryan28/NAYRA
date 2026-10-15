import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AnalyticsView } from '../views/AnalyticsView';
import { DataProvider } from '../context/DataContext';
import { AuthProvider } from '../context/AuthContext';
import { TaskItem, FocusSession } from '../types';
import { format, subDays, addDays } from 'date-fns';
import {
  calculatePercentChange,
  calculateHorizonDeltas,
  detectPeakFocusWindow,
  calculateTaskPeriodFocus,
  generateMarkdownSummary,
} from '../views/analytics/analyticsUtils';

const TestHarness: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>
    <DataProvider>{children}</DataProvider>
  </AuthProvider>
);

describe('NAYRA Decluttered Analytics (v2.5.1) — Algorithmic Engine', () => {
  it('calculatePercentChange handles zero-baseline and percentage diffs correctly', () => {
    expect(calculatePercentChange(100, 0)).toBe(100);
    expect(calculatePercentChange(0, 0)).toBe(0);
    expect(calculatePercentChange(150, 100)).toBe(50);
    expect(calculatePercentChange(50, 100)).toBe(-50);
  });

  it('calculateHorizonDeltas computes period-over-period differences', () => {
    const deltas = calculateHorizonDeltas(7200, 3600, 8, 4, 3, 2);
    expect(deltas.focusSecondsDiff).toBe(3600);
    expect(deltas.focusSecondsPercent).toBe(100);
    expect(deltas.completedTasksDiff).toBe(4);
    expect(deltas.completedTasksPercent).toBe(100);
    expect(deltas.pomodoroCountDiff).toBe(1);
  });

  it('detectPeakFocusWindow identifies peak time windows and returns accurate stats', () => {
    const emptyResult = detectPeakFocusWindow([]);
    expect(emptyResult.windowName).toBe('Not enough data');
    expect(emptyResult.percentage).toBe(0);

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const sessions: FocusSession[] = [
      {
        id: 's1',
        taskId: null,
        taskTitle: null,
        mode: 'focus',
        durationSeconds: 3600,
        startedAt: `${todayStr}T09:30:00Z`,
        completedAt: `${todayStr}T10:30:00.000Z`,
        interrupted: false,
      },
      {
        id: 's2',
        taskId: null,
        taskTitle: null,
        mode: 'focus',
        durationSeconds: 1800,
        startedAt: `${todayStr}T11:00:00Z`,
        completedAt: `${todayStr}T11:30:00.000Z`,
        interrupted: false,
      },
    ];

    const result = detectPeakFocusWindow(sessions);
    expect(result.totalSeconds).toBe(5400);
    expect(result.percentage).toBe(100);
    expect(result.windowName).not.toBe('Not enough data');
  });

  it('calculateTaskPeriodFocus accurately aggregates focus time per task without 4-5 task truncation', () => {
    const tasks: TaskItem[] = Array.from({ length: 8 }, (_, idx) => ({
      id: `task-${idx + 1}`,
      title: `Task Title ${idx + 1}`,
      taskListId: 'list_default',
      status: idx % 2 === 0 ? 'completed' : 'needsAction',
      priority: 'medium',
      totalFocusSeconds: (idx + 1) * 600,
      pomodoroCount: idx + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const sessions: FocusSession[] = [
      {
        id: 's1',
        taskId: 'task-1',
        taskTitle: 'Task Title 1',
        mode: 'focus',
        durationSeconds: 1200,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        interrupted: false,
      },
      {
        id: 's2',
        taskId: 'task-2',
        taskTitle: 'Task Title 2',
        mode: 'focus',
        durationSeconds: 1800,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        interrupted: false,
      },
      {
        id: 's3',
        taskId: null,
        taskTitle: null,
        taskTimeAllocations: {
          'task-3': 600,
          'task-4': 600,
        },
        mode: 'focus',
        durationSeconds: 1200,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        interrupted: false,
      },
    ];

    const periodFocus = calculateTaskPeriodFocus(tasks, sessions, '7d');

    // All 8 tasks must be processed (NO TRUNCATION!)
    expect(periodFocus).toHaveLength(8);

    const t1 = periodFocus.find((p) => p.task.id === 'task-1');
    expect(t1?.periodFocusSeconds).toBe(1200);
    expect(t1?.periodPomodoroCount).toBe(1);

    const t2 = periodFocus.find((p) => p.task.id === 'task-2');
    expect(t2?.periodFocusSeconds).toBe(1800);
    expect(t2?.periodPomodoroCount).toBe(1);

    const t3 = periodFocus.find((p) => p.task.id === 'task-3');
    expect(t3?.periodFocusSeconds).toBe(600);

    const t8 = periodFocus.find((p) => p.task.id === 'task-8');
    expect(t8?.periodFocusSeconds).toBe(0); // No sessions in this period
  });

  it('generateMarkdownSummary creates clean executive report', () => {
    const summary = generateMarkdownSummary({
      horizonLabel: 'Last 7 Days',
      focusSeconds: 7200,
      pomodoroCount: 3,
      taskVelocityPercent: 100,
      completedTasks: 4,
      totalTasks: 4,
      topTasks: [
        { title: 'Accounting Study', focusTime: '1h 30m' },
        { title: 'Maths Revision', focusTime: '30m' },
      ],
    });

    expect(summary).toContain('# NAYRA Productivity Summary');
    expect(summary).toContain('Time Horizon**: Last 7 Days');
    expect(summary).toContain('Total Focus Time**: 2h 0m');
    expect(summary).toContain('Accounting Study**: 1h 30m');
  });
});

describe('NAYRA Decluttered Analytics (v2.5.1) — Component Integration & Full Task Breakdown', () => {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    // Create 8 sample tasks to verify that ALL tasks are visible and not capped at 4-5
    const sampleTasks: TaskItem[] = Array.from({ length: 8 }, (_, idx) => ({
      id: `task-${idx + 1}`,
      title: `Study Session Module ${idx + 1}`,
      taskListId: 'list_default',
      status: idx % 2 === 0 ? 'completed' : 'needsAction',
      priority: idx === 0 ? 'high' : idx === 1 ? 'medium' : 'low',
      tags: idx < 4 ? ['ca-foundation', 'study'] : ['general'],
      due: todayStr,
      totalFocusSeconds: (idx + 1) * 900,
      pomodoroCount: idx + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: idx % 2 === 0 ? `${todayStr}T10:00:00Z` : undefined,
    }));

    // Create focus sessions linked to these tasks with distinct timestamps (avoid deduplication)
    const sampleSessions: FocusSession[] = sampleTasks.map((t, idx) => {
      const hour = String(8 + idx).padStart(2, '0');
      return {
        id: `s-${idx + 1}`,
        taskId: t.id,
        taskTitle: t.title,
        mode: 'focus',
        durationSeconds: (idx + 1) * 900,
        startedAt: `${todayStr}T${hour}:00:00Z`,
        completedAt: `${todayStr}T${hour}:45:00Z`,
        interrupted: false,
      };
    });

    localStorage.setItem('nayra_test_operator_id_tasks', JSON.stringify(sampleTasks));
    localStorage.setItem('nayra_test_operator_id_focus_sessions', JSON.stringify(sampleSessions));
  });

  it('renders decluttered KPI strip without duplicate domain tabs', async () => {
    render(
      <TestHarness>
        <AnalyticsView />
      </TestHarness>
    );

    await waitFor(() => {
      expect(screen.getByText('Productivity & Execution Analytics')).toBeInTheDocument();
    });

    // 4 Core KPI cards must be present
    expect(screen.getByText('Total Focus Time')).toBeInTheDocument();
    expect(screen.getByText('Task Velocity')).toBeInTheDocument();
    expect(screen.getByText('Habit Adherence')).toBeInTheDocument();
    expect(screen.getByText('Peak Focus Window')).toBeInTheDocument();

    // Duplicate domain tabs MUST NOT exist
    expect(screen.queryByRole('button', { name: 'Executive Overview' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Focus Lab' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Habits & Streaks' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Nutrition & Fuel' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'CA Foundation' })).not.toBeInTheDocument();
  });

  it('renders EVERY task in the Task Focus Breakdown with NO 4-5 task truncation', async () => {
    render(
      <TestHarness>
        <AnalyticsView />
      </TestHarness>
    );

    await waitFor(() => {
      expect(screen.getByText('Task Focus Breakdown')).toBeInTheDocument();
    });

    // Verify all 8 tasks are in the DOM (not just 4 or 5!)
    for (let i = 1; i <= 8; i++) {
      expect(screen.getByText(`Study Session Module ${i}`)).toBeInTheDocument();
    }
  });

  it('filters tasks interactively using search input', async () => {
    render(
      <TestHarness>
        <AnalyticsView />
      </TestHarness>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search tasks by title or tag...')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search tasks by title or tag...');

    // Search for Module 7
    fireEvent.change(searchInput, { target: { value: 'Module 7' } });

    expect(screen.getByText('Study Session Module 7')).toBeInTheDocument();
    expect(screen.queryByText('Study Session Module 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Study Session Module 2')).not.toBeInTheDocument();

    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    expect(screen.getByText('Study Session Module 1')).toBeInTheDocument();
  });

  it('switches between Focused Only and All Tasks mode', async () => {
    render(
      <TestHarness>
        <AnalyticsView />
      </TestHarness>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /All Tasks/i })).toBeInTheDocument();
    });

    const allTasksBtn = screen.getByRole('button', { name: /All Tasks/i });
    fireEvent.click(allTasksBtn);

    const focusedBtn = screen.getByRole('button', { name: /Focused Only/i });
    fireEvent.click(focusedBtn);

    expect(screen.getByText('Task Focus Breakdown')).toBeInTheDocument();
  });

  it('copies executive markdown report on Copy Report click', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <TestHarness>
        <AnalyticsView />
      </TestHarness>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Copy Report/i })).toBeInTheDocument();
    });

    const copyBtn = screen.getByRole('button', { name: /Copy Report/i });
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalled();
    expect(await screen.findByText('Copied!')).toBeInTheDocument();
  });
});
