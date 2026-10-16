/* Hands files from one page to the next (tool chaining, PWA share target, file handlers) through IndexedDB. */
const DB = 'hw-handoff', STORE = 'files', MAX_AGE = 10 * 60 * 1000;

const open = () => new Promise((res, rej) => {
  const r = indexedDB.open(DB, 1);
  r.onupgradeneeded = () => r.result.createObjectStore(STORE, { autoIncrement: true });
  r.onsuccess = () => res(r.result);
  r.onerror = () => rej(r.error);
});
const done = tx => new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = tx.onabort = () => rej(tx.error); });

export async function put(files) {
  const db = await open();
  const tx = db.transaction(STORE, 'readwrite');
  const st = tx.objectStore(STORE);
  st.clear();
  const at = Date.now();
  for (const f of files) st.add({ name: f.name, type: f.type, blob: f, at });
  await done(tx);
  db.close();
}

/* read and clear; returns File[] (empty when nothing is waiting or it is stale) */
export async function take() {
  try {
    const db = await open();
    const tx = db.transaction(STORE, 'readwrite');
    const st = tx.objectStore(STORE);
    const all = await new Promise((res, rej) => { const r = st.getAll(); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
    st.clear();
    await done(tx);
    db.close();
    return all.filter(x => Date.now() - x.at < MAX_AGE).map(x => new File([x.blob], x.name, { type: x.type }));
  } catch (e) { return []; }
}

export async function peek() {
  try {
    const db = await open();
    const all = await new Promise((res, rej) => { const r = db.transaction(STORE).objectStore(STORE).getAll(); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
    db.close();
    return all.filter(x => Date.now() - x.at < MAX_AGE).map(x => new File([x.blob], x.name, { type: x.type }));
  } catch (e) { return []; }
}

/* which tools can take these files? (ids from registry) */
export function kindOf(file) {
  const e = (/\.([^.]+)$/.exec(file.name) || [])[1]?.toLowerCase() || '', ty = file.type || '';
  if (ty === 'application/pdf' || e === 'pdf') return 'pdf';
  if (ty.startsWith('image/') || /^(jpe?g|png|webp|gif|bmp|avif|svg|ico|heic|heif)$/.test(e)) return 'image';
  if (ty.startsWith('video/') || /^(mp4|mov|mkv|avi|webm|m4v|3gp)$/.test(e)) return 'video';
  if (ty.startsWith('audio/') || /^(mp3|wav|ogg|m4a|aac|flac|opus)$/.test(e)) return 'audio';
  if (e === 'docx') return 'docx';
  if (/^(txt|md|markdown|html?|csv|tsv|json)$/.test(e)) return 'text';
  return 'other';
}
export const TOOLS_FOR = {
  pdf: ['merge-pdf', 'split-pdf', 'rotate-pdf', 'organize-pdf', 'compress-pdf', 'pdf-to-images'],
  image: ['images-to-pdf', 'compress-image', 'image-converter', 'heic-to-jpg'],
  video: ['video-to-audio'],
  audio: ['video-to-audio', 'audio-to-video'],
  docx: ['docx-to-pdf'],
  text: ['text-to-pdf'],
  other: ['compress', 'zip-files']
};
