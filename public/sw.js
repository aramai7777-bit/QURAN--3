/**
 * Minimal app-shell service worker for Quran 3.
 *
 * Scope: caches only the static UI shell (the pages the visitor has
 * already opened, plus their CSS/JS) so the app can re-open while offline.
 *
 * It intentionally does NOT cache:
 *  - Quran audio files (mp3quran.net) — we don't have redistribution
 *    rights to store reciters' recordings for offline playback.
 *  - Quran.com / mp3quran.net API responses — these should always be
 *    fetched fresh so verse text and reciter data stay accurate.
 */
const CACHE_NAME = 'quran3-shell-v1';
const AUDIO_HOSTS = ['mp3quran.net'];
const API_HOSTS = ['api.quran.com', 'mp3quran.net'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never intercept audio or API calls — always go to the network.
  if (AUDIO_HOSTS.some((h) => url.hostname.includes(h))) return;
  if (API_HOSTS.some((h) => url.hostname.includes(h))) return;
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && url.origin === self.location.origin) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
