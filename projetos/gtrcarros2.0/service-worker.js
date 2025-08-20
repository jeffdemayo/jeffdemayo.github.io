const CACHE = 'gtrcarros-v1';
const ASSETS = [
  '/', '/index.html', '/inventory.html', '/car.html', '/about.html', '/sellers.html', '/contact.html',
  '/assets/css/style.css', '/assets/js/app.js', '/data/company.json', '/data/cars.json'
];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))); });
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return resp;
    }).catch(() => caches.match('/index.html')))
  );
});
