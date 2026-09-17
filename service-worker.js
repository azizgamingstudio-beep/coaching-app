const CACHE_NAME = 'alis-math-app-v2';
const SHELL_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './favicon.png',
  './apple-touch-icon.png',
  './pic-good.jpg',
  './pic-encourage.jpg',
  './sound-good.mp3',
  './sound-encourage.mp3'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(SHELL_FILES).catch(() => {
        // if some optional file is missing, don't fail the whole install
        return Promise.all(SHELL_FILES.map((f) => cache.add(f).catch(() => {})));
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(
      names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
    ))
  );
  self.clients.claim();
});

// network-first: always try the live version when online, only use the cached
// copy when the network request fails (i.e. truly offline)
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    fetch(req).then((res) => {
      if (req.url.startsWith(self.location.origin)) {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
      }
      return res;
    }).catch(() => caches.match(req))
  );
});
