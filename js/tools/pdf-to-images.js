import { h, node, t, field, select, createDropzone, createFileList, createProgress, createResults, runTask, baseName, safeName, parsePages, UserError } from '../ui.js';
import * as libs from '../libs.js';
import { canvasToBlob, EXT } from '../img.js';

const TYPES = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' };
const MAX_PIXELS = 20e6;

export default function mount(root) {
  const list = createFileList({ reorder: false, thumbs: false, onChange: f => { go.disabled = !f.length; } });
  const drop = createDropzone({ accept: ['application/pdf', '.pdf'], multiple: false, icon: 'pdf-images', hint: 'p2i.hint', onFiles: f => list.set(f) });
  const fmt = select('o-fmt', [['png', 'o.png', 'fmt-png'], ['jpg', 'o.jpg', 'fmt-jpg'], ['webp', 'o.webp', 'fmt-webp']], 'png');
  const dpi = select('o-dpi', [['72', 'o.dpi.72', 'q-low'], ['150', 'o.dpi.150', 'q-mid'], ['300', 'o.dpi.300', 'q-high']], '150');
  const pages = h('input', { type: 'text', id: 'o-pages', 'data-i18n-ph': 'o.pages.ph', placeholder: t('o.pages.ph'), inputmode: 'numeric', dir: 'ltr' });
  const go = h('button', { type: 'button', class: 'btn', disabled: true }, node('p2i.go'));
  const prog = createProgress(), res = createResults();

  go.addEventListener('click', () => runTask(go, prog, async () => {
    res.clear();
    const file = list.files()[0];
    if (!file) return;
    const pdfjs = await libs.pdfjs();
    const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
    const nums = parsePages(pages.value, pdf.numPages);
    const type = TYPES[fmt.value], ext = EXT[type] || fmt.value;
    const items = [];
    const pad = String(pdf.numPages).length;
    for (let i = 0; i < nums.length; i++) {
      prog.set(i / nums.length, t('status.page', { i: i + 1, n: nums.length }));
      const page = await pdf.getPage(nums[i]);
      let scale = +dpi.value / 72;
      const base = page.getViewport({ scale: 1 });
      scale = Math.min(scale, Math.sqrt(MAX_PIXELS / (base.width * base.height)));
      const vp = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(vp.width); canvas.height = Math.ceil(vp.height);
      const ctx = canvas.getContext('2d');
      if (type !== 'image/png') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
      await page.render({ canvasContext: ctx, viewport: vp }).promise;
      const blob = await canvasToBlob(canvas, type, 0.92);
      items.push({ name: safeName(`${baseName(file.name)}-${String(nums[i]).padStart(pad, '0')}.${ext}`), blob, thumb: blob, icon: 'image', note: `${canvas.width}×${canvas.height}` });
      page.cleanup();
    }
    await pdf.destroy();
    await res.render(items, { zipName: safeName(baseName(file.name)) + '-images.zip' });
  }));

  root.append(drop.el,
    h('section', { class: 'card' }, h('h2', {}, node('files.title')), list.el),
    h('section', { class: 'card' }, h('h2', {}, node('opts.title')),
      h('div', { class: 'opts' }, field('o.format', fmt, 'o-fmt'), field('o.dpi', dpi, 'o-dpi'), field('o.pages', pages, 'o-pages'))),
    h('div', { class: 'act' }, go), prog.el, res.el);
}
