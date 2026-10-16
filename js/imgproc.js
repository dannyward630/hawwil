/* Run the image pipeline in a worker when possible, on the main thread otherwise. */
import { processImage } from './imgcore.js';
import { decodeImage, canvasToBlob, isHeic, heicToJpeg } from './img.js';
import { callWorker } from './work.js';

const mainEnv = {
  canvas: (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; },
  toBlob: (c, type, q) => canvasToBlob(c, type, q)
};
const workerOk = typeof OffscreenCanvas !== 'undefined' && typeof Worker !== 'undefined';

/* file: File|Blob; opts: see imgcore; prog: optional progress (for Cancel) */
export async function convertImage(file, opts, prog) {
  const prepared = await toDecodable(file);
  if (workerOk && prepared.type !== 'image/svg+xml') {
    try { return await callWorker('image.worker.js', { file: prepared, opts }, { module: true, prog }); }
    catch (e) { if (e && e.cancelled) throw e; /* fall through to the main thread */ }
  }
  const dec = await decodeImage(prepared);
  try { return await processImage(dec.source, dec.width, dec.height, { ...opts, origType: prepared.type }, mainEnv); }
  finally { dec.close(); }
}

/* HEIC/HEIF cannot be decoded by browsers: turn them into JPEG first */
export async function toDecodable(file) {
  return isHeic(file) ? heicToJpeg(file) : file;
}
