// const CACHE_NAME = 'my-cache-v1';
// const urlsToCache = [
//   '/',
//   '/front/index.html',
//   '/front/styles/main.css',
//   '/front/scripts/main.js',
//   '/front/imgs/logo.png',
// ];

// self.addEventListener('install', (event) => {
//   event.waitUntil(
//     caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
//   );
// });

// self.addEventListener('fetch', (event) => {
//   event.respondWith(
//     caches
//       .match(event.request)
//       .then((response) => response || fetch(event.request))
//   );
// });
