/* SEO copy for every tool page: Arabic-first titles, descriptions, keywords and FAQ (shown on the page and in schema.org JSON-LD).
   Run `node scripts/build.mjs` after editing. */

export const COMMON_FAQ = [
  {
    qa: 'هل الأداة مجانية؟', aa: 'نعم، مجانية بالكامل، بدون حدود على عدد الملفات، وبدون علامة مائية، وبدون تسجيل حساب.',
    qe: 'Is it free?', ae: 'Yes. It is completely free: no limits on the number of files, no watermark and no account.'
  },
  {
    qa: 'هل ملفاتي آمنة؟ هل تُرفع إلى خادم؟', aa: 'لا تُرفع ملفاتك أبداً. تتم المعالجة كلها داخل متصفحك على جهازك، ويعمل الموقع حتى بدون إنترنت بعد أول زيارة. يمكنك التحقق من ذلك في صفحة إثبات الخصوصية.',
    qe: 'Are my files safe? Are they uploaded?', ae: 'Your files are never uploaded. Everything is processed inside your browser, on your device, and the site works offline after the first visit. You can verify this on the privacy proof page.'
  }
];

export const SEO = {
  'images-to-pdf': {
    ar: 'تحويل الصور إلى PDF أونلاين مجاناً',
    da: 'حوّل صور JPG وPNG وWebP وغيرها إلى ملف PDF واحد. رتّب الصفحات واختر الحجم والهوامش. بدون رفع ملفات وبدون تسجيل.',
    de: 'Convert JPG, PNG, WebP and other images into one PDF. Reorder pages, choose page size and margins. No upload, no sign-up.',
    kw: 'تحويل الصور الى PDF, صور إلى PDF, JPG to PDF, PNG to PDF, images to PDF',
    faq: [{ qa: 'كم صورة أستطيع تحويلها في ملف واحد؟', aa: 'لا يوجد حد ثابت، والحد الفعلي هو ذاكرة جهازك. أضف صورك ثم رتّبها بالأسهم قبل الإنشاء.', qe: 'How many images can I convert at once?', ae: 'There is no fixed limit; your device memory is the limit. Add your images and reorder them before creating the PDF.' }]
  },
  'pdf-to-images': {
    ar: 'تحويل PDF إلى صور PNG وJPG أونلاين',
    da: 'حوّل كل صفحة من ملف PDF إلى صورة PNG أو JPG أو WebP بدقة تختارها. مجاني وبدون رفع الملف.',
    de: 'Convert every page of a PDF to PNG, JPG or WebP at the resolution you choose. Free, and the file never leaves your device.',
    kw: 'تحويل PDF الى صور, PDF إلى JPG, PDF to PNG, PDF to image',
    faq: [{ qa: 'ما الدقة المناسبة؟', aa: 'دقة 150 مناسبة للشاشة والمشاركة، و300 للطباعة، و72 للملفات الصغيرة.', qe: 'Which resolution should I choose?', ae: '150 DPI suits screens and sharing, 300 DPI is for printing, and 72 DPI gives small files.' }]
  },
  'image-converter': {
    ar: 'محوّل الصور JPG PNG WebP أونلاين',
    da: 'حوّل الصور بين JPG وPNG وWebP مع تغيير الحجم والجودة. معالجة على جهازك بدون رفع.',
    de: 'Convert images between JPG, PNG and WebP with optional resizing and quality control. Processed on your device.',
    kw: 'تحويل صور, محول صيغ الصور, PNG إلى JPG, JPG to WebP, image converter',
    faq: [{ qa: 'ما الفرق بين JPG وPNG وWebP؟', aa: 'JPG للصور الفوتوغرافية بحجم صغير، وPNG يحتفظ بالشفافية بجودة كاملة، وWebP يجمع الصغر والشفافية في أغلب المتصفحات.', qe: 'What is the difference between JPG, PNG and WebP?', ae: 'JPG is small and good for photos, PNG keeps transparency at full quality, and WebP gives small files with transparency in most browsers.' }]
  },
  'heic-to-jpg': {
    ar: 'تحويل صور HEIC إلى JPG أونلاين مجاناً',
    da: 'حوّل صور الآيفون بصيغة HEIC وHEIF إلى JPG أو PNG أو WebP لتفتح على أي جهاز. التحويل على جهازك بدون رفع.',
    de: 'Convert iPhone HEIC and HEIF photos to JPG, PNG or WebP so they open anywhere. Converted on your device, nothing uploaded.',
    kw: 'تحويل HEIC الى JPG, صور الايفون, HEIC to JPG, HEIF converter, iPhone photo converter',
    faq: [{ qa: 'لماذا لا تفتح صور الآيفون عندي؟', aa: 'الآيفون يحفظ الصور بصيغة HEIC التي لا تدعمها كل الأجهزة. حوّلها إلى JPG لتفتح في أي مكان.', qe: 'Why can\'t I open my iPhone photos?', ae: 'iPhones save photos as HEIC, which not every device supports. Convert them to JPG to open them anywhere.' },
      { qa: 'هل تُحفظ جودة الصورة؟', aa: 'نعم، التحويل بجودة عالية، ويمكنك رفع الجودة أو اختيار PNG لعدم فقد أي تفاصيل.', qe: 'Is the photo quality kept?', ae: 'Yes. Conversion is high quality, and you can raise the quality or choose PNG to avoid any loss.' }]
  },
  'text-to-pdf': {
    ar: 'تحويل النصوص وMarkdown وHTML إلى PDF',
    da: 'حوّل ملفات TXT وMarkdown وHTML وCSV وJSON إلى PDF مع دعم كامل للعربية والكتابة من اليمين لليسار.',
    de: 'Convert TXT, Markdown, HTML, CSV and JSON to PDF with full Arabic and right-to-left support.',
    kw: 'تحويل نص الى PDF, Markdown إلى PDF, HTML to PDF, CSV to PDF, نص عربي PDF',
    faq: [{ qa: 'هل النص في ملف PDF قابل للتحديد؟', aa: 'اختر «نص قابل للتحديد» ليُنشأ الملف عبر طباعة المتصفح فيبقى النص حقيقياً وقابلاً للبحث. الخيار الافتراضي يحوّل الصفحات إلى صور للحصول على شكل مطابق.', qe: 'Is the text in the PDF selectable?', ae: 'Choose "Selectable text" to create the file with your browser\'s print engine, which keeps real, searchable text. The default turns pages into images for an exact look.' }]
  },
  'docx-to-pdf': {
    ar: 'تحويل ملفات وورد DOCX إلى PDF أونلاين',
    da: 'حوّل مستندات وورد (.docx) إلى PDF مع دعم العربية والجداول والصور. بدون رفع الملف وبدون تسجيل.',
    de: 'Convert Word (.docx) documents to PDF with Arabic, tables and images. No upload and no sign-up.',
    kw: 'تحويل وورد الى PDF, Word to PDF, DOCX to PDF, docx إلى pdf, ملف وورد pdf',
    faq: [{ qa: 'هل تبقى التنسيقات كما هي؟', aa: 'تبقى النصوص والعناوين والقوائم والجداول والصور. التنسيقات المعقدة جداً مثل الترويسات والأعمدة المتعددة قد تظهر أبسط من الأصل.', qe: 'Is the formatting preserved?', ae: 'Text, headings, lists, tables and images are kept. Very complex layouts such as headers and multi-column pages may look simpler than the original.' },
      { qa: 'هل يدعم ملفات .doc القديمة؟', aa: 'يدعم .docx فقط. احفظ الملف القديم بصيغة docx من وورد ثم حوّله.', qe: 'Does it support old .doc files?', ae: 'Only .docx is supported. Save the old file as docx in Word, then convert it.' }]
  },
  'merge-pdf': {
    ar: 'دمج ملفات PDF أونلاين مجاناً',
    da: 'اجمع عدة ملفات PDF في ملف واحد بالترتيب الذي تختاره. مجاني، بدون علامة مائية وبدون رفع الملفات.',
    de: 'Combine several PDF files into one, in the order you choose. Free, no watermark and no upload.',
    kw: 'دمج ملفات PDF, دمج بي دي اف, merge PDF, combine PDF, join PDF',
    faq: [{ qa: 'كيف أغيّر ترتيب الملفات؟', aa: 'استخدم أسهم التحريك بجانب كل ملف قبل الدمج، فالترتيب في القائمة هو ترتيب الملف النهائي.', qe: 'How do I change the order of the files?', ae: 'Use the arrows next to each file before merging. The order in the list is the order in the final PDF.' }]
  },
  'split-pdf': {
    ar: 'تقسيم PDF واستخراج الصفحات أونلاين',
    da: 'استخرج صفحات من PDF أو قسّمه إلى عدة ملفات حسب نطاقات الصفحات. مجاني وبدون رفع.',
    de: 'Extract pages from a PDF or split it into several files by page ranges. Free, with no upload.',
    kw: 'تقسيم PDF, استخراج صفحات من PDF, split PDF, extract PDF pages',
    faq: [{ qa: 'كيف أكتب نطاق الصفحات؟', aa: 'اكتب مثلاً 1-3, 5, 8- لاستخراج الصفحات 1 إلى 3 والصفحة 5 ومن 8 إلى النهاية.', qe: 'How do I write a page range?', ae: 'For example 1-3, 5, 8- extracts pages 1 to 3, page 5, and page 8 to the end.' }]
  },
  'rotate-pdf': {
    ar: 'تدوير صفحات PDF أونلاين مجاناً',
    da: 'دوّر كل صفحات PDF أو صفحات محددة بزاوية 90 أو 180 أو 270 درجة. بدون رفع الملف.',
    de: 'Rotate all pages of a PDF, or only the ones you choose, by 90, 180 or 270 degrees. No upload.',
    kw: 'تدوير PDF, قلب صفحات PDF, rotate PDF, rotate PDF pages',
    faq: [{ qa: 'هل أستطيع تدوير صفحة واحدة فقط؟', aa: 'نعم، اكتب رقم الصفحة في خانة الصفحات، أو اتركها فارغة لتدوير الكل.', qe: 'Can I rotate just one page?', ae: 'Yes. Type the page number in the pages field, or leave it empty to rotate everything.' }]
  },
  'organize-pdf': {
    ar: 'ترتيب صفحات PDF وحذفها وتدويرها',
    da: 'أعد ترتيب صفحات PDF بالسحب والإفلات، واحذف أو كرّر أو دوّر أي صفحة. معاينة مصغّرة لكل صفحة وبدون رفع.',
    de: 'Reorder PDF pages by drag and drop, and delete, duplicate or rotate any page. Thumbnail preview, no upload.',
    kw: 'ترتيب صفحات PDF, حذف صفحة من PDF, organize PDF, reorder PDF pages, delete PDF pages',
    faq: [{ qa: 'كيف أحذف صفحة من PDF؟', aa: 'اضغط زر الحذف على الصفحة (علامة ×) ثم احفظ الملف. يمكنك استرجاعها قبل الحفظ.', qe: 'How do I delete a page from a PDF?', ae: 'Press the delete button (×) on the page, then save. You can restore it before saving.' },
      { qa: 'هل يعمل على الجوال؟', aa: 'نعم، استخدم أزرار التقديم والتأخير على كل صفحة بدل السحب.', qe: 'Does it work on mobile?', ae: 'Yes. Use the move earlier/later buttons on each page instead of dragging.' }]
  },
  'compress': {
    ar: 'ضغط الملفات أونلاين: صور وPDF وأي ملف',
    da: 'قلّل حجم الصور وملفات PDF وأي ملف آخر. أسقط ملفك وسنختار الطريقة المناسبة. بدون رفع.',
    de: 'Reduce the size of images, PDFs and any other file. Drop it in and the right method is chosen for you. No upload.',
    kw: 'ضغط الملفات, تقليل حجم الملف, compress files, reduce file size',
    faq: [{ qa: 'هل تقل جودة الملف بعد الضغط؟', aa: 'تظهر نسبة التوفير قبل التنزيل، وإن لم يوفّر الضغط شيئاً نحتفظ بالملف الأصلي.', qe: 'Does quality drop after compression?', ae: 'The saving is shown before you download, and if compression saves nothing the original is kept.' }]
  },
  'compress-image': {
    ar: 'ضغط الصور أونلاين وتقليل حجمها',
    da: 'قلّل حجم صور JPG وPNG وWebP أو اضغطها لحجم محدد مثل أقل من 200 كيلو أو 1 ميجا. مناسب لرفعها على المواقع.',
    de: 'Shrink JPG, PNG and WebP images, or compress them to a target size such as under 200 KB or 1 MB, for upload forms.',
    kw: 'ضغط الصور, تصغير حجم الصورة, صورة اقل من 200 كيلو, compress image, reduce image size',
    faq: [{ qa: 'كيف أجعل الصورة أقل من 200 كيلوبايت؟', aa: 'اختر «أقل من 200 كيلو» من قائمة الهدف وسيختار الموقع الجودة المناسبة تلقائياً.', qe: 'How do I make an image under 200 KB?', ae: 'Pick "Under 200 KB" in the target list and the site chooses the right quality automatically.' },
      { qa: 'هل توجد صورة شخصية جاهزة؟', aa: 'نعم، خيار «صورة شخصية 3:4» يقص الصورة من المنتصف ويضغطها بحجم مناسب لنماذج التقديم.', qe: 'Is there an ID-photo preset?', ae: 'Yes. "ID photo 3:4" crops from the centre and compresses to a size suited to application forms.' }]
  },
  'compress-pdf': {
    ar: 'ضغط ملفات PDF أونلاين وتقليل الحجم',
    da: 'صغّر حجم ملفات PDF مع الإبقاء على النص أو بضغط أقوى للملفات الممسوحة ضوئياً. بدون رفع.',
    de: 'Make PDF files smaller, keeping the text or compressing harder for scanned files. No upload.',
    kw: 'ضغط PDF, تقليل حجم PDF, compress PDF, reduce PDF size',
    faq: [{ qa: 'ما الفرق بين الضغط الخفيف والقوي؟', aa: 'الخفيف يحافظ على النص قابلاً للتحديد لكن التوفير أقل، والقوي يحوّل الصفحات إلى صور فيوفّر أكثر خصوصاً للملفات الممسوحة.', qe: 'What is the difference between light and strong?', ae: 'Light keeps text selectable but saves less. Strong turns pages into images and saves more, especially for scans.' }]
  },
  'zip-files': {
    ar: 'إنشاء ملف ZIP أونلاين من عدة ملفات',
    da: 'اجمع أي ملفات في أرشيف ZIP مضغوط واحد بمستوى ضغط تختاره. بدون رفع.',
    de: 'Pack any files into a single compressed ZIP archive at the compression level you choose. No upload.',
    kw: 'ضغط ملفات ZIP, إنشاء ZIP, create zip online, zip files',
    faq: [{ qa: 'هل يوجد حد لحجم الأرشيف؟', aa: 'الحد هو ذاكرة جهازك لأن كل شيء يتم داخل المتصفح.', qe: 'Is there a size limit?', ae: 'Your device memory is the limit, because everything runs inside the browser.' }]
  },
  'video-to-audio': {
    ar: 'تحويل الفيديو إلى صوت MP3 أونلاين',
    da: 'استخرج الصوت من أي فيديو بصيغة MP3 أو WAV، أو حوّل الملفات الصوتية بين الصيغ. على جهازك وبدون رفع الفيديو.',
    de: 'Extract the sound of any video as MP3 or WAV, or convert audio files between formats. On your device, the video is never uploaded.',
    kw: 'تحويل فيديو الى صوت, تحويل MP4 الى MP3, استخراج الصوت من الفيديو, video to MP3, extract audio',
    faq: [{ qa: 'كيف أستخرج الصوت من فيديو؟', aa: 'أضف الفيديو، اختر MP3 أو WAV، ثم اضغط «حوّل إلى صوت». ينزل الصوت بنفس مدة الفيديو.', qe: 'How do I extract audio from a video?', ae: 'Add the video, choose MP3 or WAV and press convert. The audio has the same length as the video.' },
      { qa: 'ماذا لو لم يقرأ المتصفح صيغة الفيديو؟', aa: 'نسجّل الصوت تلقائياً أثناء تشغيل الفيديو ونعطيك ملف WebM. يستغرق ذلك بقدر مدة الفيديو.', qe: 'What if the browser cannot read the video format?', ae: 'The sound is recorded while the video plays and you get a WebM file. That takes as long as the video.' }]
  },
  'audio-to-video': {
    ar: 'تحويل الصوت إلى فيديو بصورة غلاف',
    da: 'حوّل ملفاً صوتياً إلى فيديو بصورة غلاف ومؤثر مرئي للصوت، بشكل عريض أو طولي أو مربع، جاهز للنشر.',
    de: 'Turn an audio file into a video with cover art and a sound visualizer, in wide, vertical or square shape, ready to post.',
    kw: 'تحويل الصوت الى فيديو, mp3 إلى فيديو, audio to video, MP3 to MP4, صوت مع صورة فيديو',
    faq: [{ qa: 'لماذا يستغرق التحويل بقدر مدة الصوت؟', aa: 'يُسجَّل الفيديو أثناء تشغيل الصوت داخل المتصفح. أبقِ الصفحة مفتوحة وظاهرة حتى ينتهي.', qe: 'Why does it take as long as the audio?', ae: 'The video is recorded while the audio plays inside the browser. Keep the page open and visible until it finishes.' },
      { qa: 'هل أستطيع النشر على وسائل التواصل؟', aa: 'نعم، اختر الشكل الطولي 9:16 للقصص والريلز، أو المربع 1:1 للمنشورات.', qe: 'Can I post it on social media?', ae: 'Yes. Choose vertical 9:16 for stories and reels, or square 1:1 for posts.' }]
  }
};
