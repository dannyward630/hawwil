/* Generates every static HTML page (tools, home, privacy, share) plus sitemap.xml.
   Usage: node scripts/build.mjs   (no dependencies) */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { TOOLS } from '../js/registry.js';
import en from '../js/lang/en.js';
import ar from '../js/lang/ar.js';
import { SEO, COMMON_FAQ } from './seo.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://l7v0l.github.io/hawwil/';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const bi = (a, e) => `<span lang="ar">${esc(a)}</span><span lang="en">${esc(e)}</span>`;

const THEME_BOOT = `<script>try{var d=document.documentElement,t=localStorage.getItem('hw-theme')||(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');d.dataset.theme=t;var l=localStorage.getItem('hw-lang')||((navigator.language||'').toLowerCase().indexOf('ar')===0?'ar':'en');d.lang=l;d.dir=l==='ar'?'rtl':'ltr'}catch(e){}</script>`;

function shell({ file, title, desc, kw, body, script, main, after = '', jsonld = [] }) {
  const url = SITE + (file === 'index.html' ? '' : file);
  return `<!doctype html>
<html lang="ar" dir="rtl" data-theme="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">${kw ? `\n  <meta name="keywords" content="${esc(kw)}">` : ''}
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${SITE}og.jpg">
  <meta property="og:locale" content="ar_AR">
  <meta property="og:locale:alternate" content="en_US">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${SITE}og.jpg">
  <meta name="theme-color" content="#0b0f1a" id="tc">
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
  <link rel="manifest" href="manifest.webmanifest">
  <meta name="color-scheme" content="dark light">
  <link rel="preload" href="vendor/fonts/cairo-arabic.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="fonts.css">
  ${THEME_BOOT}
  <link rel="stylesheet" href="style.css">${jsonld.map(j => `\n  <script type="application/ld+json">${JSON.stringify(j)}</script>`).join('')}
</head>
<body${body ? ' ' + body : ''}>
  <canvas id="bg3d" aria-hidden="true"></canvas>
  <div class="glow g1"></div><div class="glow g2"></div>
  <header class="top" id="top"></header>
  <main id="app">${main}</main>${after}
  <footer class="foot" id="foot"></footer>
  <script type="module" src="js/${script}"></script>
</body>
</html>
`;
}

const noscript = '<noscript><p>JavaScript is required. | يلزم تفعيل جافاسكربت.</p></noscript>';
const out = (file, html) => writeFileSync(join(ROOT, file), html, 'utf8');

function faqBlock(items) {
  return `
  <section class="faq" aria-labelledby="faq-h">
    <h2 id="faq-h">${bi('أسئلة شائعة', 'Frequently asked questions')}</h2>
${items.map(f => `    <details><summary>${bi(f.qa, f.qe)}</summary><p>${bi(f.aa, f.ae)}</p></details>`).join('\n')}
  </section>`;
}

const faqLd = items => ({
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: items.flatMap(f => [
    { '@type': 'Question', name: f.qa, inLanguage: 'ar', acceptedAnswer: { '@type': 'Answer', text: f.aa } },
    { '@type': 'Question', name: f.qe, inLanguage: 'en', acceptedAnswer: { '@type': 'Answer', text: f.ae } }
  ])
});

/* ---------- tool pages ---------- */
for (const tool of TOOLS) {
  const s = SEO[tool.id];
  if (!s) throw new Error('missing SEO for ' + tool.id);
  const file = tool.id + '.html';
  const enTitle = en[tool.id + '.title'];
  const title = `${s.ar} | ${enTitle} | Hawwil`;
  const desc = `${s.de} ${s.da}`;
  const faq = [...s.faq, ...COMMON_FAQ];
  out(file, shell({
    file, title, desc, kw: s.kw, body: `data-tool="${tool.id}"`, script: 'page.js',
    main: `<div class="wrap"><h1>${esc(ar[tool.id + '.title'])}</h1><p class="lead">${esc(s.da)}</p>${noscript}</div>`,
    after: faqBlock(faq),
    jsonld: [
      {
        '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: `${enTitle} | ${ar[tool.id + '.title']}`, url: SITE + file,
        applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any', description: s.de, inLanguage: ['ar', 'en'],
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, isAccessibleForFree: true
      },
      {
        '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Hawwil | حوّل', item: SITE },
          { '@type': 'ListItem', position: 2, name: enTitle, item: SITE + file }
        ]
      },
      faqLd(faq)
    ]
  }));
}

/* ---------- home ---------- */
out('index.html', shell({
  file: 'index.html',
  title: 'حوّل | تحويل وضغط الملفات أونلاين مجاناً | Hawwil',
  desc: 'Free tools to convert PDF, images, Word, audio and video and to reduce file sizes. No upload, no sign-up. أدوات مجانية لتحويل PDF والصور والوورد والصوت والفيديو وضغط الملفات. بدون رفع ملفات وبدون تسجيل.',
  kw: 'تحويل الملفات, ضغط الملفات, دمج PDF, تحويل HEIC, وورد الى PDF, فيديو الى MP3, convert files online, compress PDF',
  script: 'home.js',
  main: `<div class="wrap"><h1>حوّل واضغط أي ملف</h1><p class="lead">أدوات مجانية لتحويل PDF والصور والوورد والصوت والفيديو وتقليل أحجام الملفات. بدون رفع ملفات وبدون تسجيل.</p>${noscript}</div>`,
  after: faqBlock(COMMON_FAQ),
  jsonld: [
    { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Hawwil | حوّل', url: SITE, inLanguage: ['ar', 'en'] },
    {
      '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: TOOLS.map((t, i) => ({
        '@type': 'ListItem', position: i + 1, name: en[t.id + '.title'], url: SITE + t.id + '.html'
      }))
    },
    faqLd(COMMON_FAQ)
  ]
}));

/* ---------- privacy ---------- */
const priv = [
  ['لا رفع للملفات', 'Nothing is uploaded', 'كل التحويلات والضغط تتم داخل متصفحك بمكتبات تعمل على جهازك. لا يوجد خادم يستقبل ملفاتك أصلاً.', 'Every conversion and compression runs inside your browser with libraries on your device. There is no server that receives your files.'],
  ['بدون حسابات ولا تتبّع', 'No accounts, no tracking', 'لا نستخدم ملفات تعريف ارتباط للتتبع ولا أدوات إحصاء ولا إعلانات. الخطوط والمكتبات كلها مستضافة مع الموقع نفسه.', 'No tracking cookies, no analytics, no ads. Fonts and libraries are all hosted with the site itself.'],
  ['ما الذي يُحفظ على جهازك؟', 'What is stored on your device?', 'اللغة والمظهر والوضع الخفيف فقط في تخزين المتصفح. وعند «تابع مع أداة أخرى» تُنقل ملفاتك مؤقتاً داخل جهازك وتُحذف فور فتح الأداة التالية.', 'Only your language, theme and Lite-mode choice in browser storage. When you continue to another tool, files are passed locally on your device and removed as soon as the next tool opens.'],
  ['يعمل بدون إنترنت', 'Works offline', 'بعد أول زيارة يعمل الموقع بدون اتصال. جرّب: افتح أي أداة، افصل الإنترنت، وحوّل ملفك.', 'After the first visit the site works offline. Try it: open any tool, disconnect, and convert your file.']
];
out('privacy.html', shell({
  file: 'privacy.html',
  title: 'إثبات الخصوصية | Privacy proof | Hawwil',
  desc: 'Hawwil never uploads your files. See live proof of the network requests this page makes. حوّل لا يرفع ملفاتك أبداً، وهذه صفحة إثبات حيّ للطلبات التي يرسلها الموقع.',
  body: 'data-page="privacy"', script: 'privacy.js',
  main: `<div class="wrap"><h1>${bi('إثبات الخصوصية', 'Privacy proof')}</h1><p class="lead">${bi('ملفاتك لا تغادر جهازك. إليك كيف تتأكد بنفسك.', 'Your files never leave your device. Here is how to check for yourself.')}</p>
    <div class="stack">
${priv.map(p => `      <section class="card"><h2>${bi(p[0], p[1])}</h2><p>${bi(p[2], p[3])}</p></section>`).join('\n')}
      <section class="card" id="live"><h2>${bi('الطلبات التي أرسلتها هذه الصفحة', 'Requests this page made')}</h2><noscript><p>JavaScript is required.</p></noscript></section>
      <section class="card"><h2>${bi('تحقق بنفسك', 'Verify it yourself')}</h2>
        <ol class="steps">
          <li>${bi('افتح أدوات المطور (F12) ثم تبويب Network.', 'Open developer tools (F12) and the Network tab.')}</li>
          <li>${bi('حوّل أي ملف. لن ترى أي طلب يحمل بيانات ملفك.', 'Convert any file. You will see no request carrying your file data.')}</li>
          <li>${bi('أو فعّل وضع الطيران ثم حوّل: سيعمل كل شيء.', 'Or turn on airplane mode and convert: everything still works.')}</li>
        </ol></section>
    </div></div>`,
  jsonld: []
}));

/* ---------- share / open-with target ---------- */
out('share.html', shell({
  file: 'share.html',
  title: 'اختر الأداة | Choose a tool | Hawwil',
  desc: 'Choose what to do with the files you shared to Hawwil. اختر ما تريد فعله بالملفات التي شاركتها مع حوّل.',
  script: 'share.js',
  main: `<div class="wrap"><h1>${bi('اختر الأداة', 'Choose a tool')}</h1>${noscript}</div>`
}));

/* ---------- sitemap ---------- */
const day = new Date().toISOString().slice(0, 10);
const urls = ['', ...TOOLS.map(t => t.id + '.html'), 'privacy.html'];
out('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${SITE}${u}</loc><lastmod>${day}</lastmod></url>`).join('\n')}
</urlset>
`);
console.log('built', TOOLS.length + 3, 'pages + sitemap');
