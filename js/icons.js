/* Icon set: 24x24, 1.8 stroke, rounded. Paths are inline so there are no extra requests. */
const P = {
  upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
  download: '<path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  'arrow-up': '<path d="M12 19V5M5 12l7-7 7 7"/>',
  'arrow-down': '<path d="M12 5v14M5 12l7 7 7-7"/>',
  'arrow-left': '<path d="M19 12H5M12 19l-7-7 7-7"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
  'user-x': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m17 8 5 5M22 8l-5 5"/>',
  sparkles: '<path d="m12 3 1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8zM19 15l.7 1.8 1.8.7-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7z"/>',
  zap: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',

  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
  pdf: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="1.6"/><path d="m21 16-5-5L5 21"/>',
  text: '<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',
  archive: '<rect x="3" y="3" width="18" height="5" rx="1.5"/><path d="M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8M10 12h4"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  audio: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  video: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3z"/>',
  table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16"/>',

  /* tools */
  'images-pdf': '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><circle cx="10" cy="12" r="1.3"/><path d="m18 17-3-3-6 6"/>',
  'pdf-images': '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="1.6"/><path d="m21 16-5-5L5 21"/><path d="M15 3v3h6"/>',
  convert: '<path d="m17 2 4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
  'text-pdf': '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M8.5 13h7M8.5 17h5"/>',
  merge: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/><path d="m3 17.5 9 5 9-5" opacity=".45"/>',
  scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12"/>',
  rotate: '<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/>',
  compress: '<path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"/>',
  'compress-image': '<rect x="3" y="3" width="13" height="13" rx="2.5"/><circle cx="8" cy="8" r="1.2"/><path d="m16 12-3.5-3.5L5 16M15 21h6v-6M21 21l-6-6"/>',
  'compress-pdf': '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 11.5l3 3 3-3M9 16.5l3 3 3-3" />',

  /* option glyphs */
  'page-a4': '<rect x="6" y="3" width="12" height="18" rx="1.8"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  'page-letter': '<rect x="5.5" y="4" width="13" height="16" rx="1.8"/><path d="M9 8.5h6M9 12h6M9 15.5h3"/>',
  'page-fit': '<path d="M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4"/><rect x="8" y="8" width="8" height="8" rx="1.5"/>',
  portrait: '<rect x="7" y="3" width="10" height="18" rx="2"/>',
  landscape: '<rect x="3" y="7" width="18" height="10" rx="2"/>',
  auto: '<path d="m12 3 1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.7 1.8 1.8.7-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7z"/>',
  'margin-0': '<rect x="4" y="4" width="16" height="16" rx="1.5"/><rect x="4" y="4" width="16" height="16" rx="1.5" fill="currentColor" opacity=".25" stroke="none"/>',
  'margin-s': '<rect x="4" y="4" width="16" height="16" rx="1.5"/><rect x="7" y="7" width="10" height="10" rx="1" fill="currentColor" opacity=".25" stroke="none"/>',
  'margin-m': '<rect x="4" y="4" width="16" height="16" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" opacity=".25" stroke="none"/>',
  'q-high': '<path d="M5 20v-5M11 20V11M17 20V5M22 20V3" stroke-width="2.4"/>',
  'q-mid': '<path d="M5 20v-5M11 20V11M17 20V5" stroke-width="2.4"/><path d="M22 20V3" opacity=".3" stroke-width="2.4"/>',
  'q-low': '<path d="M5 20v-5M11 20V11" stroke-width="2.4"/><path d="M17 20V5M22 20V3" opacity=".3" stroke-width="2.4"/>',
  'rot-cw': '<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/><text x="12" y="15.5" text-anchor="middle" font-size="8" font-weight="700" fill="currentColor" stroke="none" font-family="monospace">90</text>',
  'rot-180': '<path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M8 16H3v5"/>',
  'rot-ccw': '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 3v6h6"/><text x="12" y="15.5" text-anchor="middle" font-size="8" font-weight="700" fill="currentColor" stroke="none" font-family="monospace">90</text>',
  organize: '<rect x="3" y="3" width="8" height="10" rx="1.5"/><rect x="13" y="3" width="8" height="6" rx="1.5"/><rect x="13" y="11" width="8" height="10" rx="1.5"/><rect x="3" y="15" width="8" height="6" rx="1.5"/>',
  docx: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="m8.5 12.5 1.2 4.5 1.3-3.5 1.3 3.5 1.2-4.5"/>',
  heic: '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m21 16-4.5-4.5L8 20"/>',
  extract: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M12 18v-6M9 14.5l3-3 3 3"/>',
  split: '<path d="M16 3h5v5M8 3H3v5M12 22v-8.3a4 4 0 0 0-1.2-2.9L3 3M15 9l6-6"/>',
  copies: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  'fmt-jpg': '<rect x="3" y="5" width="18" height="14" rx="3"/><text x="12" y="15" text-anchor="middle" font-size="7.5" font-weight="700" fill="currentColor" stroke="none" font-family="monospace">JPG</text>',
  'fmt-png': '<rect x="3" y="5" width="18" height="14" rx="3"/><text x="12" y="15" text-anchor="middle" font-size="7.5" font-weight="700" fill="currentColor" stroke="none" font-family="monospace">PNG</text>',
  'fmt-webp': '<rect x="3" y="5" width="18" height="14" rx="3"/><text x="12" y="15" text-anchor="middle" font-size="6.5" font-weight="700" fill="currentColor" stroke="none" font-family="monospace">WebP</text>',
  rtl: '<path d="M21 6H9a4 4 0 0 0 0 8h1M10 4v14M14 4v14M6 18l-3-3 3-3"/>',
  ltr: '<path d="M3 6h12a4 4 0 0 1 0 8h-1M14 4v14M10 4v14M18 18l3-3-3-3"/>',
  'size-s': '<path d="M7 18 11 6l4 12M8.5 14h5"/>',
  'size-m': '<path d="M6 19 11 5l5 14M7.8 14.5h6.4"/>',
  'size-l': '<path d="M5 20 11 4l6 16M7.2 15h7.6"/>',
  lightning: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  gauge: '<path d="M12 14l4-4"/><path d="M3.3 17a10 10 0 1 1 17.4 0"/>',
  minimize: '<path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3"/>'
};

export function icon(name, size = 22, cls = '') {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 24 24');
  s.setAttribute('width', size); s.setAttribute('height', size);
  s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', '1.8');
  s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round');
  s.setAttribute('aria-hidden', 'true'); s.setAttribute('focusable', 'false');
  if (cls) s.setAttribute('class', cls);
  s.innerHTML = P[name] || P.file;
  return s;
}

/* Brand logo mark: gradient tile, document with folded corner and two compress chevrons */
export function logo(size = 38) {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 64 64'); s.setAttribute('width', size); s.setAttribute('height', size);
  s.setAttribute('aria-hidden', 'true'); s.setAttribute('class', 'logo-mark');
  s.innerHTML = LOGO_INNER;
  return s;
}
export const LOGO_INNER = '<defs><linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#58a6ff"/><stop offset="1" stop-color="#8957e5"/></linearGradient></defs>'
  + '<rect width="64" height="64" rx="17" fill="url(#lg1)"/>'
  + '<path d="M21 13h15l9 9v27a3 3 0 0 1-3 3H21a3 3 0 0 1-3-3V16a3 3 0 0 1 3-3z" fill="#fff"/>'
  + '<path d="M36 13v7a2 2 0 0 0 2 2h7z" fill="#58a6ff" opacity=".45"/>'
  + '<path d="m25.5 30 6.5 6 6.5-6M25.5 38.5l6.5 6 6.5-6" fill="none" stroke="#6b5be6" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>';
