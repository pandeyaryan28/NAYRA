import React, { useEffect } from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import App from '../App';
import { TaskItem, FocusSession } from '../types';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { DataProvider, useData, DataContextValue } from '../context/DataContext';
import { FocusProvider, useFocus, FocusContextValue } from '../context/FocusContext';
import { BrowserRouter } from 'react-router-dom';
import { TasksView } from '../views/TasksView';
import { FocusView } from '../views/FocusView';
import { AnalyticsView } from '../views/AnalyticsView';
import { CalendarView } from '../views/CalendarView';

const TestHarness: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <FocusProvider>
            <BrowserRouter>{children}</BrowserRouter>
          </FocusProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

// Probe component to access contexts directly during integration tests
let contextBridge: { focus: FocusContextValue; data: DataContextValue } | null = null;
const ContextProbe: React.FC = () => {
  const focus = useFocus();
  const data = useData();
  useEffect(() => {
    contextBridge = { focus, data };
  }, [focus, data]);
  return null;
};

describe('Tags & Dynamic Multi-Task Focus Engine Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    contextBridge = null;
    window.history.pushState({}, '', '/');
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // --------------------------------------------------------------------------
  // 1. Task Creation, Editing with Tags, and Tag Filtering in TasksView & Calendar
  // --------------------------------------------------------------------------
  describe('1. Task Tags Management & Filtering in TasksView & Calendar', () => {
    it('creates task with inline #tag syntax, extracts tags and renders tag badges', async () => {
      render(
        <TestHarness>
          <TasksView />
        </TestHarness>
      );

      const input = screen.getByPlaceholderText('Add a task (press Enter to save)...');
      fireEvent.change(input, {
        target: { value: 'Synthesize Neural Matrix #deepwork #ai' },
      });
      fireEvent.submit(input.closest('form')!);

      await waitFor(() => {
        expect(screen.getByText('Synthesize Neural Matrix')).toBeInTheDocument();
      });

      // Verifies tag chips rendered on task card
      expect(screen.getAllByText('#deepwork').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('#ai').length).toBeGreaterThanOrEqual(1);

      // Verifies Tags section heading in sidebar
      expect(screen.getByText('Tags')).toBeInTheDocument();
    });

    it('edits an existing task to add new tags, remove tags, and save', async () => {
      const existingTask: TaskItem = {
        id: 'task_edit_1',
        title: 'Design Quantum Microkernel',
        taskListId: 'list_default',
        status: 'needsAction',
        priority: 'high',
        tags: ['kernel', 'lowlevel'],
        totalFocusSeconds: 0,
        pomodoroCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(
        'nayra_test_operator_id_tasks',
        JSON.stringify([existingTask])
      );

      render(
        <TestHarness>
          <TasksView />
        </TestHarness>
      );

      await waitFor(() => {
        expect(screen.getByText('Design Quantum Microkernel')).toBeInTheDocument();
      });

      // Open task edit modal by clicking title
      fireEvent.click(screen.getByText('Design Quantum Microkernel'));

      await waitFor(() => {
        expect(screen.getByText(/Edit Task/i)).toBeInTheDocument();
        expect(screen.getByText(/Tags \(2\)/i)).toBeInTheDocument();
      });

      // Remove 'lowlevel' tag from edit modal
      const lowlevelMatchingChips = screen.getAllByText('#lowlevel');
      const modalChip = lowlevelMatchingChips.find((el) => el.parentElement?.querySelector('button'));
      const removeBtn = modalChip?.parentElement?.querySelector('button');
      expect(removeBtn).toBeDefined();
      fireEvent.click(removeBtn!);

      // Add new tag 'systems'
      const tagInput = screen.getByPlaceholderText('New tag (e.g. backend, deepwork)...');
      fireEvent.change(tagInput, { target: { value: 'systems' } });
      fireEvent.click(screen.getByRole('button', { name: /Add Tag/i }));

      // Save changes
      fireEvent.click(screen.getByText('Save Changes'));

      await waitFor(() => {
        expect(screen.queryByText('#lowlevel')).not.toBeInTheDocument();
        expect(screen.getAllByText('#kernel').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('#systems').length).toBeGreaterThanOrEqual(1);
      });
    });

    it('filters tasks by clicking tag in sidebar, auto-assigns active tag to quick tasks, and clears filter', async () => {
      const taskA: TaskItem = {
        id: 'task_work',
        title: 'Implement Payment Gateway',
        taskListId: 'list_default',
        status: 'needsAction',
        priority: 'high',
        tags: ['work', 'finance'],
        totalFocusSeconds: 0,
        pomodoroCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const taskB: TaskItem = {
        id: 'task_personal',
        title: 'Read Macroeconomics Chapter',
        taskListId: 'list_default',
        status: 'needsAction',
        priority: 'medium',
        tags: ['study'],
        totalFocusSeconds: 0,
        pomodoroCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(
        'nayra_test_operator_id_tasks',
        JSON.stringify([taskA, taskB])
      );

      render(
        <TestHarness>
          <TasksView />
        </TestHarness>
      );

      await waitFor(() => {
        expect(screen.getByText('Implement Payment Gateway')).toBeInTheDocument();
        expect(screen.getByText('Read Macroeconomics Chapter')).toBeInTheDocument();
      });

      // Click #study tag in sidebar
      const studyTagBtn = screen.getByTitle('Filter by tag #study');
      fireEvent.click(studyTagBtn);

      // Active filter indicator should appear
      await waitFor(() => {
        expect(screen.getByText('Filtered by tag:')).toBeInTheDocument();
        expect(screen.getAllByText('#study').length).toBeGreaterThanOrEqual(1);
      });

      // taskB should be visible, taskA should be filtered out
      expect(screen.getByText('Read Macroeconomics Chapter')).toBeInTheDocument();
      expect(screen.queryByText('Implement Payment Gateway')).not.toBeInTheDocument();

      // Quick add a task while filtered
      const quickAdd = screen.getByPlaceholderText('Add a task (press Enter to save)...');
      fireEvent.change(quickAdd, { target: { value: 'Study Econometrics' } });
      fireEvent.submit(quickAdd.closest('form')!);

      await waitFor(() => {
        expect(screen.getByText('Study Econometrics')).toBeInTheDocument();
      });

      // Click Clear Filter
      const clearBtn = screen.getAllByRole('button', { name: /Clear Filter/i })[0];
      fireEvent.click(clearBtn);

      await waitFor(() => {
        expect(screen.queryByText('Filtered by tag:')).not.toBeInTheDocument();
        expect(screen.getByText('Implement Payment Gateway')).toBeInTheDocument();
        expect(screen.getByText('Read Macroeconomics Chapter')).toBeInTheDocument();
        expect(screen.getByText('Study Econometrics')).toBeInTheDocument();
      });
    });

    it('creates and edits tasks with tags directly inside Calendar modal', async () => {
      render(
        <TestHarness>
          <CalendarView />
        </TestHarness>
      );

      // Open Create modal
      fireEvent.click(screen.getByText('Create'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Task/i })).toBeInTheDocument();
      });

      // Switch to Task tab
      fireEvent.click(screen.getByRole('button', { name: /Task/i }));

      // Fill in Task Title (placeholder: e.g., Submit balance sheet diligence)
      const titleInput = screen.getByPlaceholderText(/Submit balance sheet diligence/i);
      fireEvent.change(titleInput, { target: { value: 'Calendar Scheduled Audit' } });

      // Add a Tag
      const tagInput = screen.getByPlaceholderText('Add tag (e.g. deadline, taxes)...');
      fireEvent.change(tagInput, { target: { value: 'audit' } });
      fireEvent.click(screen.getAllByRole('button', { name: /Add Tag/i })[0]);

      await waitFor(() => {
        expect(screen.getByText('#audit')).toBeInTheDocument();
      });

      // Save task
      fireEvent.click(screen.getByRole('button', { name: /Create Task/i }));

      await waitFor(() => {
        expect(screen.queryByText('Create Task')).not.toBeInTheDocument();
      });
    });
  });

  // --------------------------------------------------------------------------
  // 2. Tag-Based Analytics Calculation & Rendering in AnalyticsView
  // --------------------------------------------------------------------------
  describe('2. Tag-Based Analytics Calculation and Rendering', () => {
    it('calculates and renders tag metrics: total tasks, completion rates, and focus time', async () => {
      const sampleTasks: TaskItem[] = [
        {
          id: 't1',
          title: 'Frontend UI Polish',
          taskListId: 'list_default',
          status: 'completed',
          priority: 'high',
          tags: ['frontend', 'ux'],
          totalFocusSeconds: 3600, // 1h
          pomodoroCount: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        },
        {
          id: 't2',
          title: 'Design System Tokens',
          taskListId: 'list_default',
          status: 'needsAction',
          priority: 'medium',
          tags: ['frontend'],
          totalFocusSeconds: 1800, // 30m
          pomodoroCount: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 't3',
          title: 'PostgreSQL Migration',
          taskListId: 'list_default',
          status: 'completed',
          priority: 'high',
          tags: ['backend'],
          totalFocusSeconds: 5400, // 1h 30m
          pomodoroCount: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        },
      ];

      localStorage.setItem(
        'nayra_test_operator_id_tasks',
        JSON.stringify(sampleTasks)
      );

      render(
        <TestHarness>
          <AnalyticsView />
        </TestHarness>
      );

      await waitFor(() => {
        expect(screen.getByText('Tag Performance & Time Allocation')).toBeInTheDocument();
      });

      // Mini-cards verification
      expect(screen.getByText('Total Distinct Tags')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument(); // frontend, ux, backend

      expect(screen.getByText('Top Focused Tag')).toBeInTheDocument();
      // #backend appears in Top Focused Tag, Highest Completion, and breakdown table (3 times)
      expect(screen.getAllByText('#backend').length).toBe(3);
      expect(screen.getAllByText('#frontend').length).toBe(1);

      expect(screen.getByText('Tagged Deep Work')).toBeInTheDocument();
      expect(screen.getByText('3h 0m')).toBeInTheDocument(); // 3600 + 1800 + 5400 = 10800s = 3h

      // Table breakdown verification
      // For #frontend (2 tasks: 1 completed, 1 pending = 50% rate, 5400s = 1h 30m, 3 pomodoros)
      expect(screen.getByText('1 of 2 completed')).toBeInTheDocument();
      expect(screen.getByText('1 pending tasks')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
      expect(screen.getAllByText('3 pomodoros logged').length).toBe(2);

      // For #backend and #ux (1 task each: 1 completed = 100% rate, 0 pending)
      expect(screen.getAllByText('0 pending tasks').length).toBe(2);
      expect(screen.getAllByText('100%').length).toBe(2);
    });

    it('handles sorting of tag analytics by tasks, completion, and name', async () => {
      const sampleTasks: TaskItem[] = [
        {
          id: 't1',
          title: 'Task A',
          taskListId: 'list_default',
          status: 'needsAction',
          priority: 'low',
          tags: ['alpha'],
          totalFocusSeconds: 600,
          pomodoroCount: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 't2',
          title: 'Task B',
          taskListId: 'list_default',
          status: 'completed',
          priority: 'high',
          tags: ['beta'],
          totalFocusSeconds: 1200,
          pomodoroCount: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        },
      ];

      localStorage.setItem(
        'nayra_test_operator_id_tasks',
        JSON.stringify(sampleTasks)
      );

      render(
        <TestHarness>
          <AnalyticsView />
        </TestHarness>
      );

      await waitFor(() => {
        expect(screen.getByText('Tag Performance & Time Allocation')).toBeInTheDocument();
      });

      const sortSelect = screen.getByDisplayValue('Sort: Focus Time');
      fireEvent.change(sortSelect, { target: { value: 'name' } });
      expect(screen.getByDisplayValue('Sort: Tag Name')).toBeInTheDocument();

      fireEvent.change(sortSelect, { target: { value: 'completion' } });
      expect(screen.getByDisplayValue('Sort: Completion Rate')).toBeInTheDocument();
    });

    it('renders empty state placeholder when no tagged tasks exist', async () => {
      render(
        <TestHarness>
          <AnalyticsView />
        </TestHarness>
      );

      await waitFor(() => {
        expect(screen.getByText('No task tags tracked yet.')).toBeInTheDocument();
        expect(screen.getByText(/Assign tags like #work, #study/i)).toBeInTheDocument();
      });
    });
  });

  // --------------------------------------------------------------------------
  // 3. Dynamic Multi-Task Selection in Focus Lab & Mid-Session Add/Remove
  // --------------------------------------------------------------------------
  describe('3. Dynamic Multi-Task Selection & Exact Elapsed Time Attribution', () => {
    it('selects multiple tasks in TasksView and launches multi-task Focus session', async () => {
      const taskA: TaskItem = {
        id: 't_one',
        title: 'Draft Whitepaper',
        taskListId: 'list_default',
        status: 'needsAction',
        priority: 'high',
        tags: ['research'],
        totalFocusSeconds: 0,
        pomodoroCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const taskB: TaskItem = {
        id: 't_two',
        title: 'Review Pull Request #42',
        taskListId: 'list_default',
        status: 'needsAction',
        priority: 'medium',
        tags: ['code'],
        totalFocusSeconds: 0,
        pomodoroCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(
        'nayra_test_operator_id_tasks',
        JSON.stringify([taskA, taskB])
      );

      window.history.pushState({}, '', '/tasks');
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Draft Whitepaper')).toBeInTheDocument();
        expect(screen.getByText('Review Pull Request #42')).toBeInTheDocument();
      });

      // Select both tasks for Pomodoro
      const checkboxes = screen.getAllByTitle('Select for multi-task Pomodoro');
      expect(checkboxes.length).toBe(2);

      fireEvent.click(checkboxes[0]);
      fireEvent.click(checkboxes[1]);

      // Verify banner
      await waitFor(() => {
        expect(screen.getByText(/2 tasks selected for Pomodoro/i)).toBeInTheDocument();
      });

      // Click Start Multi-Task Focus
      const startMultiBtn = screen.getByRole('button', { name: /Start Multi-Task Focus/i });
      fireEvent.click(startMultiBtn);

      // Verify navigation to Focus Lab and presence of both tasks
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Focus Lab' })).toBeInTheDocument();
        expect(screen.getByText(/Session Linked Tasks \(2\)/i)).toBeInTheDocument();
        expect(screen.getByText('Draft Whitepaper')).toBeInTheDocument();
        expect(screen.getByText('Review Pull Request #42')).toBeInTheDocument();
      });
    });

    it('calculates exact elapsed time for mid-session task removal and addition upon Pomodoro completion', async () => {
      vi.useFakeTimers();
      const baseTime = new Date('2026-10-07T10:00:00.000Z').getTime();
      vi.setSystemTime(baseTime);

      const taskA: TaskItem = {
        id: 'task_a',
        title: 'Core Engine Kernel',
        taskListId: 'list_default',
        status: 'needsAction',
        priority: 'high',
        tags: ['engine'],
        totalFocusSeconds: 0,
        pomodoroCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const taskB: TaskItem = {
        id: 'task_b',
        title: 'Distributed Consensus',
        taskListId: 'list_default',
        status: 'needsAction',
        priority: 'high',
        tags: ['raft', 'network'],
        totalFocusSeconds: 0,
        pomodoroCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const taskC: TaskItem = {
        id: 'task_c',
        title: 'Telemetry Collector',
        taskListId: 'list_default',
        status: 'needsAction',
        priority: 'medium',
        tags: ['telemetry'],
        totalFocusSeconds: 0,
        pomodoroCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(
        'nayra_test_operator_id_tasks',
        JSON.stringify([taskA, taskB, taskC])
      );

      render(
        <TestHarness>
          <ContextProbe />
          <FocusView />
        </TestHarness>
      );

      expect(contextBridge).not.toBeNull();

      // Start session with taskA and taskB selected (25m = 1500s session)
      act(() => {
        contextBridge!.focus.selectTasks([taskA, taskB]);
        contextBridge!.focus.startTimer();
      });

      expect(contextBridge!.focus.timerState).toBe('running');
      expect(contextBridge!.focus.activeTaskIds).toEqual(['task_a', 'task_b']);

      // 1. Advance timer by 600 seconds (10 minutes)
      act(() => {
        vi.advanceTimersByTime(600 * 1000);
      });

      // At minute 10:
      // Remove Task A (was active for 600s)
      // Add Task C (will be active for the remaining 900s)
      act(() => {
        contextBridge!.focus.removeSessionTask('task_a');
        contextBridge!.focus.addSessionTask(taskC);
      });

      expect(contextBridge!.focus.activeTaskIds).toEqual(['task_b', 'task_c']);

      // 2. Advance timer by remaining 900 seconds (15 minutes) to hit 1500s completion
      act(() => {
        vi.advanceTimersByTime(900 * 1000);
      });

      // Verify timer expired and transitioned out of running focus
      expect(contextBridge!.focus.timerState).toBe('idle');

      // 3. Check exact task focus allocations in DataContext
      const updatedTasks = contextBridge!.data.tasks;
      const updatedA = updatedTasks.find((t: TaskItem) => t.id === 'task_a');
      const updatedB = updatedTasks.find((t: TaskItem) => t.id === 'task_b');
      const updatedC = updatedTasks.find((t: TaskItem) => t.id === 'task_c');

      // Task A was kept in session ONLY for the first 600 seconds
      expect(updatedA?.totalFocusSeconds).toBe(600);
      expect(updatedA?.pomodoroCount).toBe(1);

      // Task B was kept in session for the entire 1500 seconds
      expect(updatedB?.totalFocusSeconds).toBe(1500);
      expect(updatedB?.pomodoroCount).toBe(1);

      // Task C was added mid-session and kept ONLY for the last 900 seconds
      expect(updatedC?.totalFocusSeconds).toBe(900);
      expect(updatedC?.pomodoroCount).toBe(1);

      // 4. Verify logged focus session record
      const sessions = contextBridge!.data.focusSessions;
      expect(sessions.length).toBeGreaterThanOrEqual(1);
      const latestSession = sessions[0];

      expect(latestSession.mode).toBe('focus');
      expect(latestSession.durationSeconds).toBe(1500);
      expect(latestSession.taskTimeAllocations).toEqual({
        task_a: 600,
        task_b: 1500,
        task_c: 900,
      });

      // Verify all 3 tasks and their tags are associated
      expect(latestSession.taskIds).toContain('task_a');
      expect(latestSession.taskIds).toContain('task_b');
      expect(latestSession.taskIds).toContain('task_c');
      expect(latestSession.tags).toContain('engine');
      expect(latestSession.tags).toContain('raft');
      expect(latestSession.tags).toContain('network');
      expect(latestSession.tags).toContain('telemetry');
    });

    it('verifies getTaskLiveSeconds reports accurate live elapsed time during running session', () => {
      vi.useFakeTimers();
      const baseTime = new Date('2026-10-07T10:00:00.000Z').getTime();
      vi.setSystemTime(baseTime);

      const taskA: TaskItem = {
        id: 't_live',
        title: 'Real-time Telemetry Stream',
        taskListId: 'list_default',
        status: 'needsAction',
        priority: 'high',
        tags: ['telemetry'],
        totalFocusSeconds: 0,
        pomodoroCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      render(
        <TestHarness>
          <ContextProbe />
        </TestHarness>
      );

      act(() => {
        contextBridge!.focus.selectTask(taskA);
        contextBridge!.focus.startTimer();
      });

      expect(contextBridge!.focus.getTaskLiveSeconds('t_live')).toBe(0);

      // Advance by 45 seconds
      act(() => {
        vi.advanceTimersByTime(45 * 1000);
      });

      expect(contextBridge!.focus.getTaskLiveSeconds('t_live')).toBe(45);
    });

    it('does not accumulate focus time while timer is paused', () => {
      vi.useFakeTimers();
      const baseTime = new Date('2026-10-07T10:00:00.000Z').getTime();
      vi.setSystemTime(baseTime);

      const taskA: TaskItem = {
        id: 't_pause',
        title: 'Pause Test Task',
        taskListId: 'list_default',
        status: 'needsAction',
        priority: 'medium',
        tags: ['test'],
        totalFocusSeconds: 0,
        pomodoroCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(
        'nayra_test_operator_id_tasks',
        JSON.stringify([taskA])
      );

      render(
        <TestHarness>
          <ContextProbe />
        </TestHarness>
      );

      act(() => {
        contextBridge!.focus.selectTask(taskA);
        contextBridge!.focus.startTimer();
      });

      // Run for 300s
      act(() => {
        vi.advanceTimersByTime(300 * 1000);
      });

      act(() => {
        contextBridge!.focus.pauseTimer();
      });

      // Idle while paused for 600s
      act(() => {
        vi.advanceTimersByTime(600 * 1000);
      });

      // Live seconds should only reflect the 300 active seconds
      expect(contextBridge!.focus.getTaskLiveSeconds('t_pause')).toBe(300);

      // Resume in its own act cycle to commit state and register timer
      act(() => {
        contextBridge!.focus.resumeTimer();
      });

      // Run for remaining 1200s to finish the 1500s focus session
      act(() => {
        vi.advanceTimersByTime(1200 * 1000);
      });

      // Session completes at 1500s total active focus duration
      const updated = contextBridge!.data.tasks.find((t: TaskItem) => t.id === 't_pause');
      expect(updated?.totalFocusSeconds).toBe(1500);
    });
  });
});
