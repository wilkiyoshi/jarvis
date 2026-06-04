// ===================================================================
//  Service Worker — instala o J.A.R.V.I.S. como app e habilita offline.
//  Estratégia: network-first p/ recursos próprios (sempre atualizado
//  quando online), com cache de fallback quando offline.
//  Chamadas a APIs/proxies externos NÃO são interceptadas.
// ===================================================================

const CACHE = "jarvis-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/config.js", "./js/net.js", "./js/ui.js", "./js/voice.js",
  "./js/geo.js", "./js/clock.js", "./js/weather.js", "./js/currency.js",
  "./js/news.js", "./js/events.js", "./js/tasks.js", "./js/settings.js",
  "./js/chat.js", "./js/wake.js", "./js/assistant.js", "./js/app.js",
  "./manifest.json",
  "./icons/icon-192.png", "./icons/icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // deixa APIs externas passarem direto

  e.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() =>
        caches.match(req).then(c => c || (req.mode === "navigate" ? caches.match("./index.html") : undefined))
      )
  );
});
