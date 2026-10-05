import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import App from '../App';
import {
  resolveGoogleCalendarId,
  resolveGoogleTaskListId,
  formatGoogleDateTime,
  createGoogleTask,
  updateGoogleTask,
  updateGoogleTaskStatus,
  deleteGoogleTask,
  fetchGoogleTasks,
  createGoogleEvent,
  updateGoogleEvent,
  deleteGoogleEvent,
  fetchGoogleEvents,
  fetchGoogleCalendars,
  fetchGoogleTaskLists,
  createGoogleTaskList,
  deleteGoogleTaskList,
} from '../lib/googleApi';
import { DataProvider, useData } from '../context/DataContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { FocusProvider } from '../context/FocusContext';
import { BrowserRouter } from 'react-router-dom';
import { CalendarView } from '../views/CalendarView';
import { TasksView } from '../views/TasksView';
import { Header } from '../components/layout/Header';
import { safeLocalStorageSet } from '../lib/utils';

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

describe('Google API Formatting and Resolvers', () => {
  it('correctly resolves Google Calendar IDs', () => {
    expect(resolveGoogleCalendarId('primary')).toBe('primary');
    expect(resolveGoogleCalendarId('cal_work')).toBe('primary');
    expect(resolveGoogleCalendarId('gcal_c_12345')).toBe('c_12345');
    expect(resolveGoogleCalendarId('custom_id@group.calendar.google.com')).toBe(
      'custom_id@group.calendar.google.com'
    );
  });

  it('correctly resolves Google Task List IDs', () => {
    expect(resolveGoogleTaskListId('list_default')).toBe('@default');
    expect(resolveGoogleTaskListId('@default')).toBe('@default');
    expect(resolveGoogleTaskListId('gtl_MTIzNDU')).toBe('MTIzNDU');
    expect(resolveGoogleTaskListId('')).toBe('@default');
  });

  it('formats RFC3339 timestamps for Google Calendar & Tasks without errors', () => {
    const rawLocal = '2026-10-02T14:30';
    const formatted = formatGoogleDateTime(rawLocal);
    expect(formatted).toContain('T');
    expect(formatted).toContain('Z');

    const alreadyUtc = '2026-10-02T14:30:00.000Z';
    expect(formatGoogleDateTime(alreadyUtc)).toBe(alreadyUtc);
  });
});

describe('Authentication Flow & Login Screen', () => {
  beforeEach(() => {
    window.localStorage.clear();
    (window as any).__NAYRA_TEST_UNAUTHENTICATED__ = true;
  });

  afterEach(() => {
    delete (window as any).__NAYRA_TEST_UNAUTHENTICATED__;
  });

  it('redirects unauthenticated users to /login and renders the authentic login screen', async () => {
    render(<App />);

    // Verify Login Screen Header and Titles
    expect(await screen.findByText('Sign In to Your Workspace')).toBeInTheDocument();
    expect(screen.getByText('Autonomous Personal OS')).toBeInTheDocument();
    expect(
      screen.getByText('Authenticate to access your isolated personal database and synchronized services.')
    ).toBeInTheDocument();

    // Verify Form Inputs
    expect(screen.getByPlaceholderText('operator@nayra.internal')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••••••')).toBeInTheDocument();
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
    expect(screen.getByText('Explore as Guest (Local Sandbox)')).toBeInTheDocument();
  });

  it('switches between Sign In and Create Account tabs with proper validation fields', async () => {
    render(<App />);

    expect(await screen.findByText('Sign In to Your Workspace')).toBeInTheDocument();

    // Switch to Create Account
    const createAccountTab = screen.getByRole('button', { name: 'Create Account' });
    fireEvent.click(createAccountTab);

    expect(screen.getByText('Create Your NAYRA Account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Aryan Pandey')).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText('••••••••••••').length).toBe(2);
    expect(screen.getByRole('button', { name: 'Register & Initialize Workspace' })).toBeInTheDocument();

    // Switch back to Sign In
    const signInTab = screen.getByRole('button', { name: 'Sign In' });
    fireEvent.click(signInTab);
    expect(screen.getByText('Sign In to Your Workspace')).toBeInTheDocument();
  });

  it('allows entering the app via Guest Access and initializes isolated workspace', async () => {
    render(<App />);

    const guestButton = await screen.findByText('Explore as Guest (Local Sandbox)');
    fireEvent.click(guestButton);

    // Navigates to AppShell after guest sign-in
    await waitFor(() => {
      expect(screen.getByText('Personal OS')).toBeInTheDocument();
    });
  });
});

describe('Multi-Tenant Database Isolation & Tasks on Calendar Integration', () => {
  beforeEach(() => {
    window.localStorage.clear();
    delete (window as any).__NAYRA_TEST_UNAUTHENTICATED__;
  });

  it('isolates database keys per user in local storage', async () => {
    const ComponentUsingData: React.FC = () => {
      const { tasks, createTask, user } = useData() as any;
      const { user: authUser } = useAuth();
      return (
        <div>
          <span data-testid="user-id">{authUser?.uid}</span>
          <button
            onClick={() =>
              createTask({
                title: 'User-Specific Task',
                due: '2026-10-02',
              })
            }
          >
            Add Task
          </button>
          <div data-testid="task-count">{tasks.length}</div>
        </div>
      );
    };

    render(
      <TestHarness>
        <ComponentUsingData />
      </TestHarness>
    );

    const userId = screen.getByTestId('user-id').textContent;
    expect(userId).toBeTruthy();

    const addBtn = screen.getByText('Add Task');
    fireEvent.click(addBtn);

    // Verify task is stored in user-isolated key
    await waitFor(() => {
      const userKey = `nayra_${userId}_tasks`;
      const rawStored = window.localStorage.getItem(userKey);
      expect(rawStored).toBeTruthy();
      expect(rawStored).toContain('User-Specific Task');
    });
  });

  it('renders tasks with due dates on the calendar and allows toggling completion', async () => {
    const initialTask = {
      id: 'task_diligence_1',
      title: 'Review Quarterly Diligence',
      due: '2026-10-02T10:00:00.000Z',
      status: 'needsAction' as const,
      taskListId: 'list_default',
      priority: 'medium' as const,
      subtasks: [],
      totalFocusSeconds: 0,
      pomodoroCount: 0,
      createdAt: '2026-10-02T00:00:00.000Z',
      updatedAt: '2026-10-02T00:00:00.000Z',
    };
    window.localStorage.setItem('nayra_test_operator_id_tasks', JSON.stringify([initialTask]));

    render(
      <TestHarness>
        <CalendarView />
      </TestHarness>
    );

    // Wait for the calendar to render
    await waitFor(() => {
      expect(screen.getByText('Tasks (Google & Myra)')).toBeInTheDocument();
    });

    // Check that task count displays in sidebar
    expect(screen.getByText(/Tasks \(Google & Myra\)/)).toBeInTheDocument();

    // Switch to Agenda view to view chronological items
    const agendaBtn = screen.getByText('agenda');
    fireEvent.click(agendaBtn);

    // The task should be visible in Agenda view
    await waitFor(() => {
      expect(screen.getByText('Review Quarterly Diligence')).toBeInTheDocument();
    });

    // Find the task completion checkbox and click it
    const taskCheckbox = screen.getByRole('checkbox', { name: /Review Quarterly Diligence/i });
    expect(taskCheckbox).not.toBeChecked();
    fireEvent.click(taskCheckbox);

    // Should update to checked
    await waitFor(() => {
      expect(taskCheckbox).toBeChecked();
    });
  });
});

describe('Google API Endpoints & CRUD Operations (Calendar & Tasks)', () => {
  const originalFetch = globalThis.fetch;
  let fetchMock: any;

  beforeEach(() => {
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('createGoogleTask sends correct POST payload and headers', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: 'g_task_123', title: 'Test Task' }),
    });

    const res = await createGoogleTask('test_token', 'list_default', {
      title: 'Test Task',
      notes: 'Task notes',
      due: '2026-10-02T10:00:00.000Z',
      status: 'needsAction',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('https://tasks.googleapis.com/tasks/v1/lists/%40default/tasks');
    expect(options.method).toBe('POST');
    expect(options.headers.get('Authorization')).toBe('Bearer test_token');
    expect(options.headers.get('Content-Type')).toBe('application/json');
    const body = JSON.parse(options.body);
    expect(body.title).toBe('Test Task');
    expect(body.notes).toBe('Task notes');
    expect(body.status).toBe('needsAction');
    expect(res.id).toBe('g_task_123');
  });

  it('updateGoogleTaskStatus updates completion status', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: 'gtask_abc', status: 'completed' }),
    });

    const res = await updateGoogleTaskStatus('test_token', 'gtl_xyz', 'gtask_abc', 'completed');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('https://tasks.googleapis.com/tasks/v1/lists/xyz/tasks/abc');
    expect(options.method).toBe('PATCH');
    const body = JSON.parse(options.body);
    expect(body.status).toBe('completed');
    expect(body.completed).toBeTruthy();
    expect(res.status).toBe('completed');
  });

  it('deleteGoogleTask issues DELETE request to Google Tasks API', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: async () => ({}),
    });

    await deleteGoogleTask('test_token', 'gtl_xyz', 'gtask_abc');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('https://tasks.googleapis.com/tasks/v1/lists/xyz/tasks/abc');
    expect(options.method).toBe('DELETE');
  });

  it('createGoogleEvent formats start/end properly for all-day and timed events', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'gcal_ev_1' }),
    });

    // Timed event
    await createGoogleEvent('test_token', 'primary', {
      title: 'Engineering Standup',
      start: '2026-10-02T09:00:00.000Z',
      end: '2026-10-02T09:30:00.000Z',
      allDay: false,
    });
    const [, options1] = fetchMock.mock.calls[0];
    const body1 = JSON.parse(options1.body);
    expect(body1.summary).toBe('Engineering Standup');
    expect(body1.start.dateTime).toBe('2026-10-02T09:00:00.000Z');

    // All-day event
    await createGoogleEvent('test_token', 'primary', {
      title: 'Company Holiday',
      start: '2026-10-05',
      end: '2026-10-05',
      allDay: true,
    });
    const [, options2] = fetchMock.mock.calls[1];
    const body2 = JSON.parse(options2.body);
    expect(body2.start.date).toBe('2026-10-05');
  });

  it('deleteGoogleEvent issues DELETE request to Google Calendar API', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: async () => ({}),
    });

    await deleteGoogleEvent('test_token', 'gcal_primary_cal', 'gev_evt_999');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('https://www.googleapis.com/calendar/v3/calendars/primary_cal/events/evt_999');
    expect(options.method).toBe('DELETE');
  });

  it('fetchGoogleTasks normalizes response into Myra TaskItems', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        items: [
          {
            id: 'task_api_1',
            title: 'Audit Logs',
            notes: 'Check security',
            status: 'needsAction',
            due: '2026-10-02T15:00:00.000Z',
            updated: '2026-10-02T08:00:00.000Z',
          },
        ],
      }),
    });

    const tasks = await fetchGoogleTasks('test_token', 'gtl_xyz', 'local_list_1');
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe('gtask_task_api_1');
    expect(tasks[0].googleTaskId).toBe('task_api_1');
    expect(tasks[0].taskListId).toBe('local_list_1');
    expect(tasks[0].title).toBe('Audit Logs');
    expect(tasks[0].status).toBe('needsAction');
  });

  it('fetchGoogleEvents normalizes response into Myra CalendarEvents', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        items: [
          {
            id: 'evt_api_1',
            summary: 'Quarterly Planning',
            description: 'Discuss Q4',
            start: { dateTime: '2026-10-02T10:00:00.000Z' },
            end: { dateTime: '2026-10-02T11:00:00.000Z' },
          },
        ],
      }),
    });

    const events = await fetchGoogleEvents('test_token', 'primary');
    expect(events).toHaveLength(1);
    expect(events[0].id).toBe('gev_evt_api_1');
    expect(events[0].googleEventId).toBe('evt_api_1');
    expect(events[0].title).toBe('Quarterly Planning');
  });
});

describe('Calendar Tabbed Modal & Task Lifecycle (Create, Edit, Delete)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    delete (window as any).__NAYRA_TEST_UNAUTHENTICATED__;
  });

  it('creates a task directly from the Calendar modal via the [Task] tab and displays it on the calendar', async () => {
    render(
      <TestHarness>
        <CalendarView />
      </TestHarness>
    );

    // Wait for calendar to be rendered
    await waitFor(() => {
      expect(screen.getByText('Tasks (Google & Myra)')).toBeInTheDocument();
    });

    // 1. Click the "Create" button in toolbar
    const createBtn = screen.getByRole('button', { name: /^Create$/i });
    fireEvent.click(createBtn);

    // Modal opens with default tab "Event"
    expect(await screen.findByRole('heading', { name: 'Create Event' })).toBeInTheDocument();

    // 2. Switch to "Task" tab in the modal header
    const taskTabBtn = screen.getByRole('button', { name: 'Task' });
    fireEvent.click(taskTabBtn);

    // Header and description should switch to Task
    expect(await screen.findByRole('heading', { name: 'Create Task' })).toBeInTheDocument();

    // 3. Enter task details
    const titleInput = screen.getByLabelText(/Task Title/i);
    fireEvent.change(titleInput, { target: { value: 'Audit Security Roadmap' } });

    // 4. Submit form
    const submitBtn = screen.getByRole('button', { name: 'Create Task' });
    fireEvent.click(submitBtn);

    // Modal should close
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Create Task' })).not.toBeInTheDocument();
    });

    // 5. Verify the task renders in Week view
    expect(await screen.findByText('Audit Security Roadmap')).toBeInTheDocument();

    // 6. Switch to Agenda view and verify task is displayed
    const agendaBtn = screen.getByText('agenda');
    fireEvent.click(agendaBtn);
    expect(await screen.findByText('Audit Security Roadmap')).toBeInTheDocument();
  });

  it('edits an existing task from the Calendar modal and persists modifications', async () => {
    const existingTask = {
      id: 'task_edit_test',
      title: 'Initial Diligence Review',
      due: '2026-10-02T09:00:00.000Z',
      status: 'needsAction' as const,
      taskListId: 'list_default',
      priority: 'medium' as const,
      subtasks: [],
      totalFocusSeconds: 0,
      pomodoroCount: 0,
      createdAt: '2026-10-02T00:00:00.000Z',
      updatedAt: '2026-10-02T00:00:00.000Z',
    };
    window.localStorage.setItem('nayra_test_operator_id_tasks', JSON.stringify([existingTask]));

    render(
      <TestHarness>
        <CalendarView />
      </TestHarness>
    );

    // Switch to Agenda view
    const agendaBtn = await screen.findByText('agenda');
    fireEvent.click(agendaBtn);

    // Wait for the task item to show up in Agenda view
    const taskItem = await screen.findByText('Initial Diligence Review');
    expect(taskItem).toBeInTheDocument();

    // Click on the task row to open the Edit Task modal
    fireEvent.click(taskItem);

    // Verify modal opened in Edit Task mode
    expect(await screen.findByText('Edit Task')).toBeInTheDocument();
    const titleInput = screen.getByLabelText(/Task Title/i);
    expect(titleInput).toHaveValue('Initial Diligence Review');

    // Edit title
    fireEvent.change(titleInput, { target: { value: 'Updated Diligence Review (Approved)' } });

    // Save
    const saveBtn = screen.getByRole('button', { name: 'Save Task' });
    fireEvent.click(saveBtn);

    // Modal should close
    await waitFor(() => {
      expect(screen.queryByText('Edit Task')).not.toBeInTheDocument();
    });

    // Check updated title appears and old title is gone
    expect(await screen.findByText('Updated Diligence Review (Approved)')).toBeInTheDocument();
    expect(screen.queryByText('Initial Diligence Review')).not.toBeInTheDocument();
  });

  it('deletes an existing task from the Calendar modal', async () => {
    const taskToDelete = {
      id: 'task_del_test',
      title: 'Temporary Scratch Task',
      due: '2026-10-02T09:00:00.000Z',
      status: 'needsAction' as const,
      taskListId: 'list_default',
      priority: 'low' as const,
      subtasks: [],
      totalFocusSeconds: 0,
      pomodoroCount: 0,
      createdAt: '2026-10-02T00:00:00.000Z',
      updatedAt: '2026-10-02T00:00:00.000Z',
    };
    window.localStorage.setItem('nayra_test_operator_id_tasks', JSON.stringify([taskToDelete]));

    render(
      <TestHarness>
        <CalendarView />
      </TestHarness>
    );

    // Switch to Agenda view
    const agendaBtn = await screen.findByText('agenda');
    fireEvent.click(agendaBtn);

    const taskItem = await screen.findByText('Temporary Scratch Task');
    expect(taskItem).toBeInTheDocument();

    // Click task to open edit modal
    fireEvent.click(taskItem);
    expect(await screen.findByText('Edit Task')).toBeInTheDocument();

    // Click Delete button
    const deleteBtn = screen.getByRole('button', { name: /Delete/i });
    fireEvent.click(deleteBtn);

    // Modal should close and task should be deleted
    await waitFor(() => {
      expect(screen.queryByText('Edit Task')).not.toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.queryByText('Temporary Scratch Task')).not.toBeInTheDocument();
    });
  });
});

describe('Multi-Tenant Database Isolation Between Distinct Operators', () => {
  beforeEach(() => {
    window.localStorage.clear();
    delete (window as any).__NAYRA_TEST_UNAUTHENTICATED__;
  });

  it('maintains strict isolation between User Alpha and User Beta databases in local storage', async () => {
    // 1. Seed User Alpha's isolated data
    const alphaTask = {
      id: 'alpha_task_1',
      title: 'Alpha Secret Mission',
      due: '2026-10-02T09:00:00.000Z',
      status: 'needsAction' as const,
      taskListId: 'list_default',
      priority: 'high' as const,
      subtasks: [],
      totalFocusSeconds: 0,
      pomodoroCount: 0,
      createdAt: '2026-10-02T00:00:00.000Z',
      updatedAt: '2026-10-02T00:00:00.000Z',
    };
    window.localStorage.setItem('nayra_user_alpha_tasks', JSON.stringify([alphaTask]));

    // 2. Set current active user as User Alpha
    const alphaProfile = {
      uid: 'user_alpha',
      email: 'alpha@nayra.internal',
      displayName: 'Operator Alpha',
      isGuest: false,
      hasGoogleCalendarScope: true,
      hasGoogleTasksScope: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    window.localStorage.setItem('nayra_user_profile', JSON.stringify(alphaProfile));

    const UserTestingComponent: React.FC = () => {
      const { tasks, createTask } = useData();
      const { user } = useAuth();
      return (
        <div>
          <span data-testid="current-user">{user?.uid}</span>
          <div data-testid="task-titles">{tasks.map((t) => t.title).join(', ')}</div>
          <button
            onClick={() =>
              createTask({
                title: `${user?.displayName} Additional Task`,
                due: '2026-10-02',
              })
            }
          >
            Create Isolation Task
          </button>
        </div>
      );
    };

    const { unmount } = render(
      <TestHarness>
        <UserTestingComponent />
      </TestHarness>
    );

    // Verify User Alpha sees Alpha's task
    expect(screen.getByTestId('current-user')).toHaveTextContent('user_alpha');
    await waitFor(() => {
      expect(screen.getByTestId('task-titles')).toHaveTextContent('Alpha Secret Mission');
    });

    // Unmount and simulate switching to User Beta
    unmount();

    const betaProfile = {
      uid: 'user_beta',
      email: 'beta@nayra.internal',
      displayName: 'Operator Beta',
      isGuest: false,
      hasGoogleCalendarScope: true,
      hasGoogleTasksScope: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    window.localStorage.setItem('nayra_user_profile', JSON.stringify(betaProfile));

    render(
      <TestHarness>
        <UserTestingComponent />
      </TestHarness>
    );

    // Verify User Beta is active
    expect(screen.getByTestId('current-user')).toHaveTextContent('user_beta');

    // CRITICAL: User Beta MUST NOT see User Alpha's confidential tasks
    await waitFor(() => {
      expect(screen.getByTestId('task-titles')).not.toHaveTextContent('Alpha Secret Mission');
    });

    // User Beta creates their own task
    fireEvent.click(screen.getByText('Create Isolation Task'));

    await waitFor(() => {
      expect(screen.getByTestId('task-titles')).toHaveTextContent('Operator Beta Additional Task');
    });

    // Verify localStorage: Alpha's tasks are completely unaffected, Beta has separate key
    const alphaStored = window.localStorage.getItem('nayra_user_alpha_tasks');
    const betaStored = window.localStorage.getItem('nayra_user_beta_tasks');

    expect(alphaStored).toContain('Alpha Secret Mission');
    expect(alphaStored).not.toContain('Operator Beta Additional Task');

    expect(betaStored).toContain('Operator Beta Additional Task');
    expect(betaStored).not.toContain('Alpha Secret Mission');
  });
});

describe('Deep Two-Way Synchronization & Calendar Polish Verification', () => {
  const originalFetch = globalThis.fetch;
  let fetchMock: any;

  beforeEach(() => {
    window.localStorage.clear();
    delete (window as any).__NAYRA_TEST_UNAUTHENTICATED__;
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('filters out deleted tasks and cancelled events from Google API responses', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        items: [
          { id: 't_active', title: 'Active Task', status: 'needsAction' },
          { id: 't_deleted', title: 'Deleted Task', status: 'completed', deleted: true },
        ],
      }),
    });

    const tasks = await fetchGoogleTasks('test_token', '@default');
    expect(tasks).toHaveLength(1);
    expect(tasks[0].googleTaskId).toBe('t_active');
    expect(tasks[0].title).toBe('Active Task');

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        items: [
          { id: 'ev_active', summary: 'Active Meeting', start: { dateTime: '2026-10-02T10:00:00Z' } },
          { id: 'ev_cancelled', summary: 'Cancelled Meeting', status: 'cancelled' },
        ],
      }),
    });

    const events = await fetchGoogleEvents('test_token', 'primary');
    expect(events).toHaveLength(1);
    expect(events[0].googleEventId).toBe('ev_active');
    expect(events[0].title).toBe('Active Meeting');
  });

  it('renders all-day events in Day View with interactive click-to-edit support', async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const allDayEvent = {
      id: 'ev_all_day_test',
      title: 'Full Day Strategy Session',
      start: todayStr,
      end: todayStr,
      allDay: true,
      calendarId: 'primary',
      createdAt: `${todayStr}T00:00:00.000Z`,
      updatedAt: `${todayStr}T00:00:00.000Z`,
    };
    window.localStorage.setItem('nayra_test_operator_id_events', JSON.stringify([allDayEvent]));

    render(
      <TestHarness>
        <CalendarView />
      </TestHarness>
    );

    // Switch to Day view
    const dayBtn = await screen.findByText('day');
    fireEvent.click(dayBtn);

    // Verify All-Day Events section and title in Day View
    expect(await screen.findByText('All-Day Events (1)')).toBeInTheDocument();
    const eventBadge = screen.getByText('Full Day Strategy Session');
    expect(eventBadge).toBeInTheDocument();

    // Click to edit opens modal
    fireEvent.click(eventBadge);
    expect(await screen.findByText('Edit Event')).toBeInTheDocument();
  });

  it('calculates Month View item overflow accurately with asymmetric event/task counts', async () => {
    const events = [
      { id: 'ev1', title: 'Event 1', start: '2026-10-02T09:00:00Z', end: '2026-10-02T10:00:00Z', allDay: false, calendarId: 'primary', createdAt: '2026-10-02T00:00:00Z', updatedAt: '2026-10-02T00:00:00Z' },
      { id: 'ev2', title: 'Event 2', start: '2026-10-02T11:00:00Z', end: '2026-10-02T12:00:00Z', allDay: false, calendarId: 'primary', createdAt: '2026-10-02T00:00:00Z', updatedAt: '2026-10-02T00:00:00Z' },
      { id: 'ev3', title: 'Event 3', start: '2026-10-02T13:00:00Z', end: '2026-10-02T14:00:00Z', allDay: false, calendarId: 'primary', createdAt: '2026-10-02T00:00:00Z', updatedAt: '2026-10-02T00:00:00Z' },
      { id: 'ev4', title: 'Event 4', start: '2026-10-02T15:00:00Z', end: '2026-10-02T16:00:00Z', allDay: false, calendarId: 'primary', createdAt: '2026-10-02T00:00:00Z', updatedAt: '2026-10-02T00:00:00Z' },
    ];
    window.localStorage.setItem('nayra_test_operator_id_events', JSON.stringify(events));

    render(
      <TestHarness>
        <CalendarView />
      </TestHarness>
    );

    // Switch to month view
    const monthBtn = await screen.findByText('month');
    fireEvent.click(monthBtn);

    // Check that +1 more is rendered accurately (4 total - 3 visible = +1 more)
    expect(await screen.findByText('+1 more')).toBeInTheDocument();
  });

  it('fetchGoogleTasks retrieves all tasks across multiple paginated pages using nextPageToken', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          items: [{ id: 'task_page1', title: 'Task Page 1', status: 'needsAction' }],
          nextPageToken: 'token_page_2',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          items: [{ id: 'task_page2', title: 'Task Page 2', status: 'needsAction' }],
        }),
      });

    const tasks = await fetchGoogleTasks('test_token', '@default');
    expect(tasks).toHaveLength(2);
    expect(tasks[0].title).toBe('Task Page 1');
    expect(tasks[1].title).toBe('Task Page 2');
  });

  it('fetchGoogleTasks maps completed tasks with archived: true and groups parent subtasks', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        items: [
          { id: 'parent_1', title: 'Parent Objective', status: 'needsAction' },
          { id: 'sub_1', title: 'Child Step 1', status: 'completed', parent: 'parent_1' },
          { id: 'archived_task', title: 'Historical Task', status: 'completed' },
        ],
      }),
    });

    const tasks = await fetchGoogleTasks('test_token', '@default');
    expect(tasks).toHaveLength(3);

    const parent = tasks.find((t) => t.googleTaskId === 'parent_1');
    expect(parent).toBeDefined();
    expect(parent?.subtasks).toHaveLength(1);
    expect(parent?.subtasks?.[0].title).toBe('Child Step 1');
    expect(parent?.subtasks?.[0].completed).toBe(true);

    const historical = tasks.find((t) => t.googleTaskId === 'archived_task');
    expect(historical?.archived).toBe(true);
    expect(historical?.status).toBe('completed');
  });

  it('renders TasksView, supports archiving completed tasks, and expands the collapsible archive section', async () => {
    const initialTasks = [
      {
        id: 'task_active_1',
        title: 'Draft Quarterly Strategy',
        taskListId: 'list_default',
        status: 'needsAction',
        priority: 'high',
        totalFocusSeconds: 0,
        pomodoroCount: 0,
        createdAt: '2026-10-01T00:00:00Z',
        updatedAt: '2026-10-01T00:00:00Z',
      },
      {
        id: 'task_archived_1',
        title: 'Review System Specs',
        taskListId: 'list_default',
        status: 'completed',
        archived: true,
        archivedAt: '2026-10-01T00:00:00Z',
        priority: 'medium',
        totalFocusSeconds: 0,
        pomodoroCount: 0,
        createdAt: '2026-10-01T00:00:00Z',
        updatedAt: '2026-10-01T00:00:00Z',
      },
    ];
    window.localStorage.setItem('nayra_test_operator_id_tasks', JSON.stringify(initialTasks));

    render(
      <TestHarness>
        <TasksView />
      </TestHarness>
    );

    // Verify Active task is rendered in main list
    expect(await screen.findByText('Draft Quarterly Strategy')).toBeInTheDocument();

    // Verify Archived Tasks is present
    const archiveButtons = await screen.findAllByText('Archived Tasks');
    expect(archiveButtons.length).toBeGreaterThan(0);

    // Expand Archived section
    fireEvent.click(archiveButtons[archiveButtons.length - 1]);
    expect(await screen.findByText('Review System Specs')).toBeInTheDocument();
  });

  it('detects expired Google token (>55 mins) and displays Reconnect UI in TasksView', async () => {
    safeLocalStorageSet('nayra_google_token', 'expired_token_123');
    // Set timestamp to 2 hours ago
    safeLocalStorageSet('nayra_google_token_time', Date.now() - 2 * 60 * 60 * 1000);

    render(
      <TestHarness>
        <TasksView />
      </TestHarness>
    );

    // Verify Reconnect alert banner is rendered
    expect(await screen.findByText('Google Tasks Session Expired')).toBeInTheDocument();
    expect(screen.getByText('Reconnect & Sync')).toBeInTheDocument();
  });

  it('displays Reconnect Google button in Header when Google token is expired', async () => {
    safeLocalStorageSet('nayra_google_token', 'expired_token_123');
    safeLocalStorageSet('nayra_google_token_time', Date.now() - 2 * 60 * 60 * 1000);

    render(
      <TestHarness>
        <Header />
      </TestHarness>
    );

    expect(await screen.findByText('Reconnect Google')).toBeInTheDocument();
  });
});
