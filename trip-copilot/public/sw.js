/*
  Service worker pre Trip Copilot.

  Stratégia:
    • navigácia (stránky)  – najprv sieť, pri výpadku cache, inak offline stránka
    • statické súbory      – najprv cache, na pozadí sa aktualizuje
    • mapové dlaždice      – necháme tak, mapa má offline vlastný fallback v UI

  Plán, checklisty, ubytovanie, dokumenty, náklady a uložené body žijú
  v localStorage, takže offline fungujú aj bez cache.
*/

const CACHE = 'trip-copilot-v1';
const APP_SHELL = [
  '/',
  '/mapa',
  '/pred-nami',
  '/plan',
  '/naklady',
  '/sumi',
  '/offline.html',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // Mapbox a ostatné externé zdroje neriešime.

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/offline.html'))),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
