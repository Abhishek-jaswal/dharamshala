// UrbanServe Service Worker — v2
// Strategy: Cache-first for static assets, Network-first for pages & API

const CACHE_NAME = 'urbanserve-v2';
const STATIC_ASSETS = [
  '/',
  '/gigs',
  '/pick-drop',
  '/dashboard',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-icon.png',
];

// ── Install: pre-cache key pages ────────────────────────────
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// ── Activate: clean old caches ───────────────────────────────
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch: network-first for HTML/API, cache-first for assets ─
self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Skip non-GET and PocketBase API calls entirely (always fresh)
  if (request.method !== 'GET') return;
  if (url.pathname.startsWith('/api/')) return;

  // Static assets (images, fonts, _next/static) → cache-first
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/static/') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|ico|woff2?|css)$/)
  ) {
    e.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(request, clone));
        return res;
      }))
    );
    return;
  }

  // Pages → network-first, fallback to cache
  e.respondWith(
    fetch(request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(request, clone));
        return res;
      })
      .catch(() => caches.match(request))
  );
});
