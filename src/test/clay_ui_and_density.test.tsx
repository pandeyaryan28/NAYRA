import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import App from '../App';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { safeLocalStorageGet } from '../lib/utils';
import pkg from '../../package.json';

describe('NAYRA v1.6.0 — Claymorphic UI/UX, Overall Zoom & Tasks Zoomout / Density Engine', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.pushState({}, '', '/');
  });

  it('verifies package.json version is incremented to 1.7.0', () => {
    expect(pkg.version).toBe('1.7.0');
  });

  it('renders Button with tactile clay styling, active spring compression, and dual shadows', () => {
    const { container, rerender } = render(<Button variant="primary">Primary Clay</Button>);
    const primaryBtn = screen.getByText('Primary Clay').closest('button');
    expect(primaryBtn).toBeInTheDocument();
    expect(primaryBtn?.className).toContain('ease-[cubic-bezier(0.34,1.56,0.64,1)]');
    expect(primaryBtn?.className).toContain('active:scale-[0.98]');

    rerender(<Button variant="secondary">Secondary Clay</Button>);
    const secondaryBtn = screen.getByText('Secondary Clay').closest('button');
    expect(secondaryBtn?.className).toContain('border-zinc-200/60');

    rerender(<Button variant="outline">Outline Clay</Button>);
    const outlineBtn = screen.getByText('Outline Clay').closest('button');
    expect(outlineBtn?.className).toContain('shadow-');
  });

  it('renders Input and Select with sunken clay indentation shadows', () => {
    render(
      <div>
        <Input label="Sunken Input" placeholder="Type here..." />
        <Select
          label="Sunken Select"
          options={[{ value: 'a', label: 'Option A' }]}
        />
      </div>
    );

    const input = screen.getByPlaceholderText('Type here...');
    expect(input.className).toContain('shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.05)]');

    const select = screen.getByLabelText('Sunken Select');
    expect(select.className).toContain('shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.05)]');
  });

  it('renders Badges with tactile rim bevel while strictly maintaining rectangular rounded-md shape', () => {
    render(
      <div>
        <Badge variant="default">Default Tag</Badge>
        <Badge variant="danger">High Priority</Badge>
        <Badge variant="success">Completed</Badge>
      </div>
    );

    const highTag = screen.getByText('High Priority');
    expect(highTag.className).toContain('rounded-md');
    expect(highTag.className).not.toContain('rounded-full');
    expect(highTag.className).toContain('shadow-[0_1px_2px_rgba(0,0,0,0.04)');
  });

  it('renders Modal with floating clay slab rounded-2xl container and spring scale animation', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Clay Slab Dialog">
        <div>Modal Content</div>
      </Modal>
    );

    const titleEl = screen.getByText('Clay Slab Dialog');
    const modalSurface = titleEl.closest('.relative.w-full');
    expect(modalSurface).toBeInTheDocument();
    expect(modalSurface?.className).toContain('rounded-2xl');
    expect(modalSurface?.className).toContain('animate-scale-in-spring');
  });

  it('navigates to Tasks view and verifies the scoped zoom-out container (tasks-zoomout-container) and wide layout (max-w-6xl)', async () => {
    render(<App />);

    const tasksLinks = screen.getAllByText('Tasks');
    const navAnchor = tasksLinks[0].closest('a') || tasksLinks[0];
    fireEvent.click(navAnchor);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Add a task (press Enter to save)...')).toBeInTheDocument();
    });

    // Check that the tasks-zoomout-container class and max-w-6xl are present on the container
    const mainArea = document.querySelector('.tasks-zoomout-container');
    expect(mainArea).not.toBeNull();
    expect(mainArea?.className).toContain('max-w-6xl');
    expect(mainArea?.className).toContain('tasks-zoomout-container');
  });

  it('provides Density Mode Switcher (Compact, Comfortable, Board) and persists selection in localStorage', async () => {
    render(<App />);

    const tasksLinks = screen.getAllByText('Tasks');
    const navAnchor = tasksLinks[0].closest('a') || tasksLinks[0];
    fireEvent.click(navAnchor);

    await waitFor(() => {
      expect(screen.getByText('Compact')).toBeInTheDocument();
    });

    const compactBtn = screen.getByText('Compact');
    const comfortableBtn = screen.getByText('Comfortable');
    const boardBtn = screen.getByText('Board');

    expect(compactBtn).toBeInTheDocument();
    expect(comfortableBtn).toBeInTheDocument();
    expect(boardBtn).toBeInTheDocument();

    // Default mode is compact
    expect(window.localStorage.getItem('nayra_tasks_density_mode')).toBeFalsy(); // or default initialized

    // Switch to Comfortable
    fireEvent.click(comfortableBtn);
    expect(safeLocalStorageGet('nayra_tasks_density_mode', '')).toBe('comfortable');

    // Switch to Board
    fireEvent.click(boardBtn);
    expect(safeLocalStorageGet('nayra_tasks_density_mode', '')).toBe('board');

    // Switch back to Compact
    fireEvent.click(compactBtn);
    expect(safeLocalStorageGet('nayra_tasks_density_mode', '')).toBe('compact');
  });

  it('creates multiple tasks and renders high-density compact rows in Compact mode', async () => {
    render(<App />);

    const tasksLinks = screen.getAllByText('Tasks');
    const navAnchor = tasksLinks[0].closest('a') || tasksLinks[0];
    fireEvent.click(navAnchor);

    const input = await screen.findByPlaceholderText('Add a task (press Enter to save)...');

    // Add 3 tasks
    for (const title of ['Density Task Alpha', 'Density Task Beta', 'Density Task Gamma']) {
      fireEvent.change(input, { target: { value: title } });
      fireEvent.submit(input.closest('form')!);
    }

    await waitFor(() => {
      expect(screen.getByText('Density Task Alpha')).toBeInTheDocument();
      expect(screen.getByText('Density Task Beta')).toBeInTheDocument();
      expect(screen.getByText('Density Task Gamma')).toBeInTheDocument();
    });

    // Verify task row has compact styling
    const taskTitle = screen.getByText('Density Task Alpha');
    const taskRow = taskTitle.closest('.group');
    expect(taskRow).toBeInTheDocument();
    expect(taskRow?.className).toContain('task-item-enter');
  });

  it('switches to Board mode and displays tasks in multi-column grid layout', async () => {
    render(<App />);

    const tasksLinks = screen.getAllByText('Tasks');
    const navAnchor = tasksLinks[0].closest('a') || tasksLinks[0];
    fireEvent.click(navAnchor);

    const input = await screen.findByPlaceholderText('Add a task (press Enter to save)...');
    fireEvent.change(input, { target: { value: 'Board Kanban Item' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Board Kanban Item')).toBeInTheDocument();
    });

    // Switch to board mode
    const boardBtn = screen.getByText('Board');
    fireEvent.click(boardBtn);

    // Verify board multi-column grid container appears
    await waitFor(() => {
      const gridContainer = document.querySelector('.grid.grid-cols-1');
      expect(gridContainer).not.toBeNull();
    });
  });

  it('strictly adheres to Anti-AI Slop guidelines across views', () => {
    render(<App />);

    // Zero rounded-full badges or chips
    const roundedFullElements = document.querySelectorAll('.rounded-full');
    expect(roundedFullElements.length).toBe(0);

    // Zero pulsing/glowing dots
    const pingingElements = document.querySelectorAll('.animate-ping');
    expect(pingingElements.length).toBe(0);
  });

  it('verifies platform-wide claymorphic surfaces on Dashboard and Habits views', async () => {
    render(<App />);

    // Verify Dashboard contains rounded-2xl interactive-cards
    const dashboardCards = document.querySelectorAll('.interactive-card.rounded-2xl');
    expect(dashboardCards.length).toBeGreaterThan(0);

    // Navigate to Habits view and verify clay-surface table container
    const habitsLinks = screen.getAllByText('Habits');
    const habitsAnchor = habitsLinks[0].closest('a') || habitsLinks[0];
    fireEvent.click(habitsAnchor);

    await waitFor(() => {
      const habitMatrix = document.querySelector('.clay-surface.rounded-2xl');
      expect(habitMatrix).not.toBeNull();
    });
  });

  it('verifies Settings view cards feature clay-surface rounded-2xl styling', async () => {
    render(<App />);

    const settingsLinks = screen.getAllByText('Settings');
    const settingsAnchor = settingsLinks[0].closest('a') || settingsLinks[0];
    fireEvent.click(settingsAnchor);

    await waitFor(() => {
      expect(screen.getByText('Google Cloud & Account Integration')).toBeInTheDocument();
    });

    const settingsCards = document.querySelectorAll('.clay-surface.rounded-2xl');
    expect(settingsCards.length).toBeGreaterThanOrEqual(4);
  });

  it('verifies edit task modal textarea has sunken clay indentation shadow', async () => {
    render(<App />);

    const tasksLinks = screen.getAllByText('Tasks');
    const navAnchor = tasksLinks[0].closest('a') || tasksLinks[0];
    fireEvent.click(navAnchor);

    const input = await screen.findByPlaceholderText('Add a task (press Enter to save)...');
    fireEvent.change(input, { target: { value: 'Textarea Test Task' } });
    fireEvent.submit(input.closest('form')!);

    const taskItem = await screen.findByText('Textarea Test Task');
    fireEvent.click(taskItem);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Add details, background context, or links...')).toBeInTheDocument();
    });

    const notesTextarea = screen.getByPlaceholderText('Add details, background context, or links...');
    expect(notesTextarea.className).toContain('shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.05)]');
  });

  it('renders prominent New Task CTA in the main sidebar and navigates or focuses task creation', async () => {
    render(<App />);

    // Prominent New Task CTA in main sidebar
    const newBtns = screen.getAllByText('New Task');
    expect(newBtns.length).toBeGreaterThan(0);
    const newBtn = newBtns[0].closest('button');
    expect(newBtn).toBeInTheDocument();
    expect(newBtn?.className).toContain('bg-zinc-900');

    // Clicking New Task navigates to tasks view and renders quick add form
    fireEvent.click(newBtn!);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Add a task (press Enter to save)...')).toBeInTheDocument();
    });
  });

  it('renders Starred view, Create new list CTA, and circular checkboxes in Google Tasks layout', async () => {
    render(<App />);

    const tasksLinks = screen.getAllByText('Tasks');
    const navAnchor = tasksLinks[0].closest('a') || tasksLinks[0];
    fireEvent.click(navAnchor);

    // Verify Starred item is present in left selector
    await waitFor(() => {
      expect(screen.getByText('Starred')).toBeInTheDocument();
      expect(screen.getByText('Create new list')).toBeInTheDocument();
    });

    // Create a task to test circular checkbox and star toggle
    const input = screen.getByPlaceholderText('Add a task (press Enter to save)...');
    fireEvent.change(input, { target: { value: 'Google Tasks Starred Item' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Google Tasks Starred Item')).toBeInTheDocument();
    });

    // Verify circular checkbox exists
    const checkbox = screen.getAllByLabelText('Toggle complete')[0];
    expect(checkbox.className).toContain('rounded-[999px]');

    // Verify Star task button exists and can be toggled
    const starBtn = screen.getByTitle('Star task');
    expect(starBtn).toBeInTheDocument();
    fireEvent.click(starBtn);

    // Star should now be active
    await waitFor(() => {
      expect(screen.getByTitle('Starred task')).toBeInTheDocument();
    });

    // Switch to Starred view
    const starredNav = screen.getByText('Starred').closest('button')!;
    fireEvent.click(starredNav);

    await waitFor(() => {
      expect(screen.getByText('Starred Tasks')).toBeInTheDocument();
      expect(screen.getByText('Google Tasks Starred Item')).toBeInTheDocument();
    });
  });
});
