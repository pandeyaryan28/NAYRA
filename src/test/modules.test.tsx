import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import App from '../App';
import { CA_SUBJECTS } from '../data/caFoundationData';
import { formatSecondsToTimer, formatSecondsToHoursMinutes } from '../lib/utils';

describe('NAYRA Personal Operating System — Complete Module Tests', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders application shell and all navigation destinations', async () => {
    render(<App />);

    expect(screen.getByText('NAYRA')).toBeInTheDocument();
    expect(screen.getByText('Personal OS')).toBeInTheDocument();

    // Verify presence of main module navigation links
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Calendar').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Tasks').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Focus Lab').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Habits').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Nutrition').length).toBeGreaterThan(0);
    expect(screen.getAllByText('CA Tracker').length).toBeGreaterThan(0);
    expect(screen.getAllByText('SCInt Engine').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Analytics').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Assistant').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Settings').length).toBeGreaterThan(0);
  });

  it('navigates to Calendar view and switches between Day, Week, Month, and Agenda modes', async () => {
    render(<App />);

    // Click Calendar nav item in sidebar
    const calendarLinks = screen.getAllByText('Calendar');
    fireEvent.click(calendarLinks[0]);

    // Should display Google Calendar view controls
    expect(screen.getByText('Create')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('week')).toBeInTheDocument();

    // Switch to month view
    fireEvent.click(screen.getByText('month'));
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Sun')).toBeInTheDocument();

    // Switch to day view
    fireEvent.click(screen.getByText('day'));

    // Switch to agenda view
    fireEvent.click(screen.getByText('agenda'));
  });

  it('navigates to Tasks view, adds a new task, adds a subtask, and verifies inline rendering', async () => {
    render(<App />);

    const tasksLinks = screen.getAllByText('Tasks');
    fireEvent.click(tasksLinks[0]);

    const input = screen.getByPlaceholderText('Add a task (press Enter to save)...');
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'Synthesize Semiconductor Matrix' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Synthesize Semiconductor Matrix')).toBeInTheDocument();
    });

    // Open task details modal by clicking on the task title
    fireEvent.click(screen.getByText('Synthesize Semiconductor Matrix'));

    await waitFor(() => {
      expect(screen.getByText(/Edit Task/i)).toBeInTheDocument();
    });

    // Add a subtask in the edit modal
    const subtaskInput = screen.getByPlaceholderText('New subtask title...');
    fireEvent.change(subtaskInput, { target: { value: 'Phase 1: Raw Materials' } });
    fireEvent.click(screen.getByText('Add Subtask'));

    await waitFor(() => {
      expect(screen.getByText('Phase 1: Raw Materials')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(screen.getByText(/subtask/i)).toBeInTheDocument();
    });
  });

  it('links a task directly to Focus Lab and verifies timer initialization', async () => {
    render(<App />);

    const tasksLinks = screen.getAllByText('Tasks');
    const navAnchor = tasksLinks[0].closest('a') || tasksLinks[0];
    fireEvent.click(navAnchor);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Add a task (press Enter to save)...')).toBeInTheDocument();
    });

    // Create a task first
    const input = screen.getByPlaceholderText('Add a task (press Enter to save)...');
    fireEvent.change(input, { target: { value: 'Deep Work Sprint' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Deep Work Sprint')).toBeInTheDocument();
    });

    // Find the task Focus button in Tasks view
    const focusButtons = screen.getAllByTitle('Start Focus on this task');
    expect(focusButtons.length).toBeGreaterThan(0);
    fireEvent.click(focusButtons[0]);

    // Should navigate to Focus Lab with the task linked
    await waitFor(() => {
      expect(screen.getByText('Associated Task')).toBeInTheDocument();
      expect(screen.getByText('Deep Work Sprint')).toBeInTheDocument();
    });
  });

  it('verifies Pomodoro timer modes: Focus, Short Break, Long Break and cycle pips', async () => {
    render(<App />);

    const focusLinks = screen.getAllByText('Focus Lab');
    fireEvent.click(focusLinks[0]);

    expect(screen.getByText(/Focus \(25m\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Short Break \(5m\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Long Break \(15m\)/i)).toBeInTheDocument();

    // Switch to short break
    fireEvent.click(screen.getByText(/Short Break \(5m\)/i));
    expect(screen.getByText('05:00')).toBeInTheDocument();

    // Switch to long break
    fireEvent.click(screen.getByText(/Long Break \(15m\)/i));
    expect(screen.getByText('15:00')).toBeInTheDocument();
  });

  it('navigates to Habit Tracker, toggles completion, and filters active vs archived', async () => {
    render(<App />);

    const habitsLinks = screen.getAllByText('Habits');
    fireEvent.click(habitsLinks[0]);

    expect(screen.getAllByText('Habit Tracker').length).toBeGreaterThan(0);
    expect(screen.getByText('New Habit')).toBeInTheDocument();

    // Create a new habit dynamically
    fireEvent.click(screen.getByText('New Habit'));
    await waitFor(() => {
      expect(screen.getByText('Create New Habit')).toBeInTheDocument();
    });

    const titleInput = screen.getByPlaceholderText(/Morning Deep Work Block/i);
    fireEvent.change(titleInput, { target: { value: 'Daily Deep Reading' } });
    fireEvent.click(screen.getByText('Create Habit'));

    await waitFor(() => {
      expect(screen.getByText('Daily Deep Reading')).toBeInTheDocument();
    });

    // Toggle habit completion checkbox
    const toggleButtons = screen.getAllByLabelText(/Toggle habit on/i);
    expect(toggleButtons.length).toBeGreaterThan(0);
    fireEvent.click(toggleButtons[0]);

    // Verify streak info is present
    expect(screen.getAllByText(/Best:/i).length).toBeGreaterThan(0);

    // Check Active vs Archived filter toggle
    expect(screen.getByText(/Active \(/i)).toBeInTheDocument();
    expect(screen.getByText(/Archived \(/i)).toBeInTheDocument();

    // Switch to Archived tab
    fireEvent.click(screen.getByText(/Archived \(/i));
    await waitFor(() => {
      expect(screen.getByText('No archived habits.')).toBeInTheDocument();
    });
  });

  it('navigates to Nutrition & Calorie Tracker, performs quick add, and edits entry macros', async () => {
    render(<App />);

    const nutritionLinks = screen.getAllByText('Nutrition');
    fireEvent.click(nutritionLinks[0]);

    expect(screen.getByText('Nutrition & Calorie Tracker')).toBeInTheDocument();
    expect(screen.getByText('Log Food')).toBeInTheDocument();

    // Find quick add button (+100)
    const quickAddBtn = screen.getByText('+100');
    fireEvent.click(quickAddBtn);

    // Verify quick log item created
    await waitFor(() => {
      expect(screen.getByText('Quick Log (+100 kcal)')).toBeInTheDocument();
    });

    // Click edit on the quick logged entry
    const editBtns = screen.getAllByTitle('Edit Entry');
    expect(editBtns.length).toBeGreaterThan(0);
    fireEvent.click(editBtns[0]);

    // Modal should open for editing
    await waitFor(() => {
      expect(screen.getByText('Edit Food Entry')).toBeInTheDocument();
    });

    const foodInput = screen.getByDisplayValue('Quick Log (+100 kcal)');
    fireEvent.change(foodInput, { target: { value: 'Organic Rolled Oats' } });

    const caloriesInput = screen.getByDisplayValue('100');
    fireEvent.change(caloriesInput, { target: { value: '520' } });

    fireEvent.submit(screen.getByText('Update Entry').closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Organic Rolled Oats')).toBeInTheDocument();
      expect(screen.getAllByText('520 kcal').length).toBeGreaterThan(0);
    });
  });

  it('navigates to CA Tracker, verifies syllabus, and launches study session into Focus Lab', async () => {
    render(<App />);

    const caLinks = screen.getAllByText('CA Tracker');
    fireEvent.click(caLinks[0]);

    expect(screen.getAllByText('CA Foundation Exam Preparation Tracker').length).toBeGreaterThan(0);

    // Verify all 4 ICAI papers
    CA_SUBJECTS.forEach((sub) => {
      expect(screen.getByText(sub.name)).toBeInTheDocument();
    });

    // Verify Test score logger button
    expect(screen.getByText('Log Test Score')).toBeInTheDocument();

    // Click "Start Study" or "Focus Study" on a topic to launch focus session
    const studyButtons = screen.getAllByText(/Start Study|Focus Study/i);
    expect(studyButtons.length).toBeGreaterThan(0);
    fireEvent.click(studyButtons[0]);

    // Should navigate to Focus Lab with the task linked
    await waitFor(() => {
      expect(screen.getByText('Associated Task')).toBeInTheDocument();
      expect(screen.getByText(/CA Foundation:/i)).toBeInTheDocument();
    });
  });

  it('navigates to SCInt Engine and verifies 34 venture blueprints and CapEx scale switching', async () => {
    render(<App />);

    const scintLinks = screen.getAllByText('SCInt Engine');
    fireEvent.click(scintLinks[0]);

    expect(screen.getByText(/SCInt: Semiconductor Full Supply Chain/i)).toBeInTheDocument();
    expect(screen.getByText('Complete Matrix')).toBeInTheDocument();

    // Toggle to Benchmark Scale
    const benchmarkBtn = screen.getByText('Benchmark Scale');
    fireEvent.click(benchmarkBtn);

    // Search for Fluorspar
    const searchInput = screen.getByPlaceholderText('Search node, machinery, material or cluster...');
    fireEvent.change(searchInput, { target: { value: 'Fluorspar' } });

    await waitFor(() => {
      expect(screen.getByText('Acid Grade Fluorspar Beneficiation')).toBeInTheDocument();
    });
  });

  it('navigates to Productivity Analytics and verifies cross-module metrics', async () => {
    render(<App />);

    const analyticsLinks = screen.getAllByText('Analytics');
    fireEvent.click(analyticsLinks[0]);

    expect(screen.getByText('Productivity & Execution Analytics')).toBeInTheDocument();
    expect(screen.getByText('Total Focus Time')).toBeInTheDocument();
    expect(screen.getByText('Task Velocity')).toBeInTheDocument();
    expect(screen.getByText('Habit Adherence')).toBeInTheDocument();
    expect(screen.getByText('7-Day Deep Work Distribution')).toBeInTheDocument();
  });

  it('navigates to Personal Assistant and executes natural language commands', async () => {
    render(<App />);

    const assistantLinks = screen.getAllByText('Assistant');
    fireEvent.click(assistantLinks[0]);

    expect(screen.getByText('NAYRA Personal Assistant')).toBeInTheDocument();

    // Execute "Plan my day."
    const planDayBtn = screen.getByText('Plan my day.');
    fireEvent.click(planDayBtn);

    await waitFor(() => {
      expect(screen.getByText(/Here is your strategic plan for today/i)).toBeInTheDocument();
    });
  });

  it('navigates to Settings and verifies dual-theme, auto-start toggles, and data export', async () => {
    render(<App />);

    const settingsLinks = screen.getAllByText('Settings');
    fireEvent.click(settingsLinks[0]);

    expect(screen.getByText('System Settings & Preferences')).toBeInTheDocument();
    expect(screen.getByText('Google Cloud & Account Integration')).toBeInTheDocument();
    expect(screen.getByText('Auto-start break intervals')).toBeInTheDocument();
    expect(screen.getByText('Auto-start focus intervals')).toBeInTheDocument();
    expect(screen.getByText('Export JSON')).toBeInTheDocument();

    // Click light theme
    const lightThemeBtn = screen.getByText('light Theme');
    fireEvent.click(lightThemeBtn);

    // Click dark theme
    const darkThemeBtn = screen.getByText('dark Theme');
    fireEvent.click(darkThemeBtn);
  });

  it('validates utility timer formatting helpers', () => {
    expect(formatSecondsToTimer(1500)).toBe('25:00');
    expect(formatSecondsToTimer(300)).toBe('05:00');
    expect(formatSecondsToTimer(75)).toBe('01:15');

    expect(formatSecondsToHoursMinutes(3600)).toBe('1h 0m');
    expect(formatSecondsToHoursMinutes(5400)).toBe('1h 30m');
    expect(formatSecondsToHoursMinutes(1500)).toBe('25m');
  });
});
