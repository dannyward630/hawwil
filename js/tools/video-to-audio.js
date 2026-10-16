import { h, node, t, field, select, createDropzone, createFileList, createProgress, createResults, runTask, baseName, safeName, uniqueName, UserError } from '../ui.js';
import * as libs from '../libs.js';
import { callWorker } from '../work.js';

const ACCEPT = ['video/*', 'audio/*', '.mp4', '.mov', '.mkv', '.avi', '.webm', '.m4v', '.3gp', '.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.opus'];
const MAX_BYTES = 1.5 * 1024 * 1024 * 1024;

const fmtTime = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/* Decode the audio track of any video/audio file the browser understands to PCM at 44.1 kHz. */
async function decode(file) {
  const ctx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(2, 1, 44100);
  const buf = await ctx.decodeAudioData(await file.arrayBuffer());
  return { channels: Array.from({ length: Math.min(2, buf.numberOfChannels) }, (_, i) => buf.getChannelData(i).slice()), sampleRate: buf.sampleRate, duration: buf.duration };
}

/* Fallback when decodeAudioData cannot read the container: play the file and record its audio (real time, WebM/Opus). */
function recordAudio(file, prog, onTime) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const media = document.createElement('video');
    media.src = url; media.muted = false; media.playsInline = true; media.preload = 'auto';
    const cleanup = () => { URL.revokeObjectURL(url); media.removeAttribute('src'); media.load(); };
    media.onerror = () => { cleanup(); reject(new Error('media')); };
    media.onloadedmetadata = () => {
      let stream;
      try { stream = media.captureStream ? media.captureStream() : media.mozCaptureStream(); } catch (e) { cleanup(); reject(new Error('media')); return; }
      const tracks = stream.getAudioTracks();
      if (!tracks.length) { cleanup(); reject(new Error('media')); return; }
      const rec = new MediaRecorder(new MediaStream(tracks), MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? { mimeType: 'audio/webm;codecs=opus' } : undefined);
      const chunks = [];
      rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      rec.onstop = () => { clearInterval(tick); cleanup(); resolve({ blob: new Blob(chunks, { type: 'audio/webm' }), duration: media.duration }); };
      const tick = setInterval(() => { if (media.duration) onTime(media.currentTime / media.duration); }, 400);
      prog.onCancel(() => { clearInterval(tick); try { rec.stop(); } catch (e) { /* ignore */ } cleanup(); reject(Object.assign(new Error('cancelled'), { cancelled: true })); });
      media.onended = () => rec.stop();
      rec.start(1000);
      media.play().catch(e => { clearInterval(tick); cleanup(); reject(e); });
    };
  });
}

export default function mount(root) {
  const list = createFileList({ thumbs: false, reorder: false, onChange: f => { go.disabled = !f.length; } });
  const drop = createDropzone({ accept: ACCEPT, icon: 'audio', hint: 'v2a.hint', onFiles: f => list.add(f) });
  const fmt = select('o-fmt', [['mp3', 'v2a.mp3', 'audio'], ['wav', 'v2a.wav', 'audio']], 'mp3');
  const kbps = select('o-kbps', [['128', 'v2a.k128', 'q-low'], ['192', 'v2a.k192', 'q-mid'], ['320', 'v2a.k320', 'q-high']], '192');
  const mono = select('o-ch', [['auto', 'v2a.stereo', 'auto'], ['mono', 'v2a.mono', 'size-s']], 'auto');
  const fK = field('v2a.bitrate', kbps, 'o-kbps');
  fmt.addEventListener('change', () => { fK.hidden = fmt.value !== 'mp3'; });
  const go = h('button', { type: 'button', class: 'btn', disabled: true }, node('v2a.go'));
  const prog = createProgress(), res = createResults();

  go.addEventListener('click', () => runTask(go, prog, async () => {
    res.clear();
    const files = list.files(), items = [], used = new Set();
    for (let i = 0; i < files.length; i++) {
      prog.check();
      const f = files[i], name = safeName(baseName(f.name));
      const step = txt => prog.set(i / files.length, t('status.processing', { i: i + 1, n: files.length }) + (txt ? ' · ' + txt : ''));
      step(t('v2a.reading'));
      if (f.size > MAX_BYTES) throw new UserError('err.toobig');
      let pcm;
      try { pcm = await decode(f); }
      catch (e) {
        /* container the decoder does not know: record it in real time instead */
        step(t('v2a.realtime'));
        let rec;
        try { rec = await recordAudio(f, prog, p => prog.set((i + p) / files.length, t('v2a.realtime') + ' ' + Math.round(p * 100) + '%')); }
        catch (e2) { if (e2 && e2.cancelled) throw e2; throw new UserError('err.media', { name: f.name }); }
        items.push({ name: uniqueName(name + '.webm', used), blob: rec.blob, icon: 'audio', note: fmtTime(rec.duration) + ' · WebM' });
        continue;
      }
      let channels = pcm.channels;
      if (mono.value === 'mono' && channels.length > 1) {
        const m = new Float32Array(channels[0].length);
        for (let k = 0; k < m.length; k++) m[k] = (channels[0][k] + channels[1][k]) / 2;
        channels = [m];
      }
      const out = await callWorker('audio.worker.js', { format: fmt.value, channels, sampleRate: pcm.sampleRate, kbps: +kbps.value, lame: libs.vendorUrl('lame.min.js') },
        { transfer: channels.map(c => c.buffer), prog, onProgress: p => step(t('v2a.encoding') + ' ' + Math.round(p * 100) + '%') });
      const blob = new Blob([out], { type: fmt.value === 'mp3' ? 'audio/mpeg' : 'audio/wav' });
      items.push({ name: uniqueName(name + '.' + fmt.value, used), blob, icon: 'audio', note: fmtTime(pcm.duration) + (fmt.value === 'mp3' ? ` · ${kbps.value} kbps` : ' · WAV'), before: f.size });
      await new Promise(r => setTimeout(r));
    }
    await res.render(items, { zipName: 'audio.zip' });
  }));

  root.append(drop.el,
    h('section', { class: 'card' }, h('h2', {}, node('files.title')), list.el),
    h('section', { class: 'card' }, h('h2', {}, node('opts.title')),
      h('div', { class: 'opts' }, field('v2a.format', fmt, 'o-fmt'), fK, field('v2a.channels', mono, 'o-ch')),
      h('p', { class: 'note', style: 'margin-top:10px' }, node('v2a.note'))),
    h('div', { class: 'act' }, go), prog.el, res.el);
}
