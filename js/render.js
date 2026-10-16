import { h } from './ui.js';
import * as libs from './libs.js';
import { canvasToBlob } from './img.js';

export const PAGES = { a4: { w: 794, ratio: 1.41421, pt: [595.28, 841.89] }, letter: { w: 816, ratio: 1.29412, pt: [612, 792] } };
export const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export /* strip anything that can run code or load remote content; the input may come from an untrusted file */
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

export async function htmlToPdf(html, { size, fontPx, dir, onPage }) {
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


export const PRINT_CSS = `
  @page{margin:14mm}
  body{margin:0;color:#111;line-height:1.75;font-family:'Cairo','Segoe UI',Tahoma,Arial,sans-serif;overflow-wrap:anywhere}
  .pdfdoc{padding:0}
  *{max-width:100%;box-sizing:border-box}
  .plain{white-space:pre-wrap}
  h1,h2,h3{line-height:1.3;margin:1.1em 0 .5em;break-after:avoid}
  p,ul,ol,blockquote,pre,table{margin:0 0 1em}
  blockquote{border-inline-start:4px solid #bbb;padding-inline-start:1em;color:#444}
  pre,code{font-family:'Fira Code',ui-monospace,monospace;font-size:.88em;background:#f1f3f6;border-radius:4px}
  pre{padding:12px;white-space:pre-wrap;direction:ltr;text-align:left}
  table{border-collapse:collapse;width:100%}th,td{border:1px solid #bbb;padding:6px 10px;text-align:start;vertical-align:top}th{background:#eef1f6}
  tr,img{break-inside:avoid}img{height:auto}a{color:#1a56c4}`;

/* Selectable-text PDF: open the browser's own print engine ("Save as PDF"). Text stays real text and Arabic shapes correctly. */
export function printHtml(html, dir) {
  return new Promise(resolve => {
  const frame = h('iframe', { style: 'position:fixed;inset-inline-start:-9999px;width:800px;height:600px;border:0', 'aria-hidden': 'true', tabindex: '-1' });
  document.body.append(frame);
  const doc = frame.contentDocument;
  doc.open();
  doc.write(`<!doctype html><html dir="${dir}"><head><meta charset="utf-8"><style>@font-face{font-family:'Cairo';font-weight:200 1000;src:url(${new URL('../vendor/fonts/cairo-arabic.woff2', import.meta.url).href}) format('woff2');unicode-range:U+0600-06FF,U+0750-077F,U+FB50-FDFF,U+FE70-FEFC}@font-face{font-family:'Cairo';font-weight:200 1000;src:url(${new URL('../vendor/fonts/cairo-latin.woff2', import.meta.url).href}) format('woff2');unicode-range:U+0000-00FF}${PRINT_CSS}</style></head><body><div class="pdfdoc">${html}</div></body></html>`);
  doc.close();
  const go = () => {
    const w = frame.contentWindow;
    (w.document.fonts ? w.document.fonts.ready : Promise.resolve()).catch(() => {}).then(() => {
      w.focus();
      w.addEventListener('afterprint', () => setTimeout(() => { frame.remove(); resolve(); }, 500), { once: true });
      w.print();
      setTimeout(() => { if (frame.isConnected) { frame.remove(); resolve(); } }, 120000);
    });
  };
  setTimeout(go, 350);
  });
}

export const isArabicText = s => { const m = s.match(/[؀-ۿ]/g); return !!m && m.length / Math.max(1, s.replace(/\s/g, '').length) > 0.25; };
