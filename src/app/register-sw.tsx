"use client";

import { useEffect } from "react";

export function RegisterServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      // En desarrollo el service worker solo estorba: cachea JS/HTML y
      // hace que los cambios no se vean aunque el servidor ya los sirva.
      // Si quedó uno registrado de una prueba anterior, lo quitamos.
      navigator.serviceWorker.getRegistrations().then((regs) => {
        for (const reg of regs) reg.unregister();
      });
      if (window.caches) {
        caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
      }
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.error("Error registrando service worker:", err);
    });
  }, []);

  return null;
}
