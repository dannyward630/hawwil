<div align="center">

<img src="og.jpg" alt="Hawwil | حوّل" width="640">

# Hawwil | حوّل

**Convert and compress any file, free and private, right in your browser.**
**حوّل واضغط أي ملف مجاناً وبخصوصية كاملة، داخل متصفحك.**

[![Live](https://img.shields.io/badge/Live-hawwil-1f6feb?style=for-the-badge&logo=googlechrome&logoColor=white)](https://l7v0l.github.io/hawwil/)
[![License](https://img.shields.io/badge/License-MIT-8957e5?style=for-the-badge)](LICENSE)

**[🚀 Open the site | افتح الموقع](https://l7v0l.github.io/hawwil/)**

</div>

## Tools | الأدوات

| Tool | الأداة |
|:--|:--|
| HEIC to JPG (iPhone photos) | تحويل صور HEIC إلى JPG |
| Word (.docx) to PDF | تحويل وورد إلى PDF |
| Images to PDF | تحويل الصور إلى PDF |
| PDF to Images | تحويل PDF إلى صور |
| Image Converter (JPG / PNG / WebP) | محوّل الصور |
| Text & Documents to PDF (TXT, Markdown, HTML, CSV, JSON) | تحويل النصوص والمستندات إلى PDF |
| Merge PDF | دمج ملفات PDF |
| Split PDF | تقسيم PDF |
| Rotate PDF | تدوير PDF |
| Organize PDF (reorder, rotate, duplicate, delete pages) | ترتيب صفحات PDF |
| Video to Audio (MP3 / WAV) | تحويل فيديو إلى صوت |
| Audio to Video (cover art + visualizer) | تحويل صوت إلى فيديو |
| Compress Files (images, PDF, anything) | ضغط الملفات |
| Compress Images | ضغط الصور |
| Compress PDF | ضغط PDF |
| Create ZIP | إنشاء ZIP |

## Features | المميزات

- **Private:** files are processed in your browser and never uploaded. | **خصوصية:** تتم المعالجة في متصفحك ولا تُرفع الملفات.
- **Free:** no limits, no watermarks, no account. | **مجاني:** بدون حدود أو علامات مائية أو حساب.
- **Arabic and English** interface with full right-to-left support, including Arabic documents in PDF. | واجهة عربية وإنجليزية مع دعم كامل للكتابة من اليمين لليسار.
- Custom logo and icon set, animated 3D background (three.js), smooth page and card animations, and guided option controls instead of dropdowns.
- **Work stays in the browser, smoothly:** image and MP3 work runs in Web Workers, long jobs show progress and have a Cancel button.
- **Chain tools:** after a result, continue straight to another tool (merge, split, compress…) without uploading again.
- **Targets and presets:** compress images to under 1 MB / 500 KB / 200 KB / 100 KB, or crop to an ID photo (3:4) or square.
- **Installed-app extras:** share files from your phone to Hawwil, open PDFs, images and Word files with it, and use the home-screen shortcuts.
- **Hawwil Lite:** a simpler phone layout with large buttons (automatic on small screens, can be switched off in the footer).
- **Privacy proof page:** lists every network request the site makes. Fonts and libraries are self-hosted, so none go to third parties.
- Light and dark mode, responsive on every screen size, honors "reduce motion".
- Installable as an app (PWA) and works offline after the first visit.
- No framework, no bundler. Libraries are bundled in `vendor/`. Static pages and the sitemap are generated with `node scripts/build.mjs` (SEO copy lives in `scripts/seo.mjs`).

## Limits | حدود يجب معرفتها

- Everything runs on your device, so very large files depend on your device's memory.
- Text and documents are converted by rendering them as page images, so the text in those PDFs is not selectable.
- "Strong" PDF compression also turns pages into images. "Light" mode keeps the text but usually saves less.
- Word conversion supports `.docx` only (not the old `.doc`), and complex layouts, headers and footers may look simpler. Excel and PowerPoint are not included yet.
- Audio to Video records while the audio plays, so it takes as long as the audio and the tab must stay open. Very long videos need a lot of memory for Video to Audio.
- Selectable-text PDFs use your browser's print window ("Save as PDF").
- MP3 output uses lamejs; HEIC uses heic2any.

## Credits

[three.js](https://github.com/mrdoob/three.js), [pdf-lib](https://github.com/Hopding/pdf-lib), [PDF.js](https://github.com/mozilla/pdf.js), [JSZip](https://github.com/Stuk/jszip), [marked](https://github.com/markedjs/marked), [html2canvas](https://github.com/niklasvh/html2canvas), [heic2any](https://github.com/alexcorvi/heic2any), [mammoth.js](https://github.com/mwilliamson/mammoth.js), [lamejs](https://github.com/zhuker/lamejs).

## Contributing | المساهمة

Contributions are welcome, from a typo to a new tool. Start with [CONTRIBUTING.md](CONTRIBUTING.md), pick a [`good first issue`](https://github.com/l7v0l/hawwil/labels/good%20first%20issue), or share an idea in [Discussions](https://github.com/l7v0l/hawwil/discussions).
المساهمات مرحّب بها، من تصحيح كلمة إلى أداة جديدة. ابدأ من [CONTRIBUTING.md](CONTRIBUTING.md) أو اختر [`good first issue`](https://github.com/l7v0l/hawwil/labels/good%20first%20issue).

## Support | دعم المشروع

If this helped you, give it a ⭐. Found a bug or have an idea? Open an [Issue](https://github.com/l7v0l/hawwil/issues).

## License

MIT. The bundled libraries keep their own licenses.
