import { h, node, t, field, select, createDropzone, createFileList, createProgress, createResults, runTask, baseName, extOf, safeName, uniqueName, UserError } from '../ui.js';
import * as libs from '../libs.js';
import { canvasToBlob } from '../img.js';

const PAGES = { a4: { w: 794, ratio: 1.41421, pt: [595.28, 841.89] }, letter: { w: 816, ratio: 1.29412, pt: [612, 792] } };
const ACCEPT = ['.txt', '.md', '.markdown', '.html', '.htm', '.csv', '.tsv', '.json', 'text/plain', 'text/html', 'text/csv', 'application/json'];
const KIND_BY_EXT = { txt: 'text', md: 'markdown', markdown: 'markdown', html: 'html', htm: 'html', csv: 'csv', tsv: 'csv', json: 'json' };

const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* strip anything that can run code or load remote content; the input may come from an untrusted file */
function sanitize(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script,style,iframe,frame,object,embed,link,meta,base,form,input,button,textarea,select,audio,video,source,svg,math,template,noscript').forEach(e => e.remove());
  doc.querySelectorAll('*').forEach(el => {
    [...el.attributes].forEach(a => {
      const n = a.name.toLowerCase(), v = a.value.trim().toLowerCase();
      if (n.startsWith('on') || n === 'srcset' || n === 'style') el.removeAttribute(a.name);
      else if (n === 'src' && !v.startsWith('data:image/')) el.removeAttribute(a.name);
      else if (n === 'href' && !/^(https?:|mailto:|#)/.test(v)) el.removeAttribute(a.name);
    });
  });
  return doc.body.innerHTML;
}

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

const isArabicText = s => { const m = s.match(/[؀-ۿ]/g); return !!m && m.length / Math.max(1, s.replace(/\s/g, '').length) > 0.25; };

function ensureStyle() {
  if (document.getElementById('pdfdoc-style')) return;
  document.head.append(h('style', { id: 'pdfdoc-style' }, `
  .pdfdoc{position:absolute;left:-99999px;top:0;background:#fff;color:#111;padding:48px;box-sizing:border-box;line-height:1.75;font-family:'Cairo','Inter',system-ui,sans-serif;overflow-wrap:anywhere}
  .pdfdoc *{max-width:100%;box-sizing:border-box}
  .pdfdoc .plain{white-space:pre-wrap}
  .pdfdoc h1,.pdfdoc h2,.pdfdoc h3{line-height:1.3;margin:1.1em 0 .5em}.pdfdoc h1{font-size:1.9em}.pdfdoc h2{font-size:1.5em}.pdfdoc h3{font-size:1.25em}
  .pdfdoc p,.pdfdoc ul,.pdfdoc ol,.pdfdoc blockquote,.pdfdoc pre,.pdfdoc table{margin:0 0 1em}
  .pdfdoc ul,.pdfdoc ol{list-style:none;padding-inline-start:0;counter-reset:li}
  .pdfdoc li{position:relative;padding-inline-start:1.7em;counter-increment:li}
  .pdfdoc ul>li::before{content:'\\2022';position:absolute;inset-inline-start:.45em}
  .pdfdoc ol>li::before{content:counter(li) '.';position:absolute;inset-inline-start:0;font-weight:600}
  .pdfdoc li ul,.pdfdoc li ol{margin:.3em 0 .3em}
  .pdfdoc blockquote{border-inline-start:4px solid #bbb;padding-inline-start:1em;color:#444}
  .pdfdoc pre,.pdfdoc code{font-family:'Fira Code',ui-monospace,monospace;font-size:.88em;background:#f1f3f6;border-radius:4px}
  .pdfdoc code{padding:1px 5px}.pdfdoc pre{padding:12px;white-space:pre-wrap;direction:ltr;text-align:left}.pdfdoc pre code{background:none;padding:0}
  .pdfdoc table{border-collapse:collapse;width:100%}.pdfdoc th,.pdfdoc td{border:1px solid #bbb;padding:6px 10px;text-align:start;vertical-align:top}.pdfdoc th{background:#eef1f6}
  .pdfdoc img{height:auto}.pdfdoc a{color:#1a56c4}`));
}

/* a row of pixels that is (almost) all white -> safe place to cut between lines */
function findCut(ctx, w, end, minY) {
  for (let y = end; y > minY; y--) {
    const d = ctx.getImageData(0, y, w, 1).data;
    let blank = true;
    for (let i = 0; i < d.length; i += 4) if (d[i] < 245 || d[i + 1] < 245 || d[i + 2] < 245) { blank = false; break; }
    if (blank) return y;
  }
  return end;
}
function isBlank(ctx, w, y0, y1) {
  for (let y = y0; y < y1; y += 6) {
    const d = ctx.getImageData(0, y, w, 1).data;
    for (let i = 0; i < d.length; i += 4) if (d[i] < 245 || d[i + 1] < 245 || d[i + 2] < 245) return false;
  }
  return true;
}

async function htmlToPdf(html, { size, fontPx, dir, onPage }) {
  ensureStyle();
  await document.fonts.ready.catch(() => {});
  const [html2canvas, { PDFDocument }] = await Promise.all([libs.html2canvas(), libs.pdfLib()]);
  const P = PAGES[size], W = P.w, PH = Math.round(W * P.ratio);
  const box = h('div', { class: 'pdfdoc', dir, style: `width:${W}px;font-size:${fontPx}px` });
  box.innerHTML = html;
  document.body.append(box);
  try {
    await Promise.all([...box.querySelectorAll('img')].map(i => i.decode().catch(() => {})));
    const totalH = box.scrollHeight, scale = 2;
    const pdf = await PDFDocument.create(), [pw, ph] = P.pt;
    const SEG = PH * 6;
    const phPx = PH * scale;
    let curY = 0, count = 0;
    while (curY < totalH - 1) {
      const segH = Math.min(SEG, totalH - curY), atEnd = curY + segH >= totalH - 1;
      const seg = await html2canvas(box, { scale, backgroundColor: '#ffffff', x: 0, y: curY, width: W, height: segH, windowWidth: W, logging: false, useCORS: false, allowTaint: false });
      const ctx = seg.getContext('2d', { willReadFrequently: true });
      let y = 0;
      for (;;) {
        const remaining = seg.height - y;
        if (!atEnd && remaining < phPx * 1.15) break;
        const end = remaining <= phPx ? seg.height : findCut(ctx, seg.width, y + phPx, y + Math.round(phPx * 0.55));
        if (!isBlank(ctx, seg.width, y, end) || (atEnd && end >= seg.height && count === 0)) {
          const slice = document.createElement('canvas');
          slice.width = seg.width; slice.height = end - y;
          slice.getContext('2d').drawImage(seg, 0, y, seg.width, end - y, 0, 0, seg.width, end - y);
          const jpg = await pdf.embedJpg(await (await canvasToBlob(slice, 'image/jpeg', 0.85)).arrayBuffer());
          const page = pdf.addPage([pw, ph]), dh = (end - y) / seg.width * pw;
          page.drawImage(jpg, { x: 0, y: ph - dh, width: pw, height: dh });
          count++; onPage(count);
        }
        y = end;
        if (end >= seg.height) break;
      }
      curY += y / scale;
      if (atEnd) break;
      if (y === 0) curY += segH;
      await new Promise(r => setTimeout(r));
    }
    return { blob: new Blob([await pdf.save()], { type: 'application/pdf' }), pages: count };
  } finally { box.remove(); }
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
      const html = await toHtml(text, k);
      const { blob, pages } = await htmlToPdf(html, { size: size.value, fontPx: +font.value, dir,
        onPage: p => prog.set(i / jobs.length, t('status.pageonly', { i: p })) });
      items.push({ name: uniqueName(safeName(name) + '.pdf', used), blob, icon: 'pdf', note: t('res.pages', { n: pages }) });
    }
    await res.render(items, { zipName: 'documents.zip' });
  }));

  root.append(drop.el,
    h('section', { class: 'card' }, h('h2', {}, node('files.title')), list.el),
    h('section', { class: 'card' }, h('div', { class: 'fld' }, h('label', { for: 'o-text' }, node('txt.paste')), area)),
    h('section', { class: 'card' }, h('h2', {}, node('opts.title')),
      h('div', { class: 'opts' }, field('txt.kind', kind, 'o-kind'), field('o.size', size, 'o-size'), field('txt.font', font, 'o-font'), field('txt.dir', dirSel, 'o-dir'))),
    h('div', { class: 'act' }, go), prog.el, res.el);
}
