import en from './lang/en.js';
import ar from './lang/ar.js';

const dict = { en, ar };
let lang = (navigator.language || '').toLowerCase().startsWith('ar') ? 'ar' : 'en';
try { lang = localStorage.getItem('hw-lang') || lang; } catch (e) { /* storage blocked */ }
if (!dict[lang]) lang = 'en';

export const getLang = () => lang;

export function t(key, vars) {
  let s = dict[lang][key] ?? dict.en[key] ?? key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] ?? m));
  return s;
}

/* number formatting with latin digits in both languages */
export const num = n => new Intl.NumberFormat(lang === 'ar' ? 'ar-u-nu-latn' : 'en').format(n);

/* a span that re-translates itself when the language changes */
export function node(key, vars) {
  const s = document.createElement('span');
  s.dataset.i18n = key;
  if (vars) s.dataset.vars = JSON.stringify(vars);
  s.textContent = t(key, vars);
  return s;
}

export function apply(root = document) {
  root.querySelectorAll('[data-i18n]').forEach(e => {
    e.textContent = t(e.dataset.i18n, e.dataset.vars ? JSON.parse(e.dataset.vars) : undefined);
  });
  root.querySelectorAll('[data-i18n-ph]').forEach(e => { e.placeholder = t(e.dataset.i18nPh); });
  root.querySelectorAll('[data-i18n-title]').forEach(e => { e.title = t(e.dataset.i18nTitle); });
  root.querySelectorAll('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
}

export function setLang(l, save = true) {
  if (!dict[l]) return;
  lang = l;
  document.documentElement.lang = l;
  document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
  if (save) { try { localStorage.setItem('hw-lang', l); } catch (e) { /* ignore */ } }
  apply(document);
  document.dispatchEvent(new CustomEvent('langchange', { detail: l }));
}

export function initLang() { setLang(lang, false); }
