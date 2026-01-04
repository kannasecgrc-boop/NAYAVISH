
const CACHE_NAME = 'mana-kitchen-v1.0.3-prod';
const OFFLINE_URL = '/index.html';

// Assets to strictly cache on install
// We now include Tailwind and Fonts to ensure the UI doesn't break offline
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('ManaKitchen: Pre-caching offline page and styles');
      // We use addAll for local files, but for CDNs we might need to handle CORS
      // For simplicity in this environment, we attempt to cache all.
      return cache.addAll(PRECACHE_URLS).catch(err => {
         console.warn('Some assets failed to precache (likely CDN CORS), but app will still function.', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('ManaKitchen: Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // 1. Navigation Requests (HTML): Network First -> Fallback to Offline Cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // 2. Asset Requests (Images, JS, CSS): Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Cache successful network responses
        if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
        }
        return networkResponse;
      }).catch(() => {
         // Network failed
      });

      return cachedResponse || fetchPromise;
    })
  );
});
