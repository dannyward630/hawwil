import { renderChrome, reveal } from './chrome.js';
import { TOOLS, CATS } from './registry.js';
import { h } from './ui.js';
import { icon } from './icons.js';
import { t, node } from './i18n.js';

renderChrome();
let cat = 'all', q = '';

const search = h('input', { type: 'search', id: 'q', 'data-i18n-ph': 'search.ph', placeholder: t('search.ph'), autocomplete: 'off', spellcheck: 'false', 'data-i18n-aria': 'search.ph', 'aria-label': t('search.ph') });
const tabs = h('div', { class: 'tabs', role: 'group' });
const grid = h('div', { class: 'grid', id: 'grid' });

function drawTabs() {
  tabs.replaceChildren(...[['all', 'cat.all'], ...CATS].map(([v, k]) =>
    h('button', { type: 'button', 'aria-pressed': String(cat === v), onclick: () => { cat = v; drawTabs(); drawGrid(); } }, node(k))));
}
function card(x, i) {
  return h('a', { class: 'tool', href: x.id + '.html', 'data-tilt': '', 'data-cat': x.cat, style: `--i:${i}` },
    h('div', { class: 'ic' }, icon(x.icon, 26)),
    h('h3', {}, node(x.id + '.title')), h('p', {}, node(x.id + '.desc')),
    h('span', { class: 'go', 'aria-hidden': 'true' }, icon('arrow-left', 18)));
}
function drawGrid() {
  const needle = q.trim().toLowerCase();
  const list = TOOLS.filter(x => (cat === 'all' || x.cat === cat) &&
    (!needle || (t(x.id + '.title') + ' ' + t(x.id + '.desc') + ' ' + x.id).toLowerCase().includes(needle)));
  grid.replaceChildren(...(list.length ? list.map(card) : [h('div', { class: 'empty' }, node('home.none'))]));
}
search.addEventListener('input', () => { q = search.value; drawGrid(); });
document.addEventListener('langchange', () => { if (q) drawGrid(); document.title = `${t('brand')} | ${t('home.h1')}`; });

const badge = (ic, k) => h('span', { class: 'badge' }, icon(ic, 16), node(k));
document.getElementById('app').replaceChildren(h('div', { class: 'wrap' },
  h('section', { class: 'hero' },
    h('h1', { class: 'hero-t' }, node('home.h1')),
    h('p', { class: 'lead' }, node('home.lead')),
    h('div', { class: 'badges' }, badge('gift', 'badge.free'), badge('shield', 'badge.private'), badge('user-x', 'badge.nosignup')),
    h('label', { class: 'search' }, icon('search', 20), search), tabs),
  grid,
  h('div', { class: 'why' }, [['shield', 1], ['zap', 2], ['globe', 3]].map(([ic, i]) =>
    h('div', { class: 'rv', style: `--i:${i}` }, h('span', { class: 'wi' }, icon(ic, 22)), h('b', {}, node(`why.${i}.t`)), h('span', {}, node(`why.${i}.d`)))))));
drawTabs();
drawGrid();
reveal();
document.title = `${t('brand')} | ${t('home.h1')}`;
