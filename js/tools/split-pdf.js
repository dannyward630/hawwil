import { h, node, t, field, seg, createDropzone, createFileList, createProgress, createResults, runTask, baseName, safeName, parsePages, num, UserError } from '../ui.js';
import * as libs from '../libs.js';

export default function mount(root) {
  let count = 0;
  const info = h('p', { class: 'note' });
  const list = createFileList({ reorder: false, thumbs: false, onChange: async f => {
    go.disabled = !f.length; count = 0; info.textContent = '';
    if (!f.length) return;
    try {
      const { PDFDocument } = await libs.pdfLib();
      count = (await PDFDocument.load(await f[0].arrayBuffer())).getPageCount();
      info.textContent = t('split.count', { n: num(count) });
    } catch (e) { info.textContent = t('err.pdfread', { name: f[0].name }); go.disabled = true; }
  } });
  const drop = createDropzone({ accept: ['application/pdf', '.pdf'], multiple: false, icon: 'scissors', hint: 'split.hint', onFiles: f => list.set(f) });

  const radios = seg('o-mode', [['extract', 'split.m.extract', 'extract', 'split.d.extract'], ['ranges', 'split.m.ranges', 'split', 'split.d.ranges'], ['each', 'split.m.each', 'copies', 'split.d.each']], 'extract', { cards: true });
  const pages = h('input', { type: 'text', id: 'o-pages', placeholder: '1-3, 5, 8-', dir: 'ltr', inputmode: 'numeric' });
  const fPages = field('split.pages', pages, 'o-pages');
  const mode = () => radios.value;
  radios.addEventListener('change', () => { fPages.hidden = mode() === 'each'; });
  const go = h('button', { type: 'button', class: 'btn', disabled: true }, node('split.go'));
  const prog = createProgress(), res = createResults();

  go.addEventListener('click', () => runTask(go, prog, async () => {
    res.clear();
    const file = list.files()[0];
    if (!file) return;
    const { PDFDocument } = await libs.pdfLib();
    const src = await PDFDocument.load(await file.arrayBuffer());
    const n = src.getPageCount(), base = safeName(baseName(file.name));
    let groups;                                   // arrays of 1-based page numbers, one per output file
    if (mode() === 'each') groups = Array.from({ length: n }, (_, i) => [i + 1]);
    else if (mode() === 'extract') groups = [parsePages(pages.value, n)];
    else {
      const txt = pages.value.trim();
      if (!txt) throw new UserError('err.range');
      groups = txt.split(/[,\s،]+/).filter(Boolean).map(p => parsePages(p, n));
    }
    const items = [];
    for (let g = 0; g < groups.length; g++) {
      prog.check();
      prog.set(g / groups.length, t('status.processing', { i: g + 1, n: groups.length }));
      const out = await PDFDocument.create();
      (await out.copyPages(src, groups[g].map(p => p - 1))).forEach(p => out.addPage(p));
      const bytes = await out.save();
      const label = groups.length === 1 ? 'extract' : (mode() === 'each' ? `page-${g + 1}` : `part-${g + 1}`);
      items.push({ name: `${base}-${label}.pdf`, blob: new Blob([bytes], { type: 'application/pdf' }), icon: 'pdf', note: t('res.pages', { n: groups[g].length }) });
      await new Promise(r => setTimeout(r));
    }
    await res.render(items, { zipName: base + '-split.zip' });
  }));

  root.append(drop.el,
    h('section', { class: 'card' }, h('h2', {}, node('files.title')), list.el, info),
    h('section', { class: 'card' }, h('h2', {}, node('opts.title')), field('split.mode', radios, 'o-mode'), h('div', { class: 'opts', style: 'margin-top:14px' }, fPages),
      h('p', { class: 'note', style: 'margin-top:10px' }, node('split.example'))),
    h('div', { class: 'act' }, go), prog.el, res.el);
}
