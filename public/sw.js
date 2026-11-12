/**
 * NAYRA Personal Operating System — Service Worker
 * Version: nayra-pwa-v2.18.0
 * Provides offline caching, app shell precaching, stale-while-revalidate for assets/fonts,
 * and seamless background update synchronization.
 */

const CACHE_NAME = 'nayra-pwa-v2.18.0';

// Core App Shell & Static Assets to Precache
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
  '/favicon.ico',
];

// Apple / SwiftUI Glassy Offline Fallback Page
const OFFLINE_FALLBACK_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="#09090b" />
  <title>NAYRA — Offline Mode</title>
  <style>
    :root {
      color-scheme: dark light;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', system-ui, sans-serif;
      background: #09090b;
      color: #fafafa;
      padding: 24px;
      -webkit-font-smoothing: antialiased;
    }
    .glass-card {
      max-width: 420px;
      width: 100%;
      padding: 36px 32px;
      background: rgba(24, 24, 27, 0.75);
      backdrop-filter: blur(28px);
      -webkit-backdrop-filter: blur(28px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 28px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.15);
      text-align: center;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 500;
      color: #a1a1aa;
      margin-bottom: 20px;
      letter-spacing: 0.02em;
    }
    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #f59e0b;
      box-shadow: 0 0 8px #f59e0b;
    }
    h1 {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 10px;
      color: #ffffff;
    }
    p {
      font-size: 14px;
      line-height: 1.6;
      color: #a1a1aa;
      margin-bottom: 28px;
    }
    .action-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 13px 24px;
      background: #ffffff;
      color: #09090b;
      border: none;
      border-radius: 9999px;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: -0.01em;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(255, 255, 255, 0.2);
      transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.18s;
    }
    .action-btn:active {
      transform: scale(0.97);
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="glass-card">
    <div class="badge">
      <span class="status-dot"></span>
      <span>Offline Mode</span>
    </div>
    <h1>Working Without Connection</h1>
    <p>NAYRA stores your personal tasks, habits, and focus logs locally. When internet returns, cloud sync resumes automatically.</p>
    <button class="action-btn" onclick="window.location.reload()">
      Reload NAYRA
    </button>
  </div>
</body>
</html>`;

/**
 * 1. Install Event
 * Precaches core assets and app shell gracefully.
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Pre-seed offline fallback document
      await cache.put(
        new Request('/__offline_fallback.html'),
        new Response(OFFLINE_FALLBACK_PAGE, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        })
      );

      // Precache static assets with individual error resilience
      await Promise.all(
        PRECACHE_ASSETS.map(async (assetUrl) => {
          try {
            const response = await fetch(assetUrl, { cache: 'no-cache' });
            if (response.ok) {
              await cache.put(assetUrl, response);
            }
          } catch (err) {
            console.warn('[SW] Could not precache:', assetUrl, err);
          }
        })
      );
    })
  );
});

/**
 * 2. Activate Event
 * Removes older versions of NAYRA caches and claims control over active clients.
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Clean up previous caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              console.log('[SW] Purging outdated cache:', name);
              return caches.delete(name);
            }
          })
        );
      }),
      // Immediate client claiming
      self.clients.claim(),
    ])
  );
});

/**
 * 3. Message Event
 * Allows clients to prompt skipWaiting on update.
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * Helper: Identify if request matches static scripts, styles, fonts, or images.
 */
function isStaticOrFontAsset(url, request) {
  const dest = request.destination;
  if (dest === 'style' || dest === 'script' || dest === 'font' || dest === 'image') {
    return true;
  }

  const pathname = url.pathname;
  if (
    pathname.match(
      /\.(?:js|css|woff|woff2|ttf|otf|eot|png|jpg|jpeg|svg|webp|ico|webmanifest|json)$/i
    )
  ) {
    return true;
  }

  // Google Fonts, KaTeX CDN, or Cloudflare/jsdelivr CDNs
  const hostname = url.hostname;
  if (
    hostname.includes('fonts.googleapis.com') ||
    hostname.includes('fonts.gstatic.com') ||
    hostname.includes('cdn.jsdelivr.net') ||
    hostname.includes('cdnjs.cloudflare.com') ||
    hostname.includes('accounts.google.com')
  ) {
    return true;
  }

  return false;
}

/**
 * 4. Fetch Event
 * - Navigation: Network-First with cached app shell / fallback
 * - Scripts, Styles, Fonts: Stale-While-Revalidate
 * - External APIs / Firebase / Auth: Bypass SW cache
 */
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Handle only GET requests
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Bypass non-http(s) schemas (chrome-extension, blob, etc.)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Bypass Vite dev internal endpoints and hot reload
  if (
    url.pathname.startsWith('/@vite') ||
    url.pathname.startsWith('/@fs') ||
    url.pathname.startsWith('/@id') ||
    url.pathname.startsWith('/__vite')
  ) {
    return;
  }

  // Bypass Firebase Auth, Firestore, Google Calendar API endpoints
  if (
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('identitytoolkit.googleapis.com') ||
    url.hostname.includes('securetoken.googleapis.com') ||
    url.hostname.includes('tasks.googleapis.com') ||
    url.hostname.includes('googleapis.com/calendar') ||
    url.pathname.startsWith('/__/auth/')
  ) {
    return;
  }

  // A. Navigation Requests: Network-First with Offline Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Attempt exact URL from cache
          const cachedRoute = await caches.match(request);
          if (cachedRoute) {
            return cachedRoute;
          }
          // Fallback to app shell index.html
          const appShell =
            (await caches.match('/index.html')) || (await caches.match('/'));
          if (appShell) {
            return appShell;
          }
          // Fallback to offline fallback page
          const fallback = await caches.match('/__offline_fallback.html');
          if (fallback) {
            return fallback;
          }
          return new Response(OFFLINE_FALLBACK_PAGE, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          });
        })
    );
    return;
  }

  // B. Scripts, Styles, Google Fonts, KaTeX: Stale-While-Revalidate
  if (isStaticOrFontAsset(url, request)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);

        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            // Cache 200 OK and opaque cross-origin CDN responses
            if (
              networkResponse &&
              (networkResponse.ok || networkResponse.type === 'opaque')
            ) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch((err) => {
            // Return cached response on network failure
            if (cachedResponse) {
              return cachedResponse;
            }
            throw err;
          });

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // C. Default: Cache first with network fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(request).then((networkResponse) => {
        if (
          networkResponse &&
          (networkResponse.ok || networkResponse.type === 'opaque')
        ) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });
        }
        return networkResponse;
      });
    })
  );
});
