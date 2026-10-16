/* Run a worker script from js/workers/ and resolve with its result.
   Worker replies: { progress: 0..1 } | { result } | { error }. */
import { CancelError } from './ui.js';

export function callWorker(name, data, { transfer = [], onProgress, prog, module = false } = {}) {
  return new Promise((resolve, reject) => {
    let w, off;
    try { w = new Worker(new URL('./workers/' + name, import.meta.url), module ? { type: 'module' } : undefined); }
    catch (e) { reject(e); return; }
    const end = () => { if (off) off(); w.terminate(); };
    if (prog && prog.onCancel) off = prog.onCancel(() => { w.terminate(); reject(new CancelError()); });
    w.onmessage = ev => {
      const m = ev.data || {};
      if (m.progress != null) { if (onProgress) onProgress(m.progress); return; }
      end();
      if (m.error) reject(new Error(m.error)); else resolve(m.result);
    };
    w.onerror = ev => { end(); reject(new Error(ev.message || 'worker')); };
    w.postMessage(data, transfer);
  });
}
