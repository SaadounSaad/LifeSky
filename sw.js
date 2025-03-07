const CACHE_NAME = "moodsky-cache-v1";
const OFFLINE_URL = "/offline.html";

const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/styles.css',
  '/main.js'
];

// ✅ Installation du Service Worker et mise en cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("📦 Caching app shell");
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// 🔄 Gestion des requêtes (cache d'abord, puis réseau)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => caches.match(OFFLINE_URL));
    })
  );
});

// 🧹 Nettoyage des anciens caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("🗑️ Suppression du cache obsolète :", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});
