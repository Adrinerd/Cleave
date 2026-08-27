/* CLEAVE — service worker
   Guarda la app en el móvil para que funcione sin cobertura.
   Si cambias index.html, SUBE el número de CACHE o los móviles seguirán viendo la versión vieja. */

const CACHE = 'cleave-v4.0.0';

const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = e.request.url;

  // La librería de conexión y el broker NUNCA se cachean:
  // el modo online necesita red de todas formas y una copia vieja rompe las salas.
  if (url.includes('peerjs') || url.includes('unpkg.com') || url.includes('jsdelivr.net')) {
    e.respondWith(fetch(e.request).catch(() => new Response('', { status: 504 })));
    return;
  }

  e.respondWith(
    caches.match(e.request).then(hit => {
      if (hit) return hit;
      return fetch(e.request).then(res => {
        if (res && (res.ok || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
