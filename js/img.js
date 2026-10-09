/* Image helpers: decode (with EXIF orientation), draw, encode. */

export async function decodeImage(file) {
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
    return { source: bmp, width: bmp.width, height: bmp.height, close: () => bmp.close() };
  } catch (e) { /* fall back to <img> (SVG, some formats) */ }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    const w = img.naturalWidth || 1024, h = img.naturalHeight || 1024;
    return { source: img, width: w, height: h, close: () => URL.revokeObjectURL(url) };
  } catch (e) {
    URL.revokeObjectURL(url);
    const err = new Error('decode');
    err.userKey = 'err.decode';
    throw err;
  }
}

export function fitSize(w, h, maxDim) {
  if (!maxDim || (w <= maxDim && h <= maxDim)) return [w, h];
  const k = maxDim / Math.max(w, h);
  return [Math.max(1, Math.round(w * k)), Math.max(1, Math.round(h * k))];
}

/* draw decoded image on a canvas; bg = css colour to fill first (for JPEG) */
export function drawToCanvas(dec, w, h, bg = null) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  if (bg) { ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h); }
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(dec.source, 0, 0, w, h);
  return c;
}

export const canvasToBlob = (canvas, type = 'image/png', q) =>
  new Promise((res, rej) => canvas.toBlob(b => (b ? res(b) : rej(new Error('encode'))), type, q));

/* any pixel with alpha < 255 ? (sampled on a small copy) */
export function hasAlpha(canvas) {
  const k = Math.min(1, 200 / Math.max(canvas.width, canvas.height));
  const w = Math.max(1, Math.round(canvas.width * k)), h = Math.max(1, Math.round(canvas.height * k));
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(canvas, 0, 0, w, h);
  const d = ctx.getImageData(0, 0, w, h).data;
  for (let i = 3; i < d.length; i += 4) if (d[i] < 250) return true;
  return false;
}

export const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
export const IMAGE_ACCEPT = ['image/*', '.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.avif', '.svg', '.ico'];

/* is this blob really the type we asked for? (browsers fall back to PNG) */
export const sameType = (blob, type) => blob.type === type;
