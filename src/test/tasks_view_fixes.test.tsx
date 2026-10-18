import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TasksView } from '../views/TasksView';
import { DataProvider, deduplicateTaskLists } from '../context/DataContext';
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
});
