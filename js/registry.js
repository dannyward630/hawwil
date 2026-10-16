export const CATS = [['convert', 'cat.convert'], ['pdf', 'cat.pdf'], ['media', 'cat.media'], ['compress', 'cat.compress']];

/* id = page file name (id.html) = i18n key prefix; mod = module in js/tools (defaults to id); icon = name in icons.js */
export const TOOLS = [
  { id: 'images-to-pdf', icon: 'images-pdf', cat: 'convert' },
  { id: 'pdf-to-images', icon: 'pdf-images', cat: 'convert' },
  { id: 'image-converter', icon: 'convert', cat: 'convert' },
  { id: 'text-to-pdf', icon: 'text-pdf', cat: 'convert' },
  { id: 'docx-to-pdf', icon: 'docx', cat: 'convert' },
  { id: 'heic-to-jpg', icon: 'heic', cat: 'convert', mod: 'image-converter', opts: { heic: true } },
  { id: 'merge-pdf', icon: 'merge', cat: 'pdf' },
  { id: 'split-pdf', icon: 'scissors', cat: 'pdf' },
  { id: 'rotate-pdf', icon: 'rotate', cat: 'pdf' },
  { id: 'organize-pdf', icon: 'organize', cat: 'pdf' },
  { id: 'video-to-audio', icon: 'audio', cat: 'media' },
  { id: 'audio-to-video', icon: 'video', cat: 'media' },
  { id: 'compress', icon: 'compress', cat: 'compress', mod: 'compress', opts: { kinds: ['image', 'pdf', 'other'] } },
  { id: 'compress-image', icon: 'compress-image', cat: 'compress', mod: 'compress', opts: { kinds: ['image'] } },
  { id: 'compress-pdf', icon: 'compress-pdf', cat: 'compress', mod: 'compress', opts: { kinds: ['pdf'] } },
  { id: 'zip-files', icon: 'archive', cat: 'compress', mod: 'compress', opts: { kinds: ['other'] } }
];
