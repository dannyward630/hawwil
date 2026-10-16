# Contributing to Hawwil | المساهمة في حوّل

Thanks for helping. Hawwil is a no-build, no-framework site, so you can start in minutes.
شكراً لمساهمتك. حوّل موقع بدون build وبدون framework، فتقدر تبدأ خلال دقائق.

## Run it | التشغيل

```bash
git clone https://github.com/l7v0l/hawwil.git
cd hawwil
python -m http.server 5176
```

Open http://localhost:5176. No install step.

## Project layout | هيكل المشروع

| Path | What it is |
|:--|:--|
| `js/registry.js` | The list of tools (id, icon, category). Add a tool here first. |
| `js/tools/<id>.js` | One module per tool. Copy `merge-pdf.js` as a starting point. |
| `js/lang/en.js`, `js/lang/ar.js` | All text. Every key must exist in both files. |
| `scripts/seo.mjs` | Page titles, descriptions and FAQ for each tool. |
| `scripts/build.mjs` | Generates the HTML pages and `sitemap.xml`. Run `node scripts/build.mjs` after changes. |
| `vendor/` | Self-hosted libraries. Do not load libraries from a CDN. |

## Adding a tool | إضافة أداة

1. Add it to `js/registry.js`.
2. Create `js/tools/<id>.js` and export `default function mount(root)`.
3. Add `<id>.title`, `<id>.desc` and your other keys to **both** language files.
4. Add the SEO entry in `scripts/seo.mjs`, then run `node scripts/build.mjs`.

## Rules | قواعد

- **Files never leave the device.** No uploads, no analytics, no third-party requests.
- Everything must work in Arabic (right-to-left) and English.
- Keep it accessible: labels, keyboard use, `prefers-reduced-motion`.
- Small, focused pull requests. One change per PR.

## Good first contributions | بداية مناسبة

Look for the [`good first issue`](https://github.com/l7v0l/hawwil/labels/good%20first%20issue) label. A new language file is also a great first PR: copy `js/lang/en.js`, translate it, and register it in `js/i18n.js`.

Questions or ideas? Use [Discussions](https://github.com/l7v0l/hawwil/discussions).
