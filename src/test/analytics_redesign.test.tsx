import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AnalyticsView } from '../views/AnalyticsView';
import { DataProvider } from '../context/DataContext';
import { AuthProvider } from '../context/AuthContext';
import { TaskItem, FocusSession, Habit, CalorieEntry, CATopic } from '../types';
import { DEFAULT_USER_SETTINGS } from '../data/defaultData';
import { format, subDays, addDays } from 'date-fns';
import {
  calculatePercentChange,
  calculateHorizonDeltas,
  detectPeakFocusWindow,
  computeRealOSBalance,
  generateAutomatedInsights,
  generateMarkdownSummary,
  exportAnalyticsAsJson,
} from '../views/analytics/analyticsUtils';

const TestHarness: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>
    <DataProvider>{children}</DataProvider>
  </AuthProvider>
);

describe('NAYRA Analytics Redesign (v2.5.0) — Algorithmic & Intelligence Engine', () => {
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

  it('computeRealOSBalance computes scores for all 4 health domains', () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const tasks: TaskItem[] = [
      {
        id: 't1',
        title: 'Task 1',
        taskListId: 'list_default',
        status: 'completed',
        priority: 'high',
        totalFocusSeconds: 0,
        pomodoroCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 't2',
        title: 'Task 2',
        taskListId: 'list_default',
        status: 'needsAction',
        priority: 'high',
        due: subDays(new Date(), 2).toISOString(),
        totalFocusSeconds: 0,
        pomodoroCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const sessions: FocusSession[] = [
      {
        id: 's1',
        taskId: null,
        taskTitle: null,
        mode: 'focus',
        durationSeconds: 7200,
        startedAt: `${todayStr}T09:00:00Z`,
        completedAt: `${todayStr}T11:00:00Z`,
        interrupted: false,
      },
    ];

    const habits: Habit[] = [
      {
        id: 'h1',
        title: 'Morning Meditation',
        category: 'mind',
        frequency: 'daily',
        targetDaysPerWeek: 7,
        color: '#3b82f6',
        currentStreak: 5,
        bestStreak: 10,
        archived: false,
        createdAt: new Date().toISOString(),
        completions: {},
      },
    ];

    const calories: CalorieEntry[] = [
      {
        id: 'c1',
        date: todayStr,
        calories: 2000,
        proteinGrams: 140,
        carbsGrams: 200,
        fatGrams: 65,
        mealType: 'lunch',
        foodName: 'Macro Lunch',
        loggedAt: new Date().toISOString(),
      },
    ];

    const caTopics: CATopic[] = [
      {
        id: 'ca1',
        title: 'Accounting Standards',
        chapterId: 'ch1',
        chapterName: 'Introduction to Accounting',
        topicNumber: 1,
        subjectId: 'accounting',
        status: 'completed',
        revisionCount: 2,
        nextRevisionDue: todayStr,
      },
    ];

    const scores = computeRealOSBalance(
      tasks,
      sessions,
      habits,
      calories,
      caTopics,
      DEFAULT_USER_SETTINGS,
      todayStr
    );

    expect(scores.length).toBe(4);
    // Calendar alignment has overdue high priority task -> Needs Review
    const timeAlignment = scores.find((s) => s.id === 'calendar-alignment');
    expect(timeAlignment?.statusText).toBe('Needs Review');

    // Deep work session has 0 interruptions -> Optimal or Balanced
    const deepWork = scores.find((s) => s.id === 'deep-work-ratio');
    expect(['Optimal', 'Balanced']).toContain(deepWork?.statusText);

    // Caloric adherence
    const caloric = scores.find((s) => s.id === 'caloric-adherence');
    expect(caloric?.statusText).toBe('Within Target');

    // CA topic has nextRevisionDue today -> Revision Due
    const caVelocity = scores.find((s) => s.id === 'ca-study-velocity');
    expect(caVelocity?.statusText).toBe('Revision Due');
  });

  it('generateAutomatedInsights produces heuristic insights for flow, habits, and CA', () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const sessions: FocusSession[] = [
      {
        id: 's1',
        taskId: null,
        taskTitle: null,
        mode: 'focus',
        durationSeconds: 1500,
        startedAt: `${todayStr}T09:00:00Z`,
        completedAt: `${todayStr}T09:25:00Z`,
        interrupted: false,
      },
      {
        id: 's2',
        taskId: null,
        taskTitle: null,
        mode: 'focus',
        durationSeconds: 1500,
        startedAt: `${todayStr}T09:30:00Z`,
        completedAt: `${todayStr}T09:55:00Z`,
        interrupted: false,
      },
      {
        id: 's3',
        taskId: null,
        taskTitle: null,
        mode: 'focus',
        durationSeconds: 1500,
        startedAt: `${todayStr}T10:00:00Z`,
        completedAt: `${todayStr}T10:25:00Z`,
        interrupted: false,
      },
    ];

    const habits: Habit[] = [
      {
        id: 'h1',
        title: 'Deep Study Routine',
        category: 'learning',
        frequency: 'daily',
        targetDaysPerWeek: 7,
        color: '#3b82f6',
        currentStreak: 7,
        bestStreak: 14,
        archived: false,
        createdAt: new Date().toISOString(),
        completions: {},
      },
    ];

    const caTopics: CATopic[] = [
      {
        id: 'ca1',
        title: 'The Indian Contract Act',
        chapterId: 'ch1',
        chapterName: 'Law of Contract',
        topicNumber: 1,
        subjectId: 'business_law',
        status: 'completed',
        revisionCount: 1,
        nextRevisionDue: todayStr,
      },
    ];

    const insights = generateAutomatedInsights(
      [],
      sessions,
      habits,
      [],
      caTopics,
      DEFAULT_USER_SETTINGS,
      todayStr
    );

    expect(insights.some((i) => i.id === 'flow-integrity')).toBe(true);
    expect(insights.some((i) => i.id === 'habit-champion')).toBe(true);
    expect(insights.some((i) => i.id === 'ca-revisions-due')).toBe(true);
  });

  it('generateMarkdownSummary creates clean executive report without AI clichés', () => {
    const summary = generateMarkdownSummary({
      horizonLabel: 'Last 7 Days',
      focusSeconds: 18000,
      pomodoroCount: 8,
      taskVelocityPercent: 85,
      completedTasks: 12,
      totalTasks: 14,
      habitConsistency: '92% completed',
      peakWindow: 'Late Morning (09:00 - 13:00)',
      healthScores: [
        {
          id: 'calendar-alignment',
          label: 'Time & Calendar Alignment',
          statusText: 'Optimal',
          variant: 'success',
          score: 95,
          details: '12/14 tasks completed',
        },
      ],
    });

    expect(summary).toContain('# NAYRA Executive Productivity Report');
    expect(summary).toContain('Horizon**: Last 7 Days');
    expect(summary).toContain('Time & Calendar Alignment**: Optimal (95/100)');
    expect(summary).toContain('Peak Focus Window**: Late Morning');
    expect(summary).not.toContain('✨');
    expect(summary).not.toContain('v1.0.0');
  });

  it('exportAnalyticsAsJson handles JSON blob creation and document interaction', () => {
    const appendChildSpy = vi.spyOn(document.body, 'appendChild');
    const removeChildSpy = vi.spyOn(document.body, 'removeChild');
    window.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    window.URL.revokeObjectURL = vi.fn();

    exportAnalyticsAsJson({ test: 'telemetry' }, 'test-export.json');

    expect(window.URL.createObjectURL).toHaveBeenCalled();
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');

    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });
});

describe('NAYRA Analytics Redesign (v2.5.0) — Component & Perspective Integration', () => {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    const sampleTasks: TaskItem[] = [
      {
        id: 't-study-1',
        title: 'Complete Accounting Chapter 1',
        taskListId: 'list_default',
        status: 'completed',
        priority: 'high',
        tags: ['study', 'ca-foundation'],
        due: todayStr,
        totalFocusSeconds: 3600,
        pomodoroCount: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: `${todayStr}T10:00:00Z`,
      },
      {
        id: 't-health-1',
        title: 'Macro Prep & Workout',
        taskListId: 'list_default',
        status: 'completed',
        priority: 'medium',
        tags: ['health'],
        due: todayStr,
        totalFocusSeconds: 1800,
        pomodoroCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: `${todayStr}T12:00:00Z`,
      },
    ];

    const sampleSessions: FocusSession[] = [
      {
        id: 's-1',
        mode: 'focus',
        durationSeconds: 3600,
        startedAt: `${todayStr}T09:00:00Z`,
        completedAt: `${todayStr}T10:00:00Z`,
        interrupted: false,
        taskId: 't-study-1',
        taskTitle: 'Complete Accounting Chapter 1',
      },
      {
        id: 's-2',
        mode: 'focus',
        durationSeconds: 1800,
        startedAt: `${todayStr}T11:30:00Z`,
        completedAt: `${todayStr}T12:00:00Z`,
        interrupted: false,
        taskId: 't-health-1',
        taskTitle: 'Macro Prep & Workout',
      },
    ];

    const sampleHabits: Habit[] = [
      {
        id: 'h-1',
        title: 'Daily Revision',
        category: 'learning',
        frequency: 'daily',
        targetDaysPerWeek: 7,
        color: '#3b82f6',
        currentStreak: 6,
        bestStreak: 12,
        archived: false,
        createdAt: new Date().toISOString(),
        completions: {
          [todayStr]: true,
          [yesterdayStr]: true,
        },
      },
    ];

    const sampleCalories: CalorieEntry[] = [
      {
        id: 'c-1',
        date: todayStr,
        calories: 650,
        proteinGrams: 45,
        carbsGrams: 60,
        fatGrams: 20,
        mealType: 'lunch',
        foodName: 'Post-workout fuel',
        loggedAt: new Date().toISOString(),
      },
    ];

    localStorage.setItem('nayra_test_operator_id_tasks', JSON.stringify(sampleTasks));
    localStorage.setItem('nayra_test_operator_id_focus_sessions', JSON.stringify(sampleSessions));
    localStorage.setItem('nayra_test_operator_id_habits', JSON.stringify(sampleHabits));
    localStorage.setItem('nayra_test_operator_id_calories', JSON.stringify(sampleCalories));
  });

  it('renders all 6 perspective tabs and navigates smoothly between them', async () => {
    render(
      <TestHarness>
        <AnalyticsView />
      </TestHarness>
    );

    await waitFor(() => {
      expect(screen.getByText('Productivity & Execution Analytics')).toBeInTheDocument();
    });

    // Check all 6 perspective buttons in filter bar
    expect(screen.getByRole('button', { name: 'Executive Overview' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Focus Lab' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tasks & Velocity' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Habits & Streaks' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nutrition & Fuel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'CA Foundation' })).toBeInTheDocument();

    // 1. Executive Overview shows OS Health score
    expect(screen.getByText('Personal Operating System Balance')).toBeInTheDocument();

    // 2. Switch to Focus Lab
    fireEvent.click(screen.getByRole('button', { name: 'Focus Lab' }));
    expect(screen.getByText('7-Day Deep Work Distribution')).toBeInTheDocument();
    expect(screen.getByText('Highest Focus Allocation Tasks')).toBeInTheDocument();

    // 3. Switch to Tasks & Velocity
    fireEvent.click(screen.getByRole('button', { name: 'Tasks & Velocity' }));
    expect(screen.getByText('High Priority Throughput')).toBeInTheDocument();
    expect(screen.getByText('Tag Performance & Time Allocation')).toBeInTheDocument();

    // 4. Switch to Habits & Streaks
    fireEvent.click(screen.getByRole('button', { name: 'Habits & Streaks' }));
    expect(screen.getByText('Habit Consistency & 7-Day Adherence Grid')).toBeInTheDocument();
    expect(screen.getByText('Daily Revision')).toBeInTheDocument();

    // 5. Switch to Nutrition & Fuel
    fireEvent.click(screen.getByRole('button', { name: 'Nutrition & Fuel' }));
    expect(screen.getByText('Macro Energy Proportion')).toBeInTheDocument();
    expect(screen.getByText('Meal Distribution')).toBeInTheDocument();

    // 6. Switch to CA Foundation
    fireEvent.click(screen.getByRole('button', { name: 'CA Foundation' }));
    expect(screen.getByText('ICAI Foundation 4-Paper Progress Architecture')).toBeInTheDocument();
    expect(screen.getByText('Paper 1: Accounting')).toBeInTheDocument();
  });

  it('allows domain jump from Executive Overview directly to sub-perspectives', async () => {
    render(
      <TestHarness>
        <AnalyticsView />
      </TestHarness>
    );

    await waitFor(() => {
      expect(screen.getByText('Personal Operating System Balance')).toBeInTheDocument();
    });

    const jumpBtn = screen.getByRole('button', { name: /Focus Lab Heatmap & hourly flow/i });
    fireEvent.click(jumpBtn);

    // Should now be on Focus Lab perspective
    expect(screen.getByText('7-Day Deep Work Distribution')).toBeInTheDocument();
  });

  it('triggers clipboard copy when Copy Report button is clicked', async () => {
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

  it('triggers JSON export download when Export JSON button is clicked', async () => {
    window.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    window.URL.revokeObjectURL = vi.fn();

    render(
      <TestHarness>
        <AnalyticsView />
      </TestHarness>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Export JSON/i })).toBeInTheDocument();
    });

    const exportBtn = screen.getByRole('button', { name: /Export JSON/i });
    fireEvent.click(exportBtn);

    expect(window.URL.createObjectURL).toHaveBeenCalled();
  });

  it('filters data interactively using tag filter chips and clears filter', async () => {
    render(
      <TestHarness>
        <AnalyticsView />
      </TestHarness>
    );

    await waitFor(() => {
      expect(screen.getByText('Filter by Tag:')).toBeInTheDocument();
    });

    // Click on the 'tag: study' chip
    const studyChip = screen.getByRole('button', { name: /tag: study/i });
    fireEvent.click(studyChip);

    // Active tag indicator should display Active: [study]
    expect(screen.getByText('Active: [study]')).toBeInTheDocument();

    // Click Clear Filter
    const clearBtn = screen.getByRole('button', { name: /Clear Filter/i });
    fireEvent.click(clearBtn);

    expect(screen.getByText('Showing all activities')).toBeInTheDocument();
  });
});
