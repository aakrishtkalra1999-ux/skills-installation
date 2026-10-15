// Starter model for a new case. Copy into <case folder>/model/build.js, then replace the example rows.
// Run: node build.js   (writes the .xlsx and ../deck/model_data.json)
const path = require('path');
const { createBook, X, R, all, P, check } = require('../../case-comp-kit/lib/model-kit');

const book = createBook();
const inp = book.sheet('Case_Data', { noteCol: 'G', widths: { A: 40, B: 8, C: 11, D: 11, E: 11, F: 11, G: 60 } });
const asm = book.sheet('Assumptions', { noteCol: 'D', widths: { A: 60, B: 8, C: 11, D: 100 } });
const out = book.sheet('Outputs', { noteCol: 'G', widths: { A: 44, B: 8, C: 11, D: 11, E: 11, F: 11, G: 60 } });

// ---- case data (blue inputs typed from the exhibits; black formulas rebuild subtotals) ----
inp.title('Case data (USD m)');
inp.header(['USD m', '', '2023', '2024', '2025', '', 'Source']);
inp.row('rev', 'Revenue', [100, 110, 120], { note: 'Exhibit 1' });
inp.row('cogs', 'Cost of sales', [70, 78, 86], { note: 'Exhibit 1' });
inp.row('gp', 'Gross profit', all(3, c => `=${R(inp, 'rev', c)}-${R(inp, 'cogs', c)}`), { total: true });
inp.row('gp_case', 'Gross profit as reported', [30, 32, 34], { note: 'Exhibit 1, for reconciliation', italic: true });

// ---- assumptions (one per row, with a reason) ----
asm.title('Assumptions');
asm.header(['Assumption', 'Unit', 'Value', 'Reason / source']);
asm.row('growth', 'Revenue growth next year', [0.05], { fmt: 'pct', key: true, note: 'Example: replace with a benchmarked figure [B?]' });

// ---- outputs ----
out.title('Outputs');
out.header(['USD m', '', '2025A', '2026F', '', '', '']);
out.row('rev', 'Revenue', [`=${X(inp, 'rev', 'E')}`, c => `=${P(c)}${out.n('rev')}*(1+${X(asm, 'growth', 'C')})`]);
out.blank();
check(out, 'chk_gp', 'Check: rebuilt gross profit = reported (should be 0)', '=' + ['C', 'D', 'E'].map(c => `ABS(${X(inp, 'gp', c)}-${X(inp, 'gp_case', c)})`).join('+'));

book.render({ xlsx: path.join(__dirname, 'Model.xlsx'), json: path.join(__dirname, '..', 'deck', 'model_data.json') })
  .then(({ errors }) => { if (errors) process.exit(1); });
