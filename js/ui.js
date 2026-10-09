import { t, node, num, getLang } from './i18n.js';
import * as libs from './libs.js';
import { icon } from './icons.js';

export const $ = (s, r = document) => r.querySelector(s);

/* tiny DOM builder: h('div', {class:'x', onclick:fn}, child, 'text') */
export function h(tag, props = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (v === true) e.setAttribute(k, '');
    else e.setAttribute(k, v);
  }
  kids.flat(Infinity).forEach(c => { if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c)); });
  if (tag === 'input' && props && props.type === 'range') {      // coloured fill up to the thumb
    const up = () => e.style.setProperty('--p', ((e.value - e.min) / (e.max - e.min) * 100) + '%');
    e.addEventListener('input', up); up();
  }
  return e;
}

export function fmtBytes(n) {
  if (!isFinite(n)) return '';
  const u = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
  return `${num(+(i ? n.toFixed(n < 10 ? 2 : 1) : n))} ${u[i]}`;
}

export const extOf = name => (/\.([^.]+)$/.exec(name) || [])[1]?.toLowerCase() || '';
export const baseName = name => name.replace(/\.[^.]+$/, '');
export const safeName = name => (name.replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_').trim().slice(0, 150)) || 'file';

export function uniqueName(name, used) {
  if (!used.has(name)) { used.add(name); return name; }
  const b = baseName(name), e = extOf(name) ? '.' + extOf(name) : '';
  let i = 2;
  while (used.has(`${b}-${i}${e}`)) i++;
  const n = `${b}-${i}${e}`;
  used.add(n);
  return n;
}

export function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = h('a', { href: url, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

let toastTimer;
export function toast(key, vars, isErr = false) {
  let el = $('#toast');
  if (!el) { el = h('div', { id: 'toast', class: 'toast', role: 'status' }); document.body.append(el); }
  el.textContent = t(key, vars);
  el.className = 'toast show' + (isErr ? ' err' : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), isErr ? 4200 : 2200);
}

/* ---------- accept filter ---------- */
export function isAccepted(file, accept) {
  if (!accept || !accept.length) return true;
  const ext = extOf(file.name), type = (file.type || '').toLowerCase();
  return accept.some(a => {
    a = a.toLowerCase();
    if (a.startsWith('.')) return ext === a.slice(1);
    if (a.endsWith('/*')) return type.startsWith(a.slice(0, -1));
    return type === a;
  });
}

/* ---------- drop zone ---------- */
export function createDropzone({ accept = [], multiple = true, icon: ic = 'upload', hint = 'drop.hint', onFiles }) {
  const input = h('input', { type: 'file', multiple: multiple || null, accept: accept.join(',') || null });
  const el = h('label', { class: 'drop' },
    h('span', { class: 'dz-ico', 'aria-hidden': 'true' }, h('i', { class: 'ring' }), icon(ic, 34), h('em', {}, icon('arrow-up', 14))),
    h('b', {}, node(multiple ? 'drop.title.multi' : 'drop.title.one')),
    h('span', { class: 'dz-hint' }, node(hint)),
    h('span', { class: 'dz-btn' }, icon('upload', 16), node('drop.choose')),
    input);
  const take = list => {
    let files = [...list];
    if (!multiple) files = files.slice(0, 1);
    const ok = files.filter(f => isAccepted(f, accept));
    if (ok.length < files.length) toast('err.rejected', { n: files.length - ok.length }, true);
    if (ok.length) onFiles(ok);
  };
  input.addEventListener('change', () => { take(input.files); input.value = ''; });
  ['dragenter', 'dragover'].forEach(ev => el.addEventListener(ev, e => { e.preventDefault(); el.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(ev => el.addEventListener(ev, e => { e.preventDefault(); el.classList.remove('over'); }));
  el.addEventListener('drop', e => { if (e.dataTransfer?.files?.length) take(e.dataTransfer.files); });
  return { el, input };
}

/* ---------- file list with reorder ---------- */
export function createFileList({ thumbs = true, reorder = true, onChange = () => {} } = {}) {
  const ul = h('ul', { class: 'files' });
  let items = [], uid = 0;
  const urls = new Set();

  function fileIcon(file) {
    const e = extOf(file.name);
    if (e === 'pdf') return icon('pdf', 22);
    if (['zip', 'rar', '7z', 'gz'].includes(e)) return icon('archive', 22);
    if (['doc', 'docx', 'odt', 'rtf', 'txt', 'md', 'html', 'json'].includes(e)) return icon('text-pdf', 22);
    if (['xls', 'xlsx', 'csv', 'tsv'].includes(e)) return icon('table', 22);
    if (/^(mp4|mov|mkv|avi|webm)$/.test(e)) return icon('video', 22);
    if (/^(mp3|wav|ogg|m4a|flac)$/.test(e)) return icon('audio', 22);
    return icon('file', 22);
  }

  function render() {
    ul.replaceChildren(...items.map((it, i) => {
      const th = h('div', { class: 'th' });
      if (thumbs && it.file.type.startsWith('image/')) {
        if (!it.url) { it.url = URL.createObjectURL(it.file); urls.add(it.url); }
        th.append(h('img', { src: it.url, alt: '', loading: 'lazy' }));
      } else th.append(fileIcon(it.file));
      const mk = (ic, aria, fn, dis) => h('button', { type: 'button', 'data-i18n-aria': aria, 'data-i18n-title': aria, title: t(aria), 'aria-label': t(aria), onclick: fn, disabled: dis || null }, icon(ic, 16));
      return h('li', { class: 'file', style: `--i:${Math.min(i, 8)}` }, th,
        h('div', { class: 'nm' }, h('b', { title: it.file.name }, it.file.name), h('small', {}, fmtBytes(it.file.size))),
        h('div', { class: 'ac' },
          reorder && mk('arrow-up', 'file.up', () => move(i, -1), i === 0),
          reorder && mk('arrow-down', 'file.down', () => move(i, 1), i === items.length - 1),
          mk('x', 'file.remove', () => remove(i))));
    }));
    const root = document.getElementById('tool-root');
    if (root) root.classList.toggle('has-files', items.length > 0);   // options appear only after a file is added
    onChange(items.map(x => x.file));
  }
  function move(i, d) {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    [items[i], items[j]] = [items[j], items[i]];
    render();
  }
  function remove(i) {
    const [it] = items.splice(i, 1);
    if (it.url) { URL.revokeObjectURL(it.url); urls.delete(it.url); }
    render();
  }
  return {
    el: ul,
    add(files) { files.forEach(f => items.push({ id: ++uid, file: f })); render(); },
    set(files) { this.clear(); this.add(files); },
    clear() { urls.forEach(u => URL.revokeObjectURL(u)); urls.clear(); items = []; render(); },
    files: () => items.map(x => x.file)
  };
}

/* ---------- progress ---------- */
export function createProgress() {
  const bar = h('i'), label = h('small');
  const el = h('div', { class: 'prog', hidden: true, role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100' }, h('div', { class: 'bar' }, bar), label);
  return {
    el,
    set(frac, text) {
      el.hidden = false;
      const p = Math.max(0, Math.min(1, frac));
      bar.style.width = (p * 100).toFixed(1) + '%';
      el.setAttribute('aria-valuenow', Math.round(p * 100));
      label.textContent = text || '';
    },
    hide() { el.hidden = true; }
  };
}

/* ---------- results ---------- */
export function createResults() {
  const box = h('section', { class: 'card', hidden: true });
  let urls = [];
  function clear() { urls.forEach(u => URL.revokeObjectURL(u)); urls = []; box.replaceChildren(); box.hidden = true; }

  /* items: [{name, blob, note, good, thumb:Blob|null, icon}] */
  async function render(items, { zipName = 'hawwil.zip', summary = null } = {}) {
    clear();
    if (!items.length) return;
    box.hidden = false;
    box.append(h('h2', { class: 'ok-h' }, h('span', { class: 'okc' }, icon('check', 16)), node('res.title')));
    if (summary) box.append(h('div', { class: 'sumbar' }, summary));
    const ul = h('ul', { class: 'res' });
    items.forEach(it => {
      const url = URL.createObjectURL(it.blob);
      urls.push(url);
      const th = h('div', { class: 'th' });
      if (it.thumb) { const tu = URL.createObjectURL(it.thumb); urls.push(tu); th.append(h('img', { src: tu, alt: '' })); }
      else th.append(icon(it.icon || 'file', 22));
      ul.append(h('li', { style: `--i:${Math.min(ul.children.length, 10)}` }, th,
        h('div', { class: 'nm' }, h('b', { title: it.name }, it.name),
          h('small', { class: it.good ? 'good' : '' }, fmtBytes(it.blob.size), it.note ? ' · ' : '', it.note || '')),
        h('a', { class: 'btn sm', href: url, download: it.name }, icon('download', 16), node('res.download'))));
    });
    box.append(ul);
    if (items.length > 1) {
      const btn = h('button', { type: 'button', class: 'btn ghost', style: 'margin-top:14px' }, icon('archive', 18), node('res.zip'));
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        try {
          const JSZip = await libs.jszip(), zip = new JSZip(), used = new Set();
          items.forEach(it => zip.file(uniqueName(it.name, used), it.blob, { compression: 'STORE' }));
          downloadBlob(await zip.generateAsync({ type: 'blob', compression: 'STORE' }), zipName);
        } catch (e) { toast('err.generic', null, true); } finally { btn.disabled = false; }
      });
      box.append(btn);
    }
    box.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
  }
  return { el: box, render, clear };
}

/* ---------- misc ---------- */
export function field(labelKey, control, id) {
  const isSeg = control.classList && control.classList.contains('seg');
  if (isSeg) control.setAttribute('aria-labelledby', id + '-lb');
  return h('div', { class: 'fld' + (isSeg ? ' fseg' : '') },
    isSeg ? h('span', { class: 'lb', id: id + '-lb' }, node(labelKey)) : h('label', { for: id }, node(labelKey)), control);
}

/* Segmented control / option cards. Behaves like a <select>: .value, 'change' event.
   options: [value, labelKey, iconName?, descKey?] */
export function seg(id, options, value, { cards = false } = {}) {
  const el = h('div', { class: 'seg' + (cards ? ' cards' : ''), id, role: 'radiogroup' });
  let cur = String(value ?? options[0][0]);
  const btns = options.map(([v, key, ic, descKey]) => {
    const b = h('button', { type: 'button', role: 'radio', class: 'opt', 'data-v': String(v) },
      ic ? h('span', { class: 'oi' }, icon(ic, cards ? 26 : 20)) : null,
      h('span', { class: 'ot' }, h('b', {}, node(key)), descKey ? h('small', {}, node(descKey)) : null));
    b.addEventListener('click', () => choose(String(v), true));
    return b;
  });
  function paint() {
    btns.forEach(b => { const on = b.dataset.v === cur; b.setAttribute('aria-checked', String(on)); b.tabIndex = on ? 0 : -1; b.classList.toggle('on', on); });
  }
  function choose(v, user) {
    if (v === cur) return;
    cur = v; paint();
    if (user) el.dispatchEvent(new Event('change', { bubbles: true }));
  }
  el.addEventListener('keydown', e => {
    const k = e.key;
    if (!/^Arrow/.test(k)) return;
    e.preventDefault();
    const rtl = getComputedStyle(el).direction === 'rtl';
    const dir = (k === 'ArrowRight' ? 1 : k === 'ArrowLeft' ? -1 : k === 'ArrowDown' ? 1 : -1) * (rtl && /Left|Right/.test(k) ? -1 : 1);
    const i = btns.findIndex(b => b.dataset.v === cur), n = btns[(i + dir + btns.length) % btns.length];
    choose(n.dataset.v, true); n.focus();
  });
  Object.defineProperty(el, 'value', { get: () => cur, set: v => choose(String(v), false) });
  el.append(...btns);
  paint();
  return el;
}
export const select = (id, options, value, opts) => seg(id, options, value, opts);

/* run an async task with busy state + friendly errors */
export async function runTask(btn, prog, fn) {
  btn.disabled = true;
  try { await fn(); }
  catch (e) {
    console.error(e);
    const msg = e && e.userKey ? e.userKey : /password/i.test(e?.name || e?.message || '') ? 'err.password' : /lib:/.test(e?.message || '') ? 'err.lib' : 'err.generic';
    toast(msg, e && e.vars, true);
  } finally { btn.disabled = false; prog.hide(); }
}
export class UserError extends Error { constructor(key, vars) { super(key); this.userKey = key; this.vars = vars; } }

/* "1-3,5,8-" -> sorted unique page numbers (1-based) */
export function parsePages(str, max) {
  str = (str || '').trim();
  if (!str) return Array.from({ length: max }, (_, i) => i + 1);
  const out = [];
  for (const part of str.split(/[,\s،]+/).filter(Boolean)) {
    const m = /^(\d*)-(\d*)$/.exec(part) || /^(\d+)$/.exec(part);
    if (!m) throw new UserError('err.range');
    let a, b;
    if (m.length === 2) a = b = +m[1]; else { a = m[1] ? +m[1] : 1; b = m[2] ? +m[2] : max; }
    if (!a || !b || a > b || b > max) throw new UserError('err.range');
    for (let i = a; i <= b; i++) out.push(i);
  }
  return out;
}
export { getLang, t, node, num };
