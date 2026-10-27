// Checks the built deck's text against the model: key figures present, no dashes, placeholders reported.
// Run: python3 <pptx skill>/scripts/slide_text.py final/<deck>.pptx > deck/qa/slide_text.md && node deck/verify_deck.js
const fs = require('fs');
const path = require('path');
const D = require('./model_data.json');
const txt = fs.readFileSync(path.join(__dirname, 'qa', 'slide_text.md'), 'utf8');
const pc = v => Math.round(v * 100) + '%';
const g = (s, k, c) => D[s][k][c];
const must = [
  ['Cover today 22%', pc(g('Unit_Econ', 'cover', 'E'))],
  ['Cover maize Y5', pc(g('Unit_Econ', 'cover', 'D'))],
  ['Cover veg Y5', pc(g('Unit_Econ', 'cover', 'F'))],
  ['Avg turnover', 'Rs ' + (g('Targets', 't_to', 'D') / 100).toFixed(2) + ' crore'],
  ['Federation cover', pc(g('Federation', 'f_cover', 'C'))],
  ['Members selling', pc(g('Targets', 't_sell', 'D'))],
  ['Women share', pc(g('Unit_Econ', 'women_pct', 'D'))],
  ['Maize turnover', g('Unit_Econ', 'turnover', 'D').toFixed(1)],
  ['Veg turnover', g('Unit_Econ', 'turnover', 'F').toFixed(1)],
  ['Maize volume', String(Math.round(g('Unit_Econ', 'vol', 'D')))],
  ['Veg volume', String(Math.round(g('Unit_Econ', 'vol', 'F')))],
  ['Break-even maize', 'Rs ' + (g('Unit_Econ', 'be_to', 'D') / 100).toFixed(2) + ' crore'],
  ['Matching grant per FPO', 'Rs ' + Math.round(g('Working_Capital', 'w_match', 'C')) + ' lakh'],
  ['Budget 5-yr total', '4,750'],
  ['Cohort 2 5-yr', Math.round(g('Budget', 'b_coh2', 'H')).toLocaleString('en-IN')],
  ['Cohort 1 per FPO', 'Rs ' + Math.round(g('Budget', 'c1_cost', 'H')) + ' lakh'],
  ['Cohort 2 per FPO', 'Rs ' + Math.round(g('Budget', 'c2_cost', 'H')) + ' lakh'],
  ['Per farmer', 'Rs ' + (Math.round(g('Budget', 'per_farmer', 'H') / 100) * 100).toLocaleString('en-IN')],
  ['Sensitivity SRIJAN maize', pc(g('Sensitivity', 'sell39', 'C'))],
  ['Sensitivity flood veg', pc(g('Sensitivity', 'flood', 'D'))],
];
let bad = 0;
for (const [label, s] of must) { const ok = txt.includes(s); if (!ok) bad++; console.log((ok ? 'OK  ' : 'MISS') + '  ' + label.padEnd(26) + s); }
const dashes = (txt.match(/[–—]/g) || []).length;
const holders = [...new Set(txt.match(/\[(Team name|College name|Participant \d|email \d)\]/g) || [])];
console.log(`\nMissing figures: ${bad} of ${must.length}`);
console.log(`Em or en dashes: ${dashes}`);
console.log(`Team placeholders still in deck: ${holders.length ? holders.join(', ') : 'none'}`);
const slides = (txt.match(/<!-- Slide number: \d+ -->/g) || []).length;
console.log(`Slides: ${slides} (cover + 6 main + thank you + 6 appendix expected = 14)`);
process.exit(bad || dashes ? 1 : 0);
