/* Offline support: every file of the app is cached on the first visit, so the app opens
   and works with no internet connection. Bump VERSION whenever a file changes. */
const VERSION = 'dd-v3';
const FILES = [
  './', 'index.html', 'manifest.webmanifest',
  'css/style.css', 'css/editor.css', 'css/responsive.css', 'css/print.css',
  'js/vendor/JsBarcode.all.min.js', 'js/vendor/qrcode-generator.js',
  'js/localization.js', 'js/storage.js', 'js/barcode.js', 'js/elements.js', 'js/templates.js',
  'js/orders.js', 'js/designer.js', 'js/properties.js', 'js/printing.js', 'js/app.js',
  'assets/fonts/cairo-arabic-400-normal.woff2', 'assets/fonts/cairo-arabic-700-normal.woff2',
  'assets/fonts/cairo-latin-400-normal.woff2', 'assets/fonts/cairo-latin-700-normal.woff2',
  'assets/icons/favicon.svg', 'assets/icons/icon-192.png', 'assets/icons/icon-512.png',
  'assets/icons/icon-maskable-512.png', 'assets/icons/apple-touch-icon.png', 'assets/logos/sample-logo.svg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('message', (e) => { if (e.data === 'skipWaiting') self.skipWaiting(); });

// Cached copy first (instant and offline); refresh the cache from the network in the background.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(caches.open(VERSION).then(async (cache) => {
    const key = req.mode === 'navigate' ? 'index.html' : req;
    const cached = await cache.match(key, { ignoreSearch: true });
    const fresh = fetch(req).then((res) => {
      if (res && res.ok && res.type === 'basic') cache.put(key, res.clone());
      return res;
    }).catch(() => null);
    if (cached) { e.waitUntil(fresh); return cached; }
    return (await fresh) || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  }));
});
