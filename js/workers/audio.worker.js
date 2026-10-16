/* Encodes PCM to MP3 (lamejs) or WAV off the main thread.
   in:  { format: 'mp3'|'wav', channels: Float32Array[], sampleRate, kbps, lame: url }
   out: { progress } ... then { result: ArrayBuffer }                                  */
self.onmessage = e => {
  try {
    const { format, channels, sampleRate, kbps, lame } = e.data;
    const n = channels[0].length, nch = channels.length;
    const toInt16 = (src, from, to) => {
      const out = new Int16Array(to - from);
      for (let i = from; i < to; i++) { const s = Math.max(-1, Math.min(1, src[i])); out[i - from] = s < 0 ? s * 0x8000 : s * 0x7fff; }
      return out;
    };

    if (format === 'wav') {
      const bytes = 44 + n * nch * 2, buf = new ArrayBuffer(bytes), v = new DataView(buf);
      const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
      w(0, 'RIFF'); v.setUint32(4, bytes - 8, true); w(8, 'WAVE'); w(12, 'fmt ');
      v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, nch, true);
      v.setUint32(24, sampleRate, true); v.setUint32(28, sampleRate * nch * 2, true); v.setUint16(32, nch * 2, true); v.setUint16(34, 16, true);
      w(36, 'data'); v.setUint32(40, n * nch * 2, true);
      let o = 44;
      for (let i = 0; i < n; i++) {
        for (let c = 0; c < nch; c++) { const s = Math.max(-1, Math.min(1, channels[c][i])); v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true); o += 2; }
        if ((i & 0x3ffff) === 0) self.postMessage({ progress: i / n });
      }
      self.postMessage({ result: buf }, [buf]);
      return;
    }

    importScripts(lame);
    const enc = new self.lamejs.Mp3Encoder(nch, sampleRate, kbps);
    const parts = [], BLOCK = 1152 * 20;
    for (let i = 0; i < n; i += BLOCK) {
      const end = Math.min(n, i + BLOCK);
      const l = toInt16(channels[0], i, end);
      const out = nch > 1 ? enc.encodeBuffer(l, toInt16(channels[1], i, end)) : enc.encodeBuffer(l);
      if (out.length) parts.push(out);
      if (((i / BLOCK) & 15) === 0) self.postMessage({ progress: i / n });
    }
    const tail = enc.flush();
    if (tail.length) parts.push(tail);
    const size = parts.reduce((s, p) => s + p.length, 0), all = new Uint8Array(size);
    let o = 0;
    parts.forEach(p => { all.set(p, o); o += p.length; });
    self.postMessage({ result: all.buffer }, [all.buffer]);
  } catch (err) { self.postMessage({ error: String(err && err.message || err) }); }
};
