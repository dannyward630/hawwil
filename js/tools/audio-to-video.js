import { h, node, t, field, select, createDropzone, createFileList, createProgress, createResults, runTask, baseName, safeName, uniqueName, UserError } from '../ui.js';
import { icon } from '../icons.js';

const ACCEPT = ['audio/*', '.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.opus', '.webm'];
const SIZES = { '16:9': [1280, 720], '9:16': [720, 1280], '1:1': [720, 720] };
const MIMES = [
  ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'mp4'], ['video/mp4', 'mp4'],
  ['video/webm;codecs=vp9,opus', 'webm'], ['video/webm;codecs=vp8,opus', 'webm'], ['video/webm', 'webm']
];
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* isTypeSupported() can say yes for codecs the machine cannot actually encode (e.g. H.264 on some builds): test with a tiny recording */
async function probeFormats() {
  if (typeof MediaRecorder === 'undefined') return [];
  const ok = [];
  for (const [mime, ext] of MIMES) {
    if (!MediaRecorder.isTypeSupported(mime)) continue;
    try {
      const c = document.createElement('canvas');
      c.width = c.height = 64;
      c.getContext('2d').fillRect(0, 0, 64, 64);
      const rec = new MediaRecorder(c.captureStream(10), { mimeType: mime });
      let got = 0, bad = false;
      rec.ondataavailable = e => { got += e.data.size; };
      rec.onerror = () => { bad = true; };
      rec.start();
      await sleep(350);
      if (rec.state !== 'inactive') rec.stop();
      await sleep(120);
      if (!bad && got > 0) ok.push([mime, ext]);
    } catch (e) { /* not usable */ }
  }
  return ok;
}
const fmtTime = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

async function loadCover(file) {
  if (!file) return null;
  try { return await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch (e) { return null; }
}

/* Draws one frame: gradient, cover art, title, and a frequency visualizer. */
function paint(ctx, W, H, { cover, title, bars, analyser, data, t0, rtl }) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#0b0f1a'); g.addColorStop(0.55, '#1b2a55'); g.addColorStop(1, '#4b2a8a');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const s = Math.min(W, H);
  let top = H * 0.12;
  if (cover) {
    const box = s * 0.5, k = Math.min(box / cover.width, box / cover.height), cw = cover.width * k, ch = cover.height * k;
    const cx = (W - cw) / 2, cy = H * 0.1;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 12;
    ctx.beginPath(); ctx.roundRect(cx, cy, cw, ch, s * 0.03); ctx.clip();
    ctx.drawImage(cover, cx, cy, cw, ch);
    ctx.restore();
    top = cy + ch + s * 0.07;
  } else {
    ctx.fillStyle = 'rgba(255,255,255,.08)';
    ctx.beginPath(); ctx.arc(W / 2, H * 0.34, s * 0.17, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#58a6ff'; ctx.font = `${s * 0.16}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('♪', W / 2, H * 0.345);
    top = H * 0.34 + s * 0.17 + s * 0.08;
  }
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.direction = rtl ? 'rtl' : 'ltr';
  ctx.font = `700 ${s * 0.06}px Cairo, system-ui, sans-serif`;
  let txt = title;
  while (ctx.measureText(txt).width > W * 0.86 && txt.length > 4) txt = txt.slice(0, -2);
  if (txt !== title) txt += '…';
  ctx.fillText(txt, W / 2, top);
  if (bars && analyser) {
    analyser.getByteFrequencyData(data);
    const n = 48, bw = W * 0.8 / n, base = H * 0.93, maxH = H * 0.2;
    for (let i = 0; i < n; i++) {
      const v = data[Math.floor(i * data.length * 0.7 / n)] / 255;
      const bh = Math.max(4, v * maxH);
      const hue = 205 + i * 2;
      ctx.fillStyle = `hsl(${hue} 90% 65%)`;
      ctx.beginPath(); ctx.roundRect(W * 0.1 + i * bw + bw * 0.15, base - bh, bw * 0.7, bh, bw * 0.3); ctx.fill();
    }
  }
}

export default async function mount(root) {
  const formats = await probeFormats();
  const list = createFileList({ thumbs: false, reorder: false, onChange: f => { go.disabled = !f.length || !formats.length; } });
  const drop = createDropzone({ accept: ACCEPT, icon: 'video', hint: 'a2v.hint', onFiles: f => list.add(f) });
  const aspect = select('o-aspect', [['16:9', 'a2v.a169', 'landscape'], ['9:16', 'a2v.a916', 'portrait'], ['1:1', 'a2v.a11', 'page-fit']], '16:9');
  const viz = select('o-viz', [['on', 'a2v.viz.on', 'sparkles'], ['off', 'a2v.viz.off', 'minimize']], 'on');
  const fmtOpts = [...new Set(formats.map(x => x[1]))].map(e => [e, e === 'mp4' ? 'a2v.mp4' : 'a2v.webm', 'video']);
  const fmt = fmtOpts.length ? select('o-vfmt', fmtOpts, fmtOpts[0][0]) : null;
  const title = h('input', { type: 'text', id: 'o-title', 'data-i18n-ph': 'a2v.title.ph', placeholder: t('a2v.title.ph'), maxlength: '80' });
  let coverFile = null;
  const coverName = h('small', { class: 'dz-hint' });
  const coverInput = h('input', { type: 'file', accept: 'image/*', hidden: true });
  const coverBtn = h('button', { type: 'button', class: 'btn ghost sm', onclick: () => coverInput.click() }, icon('image', 16), node('a2v.cover'));
  coverInput.addEventListener('change', () => { coverFile = coverInput.files[0] || null; coverName.textContent = coverFile ? coverFile.name : ''; });
  const go = h('button', { type: 'button', class: 'btn', disabled: true }, node('a2v.go'));
  const prog = createProgress(), res = createResults();
  const unsupported = h('p', { class: 'warn', hidden: !!formats.length }, node('a2v.unsupported'));

  async function render(file, label, cover, idx, total, pick) {
    const [W, H] = SIZES[aspect.value], rtl = /[؀-ۿ]/.test(label);
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    const url = URL.createObjectURL(file);
    const audio = new Audio(); audio.src = url; audio.preload = 'auto';
    const AC = window.AudioContext || window.webkitAudioContext, ac = new AC();
    let timer, rec;
    const cleanup = () => { clearInterval(timer); try { ac.close(); } catch (e) { /* ignore */ } URL.revokeObjectURL(url); audio.pause(); };
    try {
      await new Promise((ok, no) => { audio.onloadedmetadata = ok; audio.onerror = () => no(new UserError('err.media', { name: file.name })); });
      const src = ac.createMediaElementSource(audio), analyser = ac.createAnalyser(); analyser.fftSize = 512;
      const dest = ac.createMediaStreamDestination();
      src.connect(analyser); analyser.connect(dest);                 // not connected to speakers: recording is silent
      const data = new Uint8Array(analyser.frequencyBinCount);
      const stream = canvas.captureStream(30);
      dest.stream.getAudioTracks().forEach(tr => stream.addTrack(tr));
      rec = new MediaRecorder(stream, { mimeType: pick[0], videoBitsPerSecond: 2_500_000, audioBitsPerSecond: 192_000 });
      const chunks = [];
      let failed = false;
      rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      rec.onerror = () => { failed = true; try { rec.stop(); } catch (e) { /* ignore */ } };
      const stopped = new Promise(r => { rec.onstop = r; });
      const t0 = performance.now();
      const draw = () => paint(ctx, W, H, { cover, title: label, bars: viz.value === 'on', analyser, data, t0, rtl });
      draw();
      prog.onCancel(() => { cleanup(); try { rec.stop(); } catch (e) { /* ignore */ } });
      await ac.resume();
      rec.start(1000);
      timer = setInterval(() => {
        draw();
        const d = audio.duration && isFinite(audio.duration) ? audio.duration : 0;
        prog.set((idx + (d ? audio.currentTime / d : 0)) / total, `${t('a2v.recording')} ${fmtTime(audio.currentTime)}${d ? ' / ' + fmtTime(d) : ''}`);
      }, 1000 / 30);
      audio.onended = () => setTimeout(() => { try { rec.stop(); } catch (e) { /* ignore */ } }, 300);
      await audio.play();
      await stopped;
      prog.check();
      if (failed || !chunks.length) throw new UserError('err.recorder');
      return { blob: new Blob(chunks, { type: pick[0].split(';')[0] }), ext: pick[1], duration: audio.duration };
    } finally { cleanup(); }
  }

  go.addEventListener('click', () => runTask(go, prog, async () => {
    res.clear();
    const files = list.files(), items = [], used = new Set();
    const cover = await loadCover(coverFile);
    try {
      for (let i = 0; i < files.length; i++) {
        prog.check();
        const label = (files.length === 1 && title.value.trim()) || baseName(files[i].name);
        const first = formats.find(x => x[1] === (fmt ? fmt.value : 'webm')) || formats[0];
        const order = [first, ...formats.filter(x => x !== first)];
        let r = null;
        for (let k = 0; k < order.length && !r; k++) {
          try { r = await render(files[i], label, cover, i, files.length, order[k]); }
          catch (e) { if (!(e && e.userKey === 'err.recorder') || k === order.length - 1) throw e; }
        }
        items.push({ name: uniqueName(safeName(baseName(files[i].name)) + '.' + r.ext, used), blob: r.blob, icon: 'video', note: (isFinite(r.duration) ? fmtTime(r.duration) + ' · ' : '') + r.ext.toUpperCase(), before: files[i].size });
      }
    } finally { if (cover) cover.close(); }
    await res.render(items, { zipName: 'videos.zip' });
  }));

  root.append(drop.el, unsupported,
    h('section', { class: 'card' }, h('h2', {}, node('files.title')), list.el),
    h('section', { class: 'card' }, h('h2', {}, node('opts.title')),
      h('div', { class: 'opts' }, field('a2v.aspect', aspect, 'o-aspect'), field('a2v.viz', viz, 'o-viz'), fmt ? field('a2v.format', fmt, 'o-vfmt') : null,
        field('a2v.title', title, 'o-title')),
      h('div', { class: 'act', style: 'margin-top:14px' }, coverBtn, coverName, coverInput),
      h('p', { class: 'note', style: 'margin-top:10px' }, node('a2v.note'))),
    h('div', { class: 'act' }, go), prog.el, res.el);
}
