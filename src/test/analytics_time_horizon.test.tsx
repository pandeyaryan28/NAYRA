import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AnalyticsView } from '../views/AnalyticsView';
import { DataProvider } from '../context/DataContext';
import { AuthProvider } from '../context/AuthContext';
import { TaskItem, FocusSession } from '../types';
import { format, subDays, addDays } from 'date-fns';

const TestHarness: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>
    <DataProvider>{children}</DataProvider>
  </AuthProvider>
);

describe('Analytics Time Horizon & Tag Filtering Engine', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders time horizon buttons for Today, Yesterday, Tomorrow, 7D, 30D, All Time', async () => {
    render(
      <TestHarness>
        <AnalyticsView />
      </TestHarness>
    );

    await waitFor(() => {
      expect(screen.getByText('Productivity & Execution Analytics')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Yesterday' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tomorrow' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Last 7 Days' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Last 30 Days' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'All Time' })).toBeInTheDocument();
  });

  it('switches between Today, Yesterday, and Tomorrow updating chart and metrics', async () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');

    const sampleTasks: TaskItem[] = [
      {
        id: 't-today',
        title: 'Complete Accounting Review',
        taskListId: 'list_default',
        status: 'completed',
        priority: 'high',
        tags: ['study', 'ca-foundation'],
        due: todayStr,
        totalFocusSeconds: 1800,
        pomodoroCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: `${todayStr}T10:00:00Z`,
      },
      {
        id: 't-tomorrow',
        title: 'Business Laws Contract Act',
        taskListId: 'list_default',
        status: 'needsAction',
        priority: 'high',
        tags: ['study'],
        due: tomorrowStr,
        totalFocusSeconds: 0,
        pomodoroCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const sampleSessions: FocusSession[] = [
      {
        id: 's-today',
        mode: 'focus',
        durationSeconds: 1800,
        startedAt: `${todayStr}T10:00:00Z`,
        completedAt: `${todayStr}T10:30:00Z`,
        interrupted: false,
        taskId: 't-today',
        taskTitle: 'Complete Accounting Review',
      },
      {
        id: 's-yesterday',
        mode: 'focus',
        durationSeconds: 3600,
        startedAt: `${yesterdayStr}T13:30:00Z`,
        completedAt: `${yesterdayStr}T14:30:00Z`,
        interrupted: false,
        taskId: 't-yesterday',
        taskTitle: 'Maths Ratio and Proportion',
      },
    ];

    localStorage.setItem('nayra_test_operator_id_tasks', JSON.stringify(sampleTasks));
    localStorage.setItem('nayra_test_operator_id_focus_sessions', JSON.stringify(sampleSessions));

    render(
      <TestHarness>
        <AnalyticsView />
      </TestHarness>
    );

    // Switch to "Today"
    const todayBtn = screen.getByRole('button', { name: 'Today' });
    fireEvent.click(todayBtn);
    expect(screen.getByText(/Live activity and progress for today/i)).toBeInTheDocument();
    expect(screen.getByText("Today's Hourly Deep Work Distribution")).toBeInTheDocument();

    // Switch to "Yesterday"
    const yesterdayBtn = screen.getByRole('button', { name: 'Yesterday' });
    fireEvent.click(yesterdayBtn);
    expect(screen.getByText(/Accomplishments and focus summary from yesterday/i)).toBeInTheDocument();
    expect(screen.getByText("Yesterday's Hourly Deep Work Distribution")).toBeInTheDocument();

    // Switch to "Tomorrow"
    const tomorrowBtn = screen.getByRole('button', { name: 'Tomorrow' });
    fireEvent.click(tomorrowBtn);
    expect(screen.getByText(/Forward schedule and workload projection for tomorrow/i)).toBeInTheDocument();
    expect(screen.getByText("Tomorrow's Scheduled Task Workload by Priority")).toBeInTheDocument();
    expect(screen.getByText('High Priority')).toBeInTheDocument();
  });

  it('filters activities when clicking tag filter buttons and clears filter', async () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const sampleTasks: TaskItem[] = [
      {
        id: 't-ca',
        title: 'CA Accounts Practice',
        taskListId: 'list_default',
        status: 'completed',
        priority: 'high',
        tags: ['ca-foundation'],
        due: todayStr,
        totalFocusSeconds: 3600,
        pomodoroCount: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: `${todayStr}T10:00:00Z`,
      },
      {
        id: 't-work',
        title: 'Team Meeting Prep',
        taskListId: 'list_default',
        status: 'completed',
        priority: 'medium',
        tags: ['work'],
        due: todayStr,
        totalFocusSeconds: 1200,
        pomodoroCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: `${todayStr}T11:00:00Z`,
      },
    ];

    localStorage.setItem('nayra_test_operator_id_tasks', JSON.stringify(sampleTasks));

    render(
      <TestHarness>
        <AnalyticsView />
      </TestHarness>
    );

    await waitFor(() => {
      expect(screen.getByText('Filter by Tag:')).toBeInTheDocument();
    });

    // Verify tag buttons are rendered
    const caTagBtn = screen.getByRole('button', { name: /ca-foundation/i });
    expect(caTagBtn).toBeInTheDocument();

    // Click to filter by #ca-foundation
    fireEvent.click(caTagBtn);
    expect(screen.getByText(/Active: \[ca-foundation\]/i)).toBeInTheDocument();
    expect(screen.getByText(/Clear Filter/i)).toBeInTheDocument();

    // Click Clear Filter
    const clearBtn = screen.getByRole('button', { name: /Clear Filter/i });
    fireEvent.click(clearBtn);
    expect(screen.getByText(/Showing all activities/i)).toBeInTheDocument();
  });
});
