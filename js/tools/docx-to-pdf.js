import { h, node, t, field, select, createDropzone, createFileList, createProgress, createResults, runTask, baseName, safeName, uniqueName, UserError } from '../ui.js';
import * as libs from '../libs.js';
import { sanitize, htmlToPdf, printHtml, isArabicText } from '../render.js';

export default function mount(root) {
  const list = createFileList({ thumbs: false, reorder: false, onChange: f => { go.disabled = !f.length; } });
  const drop = createDropzone({ accept: ['.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'], icon: 'text-pdf', hint: 'docx.hint', onFiles: f => list.add(f) });
  const size = select('o-size', [['a4', 'o.a4', 'page-a4'], ['letter', 'o.letter', 'page-letter']], 'a4');
  const font = select('o-font', [['12', 'txt.f.s', 'size-s'], ['15', 'txt.f.m', 'size-m'], ['18', 'txt.f.l', 'size-l']], '15');
  const dirSel = select('o-dir', [['auto', 'o.auto', 'auto'], ['rtl', 'txt.d.rtl', 'rtl'], ['ltr', 'txt.d.ltr', 'ltr']], 'auto');
  const outSel = select('o-out', [['image', 'txt.o.image', 'image'], ['print', 'txt.o.print', 'text']], 'image');
  const outNote = h('p', { class: 'note', hidden: true }, node('txt.o.print.note'));
  outSel.addEventListener('change', () => { outNote.hidden = outSel.value !== 'print'; });
  const go = h('button', { type: 'button', class: 'btn', disabled: true }, node('docx.go'));
  const prog = createProgress(), res = createResults();

  go.addEventListener('click', () => runTask(go, prog, async () => {
    res.clear();
    const files = list.files(), items = [], used = new Set();
    const mammoth = await libs.mammoth();
    for (let i = 0; i < files.length; i++) {
      prog.check();
      prog.set(i / files.length, t('status.processing', { i: i + 1, n: files.length }));
      let html;
      try { html = (await mammoth.convertToHtml({ arrayBuffer: await files[i].arrayBuffer() })).value; }
      catch (e) { throw new UserError('err.docx', { name: files[i].name }); }
      const clean = sanitize(html);
      const text = new DOMParser().parseFromString(clean, 'text/html').body.textContent || '';
      if (!text.trim() && !/<img/i.test(clean)) throw new UserError('err.empty');
      const dir = dirSel.value === 'auto' ? (isArabicText(text) ? 'rtl' : 'ltr') : dirSel.value;
      if (outSel.value === 'print') { await printHtml(clean, dir); continue; }
      const { blob, pages } = await htmlToPdf(clean, { size: size.value, fontPx: +font.value, dir, onPage: p => { prog.check(); prog.set(i / files.length, t('status.pageonly', { i: p })); } });
      items.push({ name: uniqueName(safeName(baseName(files[i].name)) + '.pdf', used), blob, icon: 'pdf', note: t('res.pages', { n: pages }), before: files[i].size });
    }
    if (items.length) await res.render(items, { zipName: 'documents.zip' });
  }));

  root.append(drop.el,
    h('section', { class: 'card' }, h('h2', {}, node('files.title')), list.el),
    h('section', { class: 'card' }, h('h2', {}, node('opts.title')),
      h('div', { class: 'opts' }, field('o.size', size, 'o-size'), field('txt.font', font, 'o-font'), field('txt.dir', dirSel, 'o-dir')),
      h('div', { style: 'margin-top:14px' }, field('txt.out', outSel, 'o-out'), outNote),
      h('p', { class: 'note', style: 'margin-top:10px' }, node('docx.note'))),
    h('div', { class: 'act' }, go), prog.el, res.el);
}
