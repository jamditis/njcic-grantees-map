// This project no longer uses a service worker.
// This file exists only to remove any previously installed worker and
// its caches from visitors' browsers, so stale content stops being served.

self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => Promise.all(cacheNames.map(name => caches.delete(name))))
            .then(() => self.registration.unregister())
            .then(() => self.clients.matchAll())
            .then(clients => {
                clients.forEach(client => client.navigate(client.url));
            })
    );
});
