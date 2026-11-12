import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PWAInstallPrompt, OfflineIndicator, UpdateAvailableToast } from '../components/pwa';
import * as pwaLib from '../lib/pwa';

describe('PWA UI Components (v2.18.0)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('PWAInstallPrompt', () => {
    it('does not render when app is already installed in standalone mode', () => {
      vi.spyOn(pwaLib, 'isPWAInstalled').mockReturnValue(true);

      const { container } = render(<PWAInstallPrompt />);
      expect(container).toBeEmptyDOMElement();
    });

    it('does not render when prompt was dismissed within the 7-day cooldown', () => {
      vi.spyOn(pwaLib, 'isPWAInstalled').mockReturnValue(false);
      localStorage.setItem('nayra_pwa_install_dismissed_at', Date.now().toString());

      const { container } = render(<PWAInstallPrompt />);
      expect(container).toBeEmptyDOMElement();
    });

    it('renders and triggers native install prompt when beforeinstallprompt fires', async () => {
      vi.spyOn(pwaLib, 'isPWAInstalled').mockReturnValue(false);
      vi.spyOn(pwaLib, 'isIOS').mockReturnValue(false);

      render(<PWAInstallPrompt />);

      // Initially no prompt is shown
      expect(screen.queryByRole('heading', { name: 'Install NAYRA' })).not.toBeInTheDocument();

      // Dispatch simulated beforeinstallprompt event
      const mockPrompt = vi.fn().mockResolvedValue(undefined);
      const mockUserChoice = Promise.resolve({ outcome: 'accepted' as const, platform: 'web' });

      const mockEvent = new Event('beforeinstallprompt') as any;
      mockEvent.prompt = mockPrompt;
      mockEvent.userChoice = mockUserChoice;
      mockEvent.preventDefault = vi.fn();

      act(() => {
        window.dispatchEvent(mockEvent);
      });

      // Now prompt is visible
      expect(screen.getByRole('heading', { name: 'Install NAYRA' })).toBeInTheDocument();
      expect(screen.getByText(/Add to your home screen or desktop dock/i)).toBeInTheDocument();

      // Clicking Install triggers prompt
      const installBtn = screen.getByRole('button', { name: /Install NAYRA/i });
      await act(async () => {
        fireEvent.click(installBtn);
      });

      expect(mockPrompt).toHaveBeenCalled();
    });

    it('dismisses prompt and persists timestamp to localStorage when user clicks Not Now', () => {
      vi.spyOn(pwaLib, 'isPWAInstalled').mockReturnValue(false);
      vi.spyOn(pwaLib, 'isIOS').mockReturnValue(false);

      render(<PWAInstallPrompt />);

      const mockEvent = new Event('beforeinstallprompt') as any;
      mockEvent.prompt = vi.fn();
      mockEvent.userChoice = Promise.resolve({ outcome: 'dismissed' as const, platform: 'web' });
      mockEvent.preventDefault = vi.fn();

      act(() => {
        window.dispatchEvent(mockEvent);
      });

      expect(screen.getByRole('heading', { name: 'Install NAYRA' })).toBeInTheDocument();

      const notNowBtn = screen.getByRole('button', { name: /Not Now/i });
      act(() => {
        fireEvent.click(notNowBtn);
      });

      expect(screen.queryByRole('heading', { name: 'Install NAYRA' })).not.toBeInTheDocument();
      expect(localStorage.getItem('nayra_pwa_install_dismissed_at')).toBeTruthy();
    });

    it('renders iOS specific instructions on iOS Safari when not standalone', () => {
      vi.useFakeTimers();
      vi.spyOn(pwaLib, 'isPWAInstalled').mockReturnValue(false);
      vi.spyOn(pwaLib, 'isIOS').mockReturnValue(true);

      render(<PWAInstallPrompt />);

      // Fast-forward entrance timer
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(screen.getByRole('heading', { name: 'Install NAYRA' })).toBeInTheDocument();
      expect(screen.getByText(/Install on your iPhone\/iPad Home Screen/i)).toBeInTheDocument();
      expect(screen.getByText(/Tap Share/i)).toBeInTheDocument();
      expect(screen.getByText(/Tap Add to Home Screen/i)).toBeInTheDocument();

      const gotItBtn = screen.getByRole('button', { name: /Got It/i });
      act(() => {
        fireEvent.click(gotItBtn);
      });

      expect(screen.queryByRole('heading', { name: 'Install NAYRA' })).not.toBeInTheDocument();
      vi.useRealTimers();
    });
  });

  describe('OfflineIndicator', () => {
    it('shows offline pill when sw-offline or window offline event is dispatched', () => {
      render(<OfflineIndicator />);

      expect(screen.queryByText(/Offline Mode/i)).not.toBeInTheDocument();

      act(() => {
        window.dispatchEvent(new Event('offline'));
      });

      expect(screen.getByText(/Offline Mode • Local Cache Active/i)).toBeInTheDocument();
    });

    it('shows recovery toast when network transitions from offline to online', () => {
      vi.useFakeTimers();
      render(<OfflineIndicator />);

      act(() => {
        window.dispatchEvent(new Event('offline'));
      });
      expect(screen.getByText(/Offline Mode/i)).toBeInTheDocument();

      act(() => {
        window.dispatchEvent(new Event('online'));
      });

      expect(screen.queryByText(/Offline Mode/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Back Online • Synchronized/i)).toBeInTheDocument();

      // After timeout, recovery toast disappears
      act(() => {
        vi.advanceTimersByTime(4000);
      });

      expect(screen.queryByText(/Back Online/i)).not.toBeInTheDocument();
      vi.useRealTimers();
    });
  });

  describe('UpdateAvailableToast', () => {
    it('does not render when no update is waiting', () => {
      const { container } = render(<UpdateAvailableToast />);
      expect(container).toBeEmptyDOMElement();
    });

    it('renders frosted toast and invokes skipWaitingAndReload when user clicks Update Now', () => {
      const skipSpy = vi.spyOn(pwaLib, 'skipWaitingAndReload').mockImplementation(() => {});

      render(<UpdateAvailableToast />);

      const mockReg = { waiting: {} } as ServiceWorkerRegistration;
      act(() => {
        window.dispatchEvent(
          new CustomEvent('sw-updated', {
            detail: {
              registration: mockReg,
              waitingWorker: {} as ServiceWorker,
            },
          })
        );
      });

      expect(screen.getByText('Update Available')).toBeInTheDocument();
      expect(screen.getByText(/A newer version of NAYRA is ready/i)).toBeInTheDocument();

      const updateBtn = screen.getByRole('button', { name: /Update Now/i });
      act(() => {
        fireEvent.click(updateBtn);
      });

      expect(skipSpy).toHaveBeenCalledWith(mockReg);
    });

    it('hides update toast when user clicks Later', () => {
      render(<UpdateAvailableToast />);

      act(() => {
        window.dispatchEvent(
          new CustomEvent('sw-updated', {
            detail: {
              registration: {} as ServiceWorkerRegistration,
              waitingWorker: {} as ServiceWorker,
            },
          })
        );
      });

      expect(screen.getByText('Update Available')).toBeInTheDocument();

      const laterBtn = screen.getByRole('button', { name: /Later/i });
      act(() => {
        fireEvent.click(laterBtn);
      });

      expect(screen.queryByText('Update Available')).not.toBeInTheDocument();
    });
  });
});
