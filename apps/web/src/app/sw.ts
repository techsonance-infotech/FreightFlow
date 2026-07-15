/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: any;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Next.js default caching logic for static assets, images, etc.
    ...defaultCache,
    
    // Custom logic: Never cache authentication endpoints (Network Only)
    {
      matcher: ({ request, url }: any) => request.method === 'GET' && url.pathname.startsWith('/api/v1/auth/'),
      handler: 'NetworkOnly',
    },
    
    // Custom logic: Cache business API GET requests (Stale While Revalidate)
    {
      matcher: ({ request, url }: any) => request.method === 'GET' && url.pathname.startsWith('/api/v1/'),
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'freightflow-api-cache',
        expiration: {
          maxEntries: 150,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    }
  ] as any,
});

// ==========================================
// Push Notification Listeners
// ==========================================
self.addEventListener('push', (event: any) => {
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.body || 'New notification from FreightFlow',
        icon: '/apple-touch-icon.png',
        badge: '/favicon.ico',
        vibrate: [100, 50, 100],
        data: {
          url: data.url || '/dashboard'
        }
      };
      event.waitUntil(
        self.registration.showNotification(data.title || 'FreightFlow', options)
      );
    } catch (e) {
      // Handle plain text
      event.waitUntil(
        self.registration.showNotification('FreightFlow', { 
          body: event.data.text(),
          icon: '/apple-touch-icon.png'
        })
      );
    }
  }
});

self.addEventListener('notificationclick', (event: any) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/dashboard';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus existing window if it matches the URL exactly, or just open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// ==========================================
// Background Sync Listener
// ==========================================
self.addEventListener('sync', (event: any) => {
  if (event.tag === 'freightflow-offline-sync') {
    event.waitUntil(
      (async () => {
        // Send a message to active clients to process their IndexedDB queue
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({ type: 'SYNC_OFFLINE_MUTATIONS' });
        });
      })()
    );
  }
});

// ==========================================
// Logout & Cache Clearing
// ==========================================
self.addEventListener('message', (event: any) => {
  if (event.data && event.data.type === 'CLEAR_TENANT_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.includes('freightflow-api-cache'))
            .map((name) => caches.delete(name))
        );
      })
    );
  }
});

serwist.addEventListeners();
