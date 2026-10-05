import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import App from '../App';
import { deduplicateFocusSessions } from '../context/DataContext';
import { FocusSession } from '../types';

describe('Focus & Pomodoro Timer Bugfix & Analytics Integrity Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('deduplicateFocusSessions sanitizes duplicate sessions and filters out breaks', () => {
    const rawSessions: FocusSession[] = [
      {
        id: 's1',
        taskId: null,
        taskTitle: null,
        mode: 'focus',
        durationSeconds: 1500,
        startedAt: '2026-10-05T10:00:00.000Z',
        completedAt: '2026-10-05T10:25:00.000Z',
        interrupted: false,
      },
      // Duplicate of s1 within 20 seconds
      {
        id: 's1_dup',
        taskId: null,
        taskTitle: null,
        mode: 'focus',
        durationSeconds: 1500,
        startedAt: '2026-10-05T10:00:00.000Z',
        completedAt: '2026-10-05T10:25:15.000Z',
        interrupted: false,
      },
      // Stray break session that was previously logged in bugged versions
      {
        id: 's_break',
        taskId: null,
        taskTitle: null,
        mode: 'shortBreak',
        durationSeconds: 300,
        startedAt: '2026-10-05T10:25:00.000Z',
        completedAt: '2026-10-05T10:30:00.000Z',
        interrupted: false,
      },
      // Valid distinct second session 1 hour later
      {
        id: 's2',
        taskId: null,
        taskTitle: null,
        mode: 'focus',
        durationSeconds: 1500,
        startedAt: '2026-10-05T11:00:00.000Z',
        completedAt: '2026-10-05T11:25:00.000Z',
        interrupted: false,
      },
    ];

    const cleaned = deduplicateFocusSessions(rawSessions);

    // Should have only 2 sessions (s2 and s1_dup sorted descending), with duplicate s1 and stray s_break removed
    expect(cleaned).toHaveLength(2);
    expect(cleaned.map((s) => s.id)).toEqual(['s2', 's1_dup']);
    expect(cleaned.every((s) => s.mode === 'focus')).toBe(true);
  });

  it('does not log completed sessions when mounting with stale expired localStorage timer', async () => {
    // Simulate stale running timer from 2 hours ago left in localStorage
    localStorage.setItem(
      'nayra_focus_engine_state',
      JSON.stringify({
        mode: 'focus',
        timerState: 'running',
        remainingSeconds: 0,
        targetEndTime: Date.now() - 3600000,
        currentCycle: 1,
        selectedTaskId: null,
      })
    );

    // Initial empty sessions for test_operator_id
    localStorage.setItem('nayra_test_operator_id_focus_sessions', JSON.stringify([]));

    render(<App />);

    // Navigate to Analytics
    const analyticsLinks = screen.getAllByText('Analytics');
    fireEvent.click(analyticsLinks[0]);

    await waitFor(() => {
      // Total focus time should be 0m, not 25m phantom time
      expect(screen.getByText('Productivity & Execution Analytics')).toBeInTheDocument();
      expect(screen.getByText('Total Focus Time')).toBeInTheDocument();
      expect(screen.getByText('0m')).toBeInTheDocument();
    });
  });

  it('only accumulates focus time for focus mode and renders animated metrics correctly', async () => {
    // Preload one valid 25m focus session for test_operator_id
    const validSession: FocusSession = {
      id: 'focus_1',
      taskId: null,
      taskTitle: null,
      mode: 'focus',
      durationSeconds: 1500,
      startedAt: new Date(Date.now() - 1500000).toISOString(),
      completedAt: new Date().toISOString(),
      interrupted: false,
    };

    localStorage.setItem(
      'nayra_test_operator_id_focus_sessions',
      JSON.stringify([validSession])
    );

    render(<App />);

    const analyticsLinks = screen.getAllByText('Analytics');
    fireEvent.click(analyticsLinks[0]);

    await waitFor(() => {
      expect(screen.getByText('Productivity & Execution Analytics')).toBeInTheDocument();
      expect(screen.getByText('Total Focus Time')).toBeInTheDocument();
      expect(screen.getByText('25m')).toBeInTheDocument();
      expect(screen.getByText(/1 sessions • 1 all-time/i)).toBeInTheDocument();
    });
  });
});
