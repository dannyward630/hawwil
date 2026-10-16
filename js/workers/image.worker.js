/* Decodes, resizes and re-encodes an image off the main thread. */
import { processImage } from '../imgcore.js';

const env = {
  canvas: (w, h) => new OffscreenCanvas(w, h),
  toBlob: (c, type, q) => c.convertToBlob({ type, quality: q })
};

self.onmessage = async e => {
  try {
    const { file, opts } = e.data;
    const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const r = await processImage(bmp, bmp.width, bmp.height, { ...opts, origType: file.type }, env);
    bmp.close();
    self.postMessage({ result: r });
  } catch (err) { self.postMessage({ error: String(err && err.message || err) }); }
};
