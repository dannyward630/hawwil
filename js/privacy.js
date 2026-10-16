/* Live privacy proof: lists every network request this page made, and checks offline support. */
import { renderChrome, reveal } from './chrome.js';
import { h, toast } from './ui.js';
import { t, node, apply } from './i18n.js';

renderChrome();
const live = document.getElementById('live');

function origins() {
  const map = new Map();
  performance.getEntriesByType('resource').concat(performance.getEntriesByType('navigation')).forEach(e => {
    let o;
    try { o = new URL(e.name).origin; } catch (err) { return; }
    map.set(o, (map.get(o) || 0) + 1);
  });
  return map;
}

async function paint() {
  const map = origins(), here = location.origin;
  const external = [...map.keys()].filter(o => o !== here);
  const rows = [...map].map(([o, n]) => h('li', {}, h('span', { class: o === here ? 'good' : 'bad-t' }, o === here ? '✓' : '✗'), ' ', h('code', {}, o), ' · ', String(n)));
  const names = 'caches' in window ? await window.caches.keys().catch(() => []) : [];
  let cached = 0;
  for (const k of names) cached += (await (await window.caches.open(k)).keys()).length;
  const sw = 'serviceWorker' in navigator && !!navigator.serviceWorker.controller;
  const clear = h('button', { type: 'button', class: 'btn ghost sm' }, node('priv.clear'));
  clear.addEventListener('click', async () => {
    try { localStorage.clear(); } catch (e) { /* ignore */ }
    try { await Promise.all((await window.caches.keys()).map(k => window.caches.delete(k))); } catch (e) { /* ignore */ }
    try { indexedDB.deleteDatabase('hw-handoff'); } catch (e) { /* ignore */ }
    toast('priv.cleared');
    paint();
  });
  live.replaceChildren(h('h2', {}, node('priv.live')),
    h('p', { class: external.length ? 'warn' : 'ok-p' }, external.length ? t('priv.ext', { n: external.length }) : t('priv.none')),
    h('ul', { class: 'org-list' }, rows),
    h('p', { class: 'note' }, t(sw ? 'priv.sw.on' : 'priv.sw.off', { n: cached }), ' · ', t(navigator.onLine ? 'priv.online' : 'priv.offline')),
    h('div', { class: 'act' }, clear));
  apply(live);
}
paint();
window.addEventListener('online', paint);
window.addEventListener('offline', paint);
document.addEventListener('langchange', paint);
apply(document);
reveal();
