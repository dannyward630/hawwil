import { renderChrome, reveal } from './chrome.js';
import { TOOLS } from './registry.js';
import { h } from './ui.js';
import { icon } from './icons.js';
import { t, node, apply } from './i18n.js';
import * as handoff from './handoff.js';

/* files sent from another tool, the share sheet or a file association: drop them into this tool's file input */
async function takeHandoff(root) {
  if (!new URLSearchParams(location.search).has('h')) return;          // only when sent from another page
  const input = root.querySelector('input[type=file]');
  if (!input) return;
  const files = await handoff.take();
  if (!files.length) return;
  const dt = new DataTransfer();
  files.forEach(f => dt.items.add(f));
  input.files = dt.files;
  input.dispatchEvent(new Event('change'));
}

const id = document.body.dataset.tool;
const def = TOOLS.find(x => x.id === id);

function others() {
  const list = TOOLS.filter(x => x.id !== id);
  return h('section', { class: 'others rv' }, h('h2', { class: 'sec-h' }, node('others.title')),
    h('div', { class: 'grid mini' }, list.map((x, i) => h('a', { class: 'tool', href: x.id + '.html', 'data-tilt': '', 'data-cat': x.cat, style: `--i:${i}` },
      h('div', { class: 'ic' }, icon(x.icon, 22)), h('h3', {}, node(x.id + '.title'))))));
}

function setTitle() { document.title = `${t(id + '.title')} | ${t('meta.suffix')}`; }

async function start() {
  renderChrome();
  const app = document.getElementById('app');
  if (!def) { app.textContent = '404'; return; }
  const root = h('div', { id: 'tool-root', class: 'stack' });
  app.replaceChildren(h('div', { class: 'wrap' },
    h('a', { class: 'crumb', href: 'index.html' }, h('span', { class: 'ar' }, icon('arrow-left', 16)), node('nav.all')),
    h('div', { class: 'thead', 'data-cat': def.cat }, h('div', { class: 'ic' }, icon(def.icon, 30)),
      h('div', {}, h('h1', {}, node(id + '.title')), h('p', {}, node(id + '.desc')))),
    root, others()));
  apply(document);
  setTitle();
  document.addEventListener('langchange', setTitle);
  try {
    const mod = await import('./tools/' + (def.mod || def.id) + '.js');
    await mod.default(root, def.opts || {});
    apply(root);
    await takeHandoff(root);
  } catch (e) {
    console.error(e);
    root.append(h('p', { class: 'warn' }, node('err.lib')));
  }
  reveal();
}
start();
