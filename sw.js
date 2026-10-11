const CACHE_NAME = 'uca-backlog-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './notes.html',
  './style.css',
  './js/main.js',
  './js/notes.js'
];

// Install Event: Cache files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Fetch Event: Serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip API requests (let IndexedDB handle JSONBin)
  if (event.request.url.includes('api.jsonbin.io')) return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request);
    })
  );
});