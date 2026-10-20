/* FonoRP · service worker
   Precarga todo lo necesario para usar la app sin conexión.
   Al publicar cambios, sube VERSION para que los usuarios reciban la nueva versión. */
const VERSION = 'fonorp-v2';
const SHELL = [
  './',
  'index.html',
  'styles.css',
  'app.js',
  'fono.js',
  'words.json',
  'manifest.webmanifest',
  'favicon.svg',
  'icons/apple-touch-icon.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'fonts/archivo-latin-standard-normal.woff2',
  'fonts/noto-sans-latin-wght-normal.woff2',
  'fonts/noto-sans-ipa-wght.woff2',
  'fonts/noto-sans-theta-wght.woff2',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Primero la caché (arranque instantáneo y sin conexión); en segundo plano se refresca desde la red.
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.open(VERSION).then(async cache => {
      const cached = await cache.match(req, { ignoreSearch: true });
      const network = fetch(req)
        .then(res => { if (res.ok) cache.put(req, res.clone()); return res; })
        .catch(() => null);
      if (cached) { event.waitUntil(network); return cached; }
      const res = await network;
      if (res) return res;
      if (req.mode === 'navigate') return cache.match('index.html');
      return Response.error();
    })
  );
});
