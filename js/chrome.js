import { h } from './ui.js';
import { t, node, getLang, setLang, initLang } from './i18n.js';
import { icon, logo } from './icons.js';
import { initFX, reveal } from './fx.js';

function setTheme(th, save) {
  document.documentElement.dataset.theme = th;
  const m = document.getElementById('tc');
  if (m) m.content = th === 'light' ? '#f4f7fc' : '#0b0f1a';
  if (save) { try { localStorage.setItem('hw-theme', th); } catch (e) { /* ignore */ } }
}

/* Hawwil Lite: bigger controls and a simpler layout on phones (automatic below 640px, can be switched off) */
(function initLite() {
  let pref = null;
  try { pref = localStorage.getItem('hw-lite'); } catch (e) { /* ignore */ }
  const on = pref ? pref === 'on' : matchMedia('(max-width:640px)').matches;
  document.documentElement.classList.toggle('lite', on);
})();

export function renderChrome() {
  const lang = h('button', { type: 'button', class: 'chip', id: 'lang-btn' }, icon('globe', 16), h('span', { id: 'lang-txt' }));
  const paint = () => { document.getElementById('lang-txt').textContent = getLang() === 'ar' ? 'English' : 'العربية'; };
  lang.addEventListener('click', () => setLang(getLang() === 'ar' ? 'en' : 'ar'));
  document.addEventListener('langchange', paint);

  const theme = h('button', { type: 'button', class: 'icon-btn', id: 'theme-btn', 'data-i18n-aria': 'theme.toggle', 'data-i18n-title': 'theme.toggle' },
    icon('moon', 20, 'moon'), icon('sun', 20, 'sun'));
  theme.addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light', true));
  setTheme(document.documentElement.dataset.theme || 'dark', false);

  document.getElementById('top').replaceChildren(
    h('a', { class: 'brand', href: 'index.html', 'aria-label': 'Hawwil' }, logo(40), h('span', { class: 'wm' }, node('brand'))),
    h('span', { class: 'sp' }), lang, theme);
  const liteBtn = h('button', { type: 'button', class: 'chip', id: 'lite-btn', style: 'padding:4px 12px;font-size:.82rem' }, icon('zap', 14), h('span', { id: 'lite-txt' }));
  const paintLite = () => { document.getElementById('lite-txt').textContent = t(document.documentElement.classList.contains('lite') ? 'lite.off' : 'lite.on'); };
  liteBtn.addEventListener('click', () => {
    const on = !document.documentElement.classList.contains('lite');
    document.documentElement.classList.toggle('lite', on);
    try { localStorage.setItem('hw-lite', on ? 'on' : 'off'); } catch (e) { /* ignore */ }
    paintLite();
  });
  document.addEventListener('langchange', paintLite);
  document.getElementById('foot').replaceChildren(
    h('span', { class: 'fl' }, icon('shield', 16), node('foot.privacy')),
    h('span', { class: 'legal' }, h('a', { href: 'privacy.html' }, node('foot.privacy.link')), liteBtn),
    h('span', {}, h('a', { href: 'https://github.com/l7v0l', target: '_blank', rel: 'noopener' }, `© ${new Date().getFullYear()} l7v0l`), ' · ', h('a', { href: 'https://github.com/l7v0l/hawwil', target: '_blank', rel: 'noopener' }, 'GitHub')));
  initLang();
  paint();
  paintLite();
  initFX();

  /* 3D background: load after first paint so it never blocks content */
  const cv = document.getElementById('bg3d');
  if (cv) {
    const boot = () => import('./bg3d.js').then(m => m.start3D(cv)).catch(() => { cv.style.display = 'none'; });
    ('requestIdleCallback' in window) ? requestIdleCallback(boot, { timeout: 1200 }) : setTimeout(boot, 300);
  }
  /* offline support + installable app */
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
}
export { reveal };
