// Renders the Slides deck source to PNGs, a PDF and an image-based PPTX with speaker notes.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const pptxgen = require('pptxgenjs');

const root = process.argv[2];
const out = process.argv[3];
const deck = JSON.parse(fs.readFileSync(path.join(root, 'project/deck.json'), 'utf8'));

const ICONS = {
  Lightning: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  Clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  Verified: '<path d="M12 2l2.4 2.1 3.2-.3.7 3.1 2.8 1.6-1.3 2.9 1.3 2.9-2.8 1.6-.7 3.1-3.2-.3L12 22l-2.4-2.1-3.2.3-.7-3.1-2.8-1.6 1.3-2.9-1.3-2.9 2.8-1.6.7-3.1 3.2.3z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  CheckCircle: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
  Lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
};

function convert(html) {
  const notes = (html.match(/<aside>([\s\S]*?)<\/aside>/) || [])[1] || '';
  html = html.replace(/<aside>[\s\S]*?<\/aside>/, '');
  html = html.replace(/<x-icon name="(\w+)" style="([^"]*)"><\/x-icon>/g, (m, name, style) => {
    const color = (style.match(/color:([^;]+)/) || [])[1];
    return `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${style};flex:none">${ICONS[name]}</svg>`;
  });
  html = html.replace(/<x-shape kind="arrow-right" style="([^"]*)"><\/x-shape>/g, (m, style) => {
    const bg = (style.match(/background:([^;]+)/) || [])[1];
    const rest = style.replace(/background:[^;]+;?/, '');
    return `<svg viewBox="0 0 56 32" style="${rest};flex:none"><path d="M0 10h34V0l22 16-22 16V22H0z" fill="${bg}"/></svg>`;
  });
  return { html, notes: notes.trim() };
}

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const fontLinks = Object.values(deck.faces).map(f => `<link rel="stylesheet" href="${f.href}">`).join('');
  const slides = deck.order.map(id => ({ id, ...convert(fs.readFileSync(path.join(root, `project/slides/${id}.html`), 'utf8')) }));
  const page_html = `<!doctype html><html><head><meta charset="utf-8">${fontLinks}<style>
    *{margin:0;box-sizing:border-box}
    html,body{background:#000}
    section{width:1920px;height:1080px;position:relative;overflow:hidden;page-break-after:always}
    ul,ol{padding-left:1.2em}
    table{border-collapse:collapse;width:100%}
    th{text-align:left;font-weight:700;border-bottom:2px solid #15130F;padding:12px}
    td{border-bottom:1px solid #D9D4CA;padding:12px}
    hr{border:none}
    @page{size:1920px 1080px;margin:0}
  </style></head><body>${slides.map(s => s.html).join('\n')}</body></html>`;
  fs.writeFileSync(path.join(out, 'deck-render.html'), page_html);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file://' + path.join(out, 'deck-render.html'), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const overflow = await page.evaluate(() => {
    const issues = [];
    document.querySelectorAll('section').forEach(sec => {
      const sb = sec.getBoundingClientRect();
      sec.querySelectorAll('p,h1,h2,h3,li,td,th,div').forEach(el => {
        const b = el.getBoundingClientRect();
        if (b.width === 0) return;
        if (b.bottom > sb.top + 1000 && !el.style.bottom) issues.push(`${sec.id}: ${el.tagName} bottom ${Math.round(b.bottom - sb.top)} "${el.textContent.trim().slice(0, 40)}"`);
        if (el.scrollWidth > el.clientWidth + 2 && el.tagName !== 'DIV') issues.push(`${sec.id}: ${el.tagName} h-overflow "${el.textContent.trim().slice(0, 40)}"`);
      });
    });
    return issues;
  });
  console.log(overflow.join('\n') || 'no overflow found');
  const sections = await page.$$('section');
  for (let i = 0; i < sections.length; i++) {
    await sections[i].screenshot({ path: path.join(out, `slide-${String(i + 1).padStart(2, '0')}.png`) });
  }
  await page.pdf({ path: path.join(out, 'PULL_UP_PM_Final_Project.pdf'), width: '1920px', height: '1080px', printBackground: true });
  await browser.close();

  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE';
  pres.title = deck.title;
  slides.forEach((s, i) => {
    const slide = pres.addSlide();
    slide.addImage({ path: path.join(out, `slide-${String(i + 1).padStart(2, '0')}.png`), x: 0, y: 0, w: 13.333, h: 7.5, altText: `Slide ${i + 1}` });
    if (s.notes) slide.addNotes(s.notes.replace(/&amp;/g, '&'));
  });
  await pres.writeFile({ fileName: path.join(out, 'PULL_UP_PM_Final_Project.pptx') });
  console.log('done');
})();
