import { h, node, t, field, select, createDropzone, createFileList, createProgress, createResults, runTask, baseName, extOf, safeName, uniqueName, UserError } from '../ui.js';
import * as libs from '../libs.js';
import { esc, sanitize, htmlToPdf, printHtml, isArabicText } from '../render.js';

const ACCEPT = ['.txt', '.md', '.markdown', '.html', '.htm', '.csv', '.tsv', '.json', 'text/plain', 'text/html', 'text/csv', 'application/json'];
const KIND_BY_EXT = { txt: 'text', md: 'markdown', markdown: 'markdown', html: 'html', htm: 'html', csv: 'csv', tsv: 'csv', json: 'json' };

function parseCsv(text) {
  const first = text.split(/\r?\n/, 1)[0] || '';
  const delim = [',', ';', '\t'].map(d => [d, first.split(d).length]).sort((a, b) => b[1] - a[1])[0][0];
  const rows = []; let row = [], cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"') q = true;
    else if (c === delim) { row.push(cur); cur = ''; }
    else if (c === '\n') { row.push(cur.replace(/\r$/, '')); rows.push(row); row = []; cur = ''; }
    else cur += c;
  }
  if (cur || row.length) { row.push(cur.replace(/\r$/, '')); rows.push(row); }
  return rows.filter(r => r.some(x => x !== ''));
}

async function toHtml(text, kind) {
  if (kind === 'markdown') { const marked = await libs.marked(); return sanitize(marked.parse(text, { mangle: false, headerIds: false })); }
  if (kind === 'html') return sanitize(text);
  if (kind === 'csv') {
    const rows = parseCsv(text);
    if (!rows.length) throw new UserError('err.empty');
    const [head, ...body] = rows;
    return `<table><thead><tr>${head.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${body.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  }
  if (kind === 'json') {
    let pretty;
    try { pretty = JSON.stringify(JSON.parse(text), null, 2); } catch (e) { throw new UserError('err.json'); }
    return `<pre dir="ltr">${esc(pretty)}</pre>`;
  }
  return `<div class="plain">${esc(text)}</div>`;
}


export default function mount(root) {
  const list = createFileList({ thumbs: false, reorder: false, onChange: () => refresh() });
  const drop = createDropzone({ accept: ACCEPT, icon: 'text-pdf', hint: 'txt.hint', onFiles: f => list.add(f) });
  const area = h('textarea', { id: 'o-text', 'data-i18n-ph': 'txt.ph', placeholder: t('txt.ph'), rows: '6' });
  area.addEventListener('input', () => refresh());
  const kind = select('o-kind', [['auto', 'o.auto', 'auto'], ['text', 'txt.k.text', 'text'], ['markdown', 'txt.k.md', 'text-pdf'], ['html', 'txt.k.html', 'globe'], ['csv', 'txt.k.csv', 'table'], ['json', 'txt.k.json', 'file']], 'auto');
  const size = select('o-size', [['a4', 'o.a4', 'page-a4'], ['letter', 'o.letter', 'page-letter']], 'a4');
  const font = select('o-font', [['12', 'txt.f.s', 'size-s'], ['15', 'txt.f.m', 'size-m'], ['18', 'txt.f.l', 'size-l']], '15');
  const dirSel = select('o-dir', [['auto', 'o.auto', 'auto'], ['rtl', 'txt.d.rtl', 'rtl'], ['ltr', 'txt.d.ltr', 'ltr']], 'auto');
  const outSel = select('o-out', [['image', 'txt.o.image', 'image'], ['print', 'txt.o.print', 'text']], 'image');
  const outNote = h('p', { class: 'note', hidden: true }, node('txt.o.print.note'));
  outSel.addEventListener('change', () => { outNote.hidden = outSel.value !== 'print'; });
  const go = h('button', { type: 'button', class: 'btn', disabled: true }, node('txt.go'));
  const prog = createProgress(), res = createResults();
  function refresh() {
    const has = !!(area.value.trim() || list.files().length);
    go.disabled = !has;
    document.getElementById('tool-root')?.classList.toggle('has-files', has);
  }

  go.addEventListener('click', () => runTask(go, prog, async () => {
    res.clear();
    const jobs = list.files().map(f => ({ file: f }));
    if (area.value.trim()) jobs.push({ text: area.value, name: 'text' });
    const items = [], used = new Set();
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      const text = job.file ? await job.file.text() : job.text;
      const name = job.file ? baseName(job.file.name) : job.name;
      let k = kind.value;
      if (k === 'auto') k = job.file ? (KIND_BY_EXT[extOf(job.file.name)] || 'text') : 'text';
      if (!text.trim()) throw new UserError('err.empty');
      const dir = dirSel.value === 'auto' ? (isArabicText(text) ? 'rtl' : 'ltr') : dirSel.value;
      prog.check();
      const html = await toHtml(text, k);
      if (outSel.value === 'print') { await printHtml(html, dir); continue; }
      const { blob, pages } = await htmlToPdf(html, { size: size.value, fontPx: +font.value, dir,
        onPage: p => prog.set(i / jobs.length, t('status.pageonly', { i: p })) });
      items.push({ name: uniqueName(safeName(name) + '.pdf', used), blob, icon: 'pdf', note: t('res.pages', { n: pages }) });
    }
    if (items.length) await res.render(items, { zipName: 'documents.zip' });
  }));

  root.append(drop.el,
    h('section', { class: 'card' }, h('h2', {}, node('files.title')), list.el),
    h('section', { class: 'card' }, h('div', { class: 'fld' }, h('label', { for: 'o-text' }, node('txt.paste')), area)),
    h('section', { class: 'card' }, h('h2', {}, node('opts.title')),
      h('div', { class: 'opts' }, field('txt.kind', kind, 'o-kind'), field('o.size', size, 'o-size'), field('txt.font', font, 'o-font'), field('txt.dir', dirSel, 'o-dir')),
      h('div', { style: 'margin-top:14px' }, field('txt.out', outSel, 'o-out'), outNote)),
    h('div', { class: 'act' }, go), prog.el, res.el);
}
