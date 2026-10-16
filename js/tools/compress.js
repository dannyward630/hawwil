import { icon } from '../icons.js';
import { h, node, t, num, field, select, seg, createDropzone, createFileList, createProgress, createResults, runTask, baseName, extOf, safeName, uniqueName, fmtBytes, downloadBlob } from '../ui.js';
import * as libs from '../libs.js';
import { canvasToBlob, EXT } from '../img.js';
import { convertImage } from '../imgproc.js';

const IMG_EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'avif', 'svg', 'ico', 'heic', 'heif'];
let onlyZip = false;
const kindOf = f => onlyZip ? 'other' : (f.type === 'application/pdf' || extOf(f.name) === 'pdf') ? 'pdf'
  : (f.type.startsWith('image/') || IMG_EXT.includes(extOf(f.name))) ? 'image' : 'other';
const PDF_PRESETS = { high: [1.5, 0.8], medium: [1.25, 0.65], low: [1, 0.5] };
const pct = (a, b) => Math.max(0, Math.round((1 - b / a) * 100));

/* kinds: which file kinds this page accepts, e.g. ['image','pdf','other'] */
export default function mount(root, { kinds = ['image', 'pdf', 'other'] } = {}) {
  onlyZip = kinds.length === 1 && kinds[0] === 'other';
  const accept = kinds.length === 1 && kinds[0] === 'image' ? ['image/*', ...IMG_EXT.map(e => '.' + e)]
    : kinds.length === 1 && kinds[0] === 'pdf' ? ['application/pdf', '.pdf'] : [];
  let present = new Set();
  const list = createFileList({ onChange: files => {
    present = new Set(files.map(kindOf));
    go.disabled = !files.length;
    sections.image.hidden = !present.has('image');
    sections.pdf.hidden = !present.has('pdf');
    sections.other.hidden = !present.has('other');
  } });
  const drop = createDropzone({ accept, icon: kinds.length === 3 ? 'compress' : kinds[0] === 'image' ? 'compress-image' : kinds[0] === 'pdf' ? 'compress-pdf' : 'archive', hint: kinds.length === 3 ? 'cmp.hint.any' : kinds[0] === 'image' ? 'cmp.hint.img' : kinds[0] === 'pdf' ? 'cmp.hint.pdf' : 'cmp.hint.any',
    onFiles: f => list.add(f) });

  /* image options */
  const q = h('input', { type: 'range', id: 'o-q', min: '10', max: '100', value: '75' });
  const qv = h('span', { class: 'val' }, '75%');
  q.addEventListener('input', () => { qv.textContent = q.value + '%'; });
  const dim = select('o-dim', [['0', 'o.dim.orig', 'image'], ['3840', 'o.dim.3840'], ['2560', 'o.dim.2560'], ['1920', 'o.dim.1920'], ['1280', 'o.dim.1280'], ['800', 'o.dim.800']], '0');
  const ofmt = select('o-ofmt', [['auto', 'o.auto', 'auto'], ['jpg', 'o.jpg', 'fmt-jpg'], ['webp', 'o.webp', 'fmt-webp']], 'auto');
  const preset = select('o-preset', [['custom', 'pre.custom', 'gauge'], ['t1000', 'pre.1mb', 'minimize'], ['t500', 'pre.500kb', 'minimize'], ['t200', 'pre.200kb', 'minimize'],
    ['t100', 'pre.100kb', 'minimize'], ['id', 'pre.id', 'portrait'], ['square', 'pre.square', 'image']], 'custom');
  const fQ = h('div', { class: 'fld' }, h('label', { for: 'o-q' }, node('o.quality'), ' ', qv), q), fDim = field('o.maxdim', dim, 'o-dim'), fFmt = field('o.outfmt', ofmt, 'o-ofmt');
  const presetNote = h('p', { class: 'note', hidden: true }, node('pre.note'));
  preset.addEventListener('change', () => { const c = preset.value === 'custom'; fQ.hidden = fDim.hidden = fFmt.hidden = !c; presetNote.hidden = c; });
  const imgSec = h('section', { class: 'card', hidden: true }, h('h2', {}, icon('image', 20), node('cmp.img')),
    field('pre.title', preset, 'o-preset'), presetNote, h('div', { class: 'opts', style: 'margin-top:12px' }, fQ, fDim, fFmt));
  /* pdf options */
  const pmode = seg('o-pmode', [['light', 'cmp.pdf.light', 'text', 'cmp.pdf.light.d'], ['strong', 'cmp.pdf.strong', 'image', 'cmp.pdf.strong.d']], 'light', { cards: true });
  const plevel = select('o-plevel', [['high', 'cmp.lvl.high', 'q-high'], ['medium', 'cmp.lvl.medium', 'q-mid'], ['low', 'cmp.lvl.low', 'q-low']], 'medium');
  const fLevel = field('cmp.pdf.level', plevel, 'o-plevel');
  const warn = h('p', { class: 'warn' }, node('cmp.pdf.warn'));
  fLevel.hidden = true; warn.hidden = true;
  pmode.addEventListener('change', () => { const s = pmode.value === 'strong'; fLevel.hidden = !s; warn.hidden = !s; });
  const pdfSec = h('section', { class: 'card', hidden: true }, h('h2', {}, icon('pdf', 20), node('cmp.pdf')), field('cmp.pdf.mode', pmode, 'o-pmode'), h('div', { class: 'opts', style: 'margin-top:12px' }, fLevel), warn);
  /* other files */
  const zlevel = select('o-zlevel', [['6', 'cmp.z.normal', 'gauge'], ['9', 'cmp.z.max', 'minimize'], ['1', 'cmp.z.fast', 'lightning']], '6');
  const otherSec = h('section', { class: 'card', hidden: true }, h('h2', {}, icon('archive', 20), node('cmp.other')),
    h('p', { class: 'note' }, node('cmp.other.note')), h('div', { class: 'opts', style: 'margin-top:12px' }, field('cmp.z.level', zlevel, 'o-zlevel')));
  const sections = { image: imgSec, pdf: pdfSec, other: otherSec };

  const go = h('button', { type: 'button', class: 'btn', disabled: true }, node('cmp.go'));
  const prog = createProgress(), res = createResults();

  const PRESETS = {
    t1000: { target: 1000 * 1024, maxDim: 3000 }, t500: { target: 500 * 1024, maxDim: 2400 }, t200: { target: 200 * 1024, maxDim: 1600 }, t100: { target: 100 * 1024, maxDim: 1200 },
    id: { target: 300 * 1024, maxDim: 800, crop: '3:4' }, square: { target: 150 * 1024, maxDim: 512, crop: '1:1' }
  };
  async function compressImage(file) {
    const p = PRESETS[preset.value];
    const type = p ? 'auto' : ofmt.value === 'jpg' ? 'image/jpeg' : ofmt.value === 'webp' ? 'image/webp' : 'auto';
    const r = await convertImage(file, p ? { type, quality: 0.9, bg: '#fff', ...p } : { type, quality: +q.value / 100, maxDim: +dim.value, bg: '#fff' }, prog);
    return { blob: r.blob, ext: EXT[r.blob.type] || 'jpg', w: r.w, h: r.h };
  }

  async function compressPdf(file, mode, onPage) {
    const bytes = await file.arrayBuffer();
    if (mode === 'light') {
      const { PDFDocument } = await libs.pdfLib();
      const doc = await PDFDocument.load(bytes);
      doc.setProducer('Hawwil'); doc.setCreator('Hawwil');
      return new Blob([await doc.save({ useObjectStreams: true })], { type: 'application/pdf' });
    }
    const [scale, quality] = PDF_PRESETS[plevel.value];
    const pdfjs = await libs.pdfjs(), { PDFDocument } = await libs.pdfLib();
    const src = await pdfjs.getDocument({ data: bytes.slice(0) }).promise;
    const out = await PDFDocument.create();
    for (let p = 1; p <= src.numPages; p++) {
      prog.check();
      onPage(p, src.numPages);
      const page = await src.getPage(p);
      const base = page.getViewport({ scale: 1 }), vp = page.getViewport({ scale: scale * 1.333 });
      const c = document.createElement('canvas');
      c.width = Math.ceil(vp.width); c.height = Math.ceil(vp.height);
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
      await page.render({ canvasContext: ctx, viewport: vp }).promise;
      const jpg = await out.embedJpg(await (await canvasToBlob(c, 'image/jpeg', quality)).arrayBuffer());
      out.addPage([base.width, base.height]).drawImage(jpg, { x: 0, y: 0, width: base.width, height: base.height });
      page.cleanup();
      await new Promise(r => setTimeout(r));
    }
    await src.destroy();
    return new Blob([await out.save()], { type: 'application/pdf' });
  }

  go.addEventListener('click', () => runTask(go, prog, async () => {
    res.clear();
    const files = list.files();
    const items = [], used = new Set();
    let before = 0, after = 0, step = 0;
    const others = files.filter(f => kindOf(f) === 'other');
    const total = files.length - others.length + (others.length ? 1 : 0);
    const tick = text => prog.set(step / total, text);

    for (const f of files) {
      prog.check();
      const kind = kindOf(f);
      if (kind === 'other') continue;
      tick(t('status.processing', { i: step + 1, n: total }));
      let blob, name, thumb = null;
      if (kind === 'image') {
        const r = await compressImage(f);
        blob = r.blob; name = safeName(baseName(f.name)) + '.' + r.ext; thumb = blob;
      } else {
        blob = await compressPdf(f, pmode.value, (p, n) => tick(t('status.page', { i: p, n })));
        name = safeName(baseName(f.name)) + '-compressed.pdf';
      }
      let note, good = false, finalBlob = blob;
      if (blob.size >= f.size * 0.99) { finalBlob = f; name = safeName(f.name); note = t('cmp.already'); }
      else { note = t('cmp.saved', { p: pct(f.size, blob.size), from: fmtBytes(f.size) }); good = true; }
      before += f.size; after += finalBlob.size;
      items.push({ name: uniqueName(name, used), blob: finalBlob, thumb: kind === 'image' ? finalBlob : null, icon: kind === 'pdf' ? 'pdf' : 'image', note, good, before: f.size });
      step++;
      await new Promise(r => setTimeout(r));
    }
    if (others.length) {
      tick(t('status.zip'));
      const JSZip = await libs.jszip(), zip = new JSZip(), zu = new Set();
      others.forEach(f => zip.file(uniqueName(safeName(f.name), zu), f));
      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: +zlevel.value } });
      const orig = others.reduce((s, f) => s + f.size, 0);
      before += orig; after += Math.min(blob.size, orig);
      items.push({ name: uniqueName('files.zip', used), blob, icon: 'archive',
        note: blob.size < orig ? t('cmp.saved', { p: pct(orig, blob.size), from: fmtBytes(orig) }) : t('cmp.zip.same'), good: blob.size < orig });
    }
    const summary = [h('span', {}, t('cmp.sum.before', { s: fmtBytes(before) })), h('span', {}, t('cmp.sum.after', { s: fmtBytes(after) })),
      h('span', {}, t('cmp.sum.saved', { p: pct(before, after) }))];
    await res.render(items, { zipName: 'compressed.zip', summary });
  }));

  root.append(drop.el,
    h('section', { class: 'card' }, h('h2', {}, node('files.title')), list.el),
    imgSec, pdfSec, otherSec,
    h('div', { class: 'act' }, go), prog.el, res.el);
}
