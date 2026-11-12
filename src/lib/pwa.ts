/**
 * NAYRA Personal Operating System — Progressive Web App Engine
 * Version: 2.18.0
 * Provides robust service worker lifecycle management, update detection,
 * connectivity broadcasting, and installation detection.
 */

export interface SWUpdatedEventDetail {
  registration: ServiceWorkerRegistration;
  waitingWorker: ServiceWorker | null;
}

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    'sw-updated': CustomEvent<SWUpdatedEventDetail>;
    'sw-offline': CustomEvent<void>;
    'sw-online': CustomEvent<void>;
    beforeinstallprompt: BeforeInstallPromptEvent;
    appinstalled: Event;
  }
}

let activeRegistration: ServiceWorkerRegistration | null = null;
let updateFoundDispatched = false;
let networkListenersInitialized = false;

/**
 * Returns whether the application is running in an installed PWA context (Standalone / WCO / iOS Home Screen).
 */
export function isPWAInstalled(): boolean {
  if (typeof window === 'undefined') return false;

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isWco = window.matchMedia('(display-mode: window-controls-overlay)').matches;
  const isIosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  const isAndroidApp = document.referrer.startsWith('android-app://');

  return Boolean(isStandalone || isWco || isIosStandalone || isAndroidApp);
}

/**
 * Checks if the current client is running on an iOS device (iPhone/iPad/iPod).
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent.toLowerCase();
  const isApplePlatform = /iphone|ipad|ipod/.test(ua);
  const isIpadMacIntel =
    window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1;
  return isApplePlatform || isIpadMacIntel;
}

/**
 * Retrieves the currently active ServiceWorkerRegistration instance, if any.
 */
export function getServiceWorkerRegistration(): ServiceWorkerRegistration | null {
  return activeRegistration;
}

/**
 * Dispatches a typed custom event on the window object.
 */
function dispatchPWAEvent<T>(type: string, detail?: T): void {
  if (typeof window === 'undefined') return;
  const event = new CustomEvent(type, { detail });
  window.dispatchEvent(event);
}

/**
 * Signals the waiting service worker to take control immediately and reloads the active client.
 */
export function skipWaitingAndReload(registration?: ServiceWorkerRegistration | null): void {
  if (typeof window === 'undefined') return;

  const targetReg = registration || activeRegistration;
  const worker = targetReg?.waiting;

  if (worker) {
    let reloaded = false;

    navigator.serviceWorker.addEventListener(
      'controllerchange',
      () => {
        if (!reloaded) {
          reloaded = true;
          window.location.reload();
        }
      },
      { once: true }
    );

    worker.postMessage({ type: 'SKIP_WAITING' });

    // Fallback reload timeout if controllerchange does not emit
    setTimeout(() => {
      if (!reloaded) {
        reloaded = true;
        window.location.reload();
      }
    }, 1000);
  } else {
    window.location.reload();
  }
}

/**
 * Registers the NAYRA service worker, registers update detection listeners,
 * and sets up network online/offline broadcasting.
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined') return null;

  // Set up network status broadcast listeners once
  if (!networkListenersInitialized) {
    networkListenersInitialized = true;
    window.addEventListener('online', () => {
      dispatchPWAEvent('sw-online');
    });

    window.addEventListener('offline', () => {
      dispatchPWAEvent('sw-offline');
    });
  }

  if (!('serviceWorker' in navigator) || typeof navigator.serviceWorker.register !== 'function') {
    console.info('[PWA] Service workers are not supported by this browser.');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    if (!registration) {
      return null;
    }

    activeRegistration = registration;

    // Check if there is already a waiting service worker from a prior session
    if (registration.waiting && navigator.serviceWorker.controller) {
      dispatchPWAEvent<SWUpdatedEventDetail>('sw-updated', {
        registration,
        waitingWorker: registration.waiting,
      });
      updateFoundDispatched = true;
    }

    // Monitor for incoming service worker updates
    registration.addEventListener('updatefound', () => {
      const installingWorker = registration.installing;
      if (!installingWorker) return;

      installingWorker.addEventListener('statechange', () => {
        if (
          installingWorker.state === 'installed' &&
          navigator.serviceWorker.controller &&
          !updateFoundDispatched
        ) {
          updateFoundDispatched = true;
          dispatchPWAEvent<SWUpdatedEventDetail>('sw-updated', {
            registration,
            waitingWorker: installingWorker,
          });
        }
      });
    });

    // Check for service worker updates when the page becomes visible again
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        registration.update().catch((err) => {
          console.warn('[PWA] Background update check failed:', err);
        });
      }
    });

    // Periodically check for updates every 60 minutes
    setInterval(() => {
      registration.update().catch((err) => {
        console.warn('[PWA] Periodic update check failed:', err);
      });
    }, 60 * 60 * 1000);

    return registration;
  } catch (error) {
    console.error('[PWA] Service worker registration failed:', error);
    return null;
  }
}
