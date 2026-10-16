import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TasksView } from '../views/TasksView';
import { DataProvider } from '../context/DataContext';
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
});
