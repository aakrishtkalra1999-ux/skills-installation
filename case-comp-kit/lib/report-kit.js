// Report kit: consulting-style A4 portrait pages as HTML, printed to PDF with Edge (for written-report rounds).
// Reuses the deck kit's palette, number formats and charts, and adds report charts:
// horizontal bars, a leaky funnel, a box-and-arrow flow, a root-cause tree and a stacked bar.
// Usage:
//   const R = require('../../case-comp-kit/lib/report-kit');
//   const p1 = R.page({ n: 1, section: 'Diagnosis', title: 'Full-sentence takeaway', body: '...', foot: 'Sources: [1] [2]' });
//   R.writeReport({ pages: [cover, p1], outHtml, outPdf, pdf: true, png: true });
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const K = require('./deck-kit');
const { C, esc, F } = K;

// ---------- page chrome ----------
let SECTIONS = ['Diagnosis', 'Solution', 'Feasibility'];
let HEADER = '';
const setChrome = ({ sections, header }) => { if (sections) SECTIONS = sections; if (header !== undefined) HEADER = header; };
const page = ({ n, section, appendix, title, body, foot = '', cls = '' }) => `
<section class="page ${cls}">
  <div class="top">
    <div class="tracker">${appendix ? `<span class="on">Appendix ${appendix}</span>` : SECTIONS.map(s => `<span class="${s === section ? 'on' : ''}">${s}</span>`).join('')}</div>
    <div class="team">${esc(HEADER)}</div>
  </div>
  ${title ? `<h1>${title}</h1><div class="rule"></div>` : ''}
  <div class="body">${body}</div>
  <div class="footer"><span>${foot}</span><span>${n}</span></div>
</section>`;
const table = (head, rows, cls = '') => `<table class="${cls}"><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;

// ---------- charts (all inline SVG, Arial) ----------
const svg = (w, h, s) => `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="Arial, Helvetica, sans-serif">${s}</svg>`;
const wrapText = (t, x, y, fs, lh, attrs = '') => String(t).split('\n').map((ln, k) => `<text x="${x}" y="${(y + k * lh).toFixed(1)}" font-size="${fs}" ${attrs}>${esc(ln)}</text>`).join('');

// items: [{ label, v, lab?, fill? }]; draws label column, bar, value
function hbars({ w, items, max, labelW = 150, rowH = 18, fs = 8.5, fmt = v => String(v), barFill = C.up }) {
  const h = items.length * rowH + 4, bx = labelW + 4, bw = w - bx - 44;
  let s = '';
  items.forEach((it, i) => {
    const y = i * rowH + 2, len = Math.max(1, bw * it.v / max);
    s += `<text x="${labelW}" y="${y + rowH / 2 + 3}" font-size="${fs}" text-anchor="end" fill="${C.ink2}">${esc(it.label)}</text>`;
    s += `<rect x="${bx}" y="${y + 3}" width="${len.toFixed(1)}" height="${rowH - 7}" fill="${it.fill || barFill}" rx="1"/>`;
    s += `<text x="${(bx + len + 4).toFixed(1)}" y="${y + rowH / 2 + 3}" font-size="${fs}" font-weight="700" fill="${C.ink}">${esc(it.lab !== undefined ? it.lab : fmt(it.v))}</text>`;
  });
  return svg(w, h, s);
}

// Leaky funnel: stages narrow left to right as horizontal bars with drop labels. items: [{ label, v, lab }]
function funnel({ w, items, max, rowH = 24, labelW = 168, fs = 8.6, fmt = v => String(v) }) {
  const h = items.length * rowH + 4, bx = labelW + 6, bw = w - bx - 70;
  let s = '';
  items.forEach((it, i) => {
    const y = i * rowH + 2, len = Math.max(2, bw * it.v / max);
    const fill = i === 0 ? C.navy : i === items.length - 1 ? C.down : C.up;
    s += wrapText(it.label, labelW, y + 10, fs, fs + 1.5, `text-anchor="end" fill="${C.ink2}"`);
    s += `<rect x="${bx}" y="${y + 3}" width="${len.toFixed(1)}" height="${rowH - 8}" fill="${fill}" rx="1"/>`;
    s += `<text x="${(bx + len + 5).toFixed(1)}" y="${y + rowH / 2 + 2}" font-size="${fs + 0.6}" font-weight="700" fill="${C.ink}">${esc(it.lab !== undefined ? it.lab : fmt(it.v))}</text>`;
  });
  return svg(w, h, s);
}

// Flow of boxes left to right with arrows. cols: [{ head, items: [text], fill? }]
function flow({ w, cols, h = 150, gap = 16, headH = 18, fs = 8.2 }) {
  const n = cols.length, bw = (w - gap * (n - 1)) / n;
  let s = '';
  cols.forEach((c, i) => {
    const x = i * (bw + gap);
    s += `<rect x="${x.toFixed(1)}" y="0" width="${bw.toFixed(1)}" height="${headH}" fill="${c.fill || C.navy}"/>`;
    s += `<text x="${(x + 6).toFixed(1)}" y="${headH - 5.5}" font-size="${fs + 0.6}" font-weight="700" fill="#fff">${esc(c.head)}</text>`;
    s += `<rect x="${x.toFixed(1)}" y="${headH}" width="${bw.toFixed(1)}" height="${h - headH}" fill="${C.fill}"/>`;
    let y = headH + 12;
    c.items.forEach(t => { s += wrapText(t, x + 6, y, fs, fs + 2, `fill="${C.ink}"`); y += String(t).split('\n').length * (fs + 2) + 4; });
    if (i < n - 1) {
      const ax = x + bw + 2, ay = h / 2 + headH / 2;
      s += `<path d="M${ax.toFixed(1)} ${(ay - 6).toFixed(1)} L${(ax + gap - 4).toFixed(1)} ${ay.toFixed(1)} L${ax.toFixed(1)} ${(ay + 6).toFixed(1)} Z" fill="${C.navy}"/>`;
    }
  });
  return svg(w, h, s);
}

// Root-cause tree: one root on the left, branches, leaves. branches: [{ head, leaves: [text] }]
function tree({ w, root, branches, rootW = 96, headW = 150, leafFs = 7.9, headFs = 8.6, rowGap = 4 }) {
  const leafX = rootW + 18 + headW + 18, leafW = w - leafX;
  const lh = leafFs + 2.2;
  let y = 0; const rows = [];
  branches.forEach(b => {
    const lines = b.leaves.reduce((a, l) => a + String(l).split('\n').length, 0);
    const bh = Math.max(lines * lh + (b.leaves.length - 1) * 2 + 8, String(b.head).split('\n').length * (headFs + 2) + 10);
    rows.push({ b, y, bh }); y += bh + rowGap;
  });
  const h = y - rowGap;
  let s = `<rect x="0" y="${(h / 2 - 34).toFixed(1)}" width="${rootW}" height="68" fill="${C.navy}"/>`;
  const rl = String(root).split('\n');
  s += wrapText(root, 6, h / 2 - (rl.length - 1) * (headFs + 2) / 2 + 3, headFs, headFs + 2, `font-weight="700" fill="#fff"`);
  rows.forEach(({ b, y: by, bh }, i) => {
    const cy = by + bh / 2, hx = rootW + 18;
    s += `<path d="M${rootW} ${(h / 2).toFixed(1)} C${rootW + 9} ${(h / 2).toFixed(1)} ${hx - 9} ${cy.toFixed(1)} ${hx} ${cy.toFixed(1)}" stroke="${C.ghost}" fill="none" stroke-width="1"/>`;
    s += `<rect x="${hx}" y="${by.toFixed(1)}" width="${headW}" height="${bh.toFixed(1)}" fill="${b.fill || C.fill}" stroke="${C.navy}" stroke-width="0.8"/>`;
    const hl = String(b.head).split('\n');
    s += wrapText(b.head, hx + 6, cy - (hl.length - 1) * (headFs + 2) / 2 + 3, headFs, headFs + 2, `font-weight="700" fill="${C.navy}"`);
    s += `<line x1="${hx + headW}" x2="${leafX - 4}" y1="${cy.toFixed(1)}" y2="${cy.toFixed(1)}" stroke="${C.ghost}" stroke-width="1"/>`;
    let ly = by + 4 + leafFs;
    b.leaves.forEach(l => { s += `<circle cx="${leafX + 2}" cy="${(ly - 3).toFixed(1)}" r="1.6" fill="${C.down}"/>`; s += wrapText(l, leafX + 8, ly, leafFs, lh, `fill="${C.ink}"`); ly += String(l).split('\n').length * lh + 2; });
  });
  return svg(w, h, s);
}

// One stacked horizontal bar per row. rows: [{ label, parts: [{ v, fill, lab }] }]
function stacked({ w, rows, max, labelW = 110, rowH = 22, fs = 8.2, legend = [] }) {
  const bx = labelW + 6, bw = w - bx - 8, legH = legend.length ? 16 : 0;
  const h = rows.length * rowH + legH + 2;
  let s = '';
  rows.forEach((r, i) => {
    const y = i * rowH + 2; let x = bx;
    s += wrapText(r.label, labelW, y + rowH / 2 + 2, fs, fs + 1.5, `text-anchor="end" fill="${C.ink2}"`);
    r.parts.forEach(p => {
      const len = bw * p.v / max;
      s += `<rect x="${x.toFixed(1)}" y="${y + 3}" width="${len.toFixed(1)}" height="${rowH - 7}" fill="${p.fill}"/>`;
      if (p.lab && len > 22) s += `<text x="${(x + len / 2).toFixed(1)}" y="${y + rowH / 2 + 2.5}" font-size="${fs - 0.4}" text-anchor="middle" font-weight="700" fill="#fff">${esc(p.lab)}</text>`;
      x += len;
    });
  });
  let lx = bx;
  legend.forEach(([t, fill]) => { const ly = rows.length * rowH + 8; s += `<rect x="${lx}" y="${ly}" width="8" height="8" fill="${fill}"/><text x="${lx + 11}" y="${ly + 7.5}" font-size="${fs - 0.5}" fill="${C.ink2}">${esc(t)}</text>`; lx += 16 + t.length * (fs - 0.5) * 0.52; });
  return svg(w, h, s);
}

// ---------- styles: A4 portrait at 96 dpi = 794 x 1123 px ----------
const css = `
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: ${C.ink}; -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #fff; }
.page { width: 794px; height: 1123px; position: relative; overflow: hidden; page-break-after: always; break-after: page; padding: 0 38px; background: #fff; }
.top { height: 30px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 7.6px; letter-spacing: .06em; text-transform: uppercase; color: #9AA3AF; }
.tracker span { margin-right: 14px; padding-bottom: 2px; }
.tracker span.on { color: ${C.navy}; font-weight: 700; border-bottom: 2px solid ${C.navy}; }
.team { color: ${C.mute}; letter-spacing: .03em; }
h1 { font-size: 15px; line-height: 1.25; font-weight: 700; color: ${C.navy}; margin: 9px 0 0; }
.rule { height: 1.6px; background: ${C.navy}; margin: 6px 0 0; }
.body { position: absolute; top: 92px; left: 38px; right: 38px; bottom: 34px; }
.footer { position: absolute; bottom: 10px; left: 38px; right: 38px; font-size: 6.6px; line-height: 1.3; color: ${C.mute}; display: flex; justify-content: space-between; gap: 20px; border-top: 1px solid ${C.hair}; padding-top: 3px; }
.grid { display: grid; }
h2 { font-size: 8.4px; text-transform: uppercase; letter-spacing: .06em; color: ${C.navy}; margin: 0 0 4px; padding-top: 3px; border-top: 1.4px solid ${C.navy}; }
h2 .num { display: inline-block; background: ${C.navy}; color: #fff; padding: 0 4px; margin-right: 5px; }
p { font-size: 8.6px; line-height: 1.42; margin: 0 0 5px; }
ul { margin: 0 0 4px; padding-left: 12px; font-size: 8.5px; line-height: 1.4; }
ul li { margin-bottom: 2.5px; }
.blk + .blk { margin-top: 9px; }
.callout { background: ${C.fill}; color: ${C.navy}; font-size: 8.6px; line-height: 1.4; padding: 6px 9px; border-left: 3px solid ${C.navy}; }
.callout.red { border-left-color: ${C.down}; }
.sm { font-size: 7px; color: ${C.mute}; line-height: 1.3; }
sup { font-size: 6px; color: ${C.up}; }
table { width: 100%; border-collapse: collapse; font-size: 7.9px; line-height: 1.3; }
th { text-align: left; font-size: 6.9px; text-transform: uppercase; letter-spacing: .03em; color: ${C.mute}; font-weight: 700; padding: 2px 4px; border-bottom: 1px solid ${C.ink2}; vertical-align: bottom; }
td { padding: 3px 4px; border-bottom: 1px solid #E5E7EB; vertical-align: top; }
table.num td:not(:first-child), table.num th:not(:first-child) { text-align: right; white-space: nowrap; }
td b { color: ${C.navy}; }
.ok { color: ${C.ok}; font-weight: 700; white-space: nowrap; } .no { color: ${C.down}; font-weight: 700; }
b.up { color: ${C.up}; } b.dn { color: ${C.down}; }
.kpis { display: grid; gap: 7px; }
.kpis div { background: ${C.fill}; padding: 5px 7px; }
.kpis b { display: block; font-size: 16px; color: ${C.navy}; line-height: 1.1; }
.kpis span { font-size: 7.3px; color: ${C.ink2}; line-height: 1.25; display: block; margin-top: 2px; }
.tag { display: inline-block; font-size: 6.8px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; padding: 1px 4px; border-radius: 2px; background: ${C.navy}; color: #fff; }
ol.refs { margin: 0; padding-left: 16px; font-size: 7.1px; line-height: 1.38; color: ${C.ink2}; }
ol.refs li { margin-bottom: 1.5px; word-break: break-word; }
.cover { padding: 0 60px; }
`;

// Writes the HTML; pdf: true prints the PDF; png: true screenshots every page to preview/pN.png
function writeReport({ pages, outHtml, outPdf, title = 'Case competition report', extraCss = '', pdf = false, png = false }) {
  const previewJs = `<script>const m=location.hash.match(/^#p(\\d+)$/);if(m){document.querySelectorAll('.page').forEach((s,i)=>{if(i!==+m[1]-1)s.style.display='none'});document.body.style.overflow='hidden'}</script>`;
  fs.writeFileSync(outHtml, `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(title)}</title><style>${css}${extraCss}</style></head><body>${pages.join('\n')}${previewJs}</body></html>`);
  console.log('Wrote', outHtml);
  const exe = ['C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', '/opt/pw-browsers/chromium', '/usr/bin/chromium', '/usr/bin/google-chrome'].find(p => fs.existsSync(p));
  if (!exe && (pdf || png)) throw new Error('No Edge or Chrome found for PDF export');
  const noSb = process.getuid && process.getuid() === 0 ? ['--no-sandbox'] : []; // Chromium refuses to run as root (Linux cloud sessions) without this
  const url = 'file:///' + encodeURI(path.resolve(outHtml).replace(/^\//, '').replace(/\\/g, '/')); // Edge fails silently on raw spaces
  if (pdf) {
    const out = path.resolve(outPdf);
    if (fs.existsSync(out)) fs.unlinkSync(out);
    execFileSync(exe, [...noSb, '--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--run-all-compositor-stages-before-draw', `--print-to-pdf=${out}`, url], { stdio: 'ignore' });
    // Edge can return before the PDF is flushed: wait until the file exists and its size stops changing
    const sleep = ms => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
    let last = -1;
    for (let i = 0; i < 60; i++) { const sz = fs.existsSync(out) ? fs.statSync(out).size : -1; if (sz > 0 && sz === last) break; last = sz; sleep(500); }
    if (!fs.existsSync(out)) throw new Error('PDF was not written: ' + out);
    console.log('Wrote', outPdf);
  }
  if (png) {
    const dir = path.join(path.dirname(path.resolve(outHtml)), 'preview');
    fs.mkdirSync(dir, { recursive: true });
    pages.forEach((_, i) => execFileSync(exe, [...noSb, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=2', '--window-size=794,1123', `--screenshot=${path.join(dir, `p${i + 1}.png`)}`, `${url}#p${i + 1}`], { stdio: 'ignore' }));
    console.log('Wrote previews to', dir);
  }
}

module.exports = { C, F, esc, setChrome, page, table, hbars, funnel, flow, tree, stacked, gantt: K.gantt, waterfall: K.waterfall, css, writeReport };
