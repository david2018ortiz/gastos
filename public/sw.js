const CACHE_NAME = "walley-shell-v2";
const APP_SHELL = ["/", "/manifest.json", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

// Solo interceptamos navegaciones completas (abrir/recargar una página),
// nunca los fetches internos de Next.js (RSC payloads, /_next/*, llamadas
// a Supabase, etc.) — antes se interceptaba CUALQUIER GET, y cachear por
// error una respuesta que no es el HTML completo de la página (por
// ejemplo un payload RSC) podía dejar la pantalla en blanco al reabrir la
// app desde segundo plano.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (event.request.mode !== "navigate") return;
  if (!event.request.url.startsWith("http")) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches
          .open(CACHE_NAME)
          .then((cache) => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match("/"))),
  );
});
