const CACHE_NAME = "moodsky-cache-v3";
const OFFLINE_URL = "/offline.html";

const urlsToCache = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.json",
  "/icons/app-icon.png",
  "/styles.css",
  "/main.js"
];

// 📦 Installation et mise en cache des fichiers statiques
self.addEventListener("install", (event) => {
  console.log("🛠️ Installation du Service Worker...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("📦 Mise en cache des fichiers...");
      return cache.addAll(urlsToCache);
    }).catch((error) => console.error("❌ Erreur de mise en cache :", error))
  );
  self.skipWaiting(); // Force l'activation immédiate du SW
});

// 🔄 Activation et suppression des anciens caches
self.addEventListener("activate", (event) => {
  console.log("✅ Activation du Service Worker...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("🗑 Suppression de l'ancien cache :", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// ⚡ Interception des requêtes et gestion du mode hors ligne
self.addEventListener("fetch", (event) => {
  if (!event.request.url.startsWith("http")) {
    return; // Ignore les requêtes Chrome extensions
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          console.log("📂 Chargé depuis le cache :", event.request.url);
          return cachedResponse;
        }

        return fetch(event.request)
          .then((networkResponse) => {
            if (!networkResponse || networkResponse.status !== 200 || event.request.method !== "GET") {
              return networkResponse;
            }

            // ✅ Stocker la requête en cache
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          })
          .catch(() => {
            console.warn("⚠️ Échec du réseau, affichage de la page hors ligne...");
            return caches.match("/offline.html"); // Retourner une page hors ligne si le réseau est indisponible
          });
      });
    })
  );
});
