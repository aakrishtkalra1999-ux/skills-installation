// Generates the 5 + 2 slide consulting deck (HTML → PDF via headless Edge) from the model's exported values.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const D = JSON.parse(fs.readFileSync(path.join(__dirname, 'model_data.json'), 'utf8'));
// No Team ID was issued, so the slides stay fully anonymous; the Team Name appears only in the file name
const TEAM_NAME = process.env.TEAM_NAME || 'AJA';
const OUT_HTML = path.join(__dirname, 'deck.html');
const OUT_PDF = path.join(__dirname, '..', `${TEAM_NAME}_Armageddon2026.pdf`);

// ---------- data access & number formatting ----------
const g = (sheet, key, col) => {
  const v = D[sheet] && D[sheet][key] && D[sheet][key][col];
  if (v === undefined) throw new Error(`missing ${sheet}.${key}.${col}`);
  return v;
};
const MINUS = '−';
const fix = (v, d) => { const s = Math.abs(v).toFixed(d); return (v < 0 && Number(s) !== 0 ? MINUS : '') + Number(s).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }); };
const n0 = v => fix(v, 0);
const n1 = v => fix(v, 1);
const s0 = v => (v >= 0 ? '+' : '') + n0(v);
const s1 = v => (v >= 0 ? '+' : '') + n1(v);
const p0 = v => fix(v * 100, 0) + '%';
const p1 = v => fix(v * 100, 1) + '%';
const x1 = v => fix(v, 1) + 'x';
const x2 = v => fix(v, 2) + 'x';

// ---------- palette (validated increase/decrease pair; navy = totals/ink) ----------
const C = { navy: '#0B2545', ink: '#1A1A1A', ink2: '#4B5563', mute: '#6B7280', hair: '#D0D5DD', fill: '#EEF2F7', up: '#1F6FB2', down: '#C0504D', ghost: '#A7B0BE', ok: '#1E7B45', lightBlue: '#D6E4F2' };

// ---------- charts ----------
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
function waterfall({ w, h, items, min = 0, max, fmt = n1, labelH = 30, barFrac = 0.62, fs = 10 }) {
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
    if (prevEnd !== null) out += `<line x1="${(prevEnd.x).toFixed(1)}" x2="${x0.toFixed(1)}" y1="${y(prevEnd.v).toFixed(1)}" y2="${y(prevEnd.v).toFixed(1)}" stroke="#9AA3AF" stroke-width="0.8" stroke-dasharray="2 2"/>`;
    prevEnd = { x: x0 + bw, v: it.kind === 'total' ? it.v : b };
    const lab = it.lab !== undefined ? it.lab : (it.kind === 'total' ? fmt(it.v) : (it.v >= 0 ? '+' : '') + fmt(it.v));
    const ly = it.v < 0 && it.kind !== 'total' ? yb + fs + 2 : yt - 4;
    out += `<text x="${(x0 + bw / 2).toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" font-size="${fs}" font-weight="700" fill="${C.ink}">${esc(lab)}</text>`;
    const lines = String(it.label).split('\n');
    lines.forEach((ln, k) => { out += `<text x="${(x0 + bw / 2).toFixed(1)}" y="${(h - bottom + 12 + k * (fs + 1)).toFixed(1)}" text-anchor="middle" font-size="${fs - 1}" fill="${C.ink2}">${esc(ln)}</text>`; });
  });
  out = `<line x1="${left}" x2="${w - right}" y1="${y(0).toFixed(1)}" y2="${y(0).toFixed(1)}" stroke="${C.ink2}" stroke-width="0.8"/>` + out;
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="Arial, Helvetica, sans-serif">${out}</svg>`;
}

function bubbles({ w, h, pts, xMax, yMin, yMax }) {
  const L = 44, R = 12, T = 12, B = 36;
  const pw = w - L - R, ph = h - T - B;
  const X = v => L + pw * v / xMax, Y = v => T + ph * (1 - (v - yMin) / (yMax - yMin));
  let s = '';
  // "start now" zone (≤ 4 months) and "gated" zone (> 8 months)
  s += `<rect x="${L}" y="${T}" width="${(X(4) - L).toFixed(1)}" height="${ph}" fill="${C.fill}"/>`;
  s += `<text x="${L + 6}" y="${T + 12}" font-size="9" font-weight="700" fill="${C.navy}">START NOW</text>`;
  s += `<text x="${(X(8) + 6).toFixed(1)}" y="${T + 12}" font-size="9" font-weight="700" fill="${C.mute}">ONLY AFTER A CHECKPOINT</text>`;
  s += `<line x1="${X(8).toFixed(1)}" x2="${X(8).toFixed(1)}" y1="${T}" y2="${T + ph}" stroke="${C.hair}" stroke-dasharray="3 3"/>`;
  for (let v = Math.ceil(yMin); v <= yMax; v += 2) s += `<line x1="${L}" x2="${w - R}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" stroke="${v === 0 ? C.ink2 : '#E5E7EB'}" stroke-width="${v === 0 ? 0.8 : 0.6}"/><text x="${L - 6}" y="${(Y(v) + 3).toFixed(1)}" font-size="9" text-anchor="end" fill="${C.mute}">${v}</text>`;
  for (let v = 0; v <= xMax; v += 3) s += `<text x="${X(v).toFixed(1)}" y="${T + ph + 13}" font-size="9" text-anchor="middle" fill="${C.mute}">${v}</text>`;
  s += `<text x="${L + pw / 2}" y="${h - 6}" font-size="9.5" text-anchor="middle" fill="${C.ink2}">Months until savings start →</text>`;
  s += `<text transform="translate(11 ${T + ph / 2}) rotate(-90)" font-size="9.5" text-anchor="middle" fill="${C.ink2}">Yearly EBITDA gain, USD m →</text>`;
  pts.slice().sort((a, b) => b.r - a.r).forEach(p => {
    s += `<circle cx="${X(p.x).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="${p.r.toFixed(1)}" fill="${p.fill || C.up}" fill-opacity="0.85" stroke="#fff" stroke-width="2"/>`;
  });
  pts.forEach(p => {
    const anchor = p.anchor || 'start';
    const dx = anchor === 'start' ? p.r + 4 : anchor === 'end' ? -(p.r + 4) : 0;
    const dy = p.dy || 3;
    s += `<text x="${(X(p.x) + dx).toFixed(1)}" y="${(Y(p.y) + dy).toFixed(1)}" font-size="9.5" font-weight="700" text-anchor="${anchor}" fill="${C.ink}">${esc(p.label)}</text>`;
    s += `<text x="${(X(p.x) + dx).toFixed(1)}" y="${(Y(p.y) + dy + 10).toFixed(1)}" font-size="8.5" text-anchor="${anchor}" fill="${C.ink2}">${esc(p.sub)}</text>`;
  });
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="Arial, Helvetica, sans-serif">${s}</svg>`;
}

function gantt({ w, rows, gates }) {
  const LW = 158, T = 34, RH = 23, months = 18;
  const gridBottom = T + rows.length * RH;
  const h = gridBottom + 18; // room for gate labels under the grid
  const cw = (w - LW) / months;
  const X = m => LW + cw * (m - 1);
  let s = '';
  const phases = [[1, 3, 'STABILISE: MONTHS 1 TO 3'], [4, 9, 'PROVE: MONTHS 4 TO 9'], [10, 18, 'SCALE: MONTHS 10 TO 18']];
  phases.forEach(([a, b, t], i) => {
    s += `<rect x="${X(a).toFixed(1)}" y="0" width="${(cw * (b - a + 1) - 2).toFixed(1)}" height="15" fill="${i === 0 ? C.navy : i === 1 ? '#34557A' : '#6C87A6'}"/>`;
    s += `<text x="${(X(a) + 5).toFixed(1)}" y="11" font-size="9" font-weight="700" fill="#fff">${t}</text>`;
  });
  const ml = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D', 'J', 'F', 'M', 'A', 'M', 'J'];
  ml.forEach((t, i) => s += `<text x="${(X(i + 1) + cw / 2).toFixed(1)}" y="28" font-size="8.5" text-anchor="middle" fill="${C.mute}">${t}${i === 0 ? '26' : i === 12 ? '27' : ''}</text>`);
  rows.forEach((r, i) => { if (i % 2 === 0) s += `<rect x="0" y="${T + i * RH}" width="${w}" height="${RH}" fill="#F7F8FA"/>`; });
  // gate lines sit behind the bars so they never cut through bar text
  gates.forEach(([m]) => { const xx = X(m + 1) - 1.5; s += `<line x1="${xx.toFixed(1)}" x2="${xx.toFixed(1)}" y1="${T}" y2="${gridBottom + 4}" stroke="${C.down}" stroke-width="1.4" stroke-dasharray="4 2"/>`; });
  rows.forEach((r, i) => {
    const yy = T + i * RH;
    s += `<text x="4" y="${yy + 16}" font-size="10.5" font-weight="700" fill="${C.navy}">${esc(r.name)}</text>`;
    r.bars.forEach(([a, b, t, kind]) => {
      const x0 = X(a) + 1, bw = cw * (b - a + 1) - 3;
      const fill = kind === 'fix' ? C.navy : kind === 'bs' ? '#7A8699' : C.up;
      s += `<rect x="${x0.toFixed(1)}" y="${yy + 3}" width="${bw.toFixed(1)}" height="${RH - 6}" fill="${fill}" rx="1.5"/>`;
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

// ---------- page chrome ----------
const SECTIONS = ['Answer', 'Diagnosis', 'Choices', 'Impact', 'Roadmap'];
const slide = ({ n, section, appendix, title, body, source }) => `
<section class="slide">
  <div class="top">
    <div class="tracker">${appendix ? `<span class="on">Appendix ${appendix}</span>` : SECTIONS.map(s => `<span class="${s === section ? 'on' : ''}">${s}</span>`).join('')}</div>
    <div class="team">Ironbridge Industrial Group | Armageddon 2026</div>
  </div>
  <h1>${title}</h1>
  <div class="rule"></div>
  <div class="body">${body}</div>
  <div class="footer"><span>${source}</span><span>${n}</span></div>
</section>`;

const table = (head, rows, cls = '') => `<table class="${cls}"><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
const tick = '<span class="ok">✓ Met</span>';

// ---------- numbers used across slides ----------
const E22 = g('Case_Financials', 'ebitda', 'C'), E25 = g('Case_Financials', 'ebitda', 'F');
const decline = E22 - E25;
const br = k => g('Diagnosis', k, 'C');
const coreErosion = -(br('br_gp') + br('br_pers') + br('br_sell') + br('br_oth'));
const selfInflicted = -(br('br_dig') + br('br_ben'));
const autoDrop = -g('Diagnosis', 'br_seg_auto', 'C'), autoShare = g('Diagnosis', 'br_seg_auto', 'D');
const lev25 = g('Diagnosis', 'lev', 'F'), icov25 = g('Diagnosis', 'icov', 'F');
const fcf25 = g('Case_Financials', 'cf_fcf', 'F'), cash25 = g('Case_Financials', 'cash', 'F'), std25 = g('Case_Financials', 'std', 'F');
const invd22 = g('Diagnosis', 'invd', 'C'), invd25 = g('Diagnosis', 'invd', 'F');
const digOpex = g('Diagnosis', 'dig_tot', 'C'), digBen = g('Case_Digital', 'ben', 'F'), digNet25 = g('Diagnosis', 'dig_net', 'C');
const digOpex22 = g('Case_Financials', 'dig', 'C');
const adopt = c => g('Case_Digital', 'adopt', c);
const tgt = c => g('Diagnosis', 'sc_tgt', c), netrr = c => g('Diagnosis', 'sc_netrr', c);
const kAct = c => g('Case_Digital', 'k_act', c), kBase = c => g('Case_Digital', 'k_base', c);

const P = (k, c) => g('Projection', k, c);
// "nc" = the no-change case (current digital plan carries on, all capex requests approved)
const ncRR = P('ebitda', 'J'), planRR = P('ebitda', 'K'), roll = P('roll', 'K'), uplift = P('init', 'K');
const init26 = P('init', 'G'), initH1 = P('init', 'H');
const fcfNc = P('fcf', 'F'), fcfPlan = P('fcf', 'I');
const ndNc = P('nd', 'E'), ndPlan = P('nd', 'H'), nd25 = P('nd', 'C');
const ltmPlan = P('l_eb', 'D'), ltmCovPlan = P('l_cov', 'D'), ltmCovNc = P('l_cov', 'C');
const rcovNc = P('r_cov', 'C');
const beEb = P('be_eb', 'D');
const newNc = P('s_new', 'C'), newPlan = P('s_new', 'D');
const digNetPlan = P('h_dignet', 'C');
const digNetNc = g('Case_Digital', 'ben', 'F') - g('Case_Digital', 'rec', 'F') - g('Case_Digital', 'central', 'C');
const wcRel = P('wc', 'I');
const Sg = (k, c) => g('Segments', k, c);
const autoRR = Sg('rr', 'C'), autoM = Sg('mrr', 'C'), iemM = Sg('mrr', 'D'), smcM = Sg('mrr', 'E');
const autoNc = Sg('eb25', 'C') + Sg('roll', 'C');
const smcBE = Sg('smc_be', 'E'), smcExit = Sg('x_net', 'F');
const autoMaint = g('Assumptions', 't_auto_pl', 'C');
const Sn = (k, c) => g('Sensitivity', k, c);
const ws = i => ({ net: g('Initiatives', `ws_${i}`, 'C'), one: g('Initiatives', `ws_${i}`, 'G'), cap: g('Initiatives', `ws_${i}`, 'H') });
const WSN = ['Fix data and ways of working', 'Predictive maintenance', 'Vision and traceability', 'Energy and process control', 'Smarter purchasing', 'Pricing and automation', 'Service pilot for IEM', 'Savings given back to car makers'];
const W = [0, 1, 2, 3, 4, 5, 6, 7].map(i => ({ ...ws(i), label: WSN[i] }));
const util = c => g('Case_Ops', 'util', c);
const autoRevDrop = 1 - g('Case_Financials', 'rev_auto', 'F') / g('Case_Financials', 'rev_auto', 'D');

// months until savings start, per workstream: benefit-weighted from the initiative table
const LV = { 0: ['F3'], 1: ['S1', 'S2'], 2: ['S3', 'S4'], 3: ['N1', 'N2'], 4: ['N3'], 5: ['N4', 'N6'], 6: ['N5'] };
const mtv = i => { let a = 0, b = 0; for (const k of LV[i]) { const ben = g('Initiatives', `b_${k}`, 'C'), m = g('Initiatives', `b_${k}`, 'T'); a += ben * m; b += ben; } return a / b; };

// ---------- SLIDE 1: the answer ----------
const sl1 = slide({
  n: 1, section: 'Answer',
  title: 'Our answer: fix digital so it pays for itself, and Ironbridge passes all four turnaround tests by June 2027',
  source: 'All figures USD million. Sources: case exhibits 1 to 8 and our model. The base case assumes 75% of planned benefits arrive. "If nothing changes" means the current digital plan carries on and all capex requests are approved.',
  body: `
  <div class="grid" style="grid-template-columns: 1.12fr 1fr; gap: 26px;">
    <div>
      <div class="panel"><h3>The problem</h3>
        <ul>
          <li>EBITDA fell from <b>${n0(E22)} to ${n0(E25)}</b> between 2022 and 2025. Ironbridge now earns less than its interest bill (cover of <b>${x1(icov25)}</b>), owes <b>${n0(lev25)} times</b> its EBITDA, and has ${n0(cash25)} in cash against ${n0(std25)} of debt due this year.</li>
          <li>About <b>${n0(coreErosion)}</b> of the ${n0(decline)} lost came from the core business: car makers pushing prices down, higher input and energy costs, and rising overheads. About <b>${n0(selfInflicted)}</b> was self-inflicted: the digital programme costs ${n0(digOpex)} a year and saves only ${n0(digBen)}.</li>
          <li>The tools are not the problem. People are not using them: only ${p0(adopt('C'))} of maintenance alerts are acted on in time, planners accept just ${p0(adopt('E'))} of the AI's schedules, and 3 plants are not on the shared ERP.</li>
        </ul></div>
      <div class="panel"><h3>What we recommend: Fix, Focus, Fund</h3>
        <ul>
          <li><b>Fix:</b> switch off the AI agent in the planning tool, clean up master data, and move every plant onto one ERP. A small Digital Value Office under the CEO releases money only when checkpoints are met.</li>
          <li><b>Focus:</b> make the two working pilots pay before growing them, and aim digital at the biggest costs: energy, purchasing, passing cost increases on to customers, and back-office work.</li>
          <li><b>Fund:</b> hold back expansion spending (no plant runs above ${p0(util('D'))} of capacity), free up ${n0(wcRel)} of cash tied up in stock and unpaid invoices, and cover the gap with asset sales, a sale-and-leaseback and receivables finance.</li>
        </ul></div>
      <div class="callout">By June 2027, annual EBITDA reaches <b>${n0(planRR)}</b>, against ${n0(ncRR)} if nothing changes (<b>${s0(uplift)}</b> from our plan). The 18-month cash burn is <b>cut in half</b> (${n0(fcfPlan)} against ${n0(fcfNc)}), and Auto's margin is back to <b>${p1(autoM)}</b> from ${p1(Sg('m25', 'C'))}.</div>
    </div>
    <div>
      <div class="panel"><h3>Turnaround scorecard, June 2027</h3>
      ${table(['Test', 'Target', 'If nothing changes', 'Our plan', ''], [
    ['<b>1 Cash</b><br><span class="sm">New money needed on top of rolling over the 180</span>', 'None', `<span class="no">${n0(newNc)} ✗</span>`, `None<br><span class="sm">${n0(-newPlan)} spare</span>`, tick],
    ['<b>2 Interest</b><br><span class="sm">EBITDA ÷ interest, even if only half the benefits arrive</span>', 'At least 1.0x', `<span class="no">${x1(rcovNc)} ✗</span>`, `${x1(Sn('icov', 'C'))}`, tick],
    ['<b>3 Auto pays its way</b><br><span class="sm">Auto EBITDA against the upkeep its plants need</span>', `At least ${n1(autoMaint)}`, `<span class="no">${n1(autoNc)} ✗</span>`, `${n1(autoRR)}`, tick],
    ['<b>4 Digital pays for itself</b><br><span class="sm">What digital adds to EBITDA after its costs</span>', 'Above 0', `<span class="no">${n0(digNetNc)} ✗</span>`, `${s0(digNetPlan)}`, tick],
  ], 'score')}
      </div>
      <div class="panel" style="margin-top:10px"><h3>How annual EBITDA gets to ${n0(planRR)}</h3>
      ${waterfall({ w: 540, h: 215, max: 80, fs: 11, items: [
    { label: '2025', v: E25, kind: 'total', lab: n0(E25) },
    { label: 'One-off costs\nthat stop*', v: roll, kind: 'ghost', lab: s0(roll) },
    { label: 'If nothing\nchanges', v: ncRR, kind: 'total', fill: '#6C7A8F', lab: n0(ncRR) },
    { label: 'Our plan', v: uplift, kind: 'up', lab: s0(uplift) },
    { label: 'June 2027', v: planRR, kind: 'total', lab: n0(planRR) },
  ] })}
      <div class="sm">* 2025 set-up costs that will not repeat (Exhibit 6). They drop out either way, so we do not count them as ours.</div>
      </div>
    </div>
  </div>`,
});

// ---------- SLIDE 2: diagnosis ----------
const sl2 = slide({
  n: 2, section: 'Diagnosis',
  title: `Diagnosis: the core business was already slipping, and a digital programme that costs ${n0(digOpex)} a year but saves ${n0(digBen)} turned a profit problem into a debt crisis`,
  source: 'USD million unless stated. Sources: case exhibits 1 to 8 and our analysis. Digital savings are 2025 savings that already sit inside cost of sales (Exhibit 5).',
  body: `
  <div class="kpis">
    <div><b>${n0(lev25)}x</b><span>Debt is ${n0(lev25)} times EBITDA (2025)</span></div>
    <div><b>${x1(icov25)}</b><span>EBITDA covers only ${p0(icov25)} of the interest bill</span></div>
    <div><b>${n0(fcf25)}</b><span>Free cash flow in 2025, all funded with debt</span></div>
    <div><b>${n0(cash25)} vs ${n0(std25)}</b><span>Cash against debt due within a year</span></div>
    <div><b>${n0(invd22)} → ${n0(invd25)}</b><span>Days of stock, 2022 to 2025</span></div>
  </div>
  <div class="grid" style="grid-template-columns: 0.9fr 1.25fr; gap: 24px; margin-top: 12px;">
    <div class="panel"><h3>How EBITDA fell from ${n0(E22)} to ${n0(E25)}, USD m</h3>
      ${waterfall({ w: 480, h: 318, max: 140, labelH: 38, fs: 11, items: [
    { label: '2022', v: E22, kind: 'total' },
    { label: 'Lower gross\nprofit', v: br('br_gp') },
    { label: 'Digital\nsavings', v: br('br_ben') },
    { label: 'Digital\nrunning costs', v: br('br_dig') },
    { label: 'Staff costs', v: br('br_pers') },
    { label: 'Selling &\nsupport', v: br('br_sell') },
    { label: 'Other', v: br('br_oth') },
    { label: '2025', v: E25, kind: 'total' },
  ], fmt: n0 })}
      <div class="callout">Auto lost <b>${n0(autoDrop)}</b> of the ${n0(decline)} (${p0(autoShare)}). Without the digital costs it carries, its margin would still be only ${p1(g('Diagnosis', 'au_exm', 'C'))}. So digital explains part of Auto's fall, and car-maker pricing and lower volumes explain the rest.</div>
    </div>
    <div>
      <div class="panel"><h3>Who is right? We checked each executive's view against the numbers</h3>
      ${table(['Executive', 'Their view', 'Our verdict', 'What the numbers show'], [
    ['COO', 'Input and energy costs', '<b>Partly right</b>', `Gross profit fell ${n0(-br('br_gp'))} even with ${n0(digBen)} of digital savings. Energy costs ${n0(g('Case_Ops', 'energy', 'F'))} a year, and ${p0(g('Case_Ops', 'energy', 'E') / g('Case_Financials', 'rev_smc', 'F'))} of SMC's revenue.`],
    ['Auto sales head', 'Car makers\' pricing and demand', '<b>Right</b>', `Auto EBITDA fell from ${n0(g('Case_Financials', 'eb_auto', 'C'))} to ${n0(g('Case_Financials', 'eb_auto', 'F'))}. Revenue is down ${p0(autoRevDrop)} from its 2023 peak.`],
    ['Plant managers', 'Tools used unevenly', '<b>Right, and this is the root cause</b>', `Only ${p0(adopt('C'))} of alerts closed in time. ${p0(adopt('D'))} of vision rejects re-checked by hand. ${p0(adopt('E'))} of AI schedules accepted.`],
    ['Finance', 'Programme cost', '<b>Right</b>', `Digital running costs rose from ${n0(digOpex22)} to ${n0(digOpex)} against ${n0(digBen)} of savings: a net loss of ${n0(-digNet25)} on EBITDA of ${n0(E25)}.`],
  ], 'verdict')}
      </div>
      <div class="panel" style="margin-top:10px"><h3>The three pilots: fix two, stop one</h3>
      ${table(['Pilot', 'Share of target reached', 'Savings minus running cost', 'What held it back', 'Our call'], [
    ['Predictive maintenance<br><span class="sm">150 machines</span>', `${p0(tgt('C'))}<br><span class="sm">downtime ${p0(kBase('C'))} → ${p0(kAct('C'))}</span>`, s0(netrr('C')), 'Alerts not linked to work orders; too few technicians', '<b>Fix, then grow</b>'],
    ['Vision inspection<br><span class="sm">8 lines</span>', `${p0(tgt('D'))}<br><span class="sm">scrap ${p1(kBase('D'))} → ${p1(kAct('D'))}</span>`, s0(netrr('D')), 'Needs recalibrating whenever a part spec changes', '<b>Fix, then grow where customers need it</b>'],
    ['AI-agent supply-chain planning<br><span class="sm">3 plants</span>', `Went backwards<br><span class="sm">stock ${n0(kBase('E'))} → ${n0(kAct('E'))} days</span>`, s0(netrr('E')), 'Messy master data; plants on separate systems', '<b>Switch off the AI agent and fix the data first</b>'],
  ], 'pilot')}
      </div>
    </div>
  </div>`,
});

// ---------- SLIDE 3: choices ----------
const bubblePts = [0, 1, 2, 3, 4, 5, 6].map(i => {
  const inv = W[i].one + W[i].cap;
  return { label: W[i].label, sub: `${s1(W[i].net)} a year, costs ${n0(inv)}`, x: mtv(i), y: W[i].net, r: 5 + Math.sqrt(inv) * 2.4 };
});
// label placement to avoid collisions
const place = { 0: { anchor: 'start' }, 1: { anchor: 'start', dy: 14 }, 2: { anchor: 'start', dy: -6 }, 3: { anchor: 'start' }, 4: { anchor: 'start', dy: -2 }, 5: { anchor: 'start' }, 6: { anchor: 'end', dy: 24 } };
bubblePts.forEach((p, i) => Object.assign(p, place[i]));
const sl3 = slide({
  n: 3, section: 'Choices',
  title: 'Strategy: stop what does not pay, fix what works, and aim digital at the biggest costs, with a separate plan for each business',
  source: 'USD million unless stated. Annual EBITDA gain at June 2027 after running costs, assuming 75% of benefits arrive. Bubble size shows 18-month spend (set-up costs plus capex). Sources: our model; benchmarks in Appendix 2.',
  body: `
  <div class="grid" style="grid-template-columns: 1fr 1.08fr; gap: 24px;">
    <div class="panel"><h3>Seven workstreams, ranked by value and speed</h3>
      ${bubbles({ w: 575, h: 405, xMax: 12, yMin: -1, yMax: 9, pts: bubblePts })}
      <div class="callout">Five of the seven start in month 1, and six within three months. The quickest savings need little spending: passing on costs and smarter purchasing need none, and energy meters cost only 3. Growth steps get money only after a checkpoint is passed.</div>
    </div>
    <div>
      <div class="panel"><h3>What we stop, fix, grow and start</h3>
      ${table(['', 'What', 'Why'], [
    ['<b class="dn">Stop</b>', 'The AI agent in the planning tool. Expansion spending, cut from 25 to 10 a year. Vision on SMC\'s batch lines.', `The AI agent loses ${n0(-netrr('E'))} a year and stock went up. No plant runs above ${p0(util('D'))} of capacity.`],
    ['<b>Fix</b>', 'Master data and ERP for 3 plants. Linking maintenance alerts to work orders. Recalibrating vision.', 'Both working pilots stalled at about half their target because of data and adoption, not the technology.'],
    ['<b class="up">Grow, after a checkpoint</b>', '150 more connected machines, mostly in IEM. Traceability on 3 Auto lines for one car maker.', 'Money released only after the month-6 and month-9 checkpoints.'],
    ['<b class="up">Start</b>', 'Energy management. Smarter purchasing. Cost pass-through clauses and a quoting tool. Automating back-office and customer-support work. A service pilot for IEM customers.', 'These go after energy, bought-in materials and overheads, where the core business lost ground.'],
  ], 'sfs')}
      </div>
      <div class="panel" style="margin-top:10px"><h3>Shared basics for the Group, a separate plan for each business</h3>
      ${table(['Business', 'Plan', 'EBITDA margin, 2025 → June 2027'], [
    ['<b>Whole Group</b>', 'Data and ERP, the Digital Value Office, energy, purchasing and back-office automation', `${p1(g('Segments', 'm25', 'F'))} → ${p1(g('Segments', 'mrr', 'F'))}`],
    ['<b>Auto</b>', 'Add cost-index clauses when car-maker contracts renew. Offer part-level traceability and carbon data per part, which European car makers ask for.', `${p1(Sg('m25', 'C'))} → <b>${p1(autoM)}</b>`],
    ['<b>IEM</b>', `Predictive maintenance adds output (plants at ${p0(util('D'))} of capacity). A service pilot starts a steady new revenue line.`, `${p1(Sg('m25', 'D'))} → <b>${p1(iemM)}</b>`],
    ['<b>SMC</b>', `Batch process control and 1% higher prices. <b>Month-6 checkpoint: fix or exit.</b> It needs ${p1(smcBE)} higher prices to break even.`, `${p1(Sg('m25', 'E'))} → <b>${p1(smcM)}</b>`],
  ], 'plays')}
      </div>
    </div>
  </div>`,
});

// ---------- SLIDE 4: impact ----------
const order = [5, 3, 4, 2, 1, 0, 6, 7];
const WSHORT = ['Data &\nprocesses', 'Maintenance', 'Vision &\ntraceability', 'Energy &\nprocess', 'Purchasing', 'Pricing &\nautomation', 'Service\npilot', 'Given back\nto car makers'];
const wfItems = [{ label: '2025', v: E25, kind: 'total' }, { label: 'One-off\ncosts that\nstop*', v: roll, kind: 'ghost' }, { label: 'If nothing\nchanges', v: ncRR, kind: 'total', fill: '#6C7A8F' }]
  .concat(order.map(i => ({ label: WSHORT[i], v: W[i].net })))
  .concat([{ label: 'June 2027', v: planRR, kind: 'total' }]);
const sl4 = slide({
  n: 4, section: 'Impact',
  title: `Impact: our plan adds ${n0(uplift)} to annual EBITDA and halves the cash burn. It needs no new money and still covers interest if only half the benefits arrive`,
  source: 'USD million unless stated. Base case: 75% of planned benefits arrive, savings given back to car makers are taken out, and the 180 and any new borrowing pay an interest rate 3% higher. Source: our model (Appendix 1).',
  body: `
  <div class="grid" style="grid-template-columns: 1.35fr 1fr; gap: 24px;">
    <div class="panel"><h3>How annual EBITDA reaches ${n0(planRR)} by June 2027, USD m</h3>
      ${waterfall({ w: 710, h: 380, max: 80, labelH: 46, fs: 11, fmt: n0, items: wfItems })}
      <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 6px;">
        <div class="callout"><b>Costs come first:</b> ${s1(init26)} in 2026 and ${s1(initH1)} in the first half of 2027, then ${s0(uplift)} a year from June 2027. Checkpoints limit the risk.</div>
        <div class="callout"><b>What we do not count:</b> the ${n0(roll)} of 2025 one-off costs that stop anyway (*Exhibit 6), and the ${n0(digBen)} of 2025 savings already in the numbers.</div>
      </div>
    </div>
    <div>
      <div class="panel"><h3>Where the cash comes from over 18 months, USD m</h3>
      ${table(['', 'If nothing changes', 'Our plan'], [
    ['Cash shortfall from running the business', n0(P('u_fcf', 'C')), n0(P('u_fcf', 'D'))],
    ['Short-term debt due', n0(P('u_std', 'C')), n0(P('u_std', 'D'))],
    ['<b>Total needed</b>', `<b>${n0(P('u_tot', 'C'))}</b>`, `<b>${n0(P('u_tot', 'D'))}</b>`],
    ['Roll over the short-term debt (at a 3% higher rate)', n0(P('s_roll', 'C')), n0(P('s_roll', 'D'))],
    ['Sell non-core licences', n0(P('s_disp', 'C')), n0(P('s_disp', 'D'))],
    ['Sale-and-leaseback of property', n0(P('s_slb', 'C')), n0(P('s_slb', 'D'))],
    ['Receivables finance', n0(P('s_scf', 'C')), n0(P('s_scf', 'D'))],
    ['<b>New money still needed</b>', `<b class="dn">${n0(newNc)}</b>`, `<b class="up">None (${n0(-newPlan)} spare)</b>`],
  ], 'su')}
      </div>
      <div class="panel" style="margin-top:10px"><h3>What if less is delivered?</h3>
      ${table(['', 'Half arrives', 'Base case', 'All arrives'], [
    ['Share of benefits', p0(Sn('f', 'C')), p0(Sn('f', 'D')), p0(Sn('f', 'E'))],
    ['Annual EBITDA, June 2027', n0(Sn('eb', 'C')), `<b>${n0(Sn('eb', 'D'))}</b>`, n0(Sn('eb', 'E'))],
    ['EBITDA ÷ interest', x1(Sn('icov', 'C')), `<b>${x1(Sn('icov', 'D'))}</b>`, x1(Sn('icov', 'E'))],
  ], 'rob')}
      <div class="sm" style="margin-top:6px">Lenders look at the last 12 months: EBITDA of ${n0(ltmPlan)} and interest cover of ${x1(ltmCovPlan)} (${x1(ltmCovNc)} if nothing changes). Net debt ends at ${n0(ndPlan)}, against ${n0(ndNc)} if nothing changes and ${n0(nd25)} today. Debt only stops growing once EBITDA reaches about ${n0(beEb)}, so repairing the balance sheet carries on after 2027.</div>
      </div>
    </div>
  </div>`,
});

// ---------- SLIDE 5: roadmap ----------
const ganttRows = [
  { name: 'Data & processes', bars: [[1, 3, 'Value Office set up; AI agent off', 'fix'], [4, 16, 'ERP and master data, 3 plants one by one', 'fix']] },
  { name: 'Maintenance', bars: [[1, 6, 'Link alerts to work orders', 'fix'], [7, 18, 'Add 150 machines, mostly in IEM', 'scale']] },
  { name: 'Vision & traceability', bars: [[1, 6, 'Retrain and recalibrate 8 lines', 'fix'], [10, 18, 'Traceability on 3 Auto lines for 1 car maker', 'scale']] },
  { name: 'Energy & process', bars: [[1, 4, 'Install energy meters', 'fix'], [5, 18, 'Cut energy use; SMC process control from month 7', 'scale']] },
  { name: 'Purchasing', bars: [[1, 3, 'Map all spending', 'fix'], [4, 18, 'Renegotiate supplier contracts, category by category', 'scale']] },
  { name: 'Pricing & automation', bars: [[2, 18, 'Cost-index clauses at each contract renewal, quoting tool, support and back-office automation', 'scale']] },
  { name: 'Service pilot (IEM)', bars: [[4, 8, 'Design the offer', 'fix'], [9, 18, 'Pilot service contracts on installed pumps and drives', 'scale']] },
  { name: 'Balance sheet', bars: [[1, 3, 'Weekly cash control; lenders', 'bs'], [4, 12, 'Roll over the 180, sell licences, leaseback, receivables finance', 'bs']] },
];
const sl5 = slide({
  n: 5, section: 'Roadmap',
  title: 'Roadmap: three phases over 18 months with two checkpoints. Business heads own the results, and money stops wherever a checkpoint is missed',
  source: 'USD million unless stated. Month 1 = January 2026. Risk sizes come from our model. Source: our analysis.',
  body: `
  <div class="panel"><h3>18-month plan, January 2026 to June 2027</h3>
    ${gantt({ w: 1200, rows: ganttRows, gates: [[6, 'CHECKPOINT 1, JUNE 2026'], [9, 'CHECKPOINT 2, SEPT 2026']] })}
    <div class="gates"><b class="dn">Checkpoint 1 (month 6):</b> at least 85% of maintenance alerts closed on time, no more than 25% of vision rejects re-checked by hand, energy savings measured, and SMC prices on track for +${p1(smcBE)} (if not, start the exit). <b class="dn">Checkpoint 2 (month 9):</b> a named car maker needs traceability, the second batch of machines is released, and interest cover over the last 12 months is heading to 1.0x.</div>
  </div>
  <div class="grid" style="grid-template-columns: 0.85fr 1.15fr; gap: 24px; margin-top: 10px;">
    <div class="panel"><h3>Who runs it</h3>
      <ul class="tight">
        <li>A <b>Chief Digital Officer</b> and a small <b>Digital Value Office</b> (about 5 people) report to the CEO. They track savings and release money only at checkpoints.</li>
        <li><b>Each business head signs up to their savings target.</b> Every workstream is led by someone from the business, not from IT.</li>
        <li>The <b>central digital team of 24</b> moves into the workstreams. Each plant gets a digital champion, and we add technicians to act on maintenance alerts.</li>
        <li><b>Week 1:</b> hire the CDO, freeze expansion spending, start weekly cash control, and give notice on the AI agent.</li>
        <li><b>18-month budget:</b> ${n0(g('Initiatives', 'ws_tot', 'G'))} of set-up costs and ${n0(g('Initiatives', 'ws_tot', 'H'))} of digital capex (30 was requested), released in stages.</li>
      </ul>
    </div>
    <div class="panel"><h3>Main risks, warning signs and our response</h3>
    ${table(['Risk', 'Warning sign or impact', 'Response'], [
    ['Lenders will not roll over the 180', 'Last-12-month interest cover below 1.0x in early 2027', 'Talk to lenders from month 1; line up the leaseback and receivables finance early'],
    ['People still do not use the tools', 'A checkpoint target is missed', 'Stop the money, change the owner, reset the savings target'],
    ['Car makers cut prices or volumes', `1% lower prices cost ${n1(-Sn('sh_price', 'D'))} of EBITDA; 5% lower volume costs ${n1(-Sn('sh_vol', 'D'))}`, 'Cost-index clauses; traceability to keep customers'],
    ['Energy prices rise 10%', `Costs ${n1(-Sn('sh_energy', 'D'))} of EBITDA`, 'Energy meters, cheaper-hour scheduling, energy index in contracts'],
    ['Borrowing costs even more', `A 2% higher rate takes cover to ${x1(Sn('sh_rate', 'F'))}`, 'Offer security to lenders; start talks early'],
    ['SMC misses its checkpoint', `Prices up less than ${p1(smcBE)}`, `Exit adds only ${n1(smcExit)} of EBITDA; the gain is cash and focus`],
  ], 'risk')}
    </div>
  </div>`,
});

// ---------- APPENDIX 1: financial workings ----------
const pc = (k, cols, f = n0) => cols.map(c => f(P(k, c)));
const LEVROWS = ['F1', 'F2', 'F3', 'S1', 'S2', 'S3', 'S4', 'N1', 'N2', 'N3', 'N4', 'N6', 'N5', 'O2', 'O3'];
const PLAIN = {
  F1: 'Master data and ERP (3 plants)', F2: 'Digital Value Office and CDO', F3: 'Switch off the AI agent',
  S1: 'Maintenance: alerts to work orders', S2: 'Maintenance: 150 more machines*', S3: 'Vision: retrain 8 lines',
  S4: 'Vision: traceability on 3 lines*', N1: 'Energy management', N2: 'SMC process control*',
  N3: 'Smarter purchasing', N4: 'Cost pass-through and quoting', N6: 'Back-office automation', N5: 'Service pilot for IEM',
  O2: 'Less: purchasing savings to car makers', O3: 'Less: yearly price cuts to car makers',
};
const a1 = slide({
  n: 6, appendix: 1,
  title: 'Appendix 1: financial workings. Our projections and the savings from each initiative tie back to exhibits 1 to 8, and all 17 model checks pass',
  source: 'USD million. Interest is the 2025 rate (5.4%) on debt at the start of each period, plus 3% on top for the rolled-over 180 and for new borrowing. No cash tax, because pre-tax profit stays negative in every period.',
  body: `
  <div class="grid" style="grid-template-columns: 1fr 1.12fr; gap: 20px;">
    <div>
      <div class="panel"><h3>Projection: if nothing changes vs our plan</h3>
      ${table(['', '2025', 'No change<br>2026', 'No change<br>H1 2027', 'Plan<br>2026', 'Plan<br>H1 2027', 'No change<br>annual*', 'Plan<br>annual*'], [
    ['EBITDA', ...pc('ebitda', ['C', 'D', 'E', 'G', 'H', 'J', 'K'])],
    ['Interest', ...pc('int', ['C', 'D', 'E', 'G', 'H', 'J', 'K'])],
    ['Working capital', ...pc('wc', ['C', 'D', 'E', 'G', 'H']), '', ''],
    ['Capex', ...pc('capex', ['C', 'D', 'E', 'G', 'H']), '', ''],
    ['<b>Free cash flow</b>', ...pc('fcf', ['C', 'D', 'E', 'G', 'H']).map(v => `<b>${v}</b>`), '', ''],
    ['Net debt at end', ...pc('nd', ['C', 'D', 'E', 'G', 'H', 'J', 'K'])],
    ['EBITDA ÷ interest', ...pc('icov', ['C', 'D', 'E', 'G', 'H', 'J', 'K'], x1)],
  ], 'num fin')}
      <div class="sm">* Annual rate at June 2027.</div>
      </div>
      <div class="panel" style="margin-top:8px"><h3>Spending and cash released over 18 months</h3>
      ${table(['', 'No change', 'Plan', 'Why'], [
    ['Maintenance capex', n0(-P('cx_m', 'F')), n0(-P('cx_m', 'I')), 'Kept at 45 a year. It is already below depreciation of 50.'],
    ['Expansion capex', n0(-P('cx_e', 'F')), n0(-P('cx_e', 'I')), `Plants run at ${p0(util('E'))} to ${p0(util('D'))} of capacity, so none needs more.`],
    ['Digital capex', n0(-P('cx_d', 'F')), n0(-P('cx_d', 'I')), 'Requests of 8, 12 and 10 become 8, 4 and 10 (moved to ERP), plus 7 for new work.'],
    ['Cash released from stock and invoices', '0', n0(wcRel), `Stock from ${n0(invd25)} to ${n0(g('Assumptions', 'w_inv27', 'C'))} days after the data fix; customers pay in ${n0(g('Assumptions', 'w_dso27', 'C'))} days instead of ${n0(g('Diagnosis', 'dso', 'F'))}.`],
  ], 'num2')}
      </div>
      <div class="panel" style="margin-top:8px"><h3>Terms we use</h3>
      <div class="gloss"><b>If nothing changes:</b> the current digital plan carries on and all capex requests are approved. <b>Annual rate:</b> the yearly level of EBITDA at June 2027. <b>Last 12 months:</b> the period lenders look at. <b>Base case:</b> 75% of planned benefits arrive. <b>Savings given back:</b> savings that flow to car makers through cost-index clauses and yearly price cuts. <b>OEM:</b> vehicle maker, Auto's customer. <b>IEM:</b> Industrial Equipment & Machinery. <b>SMC:</b> Specialty Materials & Coatings.</div>
      </div>
    </div>
    <div class="panel"><h3>Savings by initiative (base case, 75% of benefits)</h3>
    ${table(['Initiative (per year unless stated)', 'Savings', 'Running cost', 'Net', '2026', 'H1 2027', 'Set-up', 'Capex'], LEVROWS.map(k => [
    PLAIN[k],
    n1(g('Initiatives', `b_${k}`, 'C')), n1(g('Initiatives', `b_${k}`, 'D')), `<b>${n1(g('Initiatives', `b_${k}`, 'E'))}</b>`,
    n1(g('Initiatives', `b_${k}`, 'N')), n1(g('Initiatives', `b_${k}`, 'O')), n1(g('Initiatives', `b_${k}`, 'J')), n1(g('Initiatives', `b_${k}`, 'L')),
  ]).concat([['<b>Total</b>', ...['C', 'D', 'E', 'N', 'O', 'J', 'L'].map(c => `<b>${n1(g('Initiatives', 'b_tot', c))}</b>`)]]), 'num ini')}
    <div class="sm" style="margin-top:4px">* Only after a checkpoint is passed. Switching off the AI agent removes a contract cost, so we count it in full. Its negative set-up cost is the planning-tool work we no longer need (3.0) minus 0.5 to switch off. The 2.0 of 2026 contract commitments is still paid.</div>
    </div>
  </div>`,
});

// ---------- APPENDIX 2: assumptions & sources ----------
const A = k => g('Assumptions', k, 'C');
const a2 = slide({
  n: 7, appendix: 2,
  title: 'Appendix 2: assumptions and sources. We set every benchmark-based saving well below the published range, then assume only 75% of it arrives',
  source: 'USD million unless stated. All sources checked on 30 September 2026. Case data comes first; benchmarks only fill gaps the case leaves.',
  body: `
  <div class="grid" style="grid-template-columns: 1.3fr 1fr; gap: 20px;">
    <div class="panel"><h3>Our assumptions vs outside benchmarks</h3>
    ${table(['Lever', 'Our assumption', 'Benchmark', 'Source'], [
    ['Predictive maintenance', `Downtime from ${p0(kAct('C'))} to ${p1(A('s1_tgt'))} on today's machines; ${n0(A('s2_assets'))} more machines at ${p0(A('s2_real'))} of the pilot's savings`, 'Downtime falls 30% to 50%', 'B1'],
    ['Vision inspection', `Scrap from ${p1(kAct('D'))} to ${p1(A('s3_tgt'))} on the same lines; new lines at half the pilot's savings`, 'Pilot results only (Exhibit 7)', 'Case'],
    ['Energy', `${p0(A('n1_auto'))} lower energy use in Auto and SMC, ${p0(A('n1_iem'))} in IEM, over 18 months`, 'ISO 50001 plants save about 4.1% in year 1; process control up to 10%', 'B3, B2'],
    ['SMC process control', `${p0(A('n2_yield'))} better yield on materials (energy not included, so no double count)`, 'Up to 5% better yield', 'B2'],
    ['Purchasing', `${fix(A('n3_sav') * 100, 2)}% saved on about ${n0(g('Initiatives', 'a_N3', 'C') / A('n3_sav'))} of spend`, '6% to 12% savings seen in chemicals', 'B4'],
    ['Cost pass-through and quoting', `Prices up ${p1(A('n4_auto'))} in Auto and IEM, ${p1(A('n4_smc'))} in SMC`, 'Pricing programmes add 2 to 7 points of margin', 'B5'],
    ['Back-office automation', `${p0(A('n6_sav'))} of ${n0(A('n6_base'))} of staff, selling and support costs, as people leave and are not replaced`, 'GenAI cuts customer-care costs by 30% to 45%', 'B8'],
    ['IEM service', `Service revenue of ${p0(A('n5_rev'))} of IEM sales at a ${p0(A('n5_margin'))} margin`, 'Aftermarket services earn 25% against 10% for new equipment', 'B6'],
    ['Stock', `From ${n0(invd25)} to ${n0(A('w_inv27'))} days, only after the data fix`, '30% cut in a supply-chain case', 'B7'],
    ['Savings given back', `Half of Auto's purchasing savings and a quarter of its productivity savings go to car makers`, 'Cost-index clauses and yearly price cuts', 'Our view'],
    ['Funding', `Sell licences for ${n0(A('fs_disp'))} (19 and 31 were sold in 2024 and 2025), leaseback ${n0(A('fs_slb'))} (about 6% of property), receivables finance ${n0(A('fs_scf'))} (about 15% of receivables)`, 'Exhibits 2 and 4', 'Case'],
    ['Auto upkeep test', `Auto's share of maintenance capex: 45 × 5 of 11 plants = ${n1(autoMaint)}`, 'Exhibits 4 and 8', 'Case'],
    ['Finance', `Interest at ${p1(A('a_rate'))} (the 2025 rate) plus 3% on top for new and rolled-over debt; cash kept at ${n0(A('a_mincash'))}; revenue and core margin held flat`, 'Exhibits 1 and 2', 'Case'],
  ], 'asm')}
    </div>
    <div>
      <div class="panel"><h3>How we stay consistent with the case</h3>
      <ul class="tight">
        <li>The ${n0(roll)} of one-off costs that stop is Exhibit 6's set-up spend (7 + 8 + 8). Only ${n0(g('Diagnosis', 'rem26', 'C'))} of remaining work carries into 2026, and it is in both cases.</li>
        <li>The ${n0(digBen)} of 2025 savings is already in cost of sales, so we never count it again (Exhibit 5).</li>
        <li>The ${n0(wcRel)} of cash from stock and invoices is one-off, and kept apart from yearly EBITDA (Exhibit 7).</li>
        <li>The vision pilot's ${n0(g('Case_Digital', 'ben', 'D'))} of savings from a ${n1((kBase('D') - kAct('D')) * 100)}-point scrap cut would mean ${n0(g('Diagnosis', 'vis_cov', 'C'))} of production on 8 lines, ${p0(g('Diagnosis', 'vis_share', 'C'))} of the Group's cost of sales. That cannot be right, so we do not scale it up that way.</li>
        <li>Maintenance capex and the ${n0(g('Case_Digital', 'central', 'C'))} of central digital cost stay flat, because the case asks for a reason to cut them.</li>
      </ul>
      </div>
      <div class="panel" style="margin-top:8px"><h3>Sources</h3>
      <ol class="src">
        <li>[B1] McKinsey, "Manufacturing: Analytics unleashes productivity and profitability", Aug 2017.</li>
        <li>[B2] McKinsey, "The potential of advanced process controls in energy and materials", Nov 2020.</li>
        <li>[B3] Fitzgerald et al. (LBNL), "Deeper and persistent energy savings and carbon dioxide reductions achieved through ISO 50001 in the manufacturing sector", 2023.</li>
        <li>[B4] McKinsey, "Technology-enabled procurement for chemical companies", Oct 2019.</li>
        <li>[B5] McKinsey, "Turning pricing power into profit", Mar 2015.</li>
        <li>[B6] McKinsey, "Industrial aftermarket services: Growing the core", Jul 2017.</li>
        <li>[B7] McKinsey, "Supply Chain 4.0: Opportunities to use your supply chain for differentiation", May 2019.</li>
        <li>[B8] McKinsey, "The economic potential of generative AI: The next productivity frontier", Jun 2023.</li>
      </ol>
      </div>
    </div>
  </div>`,
});

// ---------- document ----------
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
ul.tight { font-size: 11.5px; line-height: 1.42; }
ul.tight li { margin-bottom: 3px; }
.panel + .panel { margin-top: 10px; }
.callout { background: ${C.fill}; color: ${C.navy}; font-size: 12px; line-height: 1.42; padding: 9px 12px; margin-top: 8px; }
.sm { font-size: 9.6px; color: ${C.mute}; line-height: 1.35; }
table { width: 100%; border-collapse: collapse; font-size: 11.2px; line-height: 1.32; }
th { text-align: left; font-size: 9.2px; text-transform: uppercase; letter-spacing: .04em; color: ${C.mute}; font-weight: 700; padding: 3px 5px; border-bottom: 1px solid ${C.ink2}; }
td { padding: 5px 6px; border-bottom: 1px solid #E5E7EB; vertical-align: top; }
table.score td:nth-child(2), table.score td:nth-child(3), table.score td:nth-child(4) { text-align: center; white-space: nowrap; }
table.score td:nth-child(4) { font-weight: 700; color: ${C.navy}; }
table.score td { padding: 8px 6px; font-size: 12px; } table.score td .sm { font-size: 10px; } .no { color: ${C.down}; }
.ok { color: ${C.ok}; font-weight: 700; white-space: nowrap; }
b.up { color: ${C.up}; } b.dn { color: ${C.down}; }
.kpis { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
.kpis div { background: ${C.fill}; padding: 7px 10px; }
.kpis b { display: block; font-size: 23px; color: ${C.navy}; }
.kpis span { font-size: 10.5px; color: ${C.ink2}; }
table.verdict td:nth-child(1) { width: 17%; font-weight: 700; } table.verdict td:nth-child(3) { width: 17%; color: ${C.navy}; }
table.pilot td:nth-child(2), table.pilot td:nth-child(3) { text-align: center; } table.pilot td:nth-child(3) { font-weight: 700; }
table.sfs td:nth-child(1) { width: 14%; } table.sfs td:nth-child(3) { width: 36%; color: ${C.ink2}; }
table.plays td:nth-child(1) { width: 15%; } table.plays td:nth-child(3) { width: 26%; white-space: nowrap; }
table.su td:nth-child(2), table.su td:nth-child(3), table.rob td:not(:first-child) { text-align: right; }
table.num td:not(:first-child), table.num th:not(:first-child) { text-align: right; white-space: nowrap; }
table.num2 td:nth-child(2), table.num2 td:nth-child(3) { text-align: right; }
table.fin td, table.ini td { padding: 4.5px 6px; font-size: 10.6px; }
table.risk td { font-size: 10.4px; padding: 4px 6px; } table.risk td:nth-child(1) { font-weight: 700; width: 25%; }
table.asm td { font-size: 10.6px; padding: 5px 6px; } table.asm td:nth-child(1) { font-weight: 700; width: 19%; } table.asm td:nth-child(4) { white-space: nowrap; color: ${C.mute}; }
.gates { font-size: 10.6px; line-height: 1.45; margin-top: 6px; color: ${C.ink}; }
.gloss { font-size: 10.2px; line-height: 1.45; color: ${C.ink2}; }
ol.src { margin: 0; padding-left: 0; list-style: none; font-size: 10.2px; line-height: 1.5; color: ${C.ink2}; }
`;
// #sN in the URL shows only slide N (used for per-slide preview screenshots; printing ignores it)
const previewJs = `<script>const m=location.hash.match(/^#s(\\d)$/);if(m){document.querySelectorAll('.slide').forEach((s,i)=>{if(i!==+m[1]-1)s.style.display='none'});document.body.style.overflow='hidden'}</script>`;
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Ironbridge Industrial Group, Armageddon 2026</title><style>${css}</style></head><body>${[sl1, sl2, sl3, sl4, sl5, a1, a2].join('\n')}${previewJs}</body></html>`;
fs.writeFileSync(OUT_HTML, html);
console.log('Wrote', OUT_HTML);

// ---------- print to PDF with headless Edge (Chrome fallback) ----------
const browsers = ['C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'];
const exe = browsers.find(p => fs.existsSync(p));
if (process.argv.includes('--pdf') && exe) {
  execFileSync(exe, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--run-all-compositor-stages-before-draw', `--print-to-pdf=${OUT_PDF}`, 'file:///' + OUT_HTML.replace(/\\/g, '/')], { stdio: 'inherit' });
  console.log('Wrote', OUT_PDF);
}
if (process.argv.includes('--png') && exe) {
  const dir = path.join(__dirname, 'preview');
  fs.mkdirSync(dir, { recursive: true });
  for (let i = 1; i <= 7; i++) {
    execFileSync(exe, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--window-size=1280,720', `--screenshot=${path.join(dir, `s${i}.png`)}`, 'file:///' + OUT_HTML.replace(/\\/g, '/') + `#s${i}`], { stdio: 'ignore' });
  }
  console.log('Wrote previews to', dir);
}
