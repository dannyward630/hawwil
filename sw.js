/* Hawwil service worker: network-first, falls back to the cache, so the app also works offline after the first visit.
   Also receives files shared to the installed app (share_target) and passes them to the share page through IndexedDB. */
const CACHE = 'hawwil-v2';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

function saveShared(files) {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open('hw-handoff', 1);
    open.onupgradeneeded = () => open.result.createObjectStore('files', { autoIncrement: true });
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const db = open.result, tx = db.transaction('files', 'readwrite'), st = tx.objectStore('files');
      st.clear();
      const at = Date.now();
      files.forEach(f => st.add({ name: f.name, type: f.type, blob: f, at }));
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = tx.onabort = () => reject(tx.error);
    };
  });
}

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method === 'POST' && url.origin === location.origin && url.pathname.endsWith('/share-target')) {
    e.respondWith((async () => {
      try {
        const data = await req.formData();
        await saveShared(data.getAll('files').filter(f => typeof f !== 'string'));
      } catch (err) { /* fall through to the share page, which shows "nothing received" */ }
      return Response.redirect(new URL('share.html', self.registration.scope).href, 303);
    })());
    return;
  }
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok && res.status === 200) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || caches.match('index.html')))
  );
});
