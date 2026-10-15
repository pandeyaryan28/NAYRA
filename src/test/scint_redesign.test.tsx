import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SCIntView } from '../views/SCIntView';

// Mock context dependencies if needed
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ currentUser: null, isGuest: true, userProfile: null }),
}));

describe('SCInt Studio — Guided 3-Step Decision Flow & Multi-Sector Architecture (v2.7.0)', () => {
  it('renders SCInt Studio header, sector dropdown, and 3-step progress bar', () => {
    render(<SCIntView />);

    expect(screen.getByText('SCInt Studio')).toBeInTheDocument();
    expect(screen.getByText('India Microchip Business Guide')).toBeInTheDocument();
    expect(screen.getByLabelText('Select Sovereign Industrial Sector')).toBeInTheDocument();

    // 3-Step Guided Breadcrumbs
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Value Chain Stage')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
    expect(screen.getByText('Venture Playbook')).toBeInTheDocument();
    expect(screen.getByText('Step 3')).toBeInTheDocument();
    expect(screen.getByText('Diligence Dossier')).toBeInTheDocument();
  });

  it('Step 1: renders all 6 spacious silicon continuum stages with comfortable typography', () => {
    render(<SCIntView />);

    expect(screen.getByText(/Where in India's microchip journey do you want to build\?/i)).toBeInTheDocument();

    // Verify all 6 stages are rendered with proper stage badges
    expect(screen.getByText('Stage 00')).toBeInTheDocument();
    expect(screen.getByText('Stage 01')).toBeInTheDocument();
    expect(screen.getByText('Stage 02')).toBeInTheDocument();
    expect(screen.getByText('Stage 03')).toBeInTheDocument();
    expect(screen.getByText('Stage 04')).toBeInTheDocument();
    expect(screen.getByText('Stage 05')).toBeInTheDocument();

    // Verify key stage descriptions in friendly plain language
    expect(screen.getByText(/Raw Earth & Mined Minerals/i)).toBeInTheDocument();
    expect(screen.getByText(/Chip Factories \(Cleanroom Fabs\)/i)).toBeInTheDocument();
  });

  it('Step 1 to Step 2: selecting a stage navigates to curated playbooks with high-contrast metrics', async () => {
    render(<SCIntView />);

    // Click Stage 00 button
    const stage0Btn = screen.getByRole('button', { name: /Stage 00/i });
    fireEvent.click(stage0Btn);

    // Should navigate to Step 2
    await waitFor(() => {
      expect(screen.getByText(/Strategic Business Playbooks/i)).toBeInTheDocument();
      expect(screen.getByText(/Acid-Grade Fluorspar/i)).toBeInTheDocument();
    });

    // Check financial clarity
    expect(screen.getAllByText(/Total Factory Setup Cost/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Your Actual Outlay/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Govt Grant/i).length).toBeGreaterThan(0);
  });

  it('Step 2: filters playbooks dynamically via global search', async () => {
    render(<SCIntView />);

    // Navigate to Step 2
    fireEvent.click(screen.getByRole('button', { name: /Stage 00/i }));

    await waitFor(() => {
      expect(screen.getByText(/Acid-Grade Fluorspar/i)).toBeInTheDocument();
    });

    // Search for Gallium
    const searchInput = screen.getByPlaceholderText('Search playbooks, minerals, buyers...');
    fireEvent.change(searchInput, { target: { value: 'Gallium' } });

    await waitFor(() => {
      expect(screen.getByText(/Compound Semiconductor Precursors/i)).toBeInTheDocument();
      expect(screen.queryByText(/Acid-Grade Fluorspar/i)).not.toBeInTheDocument();
    });
  });

  it('Step 2 to Step 3: selecting a playbook opens the Executive Dossier with live simulator and deep dive', async () => {
    render(<SCIntView />);

    // Go to Step 2
    fireEvent.click(screen.getByRole('button', { name: /Stage 00/i }));

    // Click on the first playbook card (Acid-Grade Fluorspar)
    await waitFor(() => {
      expect(screen.getByText(/Acid-Grade Fluorspar/i)).toBeInTheDocument();
    });

    const openDossierButtons = screen.getAllByText(/View Business Plan/i);
    fireEvent.click(openDossierButtons[0]);

    // Should navigate to Step 3
    await waitFor(() => {
      expect(screen.getByText(/Interactive Investment & Government Subsidy Calculator/i)).toBeInTheDocument();
      expect(screen.getByText(/Ready Customers in India/i)).toBeInTheDocument();
      expect(screen.getByText(/Best Industrial Parks in India to Build This Factory/i)).toBeInTheDocument();
      expect(screen.getByText(/Factory Machinery, Ingredients & Government Licenses/i)).toBeInTheDocument();
    });

    // Test the state policy incentive dropdown
    const stateSelector = screen.getByDisplayValue(/Gujarat/i);
    fireEvent.change(stateSelector, { target: { value: 'uttar-pradesh' } });

    // Verify calculated output includes UP incentive
    expect(screen.getByText(/Uttar Pradesh State Government Grant/i)).toBeInTheDocument();

    // Toggle Technical Machinery Accordion Deep Dive
    const viewDeepDiveBtn = screen.getByText('View Machinery & Permits');
    fireEvent.click(viewDeepDiveBtn);

    await waitFor(() => {
      expect(screen.getByText(/Heavy Factory Machines Needed/i)).toBeInTheDocument();
      expect(screen.getByText(/Raw Materials & Ingredients/i)).toBeInTheDocument();
    });
  });

  it('Multi-Sector Extensibility: switching sectors displays roadmap and enables returning', async () => {
    render(<SCIntView />);

    const sectorSelect = screen.getByLabelText('Select Sovereign Industrial Sector');
    fireEvent.change(sectorSelect, { target: { value: 'solar' } });

    // Should display Solar roadmap
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Solar Photovoltaics & Clean Tech/i })).toBeInTheDocument();
      expect(screen.getByText(/Sovereign Roadmap Pipeline/i)).toBeInTheDocument();
    });

    // Return to semiconductors
    const returnBtn = screen.getByText('Return to Semiconductors & Microchips');
    fireEvent.click(returnBtn);

    await waitFor(() => {
      expect(screen.getByText(/Where in India's microchip journey do you want to build\?/i)).toBeInTheDocument();
    });
  });

  it('strictly enforces Anti-AI Slop design directives', () => {
    const { container } = render(<SCIntView />);

    // Directive 1: No rounded-full decorative pills
    const pillBadges = container.querySelectorAll('.rounded-full');
    expect(pillBadges.length).toBe(0);

    // Directive 2: No pulsing/glowing dots (animate-ping)
    const pulsingDots = container.querySelectorAll('.animate-ping');
    expect(pulsingDots.length).toBe(0);

    // Directive 3: No custom circle mouse cursor overrides
    const cursorNone = container.querySelectorAll('[style*="cursor: none"]');
    expect(cursorNone.length).toBe(0);
  });
});
