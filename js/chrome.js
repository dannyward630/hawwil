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
  document.getElementById('foot').replaceChildren(
    h('span', { class: 'fl' }, icon('shield', 16), node('foot.privacy')),
    h('span', {}, h('a', { href: 'https://github.com/l7v0l', target: '_blank', rel: 'noopener' }, `© ${new Date().getFullYear()} l7v0l`), ' · ', h('a', { href: 'https://github.com/l7v0l/hawwil', target: '_blank', rel: 'noopener' }, 'GitHub')));
  initLang();
  paint();
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
