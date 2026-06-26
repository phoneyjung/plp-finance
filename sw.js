/* PLP Finance · Service Worker */
const CACHE = 'plp-finance-v1';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(SHELL).catch(function () {}); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (ks) { return Promise.all(ks.map(function (k) { if (k !== CACHE) return caches.delete(k); })); })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  // หน้าเว็บ (navigation): ลองดึงใหม่จากเน็ตก่อน ถ้าออฟไลน์ค่อยใช้ที่แคชไว้
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(function (res) {
          var cp = res.clone();
          caches.open(CACHE).then(function (c) { c.put('./index.html', cp); });
          return res;
        })
        .catch(function () { return caches.match('./index.html'); })
    );
  }
});
