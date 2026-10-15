// Deck kit: consulting-style 16:9 slides as HTML, printed to PDF with the Edge/Chrome already on Windows.
// Charts are inline SVG (waterfall bridge, value/speed bubble matrix, gated Gantt roadmap).
// Usage (see templates/deck.template.js):
//   const K = require('../lib/deck-kit');
//   const D = K.loadData('deck/model_data.json');        // numbers exported by the model kit
//   const s1 = K.slide({ n: 1, section: 'Answer', title: '...', body: '...', source: '...' });
//   K.writeDeck({ slides: [s1], outHtml: 'deck/deck.html', outPdf: 'TeamName_Comp.pdf', pdf: true, png: true });
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

// ---------- data and number formatting ----------
const loadData = file => {
  const D = JSON.parse(fs.readFileSync(file, 'utf8'));
  return (sheet, key, col) => {
    const v = D[sheet] && D[sheet][key] && D[sheet][key][col];
    if (v === undefined) throw new Error(`missing ${sheet}.${key}.${col}`);
    return v;
  };
};
const MINUS = '\u2212'; // a true minus sign, not a dash
const fix = (v, d) => { const s = Math.abs(v).toFixed(d); return (v < 0 && Number(s) !== 0 ? MINUS : '') + Number(s).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }); };
const F = {
  fix, n0: v => fix(v, 0), n1: v => fix(v, 1),
  s0: v => (v >= 0 ? '+' : '') + fix(v, 0), s1: v => (v >= 0 ? '+' : '') + fix(v, 1),
  p0: v => fix(v * 100, 0) + '%', p1: v => fix(v * 100, 1) + '%',
  x1: v => fix(v, 1) + 'x', x2: v => fix(v, 2) + 'x',
};

// ---------- palette: navy for totals and ink; blue/red pair passed the colour-blind validator ----------
const C = { navy: '#0B2545', ink: '#1A1A1A', ink2: '#4B5563', mute: '#6B7280', hair: '#D0D5DD', fill: '#EEF2F7', up: '#1F6FB2', down: '#C0504D', ghost: '#A7B0BE', ok: '#1E7B45', grey: '#6C7A8F' };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

// ---------- charts ----------
// items: [{ label: 'Line 1\nLine 2', v, kind: 'total' | 'delta' | 'ghost', fill?, lab? }]
function waterfall({ w, h, items, min = 0, max, fmt = F.n1, labelH = 30, barFrac = 0.62, fs = 10 }) {
  const top = 16, bottom = labelH, left = 6, right = 6;
  const ph = h - top - bottom, pw = w - left - right;
  const y = v => top + ph * (1 - (v - min) / (max - min));
  const band = pw / items.length, bw = band * barFrac;
  let run = 0, out = '', prevEnd = null;
  items.forEach((it, i) => {
    const x0 = left + band * i + (band - bw) / 2;
    let a, b, fill;
    if (it.kind === 'total') { a = 0; b = it.v; run = it.v; fill = it.fill || C.navy; }
    else { a = run; b = run + it.v; run = b; fill = it.kind === 'ghost' ? C.ghost : (it.v >= 0 ? C.up : C.down); }
    const yt = y(Math.max(a, b)), yb = y(Math.min(a, b));
    out += `<rect x="${x0.toFixed(1)}" y="${yt.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(1, yb - yt).toFixed(1)}" fill="${fill}" rx="1.5"/>`;
    if (prevEnd !== null) out += `<line x1="${prevEnd.x.toFixed(1)}" x2="${x0.toFixed(1)}" y1="${y(prevEnd.v).toFixed(1)}" y2="${y(prevEnd.v).toFixed(1)}" stroke="#9AA3AF" stroke-width="0.8" stroke-dasharray="2 2"/>`;
    prevEnd = { x: x0 + bw, v: it.kind === 'total' ? it.v : b };
    const lab = it.lab !== undefined ? it.lab : (it.kind === 'total' ? fmt(it.v) : (it.v >= 0 ? '+' : '') + fmt(it.v));
    const ly = it.v < 0 && it.kind !== 'total' ? yb + fs + 2 : yt - 4;
    out += `<text x="${(x0 + bw / 2).toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" font-size="${fs}" font-weight="700" fill="${C.ink}">${esc(lab)}</text>`;
    String(it.label).split('\n').forEach((ln, k) => { out += `<text x="${(x0 + bw / 2).toFixed(1)}" y="${(h - bottom + 12 + k * (fs + 1)).toFixed(1)}" text-anchor="middle" font-size="${fs - 1}" fill="${C.ink2}">${esc(ln)}</text>`; });
  });
  out = `<line x1="${left}" x2="${w - right}" y1="${y(0).toFixed(1)}" y2="${y(0).toFixed(1)}" stroke="${C.ink2}" stroke-width="0.8"/>` + out;
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="Arial, Helvetica, sans-serif">${out}</svg>`;
}

// pts: [{ label, sub, x, y, r, anchor?: 'start'|'end', dy? }]
function bubbles({ w, h, pts, xMax, yMin, yMax, xTitle = 'Months until savings start →', yTitle = 'Yearly EBITDA gain, USD m →', nowUntil = 4, laterFrom = 8, nowLabel = 'START NOW', laterLabel = 'ONLY AFTER A CHECKPOINT', xStep = 3, yStep = 2 }) {
  const L = 44, R = 12, T = 12, B = 36;
  const pw = w - L - R, ph = h - T - B;
  const X = v => L + pw * v / xMax, Y = v => T + ph * (1 - (v - yMin) / (yMax - yMin));
  let s = `<rect x="${L}" y="${T}" width="${(X(nowUntil) - L).toFixed(1)}" height="${ph}" fill="${C.fill}"/>`;
  s += `<text x="${L + 6}" y="${T + 12}" font-size="9" font-weight="700" fill="${C.navy}">${esc(nowLabel)}</text>`;
  s += `<text x="${(X(laterFrom) + 6).toFixed(1)}" y="${T + 12}" font-size="9" font-weight="700" fill="${C.mute}">${esc(laterLabel)}</text>`;
  s += `<line x1="${X(laterFrom).toFixed(1)}" x2="${X(laterFrom).toFixed(1)}" y1="${T}" y2="${T + ph}" stroke="${C.hair}" stroke-dasharray="3 3"/>`;
  for (let v = Math.ceil(yMin); v <= yMax; v += yStep) s += `<line x1="${L}" x2="${w - R}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" stroke="${v === 0 ? C.ink2 : '#E5E7EB'}" stroke-width="${v === 0 ? 0.8 : 0.6}"/><text x="${L - 6}" y="${(Y(v) + 3).toFixed(1)}" font-size="9" text-anchor="end" fill="${C.mute}">${v}</text>`;
  for (let v = 0; v <= xMax; v += xStep) s += `<text x="${X(v).toFixed(1)}" y="${T + ph + 13}" font-size="9" text-anchor="middle" fill="${C.mute}">${v}</text>`;
  s += `<text x="${L + pw / 2}" y="${h - 6}" font-size="9.5" text-anchor="middle" fill="${C.ink2}">${esc(xTitle)}</text>`;
  s += `<text transform="translate(11 ${T + ph / 2}) rotate(-90)" font-size="9.5" text-anchor="middle" fill="${C.ink2}">${esc(yTitle)}</text>`;
  pts.slice().sort((a, b) => b.r - a.r).forEach(p => { s += `<circle cx="${X(p.x).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="${p.r.toFixed(1)}" fill="${p.fill || C.up}" fill-opacity="0.85" stroke="#fff" stroke-width="2"/>`; });
  pts.forEach(p => {
    const anchor = p.anchor || 'start';
    const dx = anchor === 'start' ? p.r + 4 : anchor === 'end' ? -(p.r + 4) : 0;
    const dy = p.dy || 3;
    s += `<text x="${(X(p.x) + dx).toFixed(1)}" y="${(Y(p.y) + dy).toFixed(1)}" font-size="9.5" font-weight="700" text-anchor="${anchor}" fill="${C.ink}">${esc(p.label)}</text>`;
    if (p.sub) s += `<text x="${(X(p.x) + dx).toFixed(1)}" y="${(Y(p.y) + dy + 10).toFixed(1)}" font-size="8.5" text-anchor="${anchor}" fill="${C.ink2}">${esc(p.sub)}</text>`;
  });
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="Arial, Helvetica, sans-serif">${s}</svg>`;
}

// rows: [{ name, bars: [[startMonth, endMonth, text, 'fix'|'scale'|'bs']] }], gates: [[afterMonth, label]]
// months: column labels, e.g. ['J26','F','M',...]; phases: [[from, to, 'LABEL']]
function gantt({ w, rows, gates = [], months, phases, labelW = 158, rowH = 23 }) {
  const T = 34, n = months.length;
  const gridBottom = T + rows.length * rowH, h = gridBottom + 18;
  const cw = (w - labelW) / n, X = m => labelW + cw * (m - 1);
  const shades = [C.navy, '#34557A', '#6C87A6', '#8FA3BA'];
  let s = '';
  phases.forEach(([a, b, t], i) => {
    s += `<rect x="${X(a).toFixed(1)}" y="0" width="${(cw * (b - a + 1) - 2).toFixed(1)}" height="15" fill="${shades[i % shades.length]}"/>`;
    s += `<text x="${(X(a) + 5).toFixed(1)}" y="11" font-size="9" font-weight="700" fill="#fff">${esc(t)}</text>`;
  });
  months.forEach((t, i) => s += `<text x="${(X(i + 1) + cw / 2).toFixed(1)}" y="28" font-size="8.5" text-anchor="middle" fill="${C.mute}">${esc(t)}</text>`);
  rows.forEach((r, i) => { if (i % 2 === 0) s += `<rect x="0" y="${T + i * rowH}" width="${w}" height="${rowH}" fill="#F7F8FA"/>`; });
  gates.forEach(([m]) => { const xx = X(m + 1) - 1.5; s += `<line x1="${xx.toFixed(1)}" x2="${xx.toFixed(1)}" y1="${T}" y2="${gridBottom + 4}" stroke="${C.down}" stroke-width="1.4" stroke-dasharray="4 2"/>`; });
  rows.forEach((r, i) => {
    const yy = T + i * rowH;
    s += `<text x="4" y="${yy + 16}" font-size="10.5" font-weight="700" fill="${C.navy}">${esc(r.name)}</text>`;
    r.bars.forEach(([a, b, t, kind]) => {
      const x0 = X(a) + 1, bw = cw * (b - a + 1) - 3;
      const fill = kind === 'fix' ? C.navy : kind === 'bs' ? '#7A8699' : C.up;
      s += `<rect x="${x0.toFixed(1)}" y="${yy + 3}" width="${bw.toFixed(1)}" height="${rowH - 6}" fill="${fill}" rx="1.5"/>`;
      s += `<text x="${(x0 + 5).toFixed(1)}" y="${yy + 16}" font-size="9.8" fill="#fff">${esc(t)}</text>`;
    });
  });
  gates.forEach(([m, t]) => {
    const xx = X(m + 1) - 1.5;
    s += `<rect x="${(xx - 3.5).toFixed(1)}" y="${gridBottom + 3}" width="7" height="7" transform="rotate(45 ${xx.toFixed(1)} ${gridBottom + 6.5})" fill="${C.down}"/>`;
    s += `<text x="${(xx + 8).toFixed(1)}" y="${gridBottom + 11}" font-size="9.5" font-weight="700" fill="${C.down}">${esc(t)}</text>`;
  });
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="Arial, Helvetica, sans-serif">${s}</svg>`;
}

// ---------- slide chrome ----------
let SECTIONS = ['Answer', 'Diagnosis', 'Choices', 'Impact', 'Roadmap'];
let HEADER = '';
const setChrome = ({ sections, header }) => { if (sections) SECTIONS = sections; if (header !== undefined) HEADER = header; };
const slide = ({ n, section, appendix, title, body, source }) => `
<section class="slide">
  <div class="top">
    <div class="tracker">${appendix ? `<span class="on">Appendix ${appendix}</span>` : SECTIONS.map(s => `<span class="${s === section ? 'on' : ''}">${s}</span>`).join('')}</div>
    <div class="team">${esc(HEADER)}</div>
  </div>
  <h1>${title}</h1>
  <div class="rule"></div>
  <div class="body">${body}</div>
  <div class="footer"><span>${source}</span><span>${n}</span></div>
</section>`;
const table = (head, rows, cls = '') => `<table class="${cls}"><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
const tick = '<span class="ok">✓ Met</span>';
const cross = v => `<span class="no">${v} ✗</span>`;

const css = `
@page { size: 13.333in 7.5in; margin: 0; }
* { box-sizing: border-box; }
body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: ${C.ink}; -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #fff; }
.slide { width: 1280px; height: 720px; position: relative; overflow: hidden; page-break-after: always; break-after: page; padding: 0 40px; background: #fff; }
.top { height: 34px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 9.5px; letter-spacing: .06em; text-transform: uppercase; color: #9AA3AF; }
.tracker span { margin-right: 18px; padding-bottom: 3px; }
.tracker span.on { color: ${C.navy}; font-weight: 700; border-bottom: 2px solid ${C.navy}; }
.team { color: ${C.mute}; letter-spacing: .03em; }
h1 { font-size: 20px; line-height: 1.28; font-weight: 700; color: ${C.navy}; margin: 12px 0 0; min-height: 52px; }
.rule { height: 2px; background: ${C.navy}; margin: 8px 0 0; }
.body { position: absolute; top: 122px; left: 40px; right: 40px; bottom: 40px; }
.footer { position: absolute; bottom: 12px; left: 40px; right: 40px; font-size: 8.5px; color: ${C.mute}; display: flex; justify-content: space-between; gap: 30px; border-top: 1px solid ${C.hair}; padding-top: 5px; }
.grid { display: grid; }
.panel h3 { font-size: 10.5px; text-transform: uppercase; letter-spacing: .06em; color: ${C.navy}; margin: 0 0 6px; padding-top: 5px; border-top: 1.5px solid ${C.navy}; }
ul { margin: 0; padding-left: 16px; font-size: 13px; line-height: 1.45; }
ul li { margin-bottom: 6px; }
ul.tight { font-size: 11.5px; line-height: 1.42; } ul.tight li { margin-bottom: 3px; }
.panel + .panel { margin-top: 10px; }
.callout { background: ${C.fill}; color: ${C.navy}; font-size: 12px; line-height: 1.42; padding: 9px 12px; margin-top: 8px; }
.sm { font-size: 9.6px; color: ${C.mute}; line-height: 1.35; }
table { width: 100%; border-collapse: collapse; font-size: 11.2px; line-height: 1.32; }
th { text-align: left; font-size: 9.2px; text-transform: uppercase; letter-spacing: .04em; color: ${C.mute}; font-weight: 700; padding: 3px 5px; border-bottom: 1px solid ${C.ink2}; }
td { padding: 5px 6px; border-bottom: 1px solid #E5E7EB; vertical-align: top; }
table.num td:not(:first-child), table.num th:not(:first-child) { text-align: right; white-space: nowrap; }
table.score td:nth-child(n+2):nth-child(-n+4) { text-align: center; white-space: nowrap; }
table.score td { padding: 8px 6px; font-size: 12px; } table.score td .sm { font-size: 10px; }
.ok { color: ${C.ok}; font-weight: 700; white-space: nowrap; } .no { color: ${C.down}; }
b.up { color: ${C.up}; } b.dn { color: ${C.down}; }
.kpis { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
.kpis div { background: ${C.fill}; padding: 7px 10px; }
.kpis b { display: block; font-size: 23px; color: ${C.navy}; }
.kpis span { font-size: 10.5px; color: ${C.ink2}; }
.gloss { font-size: 10.2px; line-height: 1.45; color: ${C.ink2}; }
ol.src { margin: 0; padding-left: 0; list-style: none; font-size: 10.2px; line-height: 1.5; color: ${C.ink2}; }
`;

// Writes the HTML; with pdf: true prints the PDF; with png: true screenshots every slide to preview/sN.png
function writeDeck({ slides, outHtml, outPdf, title = 'Case competition deck', extraCss = '', pdf = false, png = false }) {
  const previewJs = `<script>const m=location.hash.match(/^#s(\\d+)$/);if(m){document.querySelectorAll('.slide').forEach((s,i)=>{if(i!==+m[1]-1)s.style.display='none'});document.body.style.overflow='hidden'}</script>`;
  fs.writeFileSync(outHtml, `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(title)}</title><style>${css}${extraCss}</style></head><body>${slides.join('\n')}${previewJs}</body></html>`);
  console.log('Wrote', outHtml);
  const exe = ['C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', '/opt/pw-browsers/chromium', '/usr/bin/chromium', '/usr/bin/google-chrome'].find(p => fs.existsSync(p));
  if (!exe && (pdf || png)) throw new Error('No Edge or Chrome found for PDF export');
  const noSb = process.getuid && process.getuid() === 0 ? ['--no-sandbox'] : []; // Chromium refuses to run as root (Linux cloud sessions) without this
  const url = 'file:///' + path.resolve(outHtml).replace(/^\//, '').replace(/\\/g, '/');
  if (pdf) { execFileSync(exe, [...noSb, '--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--run-all-compositor-stages-before-draw', `--print-to-pdf=${path.resolve(outPdf)}`, url], { stdio: 'ignore' }); console.log('Wrote', outPdf); }
  if (png) {
    const dir = path.join(path.dirname(path.resolve(outHtml)), 'preview');
    fs.mkdirSync(dir, { recursive: true });
    slides.forEach((_, i) => execFileSync(exe, [...noSb, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--window-size=1280,720', `--screenshot=${path.join(dir, `s${i + 1}.png`)}`, `${url}#s${i + 1}`], { stdio: 'ignore' }));
    console.log('Wrote previews to', dir);
  }
}

module.exports = { loadData, F, C, esc, waterfall, bubbles, gantt, setChrome, slide, table, tick, cross, css, writeDeck };
