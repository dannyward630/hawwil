/* Lazy loader for the self-hosted libraries in /vendor (loaded only when a tool needs them). */
const cache = new Map();
const base = new URL('../vendor/', import.meta.url).href;

function load(file, global) {
  if (window[global]) return Promise.resolve(window[global]);
  if (!cache.has(file)) {
    cache.set(file, new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = base + file;
      s.onload = () => (window[global] ? resolve(window[global]) : reject(new Error('lib:' + global)));
      s.onerror = () => { cache.delete(file); reject(new Error('lib:' + file)); };
      document.head.append(s);
    }));
  }
  return cache.get(file);
}

export const pdfLib = () => load('pdf-lib.min.js', 'PDFLib');
export const jszip = () => load('jszip.min.js', 'JSZip');
export const marked = () => load('marked.min.js', 'marked');
export const html2canvas = () => load('html2canvas.min.js', 'html2canvas');
export async function pdfjs() {
  const lib = await load('pdf.min.js', 'pdfjsLib');
  lib.GlobalWorkerOptions.workerSrc = base + 'pdf.worker.min.js';
  return lib;
}
