// Service Worker for NJCIC Grantees Map
// Provides offline support; always prefers fresh content over cache

const CACHE_NAME = 'njcic-map-v3';
const OFFLINE_URL = '404.html';

// Only the offline fallback page needs to be precached
const ASSETS_TO_CACHE = [
    '/404.html'
];

// Install event - cache offline fallback
self.addEventListener('install', event => {
    console.log('[ServiceWorker] Install');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS_TO_CACHE))
            .then(() => self.skipWaiting())
            .catch(err => {
                console.log('[ServiceWorker] Install failed:', err.message);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('[ServiceWorker] Activate');
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => cacheName !== CACHE_NAME)
                        .map(cacheName => {
                            console.log('[ServiceWorker] Removing old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - network-first, falling back to cache only when offline
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension and other non-http(s) requests
    if (!event.request.url.startsWith('http')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Check if valid response
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                // Clone and cache the fresh response for offline fallback
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                    .then(cache => {
                        if (event.request.url.startsWith(self.location.origin)) {
                            cache.put(event.request, responseToCache);
                        }
                    });

                return response;
            })
            .catch(() => {
                // Offline - fall back to whatever we have cached
                return caches.match(event.request).then(cachedResponse => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }

                    if (event.request.mode === 'navigate') {
                        return caches.match(OFFLINE_URL);
                    }

                    return new Response('Offline', {
                        status: 503,
                        statusText: 'Service Unavailable'
                    });
                });
            })
    );
});

// Handle messages from the main thread
self.addEventListener('message', event => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});
