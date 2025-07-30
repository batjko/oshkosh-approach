const CACHE_NAME = 'eaa-approach-v2';
const STATIC_CACHE_NAME = 'eaa-approach-static-v2';
const DYNAMIC_CACHE_NAME = 'eaa-approach-dynamic-v2';

// Essential assets that should always be cached
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  // Add core routes and assets
];

// Assets that can be cached dynamically
const CACHEABLE_DOMAINS = [
  'tile.openstreetmap.org', // Map tiles
  'fonts.googleapis.com',
  'fonts.gstatic.com',
];

self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('[ServiceWorker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Cache stage data and other essential app data
      caches.open(CACHE_NAME).then((cache) => {
        console.log('[ServiceWorker] Caching app data');
        // We can pre-cache important API endpoints or data here
        return Promise.resolve();
      })
    ]).then(() => {
      self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== STATIC_CACHE_NAME && 
              cacheName !== DYNAMIC_CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different types of requests
  if (request.method === 'GET') {
    // Handle navigation requests (HTML pages)
    if (request.mode === 'navigate') {
      event.respondWith(
        fetch(request)
          .then((response) => {
            // Cache successful navigation responses
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            // Serve cached version if offline
            return caches.match(request).then((cachedResponse) => {
              return cachedResponse || caches.match('/');
            });
          })
      );
    }
    // Handle static assets
    else if (STATIC_ASSETS.some(asset => request.url.includes(asset))) {
      event.respondWith(
        caches.match(request).then((cachedResponse) => {
          return cachedResponse || fetch(request).then((response) => {
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(STATIC_CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          });
        })
      );
    }
    // Handle API requests (NOTAMs, etc.)
    else if (request.url.includes('/api/') || request.url.includes('notam')) {
      event.respondWith(
        fetch(request)
          .then((response) => {
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            // Serve stale data if offline
            return caches.match(request).then((cachedResponse) => {
              if (cachedResponse) {
                console.log('[ServiceWorker] Serving stale API data for', request.url);
                return cachedResponse;
              }
              // Return a fallback response for critical API failures
              return new Response(JSON.stringify({
                notamList: [],
                message: 'Offline - using cached data'
              }), {
                headers: { 'Content-Type': 'application/json' }
              });
            });
          })
      );
    }
    // Handle external resources (map tiles, etc.)
    else if (CACHEABLE_DOMAINS.some(domain => url.hostname.includes(domain))) {
      event.respondWith(
        caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
          return cache.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              // Return cached version immediately, but update in background
              fetch(request).then((freshResponse) => {
                if (freshResponse.status === 200) {
                  cache.put(request, freshResponse.clone());
                }
              }).catch(() => {
                // Ignore background update failures
              });
              return cachedResponse;
            }
            
            // Not in cache, fetch and cache
            return fetch(request).then((response) => {
              if (response.status === 200) {
                cache.put(request, response.clone());
              }
              return response;
            });
          });
        })
      );
    }
    // Default fetch strategy for other requests
    else {
      event.respondWith(fetch(request));
    }
  }
});

// Handle background sync for when connection is restored
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync', event.tag);
  
  if (event.tag === 'refresh-notams') {
    event.waitUntil(
      // Refresh NOTAM data when connection is restored
      fetch('/api/notams').then((response) => {
        if (response.status === 200) {
          return caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            return cache.put('/api/notams', response.clone());
          });
        }
      }).catch((error) => {
        console.log('[ServiceWorker] Background sync failed', error);
      })
    );
  }
});

// Handle push notifications (future feature)
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push received');
  // Handle push notifications for critical NOTAMs or weather updates
});