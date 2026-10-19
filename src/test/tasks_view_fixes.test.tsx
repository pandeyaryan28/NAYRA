import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TasksView, isTaskInList } from '../views/TasksView';
import { DataProvider, deduplicateTaskLists } from '../context/DataContext';
import { resolveGoogleTaskListId } from '../lib/googleApi';
import { cleanupLocalStorageQuota, safeLocalStorageSet } from '../lib/utils';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { FocusProvider } from '../context/FocusContext';
import { CATrackerProvider } from '../context/CATrackerContext';
import { MemoryRouter } from 'react-router-dom';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <AuthProvider>
      <DataProvider>
        <CATrackerProvider>
          <FocusProvider>
            <MemoryRouter initialEntries={['/tasks']}>
              {children}
            </MemoryRouter>
          </FocusProvider>
        </CATrackerProvider>
      </DataProvider>
    </AuthProvider>
  </ThemeProvider>
);

describe('Tasks View Fixes & Reliability', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('marking a task complete keeps it visible in Completed section without blanking the screen', async () => {
    const initialTasks = [
      {
        id: 'task_alpha',
        title: 'Alpha Task To Complete',
        taskListId: 'list_default',
        status: 'needsAction',
        priority: 'high',
        starred: false,
      },
    ];
    window.localStorage.setItem('nayra_test_operator_id_tasks', JSON.stringify(initialTasks));

    render(
      <TestWrapper>
        <TasksView />
      </TestWrapper>
    );

    // Initial check: active task exists
    expect(await screen.findByText('Alpha Task To Complete')).toBeInTheDocument();

    // Toggle complete on the task
    const completeButtons = screen.getAllByLabelText('Toggle complete');
    expect(completeButtons.length).toBeGreaterThan(0);
    fireEvent.click(completeButtons[0]);

    // Screen should NOT go blank: it should show "All active tasks completed!"
    await waitFor(() => {
      expect(screen.getByText(/All active tasks completed!/i)).toBeInTheDocument();
    });

    // Completed section toggle should exist
    expect(screen.getByRole('button', { name: /^Completed/i })).toBeInTheDocument();
    expect(screen.getByText('Alpha Task To Complete')).toBeInTheDocument();

    // Clicking complete again restores the task back to active
    const completedCheckbox = screen.getByLabelText('Toggle complete');
    fireEvent.click(completedCheckbox);

    await waitFor(() => {
      expect(screen.queryByText(/All active tasks completed!/i)).not.toBeInTheDocument();
      expect(screen.getByText('Alpha Task To Complete')).toBeInTheDocument();
    });
  });

  it('adding a task in Starred view immediately marks it starred and visible', async () => {
    render(
      <TestWrapper>
        <TasksView />
      </TestWrapper>
    );

    // Click Starred tile
    const starredTile = screen.getByRole('button', { name: /Starred/i });
    fireEvent.click(starredTile);

    // Heading should show Starred Tasks
    expect(await screen.findByText('Starred Tasks')).toBeInTheDocument();

    // Quick add task in Starred view
    const input = screen.getByPlaceholderText(/Add a task/i);
    fireEvent.change(input, { target: { value: 'Urgent Starred Objective' } });
    fireEvent.submit(input.closest('form')!);

    // New task should appear immediately
    expect(await screen.findByText('Urgent Starred Objective')).toBeInTheDocument();
  });

  it('adding a task in Upcoming view assigns tomorrow as default date so it appears in Upcoming view', async () => {
    render(
      <TestWrapper>
        <TasksView />
      </TestWrapper>
    );

    // Click Upcoming tile
    const upcomingTile = screen.getByRole('button', { name: /Upcoming/i });
    fireEvent.click(upcomingTile);

    // Heading should show Upcoming
    expect(screen.getByRole('heading', { level: 1, name: 'Upcoming' })).toBeInTheDocument();

    // Quick add task without picking a date
    const input = screen.getByPlaceholderText(/Add a task/i);
    fireEvent.change(input, { target: { value: 'Future Event Task' } });
    fireEvent.submit(input.closest('form')!);

    // Task should be created with future due date and immediately display
    expect(await screen.findByText('Future Event Task')).toBeInTheDocument();
  });

  it('switching density modes (Compact, Comfortable, Board) does not crash with completed tasks', async () => {
    const tasks = [
      {
        id: 'task_1',
        title: 'Task Compact One',
        taskListId: 'list_default',
        status: 'completed',
        completed: true,
        priority: 'medium',
      },
      {
        id: 'task_2',
        title: 'Task Active Two',
        taskListId: 'list_default',
        status: 'needsAction',
        priority: 'high',
      },
    ];
    window.localStorage.setItem('nayra_test_operator_id_tasks', JSON.stringify(tasks));

    render(
      <TestWrapper>
        <TasksView />
      </TestWrapper>
    );

    expect(await screen.findByText('Task Active Two')).toBeInTheDocument();
    expect(screen.getByText('Task Compact One')).toBeInTheDocument();

    // Switch to Comfortable
    const comfortableBtn = screen.getByRole('button', { name: /^Comfortable$/i });
    fireEvent.click(comfortableBtn);
    expect(screen.getByText('Task Active Two')).toBeInTheDocument();

    // Switch to Board
    const boardBtn = screen.getByRole('button', { name: /^Board$/i });
    fireEvent.click(boardBtn);
    expect(screen.getByText('Task Active Two')).toBeInTheDocument();

    // Switch back to Compact
    const compactBtn = screen.getByRole('button', { name: /^Compact$/i });
    fireEvent.click(compactBtn);
    expect(screen.getByText('Task Active Two')).toBeInTheDocument();
  });

  it('deduplicateTaskLists strictly protects custom lists even if legacy isDefault was true', () => {
    const corruptedLists = [
      { id: 'gtl_01lab', googleTaskListId: '01lab_gid', title: '01 Lab', isDefault: true, updatedAt: '2026-10-18T00:00:00Z' },
      { id: 'gtl_ca', googleTaskListId: 'ca_gid', title: 'CA', isDefault: false, updatedAt: '2026-10-18T00:00:00Z' },
      { id: 'list_default', googleTaskListId: '@default', title: 'My Tasks', isDefault: true, updatedAt: '2026-10-18T00:00:00Z' },
    ];

    const { cleanLists, idRemap } = deduplicateTaskLists(corruptedLists);

    // My Tasks must be canonical default
    const myTasks = cleanLists.find((l: any) => l.title === 'My Tasks');
    expect(myTasks).toBeDefined();
    expect(myTasks!.isDefault).toBe(true);
    expect(myTasks!.id).toBe('list_default');

    // Custom lists must NOT be merged into My Tasks and must have isDefault: false
    const labList = cleanLists.find((l: any) => l.title === '01 Lab');
    expect(labList).toBeDefined();
    expect(labList!.isDefault).toBe(false);
    expect(labList!.id).toBe('gtl_01lab');

    const caList = cleanLists.find((l: any) => l.title === 'CA');
    expect(caList).toBeDefined();
    expect(caList!.isDefault).toBe(false);
    expect(caList!.id).toBe('gtl_ca');

    // idRemap must NEVER map custom lists to list_default
    expect(idRemap.get('gtl_01lab')).toBeUndefined();
    expect(idRemap.get('01lab_gid')).toBeUndefined();
    expect(idRemap.get('gtl_ca')).toBeUndefined();
  });

  it('tasks of different lists are isolated and newly created tasks appear in the active list', async () => {
    const initialLists = [
      { id: 'list_default', googleTaskListId: '@default', title: 'My Tasks', isDefault: true, updatedAt: '2026-10-18T00:00:00Z' },
      { id: 'gtl_lab', googleTaskListId: 'lab_gid', title: '01 Lab', isDefault: false, updatedAt: '2026-10-18T00:00:00Z' },
    ];
    const initialTasks = [
      {
        id: 't_mytask',
        title: 'General In My Tasks',
        taskListId: 'list_default',
        status: 'needsAction',
        priority: 'medium',
      },
      {
        id: 't_labtask',
        title: 'Make video for 01 lab',
        taskListId: 'gtl_lab',
        status: 'needsAction',
        priority: 'high',
      },
    ];

    window.localStorage.setItem('nayra_test_operator_id_task_lists', JSON.stringify(initialLists));
    window.localStorage.setItem('nayra_test_operator_id_tasks', JSON.stringify(initialTasks));

    render(
      <TestWrapper>
        <TasksView />
      </TestWrapper>
    );

    // Initially in My Tasks: "General In My Tasks" is visible, "Make video for 01 lab" is NOT visible
    expect(await screen.findByText('General In My Tasks')).toBeInTheDocument();
    expect(screen.queryByText('Make video for 01 lab')).not.toBeInTheDocument();

    // Click 01 Lab in the sidebar
    const labButton = screen.getByRole('button', { name: /01 Lab/i });
    fireEvent.click(labButton);

    // Now in 01 Lab: "Make video for 01 lab" is visible, "General In My Tasks" is NOT visible
    expect(await screen.findByText('Make video for 01 lab')).toBeInTheDocument();
    expect(screen.queryByText('General In My Tasks')).not.toBeInTheDocument();

    // Add a new task in 01 Lab
    const input = screen.getByPlaceholderText(/Add a task/i);
    fireEvent.change(input, { target: { value: 'New Lab Experiment Task' } });
    fireEvent.submit(input.closest('form')!);

    // New task appears immediately in 01 Lab
    expect(await screen.findByText('New Lab Experiment Task')).toBeInTheDocument();
  });

  it('isTaskInList strictly segregates tasks and prevents cross-list leakage', () => {
    const allLists = [
      { id: 'list_default', googleTaskListId: '@default', title: 'My Tasks', isDefault: true, updatedAt: '2026-10-18T00:00:00Z' },
      { id: 'gtl_lab', googleTaskListId: 'lab_gid', title: '01 Lab', isDefault: false, updatedAt: '2026-10-18T00:00:00Z' },
      { id: 'gtl_ca', googleTaskListId: 'ca_gid', title: 'CA', isDefault: false, updatedAt: '2026-10-18T00:00:00Z' },
    ];
    const defaultList = allLists[0];
    const labList = allLists[1];
    const caList = allLists[2];

    // Case 1: Task with corrupted taskListId='list_default' but taskListName='01 Lab'
    const leakedLabTask: any = {
      id: 'task_leak_1',
      title: 'Lab research notes',
      taskListId: 'list_default',
      taskListName: '01 Lab',
    };
    // Must be in 01 Lab
    expect(isTaskInList(leakedLabTask, labList, allLists)).toBe(true);
    // Must NOT be in My Tasks
    expect(isTaskInList(leakedLabTask, defaultList, allLists)).toBe(false);
    // Must NOT be in CA
    expect(isTaskInList(leakedLabTask, caList, allLists)).toBe(false);

    // Case 2: Task with raw Google Task List ID from Android (e.g. 'lab_gid' without 'gtl_')
    const androidLabTask: any = {
      id: 'task_android_1',
      title: 'Android lab assignment',
      taskListId: 'lab_gid',
    };
    expect(isTaskInList(androidLabTask, labList, allLists)).toBe(true);
    expect(isTaskInList(androidLabTask, defaultList, allLists)).toBe(false);

    // Case 3: Genuine default task
    const genuineDefaultTask: any = {
      id: 'task_def_1',
      title: 'Buy groceries',
      taskListId: 'list_default',
      taskListName: 'My Tasks',
    };
    expect(isTaskInList(genuineDefaultTask, defaultList, allLists)).toBe(true);
    expect(isTaskInList(genuineDefaultTask, labList, allLists)).toBe(false);
    expect(isTaskInList(genuineDefaultTask, caList, allLists)).toBe(false);
  });

  it('TasksView isolates tasks even when taskListId was defaulted to list_default if taskListName names a custom list', async () => {
    const initialLists = [
      { id: 'list_default', googleTaskListId: '@default', title: 'My Tasks', isDefault: true, updatedAt: '2026-10-18T00:00:00Z' },
      { id: 'gtl_lab', googleTaskListId: 'lab_gid', title: '01 Lab', isDefault: false, updatedAt: '2026-10-18T00:00:00Z' },
    ];
    const initialTasks = [
      {
        id: 't_real_default',
        title: 'Real Personal Task',
        taskListId: 'list_default',
        taskListName: 'My Tasks',
        status: 'needsAction',
        priority: 'medium',
      },
      {
        id: 't_corrupted_lab',
        title: 'Corrupted Lab Task with list_default id',
        taskListId: 'list_default', // Old corrupted ID
        taskListName: '01 Lab',     // But explicit custom list name
        status: 'needsAction',
        priority: 'high',
      },
    ];

    window.localStorage.setItem('nayra_test_operator_id_task_lists', JSON.stringify(initialLists));
    window.localStorage.setItem('nayra_test_operator_id_tasks', JSON.stringify(initialTasks));

    render(
      <TestWrapper>
        <TasksView />
      </TestWrapper>
    );

    // In My Tasks: Real Personal Task is shown, but Corrupted Lab Task is NOT shown
    expect(await screen.findByText('Real Personal Task')).toBeInTheDocument();
    expect(screen.queryByText('Corrupted Lab Task with list_default id')).not.toBeInTheDocument();

    // Click 01 Lab: Corrupted Lab Task IS shown, Real Personal Task is NOT shown
    const labBtn = screen.getByRole('button', { name: /01 Lab/i });
    fireEvent.click(labBtn);

    expect(await screen.findByText('Corrupted Lab Task with list_default id')).toBeInTheDocument();
    expect(screen.queryByText('Real Personal Task')).not.toBeInTheDocument();
  });

  it('resolveGoogleTaskListId correctly maps default lists and custom lists', () => {
    const lists = [
      { id: 'list_default', googleTaskListId: '@default', title: 'My Tasks', isDefault: true, updatedAt: '2026-10-18T00:00:00Z' },
      { id: 'gtl_custom_1', googleTaskListId: 'google_custom_1', title: '01 Lab', isDefault: false, updatedAt: '2026-10-18T00:00:00Z' },
    ];

    expect(resolveGoogleTaskListId('@default', lists)).toBe('@default');
    expect(resolveGoogleTaskListId('list_default', lists)).toBe('@default');
    expect(resolveGoogleTaskListId('gtl_custom_1', lists)).toBe('google_custom_1');
    expect(resolveGoogleTaskListId('google_custom_1', lists)).toBe('google_custom_1');
  });

  it('cleanupLocalStorageQuota purges dead Firestore client tokens and trims bloated arrays', () => {
    window.localStorage.setItem('firestore_clients_firestore/[DEFAULT]/nayra/client1', 'dummy');
    window.localStorage.setItem('firestore_zombied_clients/client2', 'dummy');
    window.localStorage.setItem('nayra_null_tasks', '[]');
    window.localStorage.setItem('nayra_test_tasks', JSON.stringify([{ id: '1', title: 'Task 1' }]));

    // Bloated focus sessions (150 items)
    const bigArray = new Array(150).fill(null).map((_, i) => ({
      id: `session_${i}`,
      duration: 1500,
      timestamp: '2026-10-18T00:00:00Z',
      notes: 'Extended study session description taking up storage',
    }));
    window.localStorage.setItem('nayra_test_focus_sessions', JSON.stringify(bigArray));

    expect(window.localStorage.getItem('firestore_clients_firestore/[DEFAULT]/nayra/client1')).toBeDefined();

    cleanupLocalStorageQuota();

    // Dead firestore client keys must be purged
    expect(window.localStorage.getItem('firestore_clients_firestore/[DEFAULT]/nayra/client1')).toBeNull();
    expect(window.localStorage.getItem('firestore_zombied_clients/client2')).toBeNull();
    expect(window.localStorage.getItem('nayra_null_tasks')).toBeNull();

    // Valid tasks must be preserved
    expect(window.localStorage.getItem('nayra_test_tasks')).toBeDefined();

    // Bloated focus sessions should be trimmed to the most recent items
    const trimmed = JSON.parse(window.localStorage.getItem('nayra_test_focus_sessions')!);
    expect(trimmed.length).toBeLessThanOrEqual(80);
  });

  it('safeLocalStorageSet handles QuotaExceededError smoothly and cleans storage', () => {
    // Fill storage with a dummy firestore client key
    window.localStorage.setItem('firestore_clients_firestore/[DEFAULT]/nayra/token', 'dead_token');

    // Test writing via safeLocalStorageSet
    safeLocalStorageSet('nayra_test_key', { saved: true });

    const retrieved = JSON.parse(window.localStorage.getItem('nayra_test_key')!);
    expect(retrieved.saved).toBe(true);
  });
});
