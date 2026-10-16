/* Landing page for files shared to Hawwil (PWA share target) or opened with it (file handler). */
import { renderChrome, reveal } from './chrome.js';
import { TOOLS } from './registry.js';
import { h, fmtBytes } from './ui.js';
import { icon } from './icons.js';
import { node, apply } from './i18n.js';
import * as handoff from './handoff.js';

renderChrome();

async function collect() {
  /* file handler: the OS hands us file handles through launchQueue */
  if ('launchQueue' in window) {
    const handles = await new Promise(res => {
      let done = false;
      window.launchQueue.setConsumer(p => { done = true; res(p.files || []); });
      setTimeout(() => { if (!done) res([]); }, 600);
    });
    if (handles.length) {
      const files = await Promise.all(handles.map(x => x.getFile()));
      await handoff.put(files);
      return files;
    }
  }
  return handoff.peek();
}

(async () => {
  const files = await collect();
  const app = document.getElementById('app');
  const wrap = h('div', { class: 'wrap' }, h('h1', {}, node('share.title')));
  if (!files.length) {
    wrap.append(h('p', { class: 'lead' }, node('share.none')), h('a', { class: 'btn', href: 'index.html' }, node('nav.all')));
    app.replaceChildren(wrap); apply(app); reveal();
    return;
  }
  wrap.append(h('ul', { class: 'files' }, files.map(f => h('li', { class: 'file' },
    h('div', { class: 'th' }, icon('file', 22)), h('div', { class: 'nm' }, h('b', {}, f.name), h('small', {}, fmtBytes(f.size)))))));
  const kinds = [...new Set(files.map(handoff.kindOf))];
  const ids = [...new Set(kinds.flatMap(k => handoff.TOOLS_FOR[k] || []))];
  const defs = ids.map(id => TOOLS.find(x => x.id === id)).filter(Boolean);
  wrap.append(h('h2', { class: 'sec-h', style: 'margin:22px 0 12px' }, node('share.pick')),
    h('div', { class: 'grid mini' }, defs.map((x, i) => h('a', { class: 'tool', href: x.id + '.html?h=1', 'data-cat': x.cat, style: `--i:${i}` },
      h('div', { class: 'ic' }, icon(x.icon, 22)), h('h3', {}, node(x.id + '.title'))))));
  app.replaceChildren(wrap); apply(app); reveal();
})();
