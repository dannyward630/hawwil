import { h, $, node, t, field, select, createDropzone, createFileList, createProgress, createResults, runTask, baseName, safeName, UserError } from '../ui.js';
import * as libs from '../libs.js';
import { decodeImage, drawToCanvas, canvasToBlob, hasAlpha, fitSize, IMAGE_ACCEPT } from '../img.js';

const SIZES = { a4: [595.28, 841.89], letter: [612, 792] };
const MARGINS = { none: 0, small: 18, medium: 36 };
const QUALITY = { high: 0.92, medium: 0.8, low: 0.6 };

export default function mount(root) {
  const list = createFileList({ onChange: f => { go.disabled = !f.length; } });
  const drop = createDropzone({ accept: IMAGE_ACCEPT, icon: 'images-pdf', hint: 'i2p.hint', onFiles: f => list.add(f) });
  const size = select('o-size', [['a4', 'o.a4', 'page-a4'], ['letter', 'o.letter', 'page-letter'], ['fit', 'o.fit', 'page-fit']], 'a4');
  const orient = select('o-orient', [['auto', 'o.auto', 'auto'], ['portrait', 'o.portrait', 'portrait'], ['landscape', 'o.landscape', 'landscape']], 'auto');
  const margin = select('o-margin', [['none', 'o.m.none', 'margin-0'], ['small', 'o.m.small', 'margin-s'], ['medium', 'o.m.medium', 'margin-m']], 'small');
  const quality = select('o-q', [['high', 'o.q.high', 'q-high'], ['medium', 'o.q.medium', 'q-mid'], ['low', 'o.q.low', 'q-low']], 'high');
  const fOrient = field('o.orient', orient, 'o-orient');
  size.addEventListener('change', () => { fOrient.hidden = size.value === 'fit'; });
  const go = h('button', { type: 'button', class: 'btn', disabled: true }, node('i2p.go'));
  const prog = createProgress(), res = createResults();

  go.addEventListener('click', () => runTask(go, prog, async () => {
    res.clear();
    const files = list.files();
    if (!files.length) return;
    const { PDFDocument } = await libs.pdfLib();
    const doc = await PDFDocument.create();
    for (let i = 0; i < files.length; i++) {
      prog.set(i / files.length, t('status.processing', { i: i + 1, n: files.length }));
      const dec = await decodeImage(files[i]);
      const [w, hh] = fitSize(dec.width, dec.height, 6000);
      let canvas = drawToCanvas(dec, w, hh);
      dec.close();
      let img;
      if (hasAlpha(canvas)) img = await doc.embedPng(await (await canvasToBlob(canvas, 'image/png')).arrayBuffer());
      else {
        canvas = drawToCanvas({ source: canvas }, w, hh, '#fff');
        img = await doc.embedJpg(await (await canvasToBlob(canvas, 'image/jpeg', QUALITY[quality.value])).arrayBuffer());
      }
      const m = MARGINS[margin.value];
      let pw, ph;
      if (size.value === 'fit') { pw = w * 0.75 + 2 * m; ph = hh * 0.75 + 2 * m; }
      else {
        [pw, ph] = SIZES[size.value];
        const land = orient.value === 'landscape' || (orient.value === 'auto' && w > hh);
        if (land) [pw, ph] = [ph, pw];
      }
      const page = doc.addPage([pw, ph]);
      const k = Math.min((pw - 2 * m) / w, (ph - 2 * m) / hh);
      const dw = w * k, dh = hh * k;
      page.drawImage(img, { x: (pw - dw) / 2, y: (ph - dh) / 2, width: dw, height: dh });
      await new Promise(r => setTimeout(r));
    }
    prog.set(1, t('status.saving'));
    const bytes = await doc.save();
    const name = safeName((files.length === 1 ? baseName(files[0].name) : 'images') + '.pdf');
    await res.render([{ name, blob: new Blob([bytes], { type: 'application/pdf' }), icon: 'pdf', note: t('res.pages', { n: files.length }) }]);
  }));

  root.append(drop.el,
    h('section', { class: 'card' }, h('h2', {}, node('files.title')), list.el),
    h('section', { class: 'card' }, h('h2', {}, node('opts.title')),
      h('div', { class: 'opts' }, field('o.size', size, 'o-size'), fOrient, field('o.margin', margin, 'o-margin'), field('o.quality', quality, 'o-q'))),
    h('div', { class: 'act' }, go), prog.el, res.el);
}
