import { h, node, t, field, select, createDropzone, createFileList, createProgress, createResults, runTask, baseName, safeName, parsePages } from '../ui.js';
import * as libs from '../libs.js';

export default function mount(root) {
  const list = createFileList({ reorder: false, thumbs: false, onChange: f => { go.disabled = !f.length; } });
  const drop = createDropzone({ accept: ['application/pdf', '.pdf'], multiple: false, icon: 'rotate', hint: 'rot.hint', onFiles: f => list.set(f) });
  const angle = select('o-angle', [['90', 'rot.90', 'rot-cw'], ['180', 'rot.180', 'rot-180'], ['270', 'rot.270', 'rot-ccw']], '90');
  const pages = h('input', { type: 'text', id: 'o-pages', 'data-i18n-ph': 'o.pages.ph', placeholder: t('o.pages.ph'), dir: 'ltr', inputmode: 'numeric' });
  const go = h('button', { type: 'button', class: 'btn', disabled: true }, node('rot.go'));
  const prog = createProgress(), res = createResults();

  go.addEventListener('click', () => runTask(go, prog, async () => {
    res.clear();
    const file = list.files()[0];
    if (!file) return;
    const { PDFDocument, degrees } = await libs.pdfLib();
    const doc = await PDFDocument.load(await file.arrayBuffer());
    const nums = parsePages(pages.value, doc.getPageCount());
    nums.forEach(n => {
      const p = doc.getPage(n - 1);
      p.setRotation(degrees((p.getRotation().angle + +angle.value) % 360));
    });
    const bytes = await doc.save();
    await res.render([{ name: safeName(baseName(file.name)) + '-rotated.pdf', blob: new Blob([bytes], { type: 'application/pdf' }), icon: 'pdf', note: t('res.pages', { n: nums.length }) }]);
  }));

  root.append(drop.el,
    h('section', { class: 'card' }, h('h2', {}, node('files.title')), list.el),
    h('section', { class: 'card' }, h('h2', {}, node('opts.title')),
      h('div', { class: 'opts' }, field('rot.angle', angle, 'o-angle'), field('o.pages', pages, 'o-pages'))),
    h('div', { class: 'act' }, go), prog.el, res.el);
}
