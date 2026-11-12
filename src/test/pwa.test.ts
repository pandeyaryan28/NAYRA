import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isPWAInstalled,
  isIOS,
  getServiceWorkerRegistration,
  skipWaitingAndReload,
  registerServiceWorker,
} from '../lib/pwa';

describe('PWA Utility & Service Worker Engine (v2.18.0)', () => {
  const originalNavigator = window.navigator;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  });

  describe('isPWAInstalled()', () => {
    it('returns false in standard browser viewport', () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      expect(isPWAInstalled()).toBe(false);
    });

    it('returns true when display-mode is standalone', () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(display-mode: standalone)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      expect(isPWAInstalled()).toBe(true);
    });

    it('returns true when display-mode is window-controls-overlay', () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(display-mode: window-controls-overlay)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      expect(isPWAInstalled()).toBe(true);
    });

    it('returns true when iOS standalone property is true', () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      Object.defineProperty(window.navigator, 'standalone', {
        value: true,
        configurable: true,
      });

      expect(isPWAInstalled()).toBe(true);
    });
  });

  describe('isIOS()', () => {
    it('detects iPhone User Agent', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        configurable: true,
      });

      expect(isIOS()).toBe(true);
    });

    it('detects iPad User Agent', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
        configurable: true,
      });

      expect(isIOS()).toBe(true);
    });

    it('returns false for Linux / Chrome Desktop', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        configurable: true,
      });
      Object.defineProperty(window.navigator, 'platform', {
        value: 'Linux x86_64',
        configurable: true,
      });
      Object.defineProperty(window.navigator, 'maxTouchPoints', {
        value: 0,
        configurable: true,
      });

      expect(isIOS()).toBe(false);
    });
  });

  describe('registerServiceWorker() & skipWaitingAndReload()', () => {
    it('registers sw.js when supported and returns registration', async () => {
      const mockPostMessage = vi.fn();
      const mockRegistration = {
        scope: '/',
        waiting: { postMessage: mockPostMessage } as unknown as ServiceWorker,
        installing: null,
        active: null,
        addEventListener: vi.fn(),
        update: vi.fn().mockResolvedValue(undefined),
      } as unknown as ServiceWorkerRegistration;

      const mockRegister = vi.fn().mockResolvedValue(mockRegistration);

      Object.defineProperty(window.navigator, 'serviceWorker', {
        value: {
          register: mockRegister,
          controller: {} as ServiceWorker,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        },
        configurable: true,
      });

      const updatedSpy = vi.fn();
      window.addEventListener('sw-updated', updatedSpy);

      const reg = await registerServiceWorker();

      expect(mockRegister).toHaveBeenCalledWith('/sw.js', { scope: '/' });
      expect(reg).toBe(mockRegistration);
      expect(getServiceWorkerRegistration()).toBe(mockRegistration);

      // Verify skipWaitingAndReload sends message to waiting worker
      skipWaitingAndReload(mockRegistration);
      expect(mockPostMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });

      window.removeEventListener('sw-updated', updatedSpy);
    });

    it('fires sw-online and sw-offline events on window connectivity changes', async () => {
      const onlineSpy = vi.fn();
      const offlineSpy = vi.fn();

      window.addEventListener('sw-online', onlineSpy);
      window.addEventListener('sw-offline', offlineSpy);

      await registerServiceWorker();

      window.dispatchEvent(new Event('offline'));
      expect(offlineSpy).toHaveBeenCalledTimes(1);

      window.dispatchEvent(new Event('online'));
      expect(onlineSpy).toHaveBeenCalledTimes(1);

      window.removeEventListener('sw-online', onlineSpy);
      window.removeEventListener('sw-offline', offlineSpy);
    });
  });
});
