// Service Worker pentru caching și performanță
const CACHE_NAME = 'genetica-app-v1';
const urlsToCache = [
    '/',
    '/genetics.html',
    '/style.css',
    '/script_g.js'
];

// Instalare Service Worker
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Interceptează request-urile
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Returnează din cache dacă există
                if (response) {
                    return response;
                }
                
                // Altfel, fă request-ul către rețea
                return fetch(event.request).then(
                    function(response) {
                        // Verifică dacă primim un răspuns valid
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clonează răspunsul
                        var responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});

// Actualizează cache-ul când se schimbă versiunea
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
}); 