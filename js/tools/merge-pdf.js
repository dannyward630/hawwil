import { h, node, t, createDropzone, createFileList, createProgress, createResults, runTask, UserError } from '../ui.js';
import * as libs from '../libs.js';

export default function mount(root) {
  const list = createFileList({ thumbs: false, onChange: f => { go.disabled = f.length < 2; hint.hidden = f.length !== 1; } });
  const drop = createDropzone({ accept: ['application/pdf', '.pdf'], icon: 'merge', hint: 'merge.hint', onFiles: f => list.add(f) });
  const go = h('button', { type: 'button', class: 'btn', disabled: true }, node('merge.go'));
  const hint = h('p', { class: 'note', hidden: true }, node('merge.need2'));
  const prog = createProgress(), res = createResults();

  go.addEventListener('click', () => runTask(go, prog, async () => {
    res.clear();
    const files = list.files();
    const { PDFDocument } = await libs.pdfLib();
    const out = await PDFDocument.create();
    let total = 0;
    for (let i = 0; i < files.length; i++) {
      prog.set(i / files.length, t('status.processing', { i: i + 1, n: files.length }));
      let src;
      try { src = await PDFDocument.load(await files[i].arrayBuffer()); }
      catch (e) { throw new UserError('err.pdfread', { name: files[i].name }); }
      const pages = await out.copyPages(src, src.getPageIndices());
      pages.forEach(p => out.addPage(p));
      total += pages.length;
      await new Promise(r => setTimeout(r));
    }
    prog.set(1, t('status.saving'));
    const bytes = await out.save();
    await res.render([{ name: 'merged.pdf', blob: new Blob([bytes], { type: 'application/pdf' }), icon: 'pdf', note: t('res.pages', { n: total }) }]);
  }));

  root.append(drop.el,
    h('section', { class: 'card' }, h('h2', {}, node('merge.order')), list.el, hint),
    h('div', { class: 'act' }, go), prog.el, res.el);
}
