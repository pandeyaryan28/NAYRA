import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SCIntView } from '../views/SCIntView';

// Mock context dependencies if needed
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ currentUser: null, isGuest: true, userProfile: null }),
}));

describe('SCInt Studio — Apple & Steve Jobs 4-Hub Redesign Suite (v2.6.0)', () => {
  it('renders SCInt Studio header and all 4 Apple Studio Hubs', () => {
    render(<SCIntView />);

    expect(screen.getByText('SCInt Studio')).toBeInTheDocument();
    expect(screen.getByText('Value Chain')).toBeInTheDocument();
    expect(screen.getByText('Venture Studio')).toBeInTheDocument();
    expect(screen.getByText('CapEx Lab')).toBeInTheDocument();
    expect(screen.getByText('Industrial Hubs')).toBeInTheDocument();
  });

  it('navigates through 6 stages in the Value Chain Hub', () => {
    render(<SCIntView />);

    // Stage continuum ribbon
    expect(screen.getByText('Stage 00')).toBeInTheDocument();
    expect(screen.getByText('Stage 01')).toBeInTheDocument();
    expect(screen.getByText('Stage 02')).toBeInTheDocument();
    expect(screen.getByText('Stage 03')).toBeInTheDocument();
    expect(screen.getByText('Stage 04')).toBeInTheDocument();
    expect(screen.getByText('Stage 05')).toBeInTheDocument();

    // Default stage is Tier 0
    expect(screen.getByText(/Tier 0: Raw Mining & Mineral Extraction/i)).toBeInTheDocument();

    // Click Stage 03 (Fabrication Fabs)
    fireEvent.click(screen.getByText('Stage 03'));
    expect(screen.getByText(/Tier 3: Semiconductor Fabrication \(Fabs\)/i)).toBeInTheDocument();
  });

  it('switches to Venture Studio and tests category filtering and Genius Inspector', async () => {
    render(<SCIntView />);

    // Switch to Venture Studio hub
    fireEvent.click(screen.getByText('Venture Studio'));
    expect(screen.getByText('All 34 Blueprints')).toBeInTheDocument();

    // Search for Gallium
    const searchInput = screen.getByPlaceholderText('Search nodes, minerals, machinery...');
    fireEvent.change(searchInput, { target: { value: 'Gallium' } });

    // Should find the node
    await waitFor(() => {
      expect(screen.getAllByText(/Gallium/i).length).toBeGreaterThan(0);
    });

    // Click on the card to open Genius Inspector sheet
    const inspectLinks = screen.getAllByText('Inspect');
    expect(inspectLinks.length).toBeGreaterThan(0);
    fireEvent.click(inspectLinks[0]);

    // Genius Inspector sheet should be open
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Overview & Moat')).toBeInTheDocument();
      expect(screen.getByText('Financial Stack')).toBeInTheDocument();
      expect(screen.getByText('Factory & Machinery')).toBeInTheDocument();
      expect(screen.getByText('Offtake & Clearances')).toBeInTheDocument();
    });

    // Switch tabs within the Genius Inspector
    fireEvent.click(screen.getByText('Financial Stack'));
    expect(screen.getByText(/CapEx & Subsidy Waterfall/i)).toBeInTheDocument();

    // Close inspector
    fireEvent.click(screen.getByLabelText('Close Inspector'));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('switches to CapEx Lab and verifies live dynamic subsidy calculation', () => {
    render(<SCIntView />);

    // Switch to CapEx Lab hub
    fireEvent.click(screen.getByText('CapEx Lab'));

    expect(screen.getByText(/CapEx & Sovereign Subsidy Incentive Engine/i)).toBeInTheDocument();
    expect(screen.getByText('Project Financing Structure')).toBeInTheDocument();

    // Default CapEx is ₹10,000 Cr in Gujarat (50% central + 20% state = 70% total subsidy)
    // 70% of 10,000 = 7,000 Cr subsidy => Net Outlay = 3,000 Cr
    expect(screen.getByText('70% Combined Subsidy')).toBeInTheDocument();
    expect(screen.getByText('₹3,000 Crores')).toBeInTheDocument();

    // Select Uttar Pradesh (+25% top-up => 75% total subsidy)
    const upButton = screen.getByText('Uttar Pradesh');
    fireEvent.click(upButton);

    expect(screen.getByText('75% Combined Subsidy')).toBeInTheDocument();
    // 75% of 10,000 = 7,500 Cr subsidy => Net Outlay = 2,500 Cr
    expect(screen.getByText('₹2,500 Crores')).toBeInTheDocument();
  });

  it('switches to Industrial Hubs and inspects India sovereign corridor feasibility', () => {
    render(<SCIntView />);

    // Switch to Industrial Hubs
    fireEvent.click(screen.getByText('Industrial Hubs'));

    expect(screen.getByText(/India's Emerging Semiconductor Industrial Footprint/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Dholera Special Investment Region/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Sanand GIDC Industrial Cluster/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Yamuna Expressway Industrial Development Authority/i).length).toBeGreaterThan(0);

    // Click Sanand GIDC
    const sanandButtons = screen.getAllByText(/Sanand GIDC Industrial Cluster/i);
    fireEvent.click(sanandButtons[0]);
    expect(screen.getByText(/Micron Technology/i)).toBeInTheDocument();
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
