// A minimal service worker to enable PWA installability.
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install');
  // Skip waiting is not strictly necessary but helps updates to take effect faster.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate');
  // Take control of all pages under its scope immediately.
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // A basic network-first fetch handler.
  // This is required to make the app installable.
  event.respondWith(
    fetch(event.request).catch(() => {
      // In a real app, you might want to return a fallback offline page.
      // For now, we'll just let the network error propagate.
      return new Response(
        'You are offline. Please check your internet connection.',
        { headers: { 'Content-Type': 'text/plain' } }
      );
    })
  );
});
