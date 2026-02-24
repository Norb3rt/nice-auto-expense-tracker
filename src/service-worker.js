// This is a basic service worker for Vite PWA. The plugin will inject its own logic, but you can extend it if needed.
self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  self.clients.claim();
});

// You can add custom fetch or cache logic here if needed.
