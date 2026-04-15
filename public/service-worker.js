self.addEventListener('install', () => {
  console.log('Pokédex SW installed');
});

self.addEventListener('fetch', (e) => {
  e.respondWith(fetch(e.request));
});