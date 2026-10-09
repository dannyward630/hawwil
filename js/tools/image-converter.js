import { h, node, t, field, select, createDropzone, createFileList, createProgress, createResults, runTask, baseName, safeName, uniqueName, fmtBytes } from '../ui.js';
import { decodeImage, drawToCanvas, canvasToBlob, fitSize, EXT, IMAGE_ACCEPT } from '../img.js';

const TYPES = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' };

export default function mount(root) {
  const list = createFileList({ onChange: f => { go.disabled = !f.length; } });
  const drop = createDropzone({ accept: IMAGE_ACCEPT, icon: 'convert', hint: 'conv.hint', onFiles: f => list.add(f) });
  const fmt = select('o-fmt', [['jpg', 'o.jpg', 'fmt-jpg'], ['png', 'o.png', 'fmt-png'], ['webp', 'o.webp', 'fmt-webp']], 'jpg');
  const q = h('input', { type: 'range', id: 'o-q', min: '10', max: '100', value: '90' });
  const qv = h('span', { class: 'val' }, '90%');
  const fq = h('div', { class: 'fld' }, h('label', { for: 'o-q' }, node('o.quality'), ' ', qv), q);
  q.addEventListener('input', () => { qv.textContent = q.value + '%'; });
  const dim = select('o-dim', [['0', 'o.dim.orig'], ['3840', 'o.dim.3840'], ['1920', 'o.dim.1920'], ['1280', 'o.dim.1280'], ['800', 'o.dim.800']], '0');
  fmt.addEventListener('change', () => { fq.hidden = fmt.value === 'png'; });
  const go = h('button', { type: 'button', class: 'btn', disabled: true }, node('conv.go'));
  const prog = createProgress(), res = createResults();

  go.addEventListener('click', () => runTask(go, prog, async () => {
    res.clear();
    const files = list.files(), items = [], used = new Set();
    const type = TYPES[fmt.value];
    for (let i = 0; i < files.length; i++) {
      prog.set(i / files.length, t('status.processing', { i: i + 1, n: files.length }));
      const dec = await decodeImage(files[i]);
      const [w, hh] = fitSize(dec.width, dec.height, +dim.value);
      const canvas = drawToCanvas(dec, w, hh, type === 'image/jpeg' ? '#fff' : null);
      dec.close();
      const blob = await canvasToBlob(canvas, type, +q.value / 100);
      items.push({ name: uniqueName(safeName(baseName(files[i].name)) + '.' + EXT[type], used), blob, thumb: blob, icon: 'image',
        note: `${w}×${hh}` });
      await new Promise(r => setTimeout(r));
    }
    await res.render(items, { zipName: 'converted-images.zip' });
  }));

  root.append(drop.el,
    h('section', { class: 'card' }, h('h2', {}, node('files.title')), list.el),
    h('section', { class: 'card' }, h('h2', {}, node('opts.title')),
      h('div', { class: 'opts' }, field('o.to', fmt, 'o-fmt'), fq, field('o.maxdim', dim, 'o-dim'))),
    h('div', { class: 'act' }, go), prog.el, res.el);
}
