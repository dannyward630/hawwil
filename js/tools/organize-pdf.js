import { h, node, t, num, createDropzone, createProgress, createResults, runTask, baseName, safeName, UserError } from '../ui.js';
import { icon } from '../icons.js';
import * as libs from '../libs.js';

const THUMB_W = 170;

export default function mount(root) {
  let file = null, bytes = null, pdf = null, items = [], uid = 0, gen = 0, dragFrom = -1;
  const thumbs = new Map();                       // original page number -> canvas (rendered once)
  const grid = h('div', { class: 'pgrid' });
  const info = h('p', { class: 'note' });
  const go = h('button', { type: 'button', class: 'btn', disabled: true }, node('org.go'));
  const prog = createProgress(), res = createResults();
  const drop = createDropzone({ accept: ['application/pdf', '.pdf'], multiple: false, icon: 'organize', hint: 'org.hint', onFiles: f => load(f[0]) });

  const tool = (ic, aria, fn, cls) => h('button', { type: 'button', title: t(aria), 'aria-label': t(aria), 'data-i18n-aria': aria, 'data-i18n-title': aria, onclick: e => { e.stopPropagation(); fn(); } }, icon(ic, 16, cls));
  const kept = () => items.filter(x => !x.del);

  function updateInfo() {
    info.textContent = t('org.count', { n: num(kept().length), total: num(items.length) });
    go.disabled = !kept().length;
  }

  function paintThumb(canvas, n) {
    const src = thumbs.get(n);
    if (!src) return;
    canvas.width = src.width; canvas.height = src.height;
    canvas.getContext('2d').drawImage(src, 0, 0);
  }

  function draw() {
    grid.replaceChildren(...items.map((it, i) => {
      const cv = h('canvas', { class: 'pc' });
      paintThumb(cv, it.n);
      it.cv = cv;
      const frame = h('div', { class: 'pf' }, cv);
      frame.style.setProperty('--r', it.rot + 'deg');
      const card = h('div', { class: 'pcard' + (it.del ? ' del' : ''), draggable: 'true', 'data-i': i },
        frame,
        h('div', { class: 'pn' }, '#' + it.n),
        h('div', { class: 'pt' },
          tool('arrow-left', 'org.left', () => move(i, -1), 'mv-prev'),
          tool('arrow-left', 'org.right', () => move(i, 1), 'mv-next'),
          tool('rot-cw', 'org.rotate', () => { it.rot = (it.rot + 90) % 360; draw(); }),
          tool('copies', 'org.dup', () => { items.splice(i + 1, 0, { id: ++uid, n: it.n, rot: it.rot, del: false }); draw(); updateInfo(); }),
          tool(it.del ? 'check' : 'x', it.del ? 'org.restore' : 'org.delete', () => { it.del = !it.del; draw(); updateInfo(); })));
      card.addEventListener('dragstart', e => { dragFrom = i; card.classList.add('drag'); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', String(i)); } catch (err) { /* ignore */ } });
      card.addEventListener('dragend', () => { dragFrom = -1; card.classList.remove('drag'); grid.querySelectorAll('.over').forEach(x => x.classList.remove('over')); });
      card.addEventListener('dragover', e => { if (dragFrom < 0) return; e.preventDefault(); card.classList.add('over'); });
      card.addEventListener('dragleave', () => card.classList.remove('over'));
      card.addEventListener('drop', e => {
        e.preventDefault();
        if (dragFrom < 0 || dragFrom === i) return;
        const [m] = items.splice(dragFrom, 1);
        items.splice(i, 0, m);
        dragFrom = -1;
        draw();
      });
      return card;
    }));
  }

  function move(i, d) {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    [items[i], items[j]] = [items[j], items[i]];
    draw();
  }

  async function load(f) {
    const my = ++gen;
    file = f; items = []; thumbs.clear(); grid.replaceChildren(); res.clear();
    if (pdf) { try { pdf.destroy(); } catch (e) { /* ignore */ } pdf = null; }
    document.getElementById('tool-root')?.classList.add('has-files');
    info.textContent = t('org.loading');
    try {
      bytes = await f.arrayBuffer();
      const pdfjs = await libs.pdfjs();
      pdf = await pdfjs.getDocument({ data: bytes.slice(0) }).promise;
    } catch (e) {
      console.error(e);
      info.textContent = t(/password/i.test(e?.name || '') ? 'err.password' : 'err.pdfread', { name: f.name });
      document.getElementById('tool-root')?.classList.remove('has-files');
      return;
    }
    items = Array.from({ length: pdf.numPages }, (_, k) => ({ id: ++uid, n: k + 1, rot: 0, del: false }));
    draw(); updateInfo();
    /* render thumbnails in the background, page by page */
    for (let n = 1; n <= pdf.numPages; n++) {
      if (my !== gen) return;
      try {
        const page = await pdf.getPage(n);
        const base = page.getViewport({ scale: 1 }), vp = page.getViewport({ scale: THUMB_W * (window.devicePixelRatio > 1 ? 1.5 : 1) / base.width });
        const c = document.createElement('canvas');
        c.width = Math.ceil(vp.width); c.height = Math.ceil(vp.height);
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
        await page.render({ canvasContext: ctx, viewport: vp }).promise;
        page.cleanup();
        thumbs.set(n, c);
        items.forEach(it => { if (it.n === n && it.cv) paintThumb(it.cv, n); });
      } catch (e) { /* page without preview: leave blank */ }
      if (n % 4 === 0) await new Promise(r => setTimeout(r));
    }
  }

  const bar = h('div', { class: 'act org-bar' },
    h('button', { type: 'button', class: 'btn ghost sm', onclick: () => { items.reverse(); draw(); } }, icon('arrow-down', 16), node('org.reverse')),
    h('button', { type: 'button', class: 'btn ghost sm', onclick: () => { items.forEach(x => { x.rot = 0; x.del = false; }); items.sort((a, b) => a.id - b.id); draw(); updateInfo(); } }, icon('rotate', 16), node('org.reset')),
    h('button', { type: 'button', class: 'btn ghost sm', onclick: () => { items.forEach(x => { x.rot = (x.rot + 90) % 360; }); draw(); } }, icon('rot-cw', 16), node('org.rotall')));

  go.addEventListener('click', () => runTask(go, prog, async () => {
    res.clear();
    const list = kept();
    if (!list.length) throw new UserError('err.range');
    const { PDFDocument, degrees } = await libs.pdfLib();
    prog.set(0.2, t('status.processing', { i: 1, n: 1 }));
    const src = await PDFDocument.load(bytes.slice(0));
    const out = await PDFDocument.create();
    const copied = await out.copyPages(src, list.map(x => x.n - 1));
    copied.forEach((p, i) => {
      if (list[i].rot) p.setRotation(degrees((p.getRotation().angle + list[i].rot) % 360));
      out.addPage(p);
    });
    prog.set(0.9, t('status.saving'));
    const blob = new Blob([await out.save()], { type: 'application/pdf' });
    await res.render([{ name: safeName(baseName(file.name)) + '-organized.pdf', blob, icon: 'pdf', note: t('res.pages', { n: list.length }), before: file.size }]);
  }));

  root.append(drop.el,
    h('section', { class: 'card' }, h('h2', {}, node('org.pages')), info, h('p', { class: 'note' }, node('org.tip')), bar, grid),
    h('div', { class: 'act' }, go), prog.el, res.el);
}
