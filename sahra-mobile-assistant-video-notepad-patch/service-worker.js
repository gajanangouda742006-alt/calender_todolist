const CACHE_NAME = 'sahra-shell-mobile-polish-20261025';


const APP_SHELL = [
  '/',
  '/index.html',
  '/style.css',
  '/app-config.js',
  '/web-app.js',
  '/manifest.webmanifest',
  '/icon-192.jpeg',
  '/icon-512.jpeg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );

  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('sahra-shell-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/login') ||
    url.pathname.startsWith('/auth/')
  ) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match('/index.html');
        return cached || Response.error();
      })
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (
  response.status === 200 &&
  response.type === 'basic' &&
  !request.headers.has('Range')
) {
  const copy = response.clone();

  caches.open(CACHE_NAME).then((cache) => {
    return cache.put(request, copy);
  }).catch((error) => {
    console.warn('Sahra cache update skipped:', error);
  });
}
        return response;
      })
      .catch(async () => {
        return (await caches.match(request)) || Response.error();
      })
  );
});
