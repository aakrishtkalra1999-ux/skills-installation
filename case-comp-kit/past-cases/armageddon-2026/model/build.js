// Builds the Ironbridge (Armageddon 2026) model: formulas are evaluated with HyperFormula so the
// workbook ships with cached values, then written with ExcelJS (Excel recalculates on open).
const ExcelJS = require('exceljs');
const { HyperFormula } = require('hyperformula');
const path = require('path');

const OUT = path.join(__dirname, '..', 'Ironbridge_Model.xlsx');

// ---------- tiny sheet DSL ----------
const L = i => String.fromCharCode(65 + i);
const idx = c => c.charCodeAt(0) - 65;
const P = c => String.fromCharCode(c.charCodeAt(0) - 1);
const all = (n, fn) => Array.from({ length: n }, () => fn);

class Sheet {
  constructor(name, o = {}) {
    this.name = name; this.items = []; this.keys = {};
    this.noteCol = o.noteCol || 'H'; this.widths = o.widths || {}; this.tab = o.tab;
  }
  add(it) { this.items.push(it); it.n = this.items.length; return it; }
  title(t) { this.add({ kind: 'title', t }); }
  sub(t) { this.add({ kind: 'sub', t }); }
  note(t) { this.add({ kind: 'note', t }); }
  blank() { this.add({ kind: 'blank' }); }
  header(cells) { this.add({ kind: 'header', cells }); }
  row(key, label, vals, o = {}) {
    const it = this.add({ kind: 'row', key, label, vals, o });
    if (key) { if (this.keys[key]) throw new Error(`${this.name}: duplicate key ${key}`); this.keys[key] = it; }
    return it;
  }
  n(key) { const it = this.keys[key]; if (!it) throw new Error(`${this.name}: missing key ${key}`); return it.n; }
}
const X = (s, k, c) => `${s.name}!$${c}$${s.n(k)}`; // absolute cross-sheet ref
const R = (s, k, c) => `${c}${s.n(k)}`;              // local relative ref

const sheets = [];
const mk = (name, o) => { const s = new Sheet(name, o); sheets.push(s); return s; };

// Sheet order in the workbook
const cov = mk('Cover', { noteCol: 'F', widths: { A: 52, B: 10, C: 16, D: 16, E: 12, F: 70 } });
const cf = mk('Case_Financials', { noteCol: 'G', widths: { A: 44, B: 8, C: 11, D: 11, E: 11, F: 11, G: 70 } });
const cd = mk('Case_Digital', { noteCol: 'G', widths: { A: 50, B: 8, C: 14, D: 14, E: 14, F: 12, G: 70 } });
const co = mk('Case_Ops', { noteCol: 'G', widths: { A: 40, B: 8, C: 12, D: 12, E: 12, F: 12, G: 60 } });
const dg = mk('Diagnosis', { noteCol: 'H', widths: { A: 52, B: 8, C: 12, D: 12, E: 12, F: 12, G: 4, H: 80 } });
const as = mk('Assumptions', { noteCol: 'D', widths: { A: 66, B: 9, C: 11, D: 120 } });
const ini = mk('Initiatives', { noteCol: 'Y', widths: { A: 50, B: 12, C: 10, D: 10, E: 10, F: 9, G: 9, H: 9, I: 9, J: 10, K: 9, L: 9, M: 9, N: 10, O: 10, P: 10, Q: 9, R: 9, S: 9, T: 9, U: 8, V: 8, W: 8, X: 8, Y: 70 } });
const pj = mk('Projection', { noteCol: 'L', widths: { A: 50, B: 8, C: 11, D: 11, E: 11, F: 11, G: 11, H: 11, I: 11, J: 12, K: 12, L: 70 } });
const sg = mk('Segments', { noteCol: 'H', widths: { A: 50, B: 8, C: 12, D: 12, E: 12, F: 12, G: 4, H: 70 } });
const sn = mk('Sensitivity', { noteCol: 'H', widths: { A: 56, B: 8, C: 12, D: 12, E: 12, F: 12, G: 4, H: 70 } });
const src = mk('Sources', { noteCol: 'H', widths: { A: 6, B: 60, C: 50, D: 34, E: 90, F: 12 } });

const A = k => X(as, k, 'C');

// =====================================================================
// Case_Financials — Exhibits 1–4
// =====================================================================
{
  const s = cf;
  const r = (k, c) => R(s, k, c);
  s.title('Case data — financial exhibits (USD m; FY ends 31 Dec)');
  s.note('Blue = typed from the case exhibits. Black = formulas that rebuild case subtotals; "case-reported" rows are kept to prove the rebuild matches.');
  s.blank();
  s.sub('Exhibit 1 — Income statement');
  s.header(['USD m', '', '2022', '2023', '2024', '2025', 'Source / note']);
  s.row('rev', 'Revenue', [1150, 1205, 1230, 1190], { note: 'Ex.1' });
  s.row('cogs', 'Cost of sales (excl. D&A)', [860, 910, 945, 930], { note: 'Ex.1. Includes energy and direct production labour (Ex.8) and the 2025 digital gross benefits (Ex.5)' });
  s.row('gp', 'Gross profit', all(4, c => `=${r('rev', c)}-${r('cogs', c)}`), { total: true });
  s.row('opex', 'Operating expenses excl. D&A', all(4, c => `=SUM(${r('pers', c)}:${r('oth', c)})`), { note: 'Sum of the Ex.1 opex breakdown below' });
  s.row('ebitda', 'EBITDA', all(4, c => `=${r('gp', c)}-${r('opex', c)}`), { total: true });
  s.row('da', 'Depreciation & amortisation', [58, 66, 78, 90], { note: 'Ex.1' });
  s.row('ebit', 'EBIT', all(4, c => `=${r('ebitda', c)}-${r('da', c)}`));
  s.row('fin', 'Net finance costs', [24, 27, 33, 40], { note: 'Ex.1 — interest on debt, net' });
  s.row('pbt', 'Profit before tax', all(4, c => `=${r('ebit', c)}-${r('fin', c)}`));
  s.row('tax', 'Tax', [10, 4, 0, 0], { note: 'Ex.1 (2023 rounded to 4 per case footnote)' });
  s.row('ni', 'Net income', all(4, c => `=${r('pbt', c)}-${r('tax', c)}`), { total: true });
  s.row('ebitda_case', 'EBITDA — case-reported', [122, 108, 70, 25], { note: 'Ex.1, for reconciliation', italic: true });
  s.row('ni_case', 'Net income — case-reported', [30, 11, -41, -105], { note: 'Ex.1, for reconciliation', italic: true });
  s.blank();
  s.sub('Exhibit 1 — Operating expense breakdown');
  s.header(['USD m', '', '2022', '2023', '2024', '2025', '']);
  s.row('pers', 'Non-digital personnel costs', [90, 95, 101, 108], { note: 'Ex.1' });
  s.row('sell', 'Selling and customer support', [35, 38, 42, 45], { note: 'Ex.1' });
  s.row('dig', 'Digital and AI operating costs', [8, 18, 35, 48], { note: 'Ex.1 — expensed digital personnel, software, cloud, support, implementation' });
  s.row('oth', 'Other overheads', [35, 36, 37, 34], { note: 'Ex.1' });
  s.row('opex_case', 'Total operating expenses — case-reported', [168, 187, 215, 235], { note: 'Ex.1, for reconciliation', italic: true });
  s.blank();
  s.sub('Exhibit 2 — Balance sheet');
  s.header(['USD m', '', '2022', '2023', '2024', '2025', '']);
  s.row('cash', 'Cash & cash equivalents', [90, 75, 55, 30], { note: 'Ex.2' });
  s.row('ar', 'Trade receivables', [150, 158, 168, 172], { note: 'Ex.2' });
  s.row('inv', 'Inventory', [205, 220, 240, 255], { note: 'Ex.2' });
  s.row('oca', 'Other current assets', [38, 40, 43, 45], { note: 'Ex.2' });
  s.row('tca', 'Total current assets', all(4, c => `=SUM(${r('cash', c)}:${r('oca', c)})`), { total: true });
  s.row('ppe', 'PPE (net)', [590, 630, 660, 680], { note: 'Ex.2' });
  s.row('diga', 'Capitalised digital & AI assets', [65, 100, 135, 155], { note: 'Ex.2 — net carrying value; 65 opening balance = earlier systems' });
  s.row('othi', 'Other intangible assets', [192, 191, 159, 113], { note: 'Ex.2' });
  s.row('tnca', 'Total non-current assets', all(4, c => `=SUM(${r('ppe', c)}:${r('othi', c)})`), { total: true });
  s.row('ta', 'TOTAL ASSETS', all(4, c => `=${r('tca', c)}+${r('tnca', c)}`), { total: true });
  s.row('ap', 'Trade payables', [165, 178, 188, 195], { note: 'Ex.2' });
  s.row('std', 'Short-term debt', [90, 115, 145, 180], { note: 'Ex.2' });
  s.row('ocl', 'Other current liabilities', [55, 58, 60, 63], { note: 'Ex.2' });
  s.row('tcl', 'Total current liabilities', all(4, c => `=SUM(${r('ap', c)}:${r('ocl', c)})`), { total: true });
  s.row('ltd', 'Long-term debt', [470, 510, 555, 605], { note: 'Ex.2' });
  s.row('oltl', 'Other long-term liabilities', [30, 30, 30, 30], { note: 'Ex.2' });
  s.row('tncl', 'Total non-current liabilities', all(4, c => `=${r('ltd', c)}+${r('oltl', c)}`), { total: true });
  s.row('tl', 'Total liabilities', all(4, c => `=${r('tcl', c)}+${r('tncl', c)}`), { total: true });
  s.row('eq', 'Equity', [520, 523, 482, 377], { note: 'Ex.2' });
  s.row('tle', 'TOTAL LIABILITIES & EQUITY', all(4, c => `=${r('tl', c)}+${r('eq', c)}`), { total: true });
  s.row('bs_chk', 'Check: assets − liabilities & equity (should be 0)', all(4, c => `=${r('ta', c)}-${r('tle', c)}`), { italic: true });
  s.blank();
  s.sub('Exhibit 3 — Segment financials');
  s.header(['USD m', '', '2022', '2023', '2024', '2025', '']);
  s.row('rev_auto', 'Revenue — Auto Components', [610, 630, 615, 570], { note: 'Ex.3' });
  s.row('rev_iem', 'Revenue — Industrial Equipment & Machinery', [350, 375, 400, 405], { note: 'Ex.3' });
  s.row('rev_smc', 'Revenue — Specialty Materials & Coatings', [190, 200, 215, 215], { note: 'Ex.3' });
  s.row('rev_seg', 'Total segment revenue', all(4, c => `=SUM(${r('rev_auto', c)}:${r('rev_smc', c)})`), { total: true });
  s.row('eb_auto', 'EBITDA — Auto Components', [68, 58, 30, 5], { note: 'Ex.3. Direct project costs charged to segments; shared corporate & central digital costs allocated by revenue' });
  s.row('eb_iem', 'EBITDA — Industrial Equipment & Machinery', [40, 42, 38, 33], { note: 'Ex.3' });
  s.row('eb_smc', 'EBITDA — Specialty Materials & Coatings', [14, 8, 2, -13], { note: 'Ex.3' });
  s.row('eb_seg', 'Total segment EBITDA', all(4, c => `=SUM(${r('eb_auto', c)}:${r('eb_smc', c)})`), { total: true });
  s.blank();
  s.sub('Exhibit 4 — Cash flow and capital expenditure');
  s.header(['USD m (outflows negative)', '', '2022', '2023', '2024', '2025', '']);
  const f3 = fn => [null, ...all(3, fn)];
  s.row('cf_ni', 'Net income', f3(c => `=${r('ni', c)}`));
  s.row('cf_da', 'Add D&A', f3(c => `=${r('da', c)}`));
  s.row('cf_wc', 'Increase in operating working capital', [null, -9, -21, -11], { note: 'Ex.4' });
  s.row('cf_ocf', 'Operating cash flow after interest and tax', f3(c => `=SUM(${r('cf_ni', c)}:${r('cf_wc', c)})`), { total: true });
  s.row('cf_maint', 'Maintenance PPE capex', [null, -45, -45, -45], { note: 'Ex.4 — sustains existing operations; case asks to justify any reduction' });
  s.row('cf_upg', 'Physical upgrade and expansion capex', [null, -35, -30, -25], { note: 'Ex.4' });
  s.row('cf_fof', 'Capitalised Factory of the Future spend', [null, -50, -55, -45], { note: 'Ex.4' });
  s.row('cf_oi', 'Other intangible additions', [null, -10, 0, 0], { note: 'Ex.4' });
  s.row('cf_capex', 'Total capital expenditure', f3(c => `=SUM(${r('cf_maint', c)}:${r('cf_oi', c)})`), { total: true });
  s.row('cf_fcf', 'Free cash flow before disposals', f3(c => `=${r('cf_ocf', c)}+${r('cf_capex', c)}`), { total: true });
  s.row('cf_disp', 'Other intangible disposal proceeds', [null, 0, 19, 31], { note: 'Ex.4 — non-core licences sold at carrying value' });
  s.row('cf_debt', 'Net debt raised', [null, 65, 75, 85], { note: 'Ex.4' });
  s.row('cf_div', 'Dividends paid', [null, -8, 0, 0], { note: 'Ex.4' });
  s.row('cf_chg', 'Net change in cash', f3(c => `=${r('cf_fcf', c)}+${r('cf_disp', c)}+${r('cf_debt', c)}+${r('cf_div', c)}`), { total: true });
  s.row('cf_open', 'Opening cash', f3(c => `=${P(c)}${s.n('cash')}`));
  s.row('cf_close', 'Closing cash', f3(c => `=${r('cf_open', c)}+${r('cf_chg', c)}`), { total: true });
  s.row('cf_chk', 'Check: closing cash − balance-sheet cash (should be 0)', f3(c => `=${r('cf_close', c)}-${r('cash', c)}`), { italic: true });
  s.row('cf_dchk', 'Check: debt raised − change in total debt (should be 0)', f3(c => `=${r('cf_debt', c)}-((${r('std', c)}+${r('ltd', c)})-(${P(c)}${s.n('std')}+${P(c)}${s.n('ltd')}))`), { italic: true });
  s.row('da_ppe', 'D&A — PPE', [null, 40, 45, 50], { note: 'Ex.4 asset movement reconciliation' });
  s.row('da_dig', 'D&A — digital & AI assets', [null, 15, 20, 25], { note: 'Ex.4' });
  s.row('da_oth', 'D&A — other intangibles', [null, 11, 13, 15], { note: 'Ex.4' });
  s.row('da_chk', 'Check: D&A split − total D&A (should be 0)', f3(c => `=SUM(${r('da_ppe', c)}:${r('da_oth', c)})-${r('da', c)}`), { italic: true });
}

// =====================================================================
// Case_Digital — Exhibits 5–7
// =====================================================================
{
  const s = cd;
  const r = (k, c) => R(s, k, c);
  const proj = (key, label, v, o = {}) => s.row(key, label, [...v, o.noTotal ? null : (c => `=SUM(C${s.n(key)}:E${s.n(key)})`)], o);
  s.title('Case data — digital programme (Exhibits 5–7, USD m)');
  s.note('Columns: Predictive maintenance (PdM) · Computer-vision inspection (Vision) · Supply-chain planning (SCP) · Programme total.');
  s.blank();
  s.sub('Exhibit 5 — Programme economics');
  s.header(['USD m', '', 'PdM', 'Vision', 'SCP', 'Total', 'Source / note']);
  proj('cap', 'Capitalised spend 2023–25', [50, 55, 45], { note: 'Ex.5' });
  proj('na', 'Net assets at end-2025', [38, 44, 33], { note: 'Ex.5' });
  proj('opex', '2025 operating cost (excl. D&A)', [10, 12, 14], { note: 'Ex.5' });
  proj('ben', '2025 gross benefit (realised, already in Cost of Sales)', [5, 7, 1], { note: 'Ex.5 — NOT an exit run-rate; must not be re-counted as future gain' });
  proj('req', 'Requested capex, next 18 months (unapproved)', [8, 12, 10], { note: 'Ex.5 — excludes recurring opex and remaining implementation' });
  s.blank();
  s.sub('Exhibit 6 — 2025 project operating cost breakdown');
  s.header(['USD m', '', 'PdM', 'Vision', 'SCP', 'Total', '']);
  proj('lic', 'Software and platform licences', [0.8, 1.0, 1.5], { note: 'Ex.6 — recurring' });
  proj('cloud', 'Cloud or edge compute and data storage', [0.7, 1.2, 1.3], { note: 'Ex.6 — recurring' });
  proj('tok', 'Metered language-model inference / tokens', [0, 0, 0.8], { note: 'Ex.6 — recurring; planning pilot only (agent calls)' });
  proj('mon', 'Monitoring, support and model maintenance', [1.5, 1.8, 2.4], { note: 'Ex.6 — recurring' });
  proj('rec', 'Recurring operating costs (subtotal)', all(3, c => `=SUM(${r('lic', c)}:${r('mon', c)})`), { total: true });
  proj('si', 'Systems integration and data engineering', [4, 4, 5], { note: 'Ex.6 — temporary' });
  proj('dp', 'Data preparation, labelling, initial model validation', [2, 3, 2], { note: 'Ex.6 — temporary' });
  proj('tr', 'Training and change management', [1, 1, 1], { note: 'Ex.6 — temporary' });
  proj('temp', 'Temporary implementation costs (subtotal)', all(3, c => `=SUM(${r('si', c)}:${r('tr', c)})`), { total: true });
  proj('tot', 'Total 2025 project operating cost', all(3, c => `=${r('rec', c)}+${r('temp', c)}`), { total: true });
  proj('opex_chk', 'Check: Ex.6 total − Ex.5 operating cost (should be 0)', all(3, c => `=${r('tot', c)}-${r('opex', c)}`), { italic: true });
  proj('comm', 'Committed recurring cost payable Jan–Dec 2026', [1.0, 1.5, 2.0], { note: 'Ex.6 — payable even if deployment stops; included in recurring above' });
  proj('rem', 'Remaining expensed implementation work in 2026', [1.0, 2.0, 3.0], { note: 'Ex.6 — required to continue CURRENT scope; excludes capex requests' });
  s.row('central', 'Shared central digital cost (annual)', [12], { note: 'Ex.6/Ex.8 — includes payroll of 24-person central team; stays in base case' });
  s.row('team', 'Central digital team (FTE)', [24], { fmt: 'int', note: 'Ex.8' });
  s.blank();
  s.sub('Exhibit 7 — Deployment and operational evidence (deployed scope only)');
  s.header(['', '', 'PdM', 'Vision', 'SCP', '', '']);
  s.row('kpi', 'KPI', ['Unplanned downtime (% sched. hrs)', 'Scrap/rework (% covered-line cost)', 'Pilot inventory days'], { fmt: 'text', note: 'Ex.7' });
  s.row('scope', 'Deployed scope (machines / lines / plants)', [150, 8, 3], { fmt: 'int', note: 'Ex.7 — PdM 150 machines (2 Auto + 1 IEM plant); Vision 8 lines (2 Auto + 1 SMC plant); SCP 3 plants (2 Auto + 1 IEM)' });
  s.row('k_base', 'Baseline', [{ v: 0.12, fmt: 'pct' }, { v: 0.06, fmt: 'pct' }, { v: 90, fmt: 'num0' }], { note: 'Ex.7' });
  s.row('k_tgt', 'Original business-case target', [{ v: 0.07, fmt: 'pct' }, { v: 0.035, fmt: 'pct' }, { v: 75, fmt: 'num0' }], { note: 'Ex.7 — targets, not achieved results' });
  s.row('k_act', '2025 outcome', [{ v: 0.09, fmt: 'pct' }, { v: 0.048, fmt: 'pct' }, { v: 94, fmt: 'num0' }], { note: 'Ex.7' });
  s.row('adopt', 'Adoption metric', [{ v: 0.60, fmt: 'pct' }, { v: 0.45, fmt: 'pct' }, { v: 0.35, fmt: 'pct' }], { note: 'Ex.7 — PdM: actionable alerts closed in window; Vision: flagged rejects needing manual review; SCP: schedules accepted without override' });
  s.row('otd', 'On-time delivery (SCP pilot): baseline / 2025', [null, null, { v: 0.86, fmt: 'pct' }], { note: 'Ex.7 — 86% baseline, 86% in 2025 (no change)' });
  s.row('constraint', 'Reported constraint', ['Maint. records, work-order integration, technicians', 'Calibration on spec change; selected families only', 'Master-data inconsistency; separate planning systems'], { fmt: 'text', note: 'Ex.7' });
}

// =====================================================================
// Case_Ops — Exhibit 8
// =====================================================================
{
  const s = co;
  const seg = (key, label, v, o = {}) => s.row(key, label, [...v, o.noTotal ? null : (c => `=SUM(C${s.n(key)}:E${s.n(key)})`)], o);
  s.title('Case data — operating context (Exhibit 8)');
  s.blank();
  s.sub('Manufacturing footprint and operating costs (2025)');
  s.header(['', '', 'Auto', 'IEM', 'SMC', 'Group', 'Source / note']);
  seg('plants', 'Plants', [5, 3, 3], { fmt: 'int', note: 'Ex.8 — Auto: India 3, Vietnam 1, CE 1; IEM: India 1, Vietnam 1, CE 1; SMC: India 2, CE 1' });
  seg('util', 'Capacity utilisation', [0.72, 0.81, 0.67], { fmt: 'pct', noTotal: true, note: 'Ex.8 — actual output / practical capacity at 2025 mix' });
  seg('energy', 'Energy expenditure (USD m, in Cost of Sales)', [45, 25, 50], { note: 'Ex.8' });
  seg('labour', 'Direct production labour (USD m, in Cost of Sales)', [95, 60, 25], { note: 'Ex.8' });
  s.row('process', 'Main processes', ['Machining, forging, assembly', 'Fabrication, machining, assembly', 'Mixing, batch processing, coating'], { fmt: 'text', note: 'Ex.8' });
  s.row('custreq', 'Principal customer requirements', ['Accuracy, traceability, delivery, price', 'Reliability, configurability, lead time, service', 'Batch consistency, performance, tech support'], { fmt: 'text', note: 'Ex.8' });
  s.blank();
  s.sub('Digital readiness');
  s.row('erp', 'Plants on shared ERP (of 11)', [8], { fmt: 'int', note: 'Ex.8 — 3 plants on local systems with monthly manual consolidation' });
  s.row('mdata', 'Production equipment with centrally accessible machine data', [0.40], { fmt: 'pct', note: 'Ex.8 — rest on local logs/manual records; data definitions vary across plants' });
}

// =====================================================================
// Diagnosis
// =====================================================================
{
  const s = dg;
  const r = (k, c) => R(s, k, c);
  const F = (k, c) => X(cf, k, c);
  const D = (k, c) => X(cd, k, c);
  s.title('Diagnosis — what the exhibits say');
  s.blank();
  s.sub('1. Profitability, leverage and liquidity');
  s.header(['', '', '2022', '2023', '2024', '2025', '', 'Reading']);
  s.row('g', 'Revenue growth', [null, ...all(3, c => `=${F('rev', c)}/${F('rev', P(c))}-1`)], { fmt: 'pct' });
  s.row('gpm', 'Gross margin', all(4, c => `=${F('gp', c)}/${F('rev', c)}`), { fmt: 'pct', note: 'Down ~3.4pp despite 13 of digital benefits inside 2025 COGS' });
  s.row('ebm', 'EBITDA margin', all(4, c => `=${F('ebitda', c)}/${F('rev', c)}`), { fmt: 'pct' });
  s.row('opexr', 'Opex (excl. D&A) / revenue', all(4, c => `=${F('opex', c)}/${F('rev', c)}`), { fmt: 'pct' });
  s.row('digr', 'Digital & AI opex / revenue', all(4, c => `=${F('dig', c)}/${F('rev', c)}`), { fmt: 'pct', note: 'Digital opex 6x since 2022 (8 → 48)' });
  s.row('debt', 'Total debt (short + long term)', all(4, c => `=${F('std', c)}+${F('ltd', c)}`));
  s.row('nd', 'Net debt', all(4, c => `=${r('debt', c)}-${F('cash', c)}`));
  s.row('lev', 'Net debt / EBITDA', all(4, c => `=${r('nd', c)}/${F('ebitda', c)}`), { fmt: 'x', key: true, note: '30x in 2025 — ratings downgrade warning is unsurprising' });
  s.row('icov', 'Interest cover (EBITDA / net finance costs)', all(4, c => `=${F('ebitda', c)}/${F('fin', c)}`), { fmt: 'x', key: true, note: 'Below 1.0x: operating earnings no longer cover interest' });
  s.row('rate', 'Implied interest rate (finance cost / average debt)', [null, ...all(3, c => `=${F('fin', c)}/AVERAGE(${r('debt', P(c))},${r('debt', c)})`)], { fmt: 'pct', note: '2025 rate used to project interest (Assumptions)' });
  s.row('stdshare', 'Short-term debt / total debt', all(4, c => `=${F('std', c)}/${r('debt', c)}`), { fmt: 'pct', note: 'Refinancing risk rising: 180 due within 12 months vs 30 cash' });
  s.blank();
  s.sub('2. Working capital');
  s.header(['', '', '2022', '2023', '2024', '2025', '', '']);
  s.row('owc', 'Operating working capital', all(4, c => `=${F('ar', c)}+${F('inv', c)}+${F('oca', c)}-${F('ap', c)}-${F('ocl', c)}`), { note: 'Ex.4 definition' });
  s.row('owc_chk', 'Check: Δ working capital + cash-flow line (should be 0)', [null, ...all(3, c => `=(${r('owc', c)}-${r('owc', P(c))})+${F('cf_wc', c)}`)], { italic: true });
  s.row('invd', 'Inventory days (inventory / COGS × 365)', all(4, c => `=${F('inv', c)}/${F('cogs', c)}*365`), { fmt: 'num', key: true, note: '87 → 100 days: ~33 of cash tied up vs 2022 level' });
  s.row('dso', 'Receivable days (DSO)', all(4, c => `=${F('ar', c)}/${F('rev', c)}*365`), { fmt: 'num' });
  s.row('dpo', 'Payable days (DPO)', all(4, c => `=${F('ap', c)}/${F('cogs', c)}*365`), { fmt: 'num', note: 'Not used as a lever: stretching suppliers during a downgrade is high-risk' });
  s.row('ccc', 'Cash conversion cycle (days)', all(4, c => `=${r('invd', c)}+${r('dso', c)}-${r('dpo', c)}`), { fmt: 'num' });
  s.blank();
  s.sub('3. Segment EBITDA margins');
  s.header(['', '', '2022', '2023', '2024', '2025', '', '']);
  s.row('m_auto', 'Auto Components', all(4, c => `=${F('eb_auto', c)}/${F('rev_auto', c)}`), { fmt: 'pct', note: '11.1% → 0.9%: in forced-sale territory' });
  s.row('m_iem', 'Industrial Equipment & Machinery', all(4, c => `=${F('eb_iem', c)}/${F('rev_iem', c)}`), { fmt: 'pct', note: 'Growing; the healthiest business' });
  s.row('m_smc', 'Specialty Materials & Coatings', all(4, c => `=${F('eb_smc', c)}/${F('rev_smc', c)}`), { fmt: 'pct', note: 'Loss-making; energy is 23% of revenue' });
  s.blank();
  s.sub('4. EBITDA bridge 2022 → 2025');
  s.header(['USD m', '', 'Impact', '% of decline', '', '', '', '']);
  const brShare = k => c => `=${r(k, 'C')}/(${r('br_end', 'C')}-${r('br_start', 'C')})`;
  s.row('br_start', 'EBITDA 2022', [`=${F('ebitda', 'C')}`], { total: true });
  s.row('br_gp', 'Underlying gross-profit erosion (excl. digital benefits)', [`=(${F('gp', 'F')}-${F('gp', 'C')})-${D('ben', 'F')}`, brShare('br_gp')], { note: 'OEM pricing, input & energy costs, mix — the COO and Auto sales head are both right', fmtList: ['num', 'pct'] });
  s.row('br_ben', 'Digital gross benefits realised in COGS (2025)', [`=${D('ben', 'F')}`, brShare('br_ben')], { fmtList: ['num', 'pct'] });
  s.row('br_dig', 'Increase in digital & AI opex', [`=-(${F('dig', 'F')}-${F('dig', 'C')})`, brShare('br_dig')], { fmtList: ['num', 'pct'], note: 'Single largest controllable driver' });
  s.row('br_pers', 'Increase in non-digital personnel', [`=-(${F('pers', 'F')}-${F('pers', 'C')})`, brShare('br_pers')], { fmtList: ['num', 'pct'] });
  s.row('br_sell', 'Increase in selling & customer support', [`=-(${F('sell', 'F')}-${F('sell', 'C')})`, brShare('br_sell')], { fmtList: ['num', 'pct'] });
  s.row('br_oth', 'Change in other overheads', [`=-(${F('oth', 'F')}-${F('oth', 'C')})`, brShare('br_oth')], { fmtList: ['num', 'pct'] });
  s.row('br_end', 'EBITDA 2025', [`=SUM(${r('br_start', 'C')}:${r('br_oth', 'C')})`], { total: true });
  s.row('br_chk', 'Check: bridge end − reported 2025 EBITDA (should be 0)', [`=${r('br_end', 'C')}-${F('ebitda', 'F')}`], { italic: true });
  s.row('br_seg_auto', 'Memo: segment EBITDA change — Auto', [`=${F('eb_auto', 'F')}-${F('eb_auto', 'C')}`, brShare('br_seg_auto')], { fmtList: ['num', 'pct'], note: 'Auto explains ~2/3 of the Group decline' });
  s.row('br_seg_iem', 'Memo: segment EBITDA change — IEM', [`=${F('eb_iem', 'F')}-${F('eb_iem', 'C')}`, brShare('br_seg_iem')], { fmtList: ['num', 'pct'] });
  s.row('br_seg_smc', 'Memo: segment EBITDA change — SMC', [`=${F('eb_smc', 'F')}-${F('eb_smc', 'C')}`, brShare('br_seg_smc')], { fmtList: ['num', 'pct'] });
  s.blank();
  s.sub('5. Factory of the Future scorecard (2025)');
  s.header(['USD m', '', 'PdM', 'Vision', 'SCP', 'Programme', '', '']);
  const p4 = fn => all(4, fn);
  s.row('sc_opex', '2025 operating cost', p4(c => `=${D('opex', c)}`));
  s.row('sc_rec', '  of which recurring', p4(c => `=${D('rec', c)}`));
  s.row('sc_temp', '  of which temporary implementation', p4(c => `=${D('temp', c)}`));
  s.row('sc_ben', '2025 gross benefit', p4(c => `=${D('ben', c)}`));
  s.row('sc_net', 'Net 2025 P&L effect (benefit − operating cost)', p4(c => `=${r('sc_ben', c)}-${r('sc_opex', c)}`), { total: true });
  s.row('sc_netrr', 'Net recurring effect (benefit − recurring cost)', p4(c => `=${r('sc_ben', c)}-${r('sc_rec', c)}`), { total: true, key: true, note: 'PdM and Vision pay their running costs; SCP does not' });
  s.row('sc_ratio', 'Benefit per $ of recurring cost', p4(c => `=${r('sc_ben', c)}/${r('sc_rec', c)}`), { fmt: 'x' });
  s.row('sc_tgt', 'Share of targeted KPI improvement achieved', all(3, c => `=(${D('k_base', c)}-${D('k_act', c)})/(${D('k_base', c)}-${D('k_tgt', c)})`), { fmt: 'pct', note: 'PdM 60%, Vision 48%; SCP negative — inventory days rose 90 → 94' });
  s.row('sc_cap', 'Capitalised spend 2023–25', p4(c => `=${D('cap', c)}`));
  s.row('sc_payback', 'Years of net recurring benefit to recover capitalised spend', all(3, c => `=IF(${r('sc_netrr', c)}>0,${r('sc_cap', c)}/${r('sc_netrr', c)},"never")`), { fmt: 'num', note: 'At current scope, even the winners take 18–25 years: scale and adoption are the issue, not the technology' });
  s.row('dig_tot', 'Total digital & AI opex 2025 (projects + central)', [`=${D('opex', 'F')}+${D('central', 'C')}`], { note: '36 project + 12 shared central' });
  s.row('dig_chk', 'Check: vs Ex.1 digital opex (should be 0)', [`=${r('dig_tot', 'C')}-${F('dig', 'F')}`], { italic: true });
  s.row('dig_net', 'Net digital P&L 2025 (benefits − all digital opex)', [`=${D('ben', 'F')}-${r('dig_tot', 'C')}`], { total: true, key: true, note: 'Digital is currently a −35 drag on a 25 EBITDA business' });
  s.blank();
  s.sub('6. What improves automatically in 2026 (not claimed as our impact)');
  s.row('temp25', '2025 temporary implementation cost', [`=${D('temp', 'F')}`]);
  s.row('rem26', 'Remaining implementation work required in 2026 (current scope)', [`=${D('rem', 'F')}`]);
  s.row('rolloff', 'Automatic 2026 EBITDA roll-off vs 2025', [`=${r('temp25', 'C')}-${r('rem26', 'C')}`], { total: true, key: true, note: 'Temporary costs do not recur (Ex.6). Base case gets this too — our plan must beat it' });
  s.blank();
  s.sub('7. How much of Auto\'s collapse is digital? (allocation assumption)');
  s.row('au_proj', 'Pilot project opex borne by Auto', [c => `=${D('opex', 'F')}*${A('a_auto')}`], { note: 'Pilots sit in 2 Auto plants of 3 per project → 2/3 share (assumption)' });
  s.row('au_cent', 'Central digital cost allocated to Auto (by revenue)', [`=${D('central', 'C')}*${F('rev_auto', 'F')}/${F('rev', 'F')}`], { note: 'Ex.3 allocation rule' });
  s.row('au_ben', 'Digital benefits accruing to Auto', [c => `=${D('ben', 'F')}*${A('a_auto')}`]);
  s.row('au_net', 'Net digital drag on Auto EBITDA', [`=${r('au_ben', 'C')}-${r('au_proj', 'C')}-${r('au_cent', 'C')}`], { total: true });
  s.row('au_ex', 'Auto EBITDA excluding net digital drag', [`=${F('eb_auto', 'F')}-${r('au_net', 'C')}`]);
  s.row('au_exm', 'Auto EBITDA margin excluding net digital drag', [`=${r('au_ex', 'C')}/${F('rev_auto', 'F')}`], { fmt: 'pct', note: 'Still far below 11.1% in 2022 → the rest is pricing/volume/input cost: digital must reach commercial & procurement' });
  s.blank();
  s.sub('8. Consistency flag — Vision benefit vs scrap reduction');
  s.row('vis_cov', 'Implied covered-line production cost (benefit ÷ scrap-point reduction)', [`=${D('ben', 'D')}/(${D('k_base', 'D')}-${D('k_act', 'D')})`], { note: '7.0 ÷ 1.2% ≈ 583' });
  s.row('vis_share', 'Implied share of Group cost of sales on 8 lines', [`=${r('vis_cov', 'C')}/${F('cogs', 'F')}`], { fmt: 'pct', key: true, note: 'Implausible for 8 lines → benefit likely includes inspection-labour savings. We do NOT extrapolate this ratio; new lines are haircut 50%' });
}

// =====================================================================
// Assumptions
// =====================================================================
{
  const s = as;
  const a = (key, label, v, fmt, note, o = {}) => s.row(key, label, [v], { fmt, note, key: o.key });
  s.title('Assumptions — every judgement call in one place');
  s.note('Blue = our assumption (edit to test). Yellow = key driver. Green = linked from case data. [Bx] codes point to the Sources tab.');
  s.blank();
  s.header(['Assumption', 'Unit', 'Value', 'Rationale / benchmark']);
  s.sub('General');
  a('a_real', 'Benefit realisation factor (base case)', 0.75, 'pct', 'Pilots achieved 48–60% of targeted KPI gains (Ex.7); benchmark levers are already sized well below published ranges → 75% sits between. 100% = stretch, 50% = downside (Sensitivity). Not applied to F3 (contractual cost removal)', { key: true });
  a('a_auto', 'Auto share of pilot project cost & benefit', 2 / 3, 'pct', 'Each pilot runs in 2 Auto plants out of 3 (Ex.7); allocation by plant count');
  a('a_costf', 'Incremental recurring cost per unit when scaling, vs pilot per-unit cost', 0.67, 'pct', 'Platform licences, monitoring and team are shared, so scaling costs less than the pilot per unit');
  a('a_rate', 'Interest rate on debt (before refinancing premium)', `=${X(dg, 'rate', 'F')}`, 'pct', '2025 implied: 40 ÷ average debt of 742 (Diagnosis). Applied to opening debt each period (avoids circularity)');
  a('a_prem', 'Refinancing premium on rolled-over short-term debt and all new money', 0.03, 'pct', 'Assumption: +300bp for a borrower on downgrade watch; applied from Jan-26 to the 180 of short-term debt and to every dollar of new borrowing', { key: true });
  a('a_mincash', 'Minimum cash balance', 30, 'num', 'Held at the 2025 closing level; any shortfall is funded by debt');
  a('a_tax', 'Cash tax', 0, 'num', 'PBT stays negative through Jun-27 in every case (checked on Projection); no cash tax');
  a('a_da', 'D&A per year (for PBT check only)', `=${X(cf, 'da', 'F')}`, 'num', 'Held at 2025 level; used only to confirm PBT < 0');
  a('a_capss', 'Steady-state digital capex per year after the mandate', 10, 'num', 'Used only for the run-rate cash break-even test');
  a('a_revflat', 'Revenue and underlying gross margin held at 2025 levels', 'Held', 'text', 'No market recovery and no further erosion assumed. OEM price-down and volume risks shown on Sensitivity');
  s.sub('Base case (momentum: current scope continues, capex requests approved as submitted)');
  a('b_exp', 'Base: upgrade & expansion capex per year', 25, 'num', '2025 level (Ex.4)');
  a('b_digcap', 'Base: digital capex over 18 months', `=${X(cd, 'req', 'F')}`, 'num', 'All three requests approved (8 + 12 + 10; Ex.5)');
  a('b_split', 'Base: share of 18-month digital capex spent in 2026', 2 / 3, 'pct', 'Straight-line over 18 months');
  s.sub('Capex policy (plan)');
  a('p_maint', 'Maintenance capex per year (plan and base)', 45, 'num', 'NOT reduced: already below PPE depreciation of 50 (Ex.4); case requires justification for any cut');
  a('p_exp', 'Plan: upgrade & expansion capex per year', 10, 'num', 'Defer expansion: utilisation is 72% Auto, 81% IEM, 67% SMC (Ex.8), so no business is capacity-constrained. Keep 10 for safety/debottlenecking', { key: true });
  s.sub('W1 Foundations');
  a('f1_capex', 'F1 Master data & ERP harmonisation: capex', 10, 'num', 'Redirect the SCP capex request (10) to move the 3 local-system plants onto the shared ERP in waves + master-data tooling');
  a('f1_oneoff', 'F1: one-off implementation opex', 3, 'num', 'Uses the SCP remaining-work budget (3.0), repurposed to data cleansing and governance');
  a('f1_rec', 'F1: recurring cost (data stewards, MDM tool)', 0.5, 'num', 'Assumption: ~5 data stewards across plants + MDM licence');
  a('f2_rec', 'F2 Digital Value Office: recurring cost', 1.0, 'num', 'Chief Digital Officer reporting to CEO + 4 business product owners + value tracking; central team of 24 reallocated, not added');
  a('f2_oneoff', 'F2: one-off change management & training', 0.5, 'num', 'Plant digital-champion network, adoption training');
  a('f3_lic', 'F3 SCP descope: licences retained', 1.0, 'pct', 'Keep the core planning tool so planners keep working and data fixes can be tested');
  a('f3_cloud', 'F3: cloud/compute retained', 0.5, 'pct', 'Smaller footprint once agent layer is off');
  a('f3_tok', 'F3: language-model tokens retained', 0, 'pct', 'Switch off the agentic layer: 35% acceptance, inventory days worse (Ex.7)', { key: true });
  a('f3_mon', 'F3: monitoring & model maintenance retained', 0.4, 'pct', 'Fewer models to maintain');
  a('f3_trans', 'F3: one-off transition / shutdown cost', 0.5, 'num', 'Case requires an explicit assumption (Ex.6). 2026 commitments (2.0) are below the retained run-cost (3.1) and lapse without penalty from Jan-27');
  s.sub('W2 Maintenance · W3 Quality (fix and scale what works)');
  a('s1_tgt', 'S1 PdM current cohort: target downtime by Jun-27', 0.075, 'pct', '12% → 7.5% = 37.5% reduction, inside McKinsey\'s 30–50% range [B1]; short of the 7% business-case target given technician constraints', { key: true });
  a('s1_rec', 'S1: recurring cost (technician capacity, work-order integration upkeep)', 0.5, 'num', 'Close the loop: alerts closed in window 60% → 85% (month-6 gate)');
  a('s2_assets', 'S2 PdM scale-up: additional connected assets', 150, 'int', 'Doubles the cohort, IEM-led (81% utilisation, growing); released only after the S1 gate');
  a('s2_real', 'S2: benefit per asset vs pilot', 0.7, 'pct', 'Haircut for new plants and lower data readiness (40% machine-data coverage, Ex.8)');
  a('s2_auto', 'S2: share of new assets in Auto', 0.3, 'pct', 'Rest in IEM');
  a('s2_oneoff', 'S2: one-off implementation opex', 2, 'num', 'Integration + model tuning for new assets');
  a('s2_capex', 'S2: capex', `=${X(cd, 'req', 'C')}`, 'num', 'Approve the PdM request (Ex.5), released in tranches after the gate');
  a('s3_tgt', 'S3 Vision current lines: target scrap/rework by Jun-27', 0.042, 'pct', '6.0% → 4.2% = 72% of targeted improvement (vs 48% today) via retraining and a calibration workflow for spec changes', { key: true });
  a('s3_oneoff', 'S3: one-off retraining / calibration workflow', 0.5, 'num', 'Remaining 2026 work (2.0) is already in the base case');
  a('s4_lines', 'S4 Vision + traceability: additional Auto lines (gated, one named OEM programme)', 3, 'int', 'Only where an OEM programme demands part-level traceability; capex released after month-9 gate. EBITDA-neutral — justified as customer retention, so kept small');
  a('s4_hair', 'S4: benefit per line vs pilot average', 0.5, 'pct', 'Pilot ratio implies implausible covered cost (Diagnosis §8) → 50% haircut', { key: true });
  a('s4_oneoff', 'S4: one-off implementation opex', 0.8, 'num', 'Stations, calibration for new part families');
  a('s4_capex', 'S4: capex', 4, 'num', 'Cut the 12 request to 4: three Auto lines for one OEM programme');
  s.sub('W4 Energy & process · W5 Procurement · W6 Commercial & back-office · W7 Service growth');
  a('n1_auto', 'N1 Energy management: saving on Auto energy (forging)', 0.06, 'pct', 'Sub-metering + load scheduling + furnace optimisation. ISO 50001 plants ~4.1% in year 1 [B3]; APC up to 10% energy reduction [B2]', { key: true });
  a('n1_iem', 'N1: saving on IEM energy', 0.03, 'pct', 'Less energy-intensive assembly; lower target');
  a('n1_smc', 'N1: saving on SMC energy', 0.06, 'pct', 'Batch heating/curing: energy is 23% of SMC revenue (Ex.8)', { key: true });
  a('n1_rec', 'N1: recurring cost (energy platform, analyst)', 0.8, 'num', '');
  a('n1_oneoff', 'N1: one-off implementation opex', 1, 'num', '');
  a('n1_capex', 'N1: capex (sub-metering, controls)', 3, 'num', 'Needed: only 40% of equipment has central machine data (Ex.8)');
  a('n2_yield', 'N2 SMC golden-batch / process control: yield gain on SMC materials & other cost', 0.02, 'pct', 'APC delivers up to 5% yield [B2]. Sized on materials only (energy excluded) → no overlap with N1. Funded only if SMC passes the month-6 gate');
  a('n2_rec', 'N2: recurring cost', 0.4, 'num', '');
  a('n2_oneoff', 'N2: one-off implementation opex', 0.8, 'num', '');
  a('n2_capex', 'N2: capex (process sensors)', 2, 'num', '');
  a('n3_addr', 'N3 Procurement analytics: addressable share of non-energy, non-labour COGS', 0.7, 'pct', 'COGS 930 − energy 120 − labour 180 = 630; ~70% is bought-in materials & parts (assumption)');
  a('n3_sav', 'N3: net saving on addressable spend', 0.0125, 'pct', 'Far below the 6–12% McKinsey observes in chemicals procurement [B4]', { key: true });
  a('n3_rec', 'N3: recurring cost (spend-cube tool, 2 analysts)', 0.5, 'num', '');
  a('n3_oneoff', 'N3: one-off implementation opex', 1, 'num', '');
  a('n4_auto', 'N4 Commercial: index-linked cost pass-through, Auto', 0.005, 'pct', 'NOT a list-price rise: inserts energy/raw-material index clauses at named OEM contract renewals, recovering inflation Ironbridge absorbed. Pricing programmes add 2–7pp ROS [B5]', { key: true });
  a('n4_iem', 'N4: price realisation, IEM (configure-price-quote)', 0.005, 'pct', 'Configuration flexibility is valued (Ex.8); CPQ cuts quote lead time and discount leakage');
  a('n4_smc', 'N4: price realisation, SMC (cost pass-through, specialty value pricing)', 0.01, 'pct', 'SMC EBITDA fell 15 in 2025 on flat revenue → energy/input inflation not passed on. Specialty coatings carry more pricing power than auto parts', { key: true });
  a('n4_rec', 'N4: recurring cost (pricing analysts, CPQ licence)', 0.7, 'num', 'Covers all three businesses');
  a('n4_oneoff', 'N4: one-off implementation opex', 1.0, 'num', '');
  a('n5_rev', 'N5 IEM connected-service pilot: service revenue as % of IEM revenue by Jun-27', 0.01, 'pct', 'Remote monitoring + predictive service on installed pumps/drives, reusing the PdM stack');
  a('n5_margin', 'N5: EBITDA margin on service revenue', 0.2, 'pct', 'Aftermarket services average 25% EBIT vs 10% for new equipment [B6]; haircut for start-up');
  a('n5_oneoff', 'N5: one-off (offer design, pilot contracts)', 1, 'num', '');
  a('n5_capex', 'N5: capex (sensor kits for pilot fleet)', 2, 'num', '');
  a('n6_base', 'N6 Back-office & customer-support automation: addressable cost', `=${X(cf, 'pers', 'F')}+${X(cf, 'sell', 'F')}`, 'num', 'Non-digital personnel (108) + selling & customer support (45): up 28 since 2022 while revenue rose 3.5% (Ex.1)');
  a('n6_sav', 'N6: productivity saving on addressable cost', 0.04, 'pct', 'GenAI in customer care: 30–45% of function cost [B8]; automation of the 3 plants\' manual month-end consolidation (Ex.8). Delivered via attrition and hiring freeze', { key: true });
  a('n6_rec', 'N6: recurring cost (GenAI licences, tokens, automation upkeep)', 1.0, 'num', 'Token spend budgeted explicitly — the SCP lesson (Ex.6)');
  a('n6_oneoff', 'N6: one-off implementation opex', 1.0, 'num', '');
  s.sub('Overlap netting (so benefits are not double-counted)');
  a('o_claw', 'O2: share of Auto procurement savings passed back to OEMs', 0.5, 'pct', 'Index-linked clauses work both ways: cheaper indexed materials flow through to OEM prices. Applied to Auto\'s revenue share of N3');
  a('o_give', 'O3: share of Auto productivity savings conceded in OEM annual price-downs', 0.25, 'pct', 'Auto OEMs typically ask for annual productivity give-backs; applied to Auto\'s share of PdM, vision and energy savings');
  s.sub('Working capital (plan) — phased after the master-data fix');
  a('w_inv26', 'Inventory days — Dec-26', 96, 'num', 'From 100. 2026: slow-mover clean-up and safety-stock reset only (does not need the planning tool)');
  a('w_inv27', 'Inventory days — Jun-27', 90, 'num', 'After F1 master data: 2023 level was 88. A 10% cut vs 30% achieved in a McKinsey SC case [B7]', { key: true });
  a('w_dso26', 'Receivable days (DSO) — Dec-26', 51, 'num', 'From 52.8. E-invoicing, collections analytics, dispute resolution');
  a('w_dso27', 'Receivable days (DSO) — Jun-27', 49, 'num', '2023 level was 47.9');
  s.sub('Funding bridge (balance-sheet actions, outside the digital numbers)');
  a('fs_disp', 'Further non-core licence disposals', 20, 'num', 'Precedent in the case: non-core licences sold at carrying value — 19 (2024), 31 (2025); 113 of other intangibles remain (Ex.2, Ex.4)');
  a('fs_slb', 'Sale-and-leaseback of selected plant property', 40, 'num', 'Assumption: ~6% of 680 net PPE. Creates a lease liability: buys liquidity, not deleveraging');
  a('fs_scf', 'Supply-chain finance / non-recourse receivables factoring', 25, 'num', 'Assumption: ~15% of 172 receivables, on OEM-backed programmes');
  s.sub('Sensitivity inputs');
  a('sh_cm', 'Auto contribution margin (for volume shocks)', 0.25, 'pct', 'Assumption: materials, energy and ~half of direct labour vary with volume');
  s.sub('Win condition — what "turned around by Jun-27" means (tests a board and its lenders would apply)');
  a('t_liq', 'Liquidity: new money needed beyond rolling the 180 and identified sources — at most', 0, 'num', 'The company can fund the mandate without asking lenders for fresh money (2025: FCF −141)');
  a('t_cov', 'Solvency: exit run-rate interest cover in the DOWNSIDE case (50% realisation) — at least', 1.0, 'x', 'Earnings cover interest again even if only half the benefits land (2025: 0.6x)');
  a('t_auto_pl', 'Auto plants\' share of maintenance capex (5 of 11 plants)', `=${A('p_maint')}*${X(co, 'plants', 'C')}/${X(co, 'plants', 'F')}`, 'num', 'Proxy for the capex Auto needs to stand still; allocation by plant count (assumption)');
  a('t_dig', 'Digital: net digital contribution at Jun-27 run-rate — above', 0, 'num', 'Digital pays for itself (2025: −35)');
}

// =====================================================================
// Initiatives
// =====================================================================
const LEVERS = ['F1', 'F2', 'F3', 'S1', 'S2', 'S3', 'S4', 'N1', 'N2', 'N3', 'N4', 'N6', 'N5', 'O2', 'O3'];
const WS = { F1: 'W1 Foundations', F2: 'W1 Foundations', F3: 'W1 Foundations', S1: 'W2 Maintenance', S2: 'W2 Maintenance', S3: 'W3 Quality', S4: 'W3 Quality', N1: 'W4 Energy & process', N2: 'W4 Energy & process', N3: 'W5 Procurement', N4: 'W6 Commercial & back-office', N6: 'W6 Commercial & back-office', N5: 'W7 Service growth', O2: 'Overlap netting', O3: 'Overlap netting' };
const WORKSTREAMS = ['W1 Foundations', 'W2 Maintenance', 'W3 Quality', 'W4 Energy & process', 'W5 Procurement', 'W6 Commercial & back-office', 'W7 Service growth', 'Overlap netting'];
const bFirst = () => ini.n(`b_${LEVERS[0]}`), bLast = () => ini.n(`b_${LEVERS[LEVERS.length - 1]}`);
{
  const s = ini;
  const F = (k, c) => X(cf, k, c);
  const D = (k, c) => X(cd, k, c);
  const O = (k, c) => X(co, k, c);
  s.title('Initiatives — run-rate economics, phasing, workstreams and segment split');
  s.note('Part A derives each lever\'s annual run-rate at June 2027 from Assumptions. Part B applies the realisation factor and phases it over the mandate. Ramps are % of annual run-rate achieved on average in the period.');
  s.blank();
  s.sub('Part A — Run-rate derivation (USD m, annual at Jun-27, before realisation factor)');
  s.header(['Initiative', 'Workstream', 'Gross benefit', 'Recurring cost', 'One-off opex (18m)', 'Capex (18m)', 'Revenue added', 'Realisation applies (1/0)', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'How the benefit is calculated']);
  const aRow = (k, label, ben, rec, one, cap, rev, flag, note) => s.row(`a_${k}`, label, [{ v: WS[k], fmt: 'text' }, ben, rec, one, cap, rev, { v: flag, fmt: 'int' }], { start: 'B', note });
  const aC = k => `C${s.n('a_' + k)}`;
  aRow('F1', 'F1 · Master data & ERP harmonisation (3 plants, in waves)', 0, `=${A('f1_rec')}`, `=${A('f1_oneoff')}`, `=${A('f1_capex')}`, 0, 1, 'Enabler: unlocks the 2027 inventory release, procurement analytics and any later planning automation');
  aRow('F2', 'F2 · Digital Value Office & Chief Digital Officer', 0, `=${A('f2_rec')}`, `=${A('f2_oneoff')}`, 0, 0, 1, 'Enabler: business-owned use cases, numeric stage-gates, value tracking');
  aRow('F3', 'F3 · Switch off SCP agentic layer; keep core planning tool', `=${D('lic', 'E')}*(1-${A('f3_lic')})+${D('cloud', 'E')}*(1-${A('f3_cloud')})+${D('tok', 'E')}*(1-${A('f3_tok')})+${D('mon', 'E')}*(1-${A('f3_mon')})`, 0, `=${A('f3_trans')}-${D('rem', 'E')}`, 0, 0, 0, 'Avoided SCP recurring cost (contractual, so no realisation haircut). One-off negative: remaining SCP work (3.0) avoided, net of 0.5 transition');
  aRow('S1', 'S1 · PdM: close the loop on current 150 machines', `=(${D('k_act', 'C')}-${A('s1_tgt')})*${D('ben', 'C')}/(${D('k_base', 'C')}-${D('k_act', 'C')})`, `=${A('s1_rec')}`, 0, 0, 0, 1, 'Pilot benefit per downtime point (5.0 ÷ 3pt) × further points (9.0% → 7.5%)');
  aRow('S2', 'S2 · PdM: scale to +150 assets (IEM-led, gated)', `=${A('s2_assets')}*${D('ben', 'C')}/${D('scope', 'C')}*${A('s2_real')}`, `=${A('s2_assets')}*${D('rec', 'C')}/${D('scope', 'C')}*${A('a_costf')}`, `=${A('s2_oneoff')}`, `=${A('s2_capex')}`, 0, 1, 'Pilot benefit per machine (5.0 ÷ 150) × assets × 70%; cost per machine (3.0 ÷ 150) × 67%');
  aRow('S3', 'S3 · Vision: retrain & calibrate current 8 lines', `=(${D('k_act', 'D')}-${A('s3_tgt')})*${D('ben', 'D')}/(${D('k_base', 'D')}-${D('k_act', 'D')})`, 0, `=${A('s3_oneoff')}`, 0, 0, 1, 'Pilot benefit per scrap point on the SAME lines (7.0 ÷ 1.2pt) × further points (4.8% → 4.2%)');
  aRow('S4', 'S4 · Vision + traceability: +3 Auto lines (gated)', `=${A('s4_lines')}*${D('ben', 'D')}/${D('scope', 'D')}*${A('s4_hair')}`, `=${A('s4_lines')}*${D('rec', 'D')}/${D('scope', 'D')}*${A('a_costf')}`, `=${A('s4_oneoff')}`, `=${A('s4_capex')}`, 0, 1, 'Pilot benefit per line (7.0 ÷ 8) × 50% haircut; cost per line (4.0 ÷ 8) × 67%. Justified mainly by OEM traceability');
  aRow('N1', 'N1 · Energy management & optimisation', `=${O('energy', 'C')}*${A('n1_auto')}+${O('energy', 'D')}*${A('n1_iem')}+${O('energy', 'E')}*${A('n1_smc')}`, `=${A('n1_rec')}`, `=${A('n1_oneoff')}`, `=${A('n1_capex')}`, 0, 1, 'Segment energy spend (Ex.8) × saving %');
  aRow('N2', 'N2 · SMC golden-batch & process control (gated)', `=${A('n2_yield')}*(${F('rev_smc', 'F')}*${F('cogs', 'F')}/${F('rev', 'F')}-${O('energy', 'E')}-${O('labour', 'E')})`, `=${A('n2_rec')}`, `=${A('n2_oneoff')}`, `=${A('n2_capex')}`, 0, 1, 'SMC COGS proxied at Group COGS/revenue ratio, less SMC energy & labour → materials ≈ 93; × 2% yield');
  aRow('N3', 'N3 · Procurement spend analytics & should-cost', `=(${F('cogs', 'F')}-${O('energy', 'F')}-${O('labour', 'F')})*${A('n3_addr')}*${A('n3_sav')}`, `=${A('n3_rec')}`, `=${A('n3_oneoff')}`, 0, 0, 1, '(930 − 120 − 180) × 70% addressable × 1.25%');
  const n4 = `${F('rev_auto', 'F')}*${A('n4_auto')}+${F('rev_iem', 'F')}*${A('n4_iem')}+${F('rev_smc', 'F')}*${A('n4_smc')}`;
  aRow('N4', 'N4 · Cost pass-through & quoting (index clauses, CPQ)', `=${n4}`, `=${A('n4_rec')}`, `=${A('n4_oneoff')}`, 0, `=${n4}`, 1, 'Segment revenue × price realisation (Auto 0.5%, IEM 0.5%, SMC 1.0%)');
  aRow('N6', 'N6 · Back-office & customer-support automation', `=${A('n6_base')}*${A('n6_sav')}`, `=${A('n6_rec')}`, `=${A('n6_oneoff')}`, 0, 0, 1, '(108 personnel + 45 selling & support) × 4%');
  aRow('N5', 'N5 · IEM connected-service pilot ("predictive service")', `=${F('rev_iem', 'F')}*${A('n5_rev')}*${A('n5_margin')}`, 0, `=${A('n5_oneoff')}`, `=${A('n5_capex')}`, `=${F('rev_iem', 'F')}*${A('n5_rev')}`, 1, 'IEM revenue × 1% service revenue × 20% margin — a growth option more than a 2027 profit driver');
  aRow('O2', 'O2 · Less: procurement savings passed to OEMs', c => `=-${A('o_claw')}*${aC('N3')}*${F('rev_auto', 'F')}/${F('rev', 'F')}`, 0, 0, 0, 0, 1, 'Index-linked contracts hand back part of Auto\'s share of N3');
  aRow('O3', 'O3 · Less: OEM productivity give-backs', c => `=-${A('o_give')}*(${aC('S1')}*${A('a_auto')}+${aC('S2')}*${A('s2_auto')}+${aC('S3')}*${A('a_auto')}+${aC('S4')}+${O('energy', 'C')}*${A('n1_auto')})`, 0, 0, 0, 0, 1, 'Share of Auto\'s PdM, vision and energy savings conceded in annual price-downs');
  const aTot = c => `=SUM(${c}${s.n('a_F1')}:${c}${s.n('a_O3')})`;
  s.row('a_tot', 'Total', [null, aTot('C'), aTot('D'), aTot('E'), aTot('F'), aTot('G')], { start: 'B', total: true });
  s.row('a_totr', '  of which gross benefit subject to realisation', [null, c => `=SUMPRODUCT(C${s.n('a_F1')}:C${s.n('a_O3')},H${s.n('a_F1')}:H${s.n('a_O3')})`], { start: 'B' });
  s.row('a_totn', '  of which gross benefit not subject to realisation', [null, c => `=C${s.n('a_tot')}-C${s.n('a_totr')}`], { start: 'B' });
  s.blank();
  s.sub('Part B — Phasing over the mandate (Jan-26 to Jun-27) and segment split — after realisation factor');
  s.header(['Initiative', 'Workstream', 'Benefit RR', 'Cost RR', 'Net RR', 'Ben. ramp 2026', 'Ben. ramp H1-27', 'Cost ramp 2026', 'Cost ramp H1-27', 'One-off 18m', 'One-off % 2026', 'Capex 18m', 'Capex % 2026', 'EBITDA 2026', 'EBITDA H1-27', 'EBITDA 18m', 'Capex 2026', 'Capex H1-27', 'Feasibility (1–5)', 'Months to value', 'Auto', 'IEM', 'SMC', 'Split check', 'Phasing rationale']);
  // [ben26, ben27, cost26, cost27, one26, cap26, feasibility, months, rationale]
  const ramps = {
    F1: [0, 0, 0.4, 1, 0.6, 0.6, 3, 9, 'ERP cut-over in waves, months 4–16; no P&L inside the window — the base for 2027+'],
    F2: [0, 0, 0.9, 1, 0.7, 0, 5, 1, 'Stood up in month 1'],
    F3: [0.75, 1, 0, 0, 1, 0, 5, 3, 'Agent layer off from April 2026 after Q1 contract review'],
    S1: [0.5, 1, 0.75, 1, 1, 0, 4, 4, 'Work-order integration is the remaining 2026 scope; month-6 gate: ≥85% alerts closed on time'],
    S2: [0.2, 0.75, 0.4, 1, 0.6, 0.6, 3, 9, 'Capex released only after the S1 gate is met'],
    S3: [0.5, 1, 0, 0, 1, 0, 4, 4, 'Retraining in H1-26; month-6 gate: manual review ≤25% of flagged rejects'],
    S4: [0, 0.4, 0.1, 0.8, 0.3, 0.25, 3, 12, 'Month-9 gate: S3 gate met AND named OEM programme requires traceability'],
    N1: [0.4, 0.85, 0.6, 1, 0.7, 0.8, 4, 6, 'Metering first, then scheduling and set-point optimisation — starts month 1'],
    N2: [0.1, 0.6, 0.3, 1, 0.5, 0.5, 2, 12, 'Funded only if SMC passes the month-6 fix-or-exit gate'],
    N3: [0.5, 0.9, 0.7, 1, 0.8, 0, 4, 4, 'No-capex quick win: spend cube from AP data starts month 1'],
    N4: [0.4, 0.85, 0.7, 1, 0.8, 0, 3, 6, 'Index clauses land at each OEM contract renewal; SMC/IEM quoting from month 2'],
    N6: [0.25, 0.7, 0.6, 1, 0.7, 0, 4, 6, 'Customer-support copilot and consolidation automation; savings via attrition'],
    N5: [0.1, 0.5, 0, 0, 0.6, 0.6, 2, 12, 'Pilot contracts signed H2-26; revenue in 2027'],
    O2: [0.5, 0.9, 0, 0, 0, 0, null, null, 'Follows N3 phasing'],
    O3: [0.35, 0.8, 0, 0, 0, 0, null, null, 'Follows PdM/vision/energy phasing'],
  };
  const revShare = seg => `=${F(seg, 'F')}/${F('rev', 'F')}`;
  const splits = {
    F1: [revShare('rev_auto'), revShare('rev_iem'), revShare('rev_smc')],
    F2: [revShare('rev_auto'), revShare('rev_iem'), revShare('rev_smc')],
    F3: [`=${A('a_auto')}`, `=1-${A('a_auto')}`, 0],
    S1: [`=${A('a_auto')}`, `=1-${A('a_auto')}`, 0],
    S2: [`=${A('s2_auto')}`, `=1-${A('s2_auto')}`, 0],
    S3: [`=${A('a_auto')}`, 0, `=1-${A('a_auto')}`],
    S4: [1, 0, 0],
    N1: [`=${O('energy', 'C')}*${A('n1_auto')}/${aC('N1')}`, `=${O('energy', 'D')}*${A('n1_iem')}/${aC('N1')}`, `=${O('energy', 'E')}*${A('n1_smc')}/${aC('N1')}`],
    N2: [0, 0, 1],
    N3: [revShare('rev_auto'), revShare('rev_iem'), revShare('rev_smc')],
    N4: [`=${F('rev_auto', 'F')}*${A('n4_auto')}/${aC('N4')}`, `=${F('rev_iem', 'F')}*${A('n4_iem')}/${aC('N4')}`, `=${F('rev_smc', 'F')}*${A('n4_smc')}/${aC('N4')}`],
    N6: [revShare('rev_auto'), revShare('rev_iem'), revShare('rev_smc')],
    N5: [0, 1, 0],
    O2: [1, 0, 0],
    O3: [1, 0, 0],
  };
  for (const k of LEVERS) {
    const [b26, b27, c26, c27, o26, k26, feas, months, why] = ramps[k];
    const n = () => s.n(`b_${k}`), an = () => s.n(`a_${k}`);
    const vals = [
      { v: c => `=B${an()}`, fmt: 'text' },
      c => `=C${an()}*IF(H${an()}=1,${A('a_real')},1)`,
      c => `=D${an()}`,
      c => `=C${n()}-D${n()}`,
      { v: b26, fmt: 'pct' }, { v: b27, fmt: 'pct' }, { v: c26, fmt: 'pct' }, { v: c27, fmt: 'pct' },
      c => `=E${an()}`,
      { v: o26, fmt: 'pct' },
      c => `=F${an()}`,
      { v: k26, fmt: 'pct' },
      c => `=C${n()}*F${n()}-D${n()}*H${n()}-J${n()}*K${n()}`,
      c => `=0.5*(C${n()}*G${n()}-D${n()}*I${n()})-J${n()}*(1-K${n()})`,
      c => `=N${n()}+O${n()}`,
      c => `=L${n()}*M${n()}`,
      c => `=L${n()}-Q${n()}`,
      feas == null ? null : { v: feas, fmt: 'int' }, months == null ? null : { v: months, fmt: 'int' },
      ...splits[k].map(v => ({ v, fmt: 'pct' })),
      { v: c => `=U${n()}+V${n()}+W${n()}`, fmt: 'pct' },
    ];
    s.row(`b_${k}`, `=A${s.n('a_' + k)}`, vals, { start: 'B', note: why });
  }
  const bTot = c => `=SUM(${c}${bFirst()}:${c}${bLast()})`;
  s.row('b_tot', 'Total', [null, ...['C', 'D', 'E'].map(bTot), null, null, null, null, bTot('J'), null, bTot('L'), null, ...['N', 'O', 'P', 'Q', 'R'].map(bTot)], { start: 'B', total: true, key: true });
  s.blank();
  s.sub('Part C — Workstream view (what the deck shows)');
  s.header(['Workstream', '', 'Net RR', 'EBITDA 2026', 'EBITDA H1-27', 'EBITDA 18m', 'One-off 18m', 'Capex 18m', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
  const rngB = col => `$${col}$${bFirst()}:$${col}$${bLast()}`;
  WORKSTREAMS.forEach((w, i) => {
    const key = `ws_${i}`;
    s.row(key, w, ['E', 'N', 'O', 'P', 'J', 'L'].map(col => c => `=SUMIF(${rngB('B')},$A${s.n(key)},${rngB(col)})`));
  });
  const wsTot = c => `=SUM(${c}${s.n('ws_0')}:${c}${s.n('ws_' + (WORKSTREAMS.length - 1))})`;
  s.row('ws_tot', 'Total', ['C', 'D', 'E', 'F', 'G', 'H'].map(wsTot), { total: true });
  s.row('ws_chk', 'Check: workstream total − initiative total (should be 0)', [c => `=C${s.n('ws_tot')}-E${s.n('b_tot')}`], { italic: true });
  s.blank();
  s.sub('Part D — Working-capital release (cash only; separate from recurring EBITDA as the case requires)');
  s.header(['USD m', '', '2025A', 'Dec-26', 'Jun-27', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
  s.row('w_invd', 'Inventory days', [`=${X(dg, 'invd', 'F')}`, `=${A('w_inv26')}`, `=${A('w_inv27')}`], { fmt: 'num' });
  s.row('w_inv', 'Inventory balance (at 2025 COGS)', [`=${F('inv', 'F')}`, c => `=D${s.n('w_invd')}*${F('cogs', 'F')}/365`, c => `=E${s.n('w_invd')}*${F('cogs', 'F')}/365`]);
  s.row('w_invr', 'Inventory release in period', [null, c => `=C${s.n('w_inv')}-D${s.n('w_inv')}`, c => `=D${s.n('w_inv')}-E${s.n('w_inv')}`]);
  s.row('w_dso', 'Receivable days', [`=${X(dg, 'dso', 'F')}`, `=${A('w_dso26')}`, `=${A('w_dso27')}`], { fmt: 'num' });
  s.row('w_ar', 'Receivables balance (at 2025 revenue)', [`=${F('ar', 'F')}`, c => `=D${s.n('w_dso')}*${F('rev', 'F')}/365`, c => `=E${s.n('w_dso')}*${F('rev', 'F')}/365`]);
  s.row('w_arr', 'Receivables release in period', [null, c => `=C${s.n('w_ar')}-D${s.n('w_ar')}`, c => `=D${s.n('w_ar')}-E${s.n('w_ar')}`]);
  s.row('w_rel', 'Total working-capital release', [null, c => `=D${s.n('w_invr')}+D${s.n('w_arr')}`, c => `=E${s.n('w_invr')}+E${s.n('w_arr')}`], { total: true, key: true, note: 'One-off cash, not EBITDA' });
}

// =====================================================================
// Projection
// =====================================================================
{
  const s = pj;
  const F = (k, c) => X(cf, k, c);
  const I = (k, c) => X(ini, k, c);
  const n = k => s.n(k);
  s.title('Projection — base (momentum) vs plan, Jan-2026 to Jun-2027');
  s.note('Base = current digital scope continues and all capex requests are approved; no new initiatives. Plan = this strategy at the base-case realisation factor. RR columns annualise the June-2027 exit position.');
  s.blank();
  s.header(['USD m', '', '2025A', '2026 Base', 'H1-27 Base', '18m Base', '2026 Plan', 'H1-27 Plan', '18m Plan', 'Jun-27 RR Base', 'Jun-27 RR Plan', 'Note']);
  const cols = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
  const flow = ['C', 'D', 'E', 'F', 'G', 'H', 'I'];
  const row9 = (key, label, m, o) => s.row(key, label, cols.map(c => m[c] === undefined ? null : m[c]), o);
  const sum18 = key => ({ F: c => `=D${n(key)}+E${n(key)}`, I: c => `=G${n(key)}+H${n(key)}` });
  const debt25 = `(${F('std', 'F')}+${F('ltd', 'F')})`;
  s.sub('EBITDA');
  row9('eb0', 'EBITDA 2025 (starting point)', { C: `=${F('ebitda', 'F')}`, D: c => `=C${n('eb0')}`, E: c => `=C${n('eb0')}*0.5`, ...sum18('eb0'), G: c => `=C${n('eb0')}`, H: c => `=C${n('eb0')}*0.5`, J: c => `=C${n('eb0')}`, K: c => `=C${n('eb0')}` }, { note: 'Revenue and underlying margin held at 2025 (Assumptions)' });
  row9('roll', 'One-off 2025 implementation costs rolling off (Ex.6)', { D: `=${X(dg, 'rolloff', 'C')}`, E: `=${X(dg, 'temp25', 'C')}*0.5`, ...sum18('roll'), G: c => `=D${n('roll')}`, H: c => `=E${n('roll')}`, J: `=${X(dg, 'temp25', 'C')}`, K: `=${X(dg, 'temp25', 'C')}` }, { note: '23 of 2025 temporary costs do not recur; 6 of remaining work falls in 2026. Happens in both cases — not claimed' });
  row9('init', 'Initiatives, net of costs (at realisation factor)', { D: 0, E: 0, ...sum18('init'), G: `=${I('b_tot', 'N')}`, H: `=${I('b_tot', 'O')}`, J: 0, K: `=${I('b_tot', 'E')}` }, { note: 'Initiatives Part B' });
  row9('ebitda', 'EBITDA', Object.fromEntries(cols.map(c => [c, cc => `=SUM(${c}${n('eb0')}:${c}${n('init')})`])), { total: true, key: true });
  row9('rev', 'Revenue (run-rate)', { C: `=${F('rev', 'F')}`, J: `=${F('rev', 'F')}`, K: `=${F('rev', 'F')}+${I('a_tot', 'G')}*${A('a_real')}` }, { note: 'Plan adds price realisation (N4) and service revenue (N5)' });
  row9('ebm', 'EBITDA margin (run-rate)', { C: c => `=C${n('ebitda')}/C${n('rev')}`, J: c => `=J${n('ebitda')}/J${n('rev')}`, K: c => `=K${n('ebitda')}/K${n('rev')}` }, { fmt: 'pct' });
  s.sub('Cash flow');
  row9('int_b', 'Interest at 2025 rate on opening debt', { C: `=-${F('fin', 'F')}`, D: `=-${A('a_rate')}*${debt25}`, E: c => `=-${A('a_rate')}*D${n('debt')}*0.5`, ...sum18('int_b'), G: `=-${A('a_rate')}*${debt25}`, H: c => `=-${A('a_rate')}*G${n('debt')}*0.5`, J: c => `=-${A('a_rate')}*E${n('debt')}`, K: c => `=-${A('a_rate')}*H${n('debt')}` }, { note: 'Implied 2025 rate × opening debt of each period' });
  row9('int_p', 'Refinancing premium (short-term debt rolled + new money)', { C: 0, D: `=-${A('a_prem')}*${F('std', 'F')}*0.5`, E: c => `=-${A('a_prem')}*(${F('std', 'F')}+D${n('raise')})*0.5`, ...sum18('int_p'), G: `=-${A('a_prem')}*${F('std', 'F')}*0.5`, H: c => `=-${A('a_prem')}*(${F('std', 'F')}+G${n('raise')})*0.5`, J: c => `=-${A('a_prem')}*(${F('std', 'F')}+F${n('raise')})`, K: c => `=-${A('a_prem')}*(${F('std', 'F')}+I${n('raise')})` }, { note: '180 matures through 2026 (rolled evenly → half-year of premium in 2026), fully repriced from 2027; new money priced the same' });
  row9('int', 'Net finance costs', Object.fromEntries(cols.map(c => [c, cc => `=${c}${n('int_b')}+${c}${n('int_p')}`])), { total: true });
  row9('tax', 'Cash tax', { C: `=-${F('tax', 'F')}`, D: `=-${A('a_tax')}`, E: `=-${A('a_tax')}*0.5`, ...sum18('tax'), G: `=-${A('a_tax')}`, H: `=-${A('a_tax')}*0.5` }, { note: 'Losses: PBT check below' });
  row9('wc', 'Working-capital release (+) / build (−)', { C: `=${F('cf_wc', 'F')}`, D: 0, E: 0, ...sum18('wc'), G: `=${I('w_rel', 'D')}`, H: `=${I('w_rel', 'E')}` }, { note: 'Base: days held flat. Plan: Initiatives Part D' });
  row9('ocf', 'Operating cash flow after interest and tax', Object.fromEntries(flow.map(c => [c, cc => `=${c}${n('ebitda')}+${c}${n('int')}+${c}${n('tax')}+${c}${n('wc')}`])), { total: true });
  row9('cx_m', 'Maintenance capex', { C: `=${F('cf_maint', 'F')}`, D: `=-${A('p_maint')}`, E: `=-${A('p_maint')}*0.5`, ...sum18('cx_m'), G: `=-${A('p_maint')}`, H: `=-${A('p_maint')}*0.5` }, { note: 'Held at 45/yr in both cases' });
  row9('cx_e', 'Upgrade & expansion capex', { C: `=${F('cf_upg', 'F')}`, D: `=-${A('b_exp')}`, E: `=-${A('b_exp')}*0.5`, ...sum18('cx_e'), G: `=-${A('p_exp')}`, H: `=-${A('p_exp')}*0.5` }, { note: 'Plan defers expansion: no segment is capacity-constrained' });
  row9('cx_d', 'Digital capex', { C: `=${F('cf_fof', 'F')}`, D: `=-${A('b_digcap')}*${A('b_split')}`, E: `=-${A('b_digcap')}*(1-${A('b_split')})`, ...sum18('cx_d'), G: `=-${I('b_tot', 'Q')}`, H: `=-${I('b_tot', 'R')}` }, { note: 'Base: 30 requested. Plan: re-prioritised, stage-gated portfolio' });
  row9('capex', 'Total capex', Object.fromEntries(flow.map(c => [c, cc => `=SUM(${c}${n('cx_m')}:${c}${n('cx_d')})`])), { total: true });
  row9('fcf', 'Free cash flow (before disposals and financing)', Object.fromEntries(flow.map(c => [c, cc => `=${c}${n('ocf')}+${c}${n('capex')}`])), { total: true, key: true });
  s.sub('Balance sheet (all shortfalls funded with debt; funding bridge shown below)');
  row9('raise', 'Debt raised (+) / repaid (−) to hold minimum cash', { D: c => `=-D${n('fcf')}-(${F('cash', 'F')}-${A('a_mincash')})`, E: c => `=-E${n('fcf')}`, ...sum18('raise'), G: c => `=-G${n('fcf')}-(${F('cash', 'F')}-${A('a_mincash')})`, H: c => `=-H${n('fcf')}` });
  row9('cash', 'Closing cash', { C: `=${F('cash', 'F')}`, D: `=${A('a_mincash')}`, E: `=${A('a_mincash')}`, F: c => `=E${n('cash')}`, G: `=${A('a_mincash')}`, H: `=${A('a_mincash')}`, I: c => `=H${n('cash')}` });
  row9('debt', 'Closing debt', { C: `=${debt25}`, D: c => `=C${n('debt')}+D${n('raise')}`, E: c => `=D${n('debt')}+E${n('raise')}`, F: c => `=E${n('debt')}`, G: c => `=C${n('debt')}+G${n('raise')}`, H: c => `=G${n('debt')}+H${n('raise')}`, I: c => `=H${n('debt')}` });
  row9('nd', 'Net debt', { ...Object.fromEntries(flow.map(c => [c, cc => `=${c}${n('debt')}-${c}${n('cash')}`])), J: c => `=E${n('nd')}`, K: c => `=H${n('nd')}` }, { total: true, key: true });
  s.sub('Credit metrics (period / run-rate)');
  row9('lev', 'Net debt / EBITDA (run-rate at period end)', { C: c => `=C${n('nd')}/C${n('ebitda')}`, D: c => `=D${n('nd')}/D${n('ebitda')}`, E: c => `=E${n('nd')}/J${n('ebitda')}`, F: c => `=E${n('lev')}`, G: c => `=G${n('nd')}/G${n('ebitda')}`, H: c => `=H${n('nd')}/K${n('ebitda')}`, I: c => `=H${n('lev')}`, J: c => `=J${n('nd')}/J${n('ebitda')}`, K: c => `=K${n('nd')}/K${n('ebitda')}` }, { fmt: 'x' });
  row9('icov', 'Interest cover (EBITDA / finance costs)', Object.fromEntries(cols.map(c => [c, cc => `=${c}${n('ebitda')}/-${c}${n('int')}`])), { fmt: 'x' });
  row9('pbt', 'Check: PBT ≈ EBITDA − D&A − interest (must be < 0 for zero tax)', { D: c => `=D${n('ebitda')}-${A('a_da')}+D${n('int')}`, E: c => `=E${n('ebitda')}-${A('a_da')}*0.5+E${n('int')}`, G: c => `=G${n('ebitda')}-${A('a_da')}+G${n('int')}`, H: c => `=H${n('ebitda')}-${A('a_da')}*0.5+H${n('int')}`, J: c => `=J${n('ebitda')}-${A('a_da')}+J${n('int')}`, K: c => `=K${n('ebitda')}-${A('a_da')}+K${n('int')}` }, { italic: true });
  s.blank();
  s.sub('Lender view at Jun-27 — last twelve months (LTM) vs run-rate');
  s.header(['', '', 'Base', 'Plan', 'Δ', '', '', '', '', '', '', 'Note']);
  const bp = (key, label, b, p, o = {}) => s.row(key, label, [b, p, c => `=D${n(key)}-C${n(key)}`], o);
  bp('l_eb', 'LTM EBITDA (≈ half of 2026 + H1-27)', c => `=0.5*D${n('ebitda')}+E${n('ebitda')}`, c => `=0.5*G${n('ebitda')}+H${n('ebitda')}`, { note: 'Conservative for the plan: in a ramp, H2-26 > H1-26' });
  bp('l_int', 'LTM net finance costs', c => `=-(0.5*D${n('int')}+E${n('int')})`, c => `=-(0.5*G${n('int')}+H${n('int')})`);
  bp('l_cov', 'LTM interest cover', c => `=C${n('l_eb')}/C${n('l_int')}`, c => `=D${n('l_eb')}/D${n('l_int')}`, { fmt: 'x', key: true, note: 'What lenders test at the refinancing' });
  bp('l_nd', 'Net debt at Jun-27', c => `=E${n('nd')}`, c => `=H${n('nd')}`);
  bp('l_lev', 'Net debt / LTM EBITDA', c => `=C${n('l_nd')}/C${n('l_eb')}`, c => `=D${n('l_nd')}/D${n('l_eb')}`, { fmt: 'x', key: true });
  bp('r_eb', 'Run-rate EBITDA at Jun-27', c => `=J${n('ebitda')}`, c => `=K${n('ebitda')}`);
  bp('r_cov', 'Run-rate interest cover', c => `=J${n('icov')}`, c => `=K${n('icov')}`, { fmt: 'x' });
  bp('r_lev', 'Net debt / run-rate EBITDA', c => `=J${n('lev')}`, c => `=K${n('lev')}`, { fmt: 'x' });
  bp('be_eb', 'EBITDA needed for free-cash-flow break-even at run-rate', c => `=-J${n('int')}+${A('p_maint')}+${A('b_exp')}+${A('a_capss')}`, c => `=-K${n('int')}+${A('p_maint')}+${A('p_exp')}+${A('a_capss')}`, { note: 'Interest + maintenance + expansion + steady-state digital capex' });
  bp('be_gap', 'Run-rate EBITDA minus break-even EBITDA', c => `=C${n('r_eb')}-C${n('be_eb')}`, c => `=D${n('r_eb')}-D${n('be_eb')}`, { total: true, key: true, note: 'Negative = debt still grows after Jun-27 → balance-sheet action is required, digital alone cannot stop it' });
  s.blank();
  s.sub('Sources & uses of cash, Jan-26 to Jun-27 (funding bridge)');
  s.header(['USD m', '', 'Base', 'Plan', 'Δ', '', '', '', '', '', '', 'Note']);
  bp('u_fcf', 'Use: free-cash-flow deficit', c => `=-F${n('fcf')}`, c => `=-I${n('fcf')}`);
  bp('u_std', 'Use: short-term debt falling due', `=${F('std', 'F')}`, `=${F('std', 'F')}`);
  bp('u_tot', 'Total uses', c => `=C${n('u_fcf')}+C${n('u_std')}`, c => `=D${n('u_fcf')}+D${n('u_std')}`, { total: true });
  bp('s_roll', 'Source: roll over short-term debt (at premium)', `=${F('std', 'F')}`, `=${F('std', 'F')}`, { note: 'Requires lenders to believe the plan: LTM cover above 1.0x' });
  bp('s_disp', 'Source: further non-core licence disposals', `=${A('fs_disp')}`, `=${A('fs_disp')}`);
  bp('s_slb', 'Source: sale-and-leaseback', `=${A('fs_slb')}`, `=${A('fs_slb')}`);
  bp('s_scf', 'Source: supply-chain finance / factoring', `=${A('fs_scf')}`, `=${A('fs_scf')}`);
  bp('s_new', 'Source: new term debt / revolving credit (balancing)', c => `=C${n('u_tot')}-SUM(C${n('s_roll')}:C${n('s_scf')})`, c => `=D${n('u_tot')}-SUM(D${n('s_roll')}:D${n('s_scf')})`, { total: true, key: true, note: 'Genuinely new money the CEO must raise' });
  bp('s_tot', 'Total sources', c => `=SUM(C${n('s_roll')}:C${n('s_new')})`, c => `=SUM(D${n('s_roll')}:D${n('s_new')})`, { total: true });
  s.blank();
  s.sub('Headlines (plan vs base)');
  s.header(['', '', 'Value', '', '', '', '', '', '', '', '', '']);
  s.row('h_eb', 'Run-rate EBITDA uplift at Jun-27 vs base', [c => `=K${n('ebitda')}-J${n('ebitda')}`], { total: true });
  s.row('h_fcf', '18-month free cash flow improvement vs base', [c => `=I${n('fcf')}-F${n('fcf')}`], { total: true });
  s.row('h_nd', 'Net debt at Jun-27: plan minus base', [c => `=H${n('nd')}-E${n('nd')}`], { total: true });
  s.row('h_build', 'Net-debt build over 18 months: plan as % of base', [c => `=(H${n('nd')}-C${n('nd')})/(E${n('nd')}-C${n('nd')})`], { fmt: 'pct' });
  s.row('h_digben', 'Digital & analytics benefits, Jun-27 RR (2025 realised + new, excl. F3)', [`=${X(cd, 'ben', 'F')}+(${I('b_tot', 'C')}-${I('b_F3', 'C')})`]);
  s.row('h_digcost', 'Digital & AI opex, Jun-27 RR (recurring + central + new − F3 saving)', [`=${X(cd, 'rec', 'F')}+${X(cd, 'central', 'C')}+${I('b_tot', 'D')}-${I('b_F3', 'C')}`]);
  s.row('h_dignet', 'Net digital contribution, Jun-27 RR (2025: −35)', [c => `=C${n('h_digben')}-C${n('h_digcost')}`], { total: true, key: true });
}

// =====================================================================
// Segments
// =====================================================================
{
  const s = sg;
  const r = (k, c) => R(s, k, c);
  const F = (k, c) => X(cf, k, c);
  const grp = key => c => `=SUM(C${s.n(key)}:E${s.n(key)})`;
  const rng = col => `${ini.name}!$${col}$${bFirst()}:$${col}$${bLast()}`;
  s.title('Segments — June-2027 run-rate by business (USD m)');
  s.note('Answers "where is a Group-wide approach right and where not?" and whether Auto moves out of forced-sale territory.');
  s.blank();
  s.header(['', '', 'Auto', 'IEM', 'SMC', 'Group', '', 'Note']);
  s.row('rev25', 'Revenue 2025', [`=${F('rev_auto', 'F')}`, `=${F('rev_iem', 'F')}`, `=${F('rev_smc', 'F')}`, grp('rev25')]);
  s.row('eb25', 'EBITDA 2025', [`=${F('eb_auto', 'F')}`, `=${F('eb_iem', 'F')}`, `=${F('eb_smc', 'F')}`, grp('eb25')]);
  s.row('m25', 'EBITDA margin 2025', all(4, c => `=${r('eb25', c)}/${r('rev25', c)}`), { fmt: 'pct' });
  s.row('roll', 'One-off implementation costs rolling off', [`=${X(cd, 'temp', 'F')}*${A('a_auto')}`, `=(${X(cd, 'temp', 'C')}+${X(cd, 'temp', 'E')})*(1-${A('a_auto')})`, `=${X(cd, 'temp', 'D')}*(1-${A('a_auto')})`, grp('roll')], { note: 'PdM & SCP third plant is IEM; Vision third plant is SMC (Ex.7)' });
  s.row('init', 'Initiatives, net run-rate (incl. overlap netting)', [c => `=SUMPRODUCT(${rng('E')},${rng('U')})`, c => `=SUMPRODUCT(${rng('E')},${rng('V')})`, c => `=SUMPRODUCT(${rng('E')},${rng('W')})`, grp('init')], { note: 'Net run-rate × segment split (Initiatives Part B)' });
  s.row('rr', 'EBITDA — Jun-27 run-rate', all(3, c => `=${r('eb25', c)}+${r('roll', c)}+${r('init', c)}`).concat([grp('rr')]), { total: true, key: true });
  s.row('rr_chk', 'Check: Group vs Projection run-rate (should be 0)', [null, null, null, c => `=F${s.n('rr')}-${X(pj, 'ebitda', 'K')}`], { italic: true });
  s.row('revrr', 'Revenue — Jun-27 run-rate', [`=${F('rev_auto', 'F')}*(1+${A('n4_auto')}*${A('a_real')})`, `=${F('rev_iem', 'F')}*(1+(${A('n4_iem')}+${A('n5_rev')})*${A('a_real')})`, `=${F('rev_smc', 'F')}*(1+${A('n4_smc')}*${A('a_real')})`, grp('revrr')]);
  s.row('mrr', 'EBITDA margin — Jun-27 run-rate', all(4, c => `=${r('rr', c)}/${r('revrr', c)}`), { fmt: 'pct', key: true, note: 'Auto profitable again but below its own 11.1% (2022). Supplier benchmarks are mostly EBIT (after D&A): compare like-for-like' });
  s.row('dm', 'Margin change (pp)', all(4, c => `=${r('mrr', c)}-${r('m25', c)}`), { fmt: 'pct' });
  s.row('util', 'Capacity utilisation 2025 (context)', [`=${X(co, 'util', 'C')}`, `=${X(co, 'util', 'D')}`, `=${X(co, 'util', 'E')}`], { fmt: 'pct', note: 'Auto & SMC are demand-constrained: downtime reduction saves cost there, adds throughput only in IEM' });
  s.row('smc_be', 'SMC price realisation needed for break-even (vs 1.0% assumed)', [null, null, c => `=${A('n4_smc')}-E${s.n('rr')}/(${F('rev_smc', 'F')}*${A('a_real')})`], { fmt: 'pct', key: true, note: 'The month-6 fix-or-exit test' });
  s.blank();
  s.sub('SMC exit case (run-rate EBITDA effect only)');
  s.row('x_rr', 'SMC run-rate EBITDA removed', [null, null, null, c => `=-E${s.n('rr')}`]);
  s.row('x_str', 'Stranded central digital & foundation costs left with the Group', [null, null, null, c => `=-(${X(cd, 'central', 'C')}+${A('f1_rec')}+${A('f2_rec')})*${F('rev_smc', 'F')}/${F('rev', 'F')}`], { note: 'Excludes undisclosed corporate overhead allocated to SMC → understates the stranded cost' });
  s.row('x_net', 'Change in Group run-rate EBITDA from exiting SMC', [null, null, null, c => `=F${s.n('x_rr')}+F${s.n('x_str')}`], { total: true, key: true, note: 'Close to zero: exit is not an EBITDA fix; its value is cash (working capital, capex) and management focus. Loss-making unit → minimal proceeds' });
}

// =====================================================================
// Sensitivity
// =====================================================================
{
  const s = sn;
  const r = (k, c) => R(s, k, c);
  const Pj = (k, c) => X(pj, k, c);
  const I = (k, c) => X(ini, k, c);
  s.title('Sensitivity — how robust is the Jun-27 position?');
  s.blank();
  s.sub('1. Benefit realisation (initiative benefits scaled, except contractual F3; costs unchanged)');
  s.header(['', '', 'Downside', 'Base', 'Stretch', 'Upside', '', 'Note']);
  s.row('f', 'Benefit realisation', [0.5, 0.75, 1.0, 1.25], { fmt: 'pct' });
  const eb = f => `${Pj('ebitda', 'J')}+${I('a_totn', 'C')}+${I('a_totr', 'C')}*${f}-${I('a_tot', 'D')}`;
  s.row('eb', 'Jun-27 run-rate EBITDA', all(4, c => `=${eb(r('f', c))}`), { key: true, note: 'Momentum run-rate + benefits × factor − recurring costs' });
  s.row('m', 'EBITDA margin', all(4, c => `=${r('eb', c)}/${Pj('rev', 'J')}`), { fmt: 'pct' });
  s.row('lev', 'Net debt / run-rate EBITDA (net debt at base-case plan)', all(4, c => `=${Pj('nd', 'K')}/${r('eb', c)}`), { fmt: 'x', note: 'Approximation: holds Jun-27 net debt at the base-case plan value' });
  s.row('icov', 'Run-rate interest cover', all(4, c => `=${r('eb', c)}/-${Pj('int', 'K')}`), { fmt: 'x' });
  s.row('f15', 'Realisation needed for run-rate interest cover of 1.5x', [c => `=(-1.5*${Pj('int', 'K')}-${Pj('ebitda', 'J')}-${I('a_totn', 'C')}+${I('a_tot', 'D')})/${I('a_totr', 'C')}`], { fmt: 'pct' });
  s.row('f20', 'Realisation needed for run-rate interest cover of 2.0x', [c => `=(-2*${Pj('int', 'K')}-${Pj('ebitda', 'J')}-${I('a_totn', 'C')}+${I('a_tot', 'D')})/${I('a_totr', 'C')}`], { fmt: 'pct', note: 'Above 100% → 2.0x needs balance-sheet action, not more digital' });
  s.blank();
  s.sub('2. One-at-a-time shocks to Jun-27 run-rate EBITDA (base-case plan)');
  s.header(['', '', 'Shock', 'Δ EBITDA', 'EBITDA after', 'Cover after', '', 'Note']);
  const shock = (key, label, size, delta, note) => s.row(key, label, [size, delta, c => `=${Pj('ebitda', 'K')}+D${s.n(key)}`, { v: c => `=E${s.n(key)}/-${Pj('int', 'K')}`, fmt: 'x' }], { note });
  shock('sh_price', 'Auto OEM price-down not recovered', { v: 0.01, fmt: 'pct' }, c => `=-${X(cf, 'rev_auto', 'F')}*C${s.n('sh_price')}`, 'Each 1% ≈ 5.7 — why index-linked pass-through (N4) matters');
  shock('sh_vol', 'Auto OEM volume loss', { v: 0.05, fmt: 'pct' }, c => `=-${X(cf, 'rev_auto', 'F')}*C${s.n('sh_vol')}*${A('sh_cm')}`, 'At 25% contribution margin; utilisation would fall further below 72%');
  shock('sh_energy', 'Energy price increase', { v: 0.10, fmt: 'pct' }, c => `=-${X(co, 'energy', 'F')}*C${s.n('sh_energy')}`, 'Energy is 120 of COGS; N1 metering and N4 index clauses partly hedge');
  shock('sh_scale', 'PdM & vision scale-ups stopped at their gates', { v: 1, fmt: 'pct' }, c => `=-(${I('b_S2', 'E')}+${I('b_S4', 'E')})*C${s.n('sh_scale')}`, 'Small: gates cap the downside');
  shock('sh_comm', 'Procurement & pass-through deliver only this share', { v: 0.5, fmt: 'pct' }, c => `=-(${I('b_N3', 'C')}+${I('b_N4', 'C')}+${I('b_O2', 'C')})*(1-C${s.n('sh_comm')})`, 'Net of the O2 overlap');
  shock('sh_smc', 'Exit SMC', { v: 'exit', fmt: 'text' }, c => `=${X(sg, 'x_net', 'F')}`, 'From Segments: near-neutral on EBITDA');
  s.row('sh_rate', 'Refinancing premium +200bp higher than assumed', [{ v: 0.02, fmt: 'pct' }, null, null, { v: c => `=${Pj('ebitda', 'K')}/(-${Pj('int', 'K')}+C${s.n('sh_rate')}*(${X(cf, 'std', 'F')}+${Pj('raise', 'I')}))`, fmt: 'x' }], { note: 'Interest, not EBITDA: applied to the 180 + new money' });
}

// =====================================================================
// Sources
// =====================================================================
{
  const s = src;
  s.title('Sources — external benchmarks (verified 30 Sep 2026)');
  s.note('Case data is authoritative; benchmarks are used only to size assumptions where the case is silent.');
  s.blank();
  s.header(['ID', 'Benchmark (quoted from source)', 'Source', 'Used for', 'URL', 'Accessed']);
  const rows = [
    ['B1', 'Predictive maintenance typically reduces machine downtime by 30–50% and increases machine life by 20–40%', 'McKinsey & Company, "Manufacturing: Analytics unleashes productivity and profitability", 14 Aug 2017', 'S1, S2 downtime target', 'https://www.mckinsey.com/capabilities/operations/our-insights/manufacturing-analytics-unleashes-productivity-and-profitability'],
    ['B2', 'Optimised advanced process controls: up to 15% more throughput, 5% more yield, 10% less energy', 'McKinsey & Company, "The potential of advanced process controls in energy and materials", 23 Nov 2020', 'N1 energy, N2 yield', 'https://www.mckinsey.com/industries/metals-and-mining/our-insights/the-potential-of-advanced-process-controls-in-energy-and-materials'],
    ['B3', 'ISO 50001-certified facilities achieve ~4.1% annual energy-performance improvement in the first year and ~3.4% after twelve years', 'Fitzgerald, Therkelsen, Sheaffer, Rao (Lawrence Berkeley National Laboratory), "Deeper and persistent energy savings and CO2 reductions achieved through ISO 50001 in the manufacturing sector", 2023', 'N1 energy', 'https://smartersmallbuildings.lbl.gov/publications/deeper-and-persistent-energy-savings'],
    ['B4', 'Reducing overall spending by 6–12% is a realistic goal in chemicals procurement', 'McKinsey & Company, "Technology-enabled procurement for chemical companies", 1 Oct 2019', 'N3 procurement', 'https://www.mckinsey.com/industries/chemicals/our-insights/technology-enabled-procurement-for-chemical-companies'],
    ['B5', 'Across 1,000+ pricing-excellence initiatives, return on sales typically rises 2–7 percentage points', 'McKinsey & Company, "Turning pricing power into profit", 1 Mar 2015', 'N4 commercial', 'https://www.mckinsey.com/capabilities/growth-marketing-and-sales/our-insights/turning-pricing-power-into-profit'],
    ['B6', 'Average EBIT margin for aftermarket services 25% vs 10% for new equipment (30 industries)', 'McKinsey & Company, "Industrial aftermarket services: Growing the core", 27 Jul 2017', 'N5 service margin', 'https://www.mckinsey.com/industries/industrials/our-insights/industrial-aftermarket-services-growing-the-core'],
    ['B7', 'Diagnosed ~20% inventory-reduction opportunity; achieved 30% reduction with OTIF rising to 95%', 'McKinsey & Company, "Supply Chain 4.0: Opportunities to use your supply chain for differentiation", 24 May 2019', 'Inventory days target', 'https://www.mckinsey.com/capabilities/operations/our-insights/operations-blog/supply-chain-40-opportunities-to-use-your-supply-chain-for-differentiation'],
    ['B8', 'Generative AI applied to customer care could increase productivity by 30–45% of current function costs', 'McKinsey & Company, "The economic potential of generative AI: The next productivity frontier", 14 Jun 2023', 'N6 back-office & support automation', 'https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/the-economic-potential-of-generative-ai-the-next-productivity-frontier'],
  ];
  rows.forEach(([id, b, so, u, url]) => s.row(`src_${id}`, id, [b, so, u, url, '30-Sep-26'].map(v => ({ v, fmt: 'text' })), { start: 'B' }));
}

// =====================================================================
// Cover
// =====================================================================
{
  const s = cov;
  const Pj = (k, c) => X(pj, k, c);
  s.title('Ironbridge Industrial Group — Digital transformation model');
  s.note('Armageddon 2026 case submission support. Team ID: [to be added]. USD million unless stated; baseline FY2025; mandate Jan-2026 to Jun-2027. Plan shown at the base-case realisation factor (Assumptions).');
  s.blank();
  s.sub('Win condition — is Ironbridge "turned around" by Jun-27?');
  s.header(['Test', 'Unit', 'Target', 'Plan', 'Result', 'Why this test']);
  const win = (key, label, unit, tgt, val, fmt, cmp, note) => s.row(key, label, [tgt, val, c => `=IF(D${s.n(key)}${cmp}C${s.n(key)},"MET","NOT MET")`], { unit, fmt, note, key: true, fmtList: [fmt, fmt, 'text'] });
  win('w_liq', '1 Liquidity: new money needed beyond rollover + identified sources', 'USD m', `=${A('t_liq')}`, `=${Pj('s_new', 'D')}`, 'num', '<=', 'Mandate is funded without fresh money (momentum needs it)');
  win('w_cov', '2 Solvency: exit interest cover, downside case (50% realisation)', 'x', `=${A('t_cov')}`, `=${X(sn, 'icov', 'C')}`, 'x', '>=', 'Earnings cover interest even if only half the benefits land');
  win('w_auto', '3 Auto: run-rate EBITDA vs its share of maintenance capex', 'USD m', `=${A('t_auto_pl')}`, `=${X(sg, 'rr', 'C')}`, 'num', '>=', 'Auto funds its own upkeep → no longer a cash drain, so no case for a forced sale');
  win('w_dig', '4 Digital: net digital contribution (run-rate)', 'USD m', `=${A('t_dig')}`, `=${Pj('h_dignet', 'C')}`, 'num', '>', 'Digital pays for itself');
  s.blank();
  s.sub('Key outputs');
  s.header(['', 'Unit', 'Base (momentum)', 'Plan', 'Δ', 'Note']);
  const out = (key, label, unit, b, p, fmt, note) => s.row(key, label, [b, p, c => `=D${s.n(key)}-C${s.n(key)}`], { unit, fmt, note, key: true });
  s.row('o_eb25', 'EBITDA 2025A', [`=${Pj('ebitda', 'C')}`], { unit: 'USD m' });
  out('o_ebrr', 'EBITDA — Jun-27 run-rate', 'USD m', `=${Pj('ebitda', 'J')}`, `=${Pj('ebitda', 'K')}`, 'num', 'Base includes the automatic roll-off of 23 of 2025 implementation costs (Ex.6)');
  out('o_mrr', 'EBITDA margin — Jun-27 run-rate', '%', `=${Pj('ebm', 'J')}`, `=${Pj('ebm', 'K')}`, 'pct', '');
  out('o_ltm', 'EBITDA — last twelve months to Jun-27', 'USD m', `=${Pj('l_eb', 'C')}`, `=${Pj('l_eb', 'D')}`, 'num', 'What lenders test');
  out('o_fcf', 'Free cash flow — 18 months', 'USD m', `=${Pj('fcf', 'F')}`, `=${Pj('fcf', 'I')}`, 'num', 'Before disposals and financing');
  out('o_nd', 'Net debt — Jun-27', 'USD m', `=${Pj('nd', 'E')}`, `=${Pj('nd', 'H')}`, 'num', '2025: 755');
  out('o_llev', 'Net debt / LTM EBITDA — Jun-27', 'x', `=${Pj('l_lev', 'C')}`, `=${Pj('l_lev', 'D')}`, 'x', '2025: 30.2x');
  out('o_lcov', 'Interest cover — LTM to Jun-27', 'x', `=${Pj('l_cov', 'C')}`, `=${Pj('l_cov', 'D')}`, 'x', '2025: 0.6x');
  out('o_rcov', 'Interest cover — Jun-27 run-rate', 'x', `=${Pj('r_cov', 'C')}`, `=${Pj('r_cov', 'D')}`, 'x', '');
  out('o_new', 'New money to raise (after rollover and identified sources)', 'USD m', `=${Pj('s_new', 'C')}`, `=${Pj('s_new', 'D')}`, 'num', 'Sources & uses on Projection');
  out('o_be', 'Run-rate EBITDA vs free-cash-flow break-even', 'USD m', `=${Pj('be_gap', 'C')}`, `=${Pj('be_gap', 'D')}`, 'num', 'Negative: balance-sheet action needed beyond Jun-27');
  s.row('o_auto', 'Auto EBITDA margin — Jun-27 run-rate (plan)', [null, `=${X(sg, 'mrr', 'C')}`], { unit: '%', fmt: 'pct', key: true, note: '2025: 0.9%' });
  s.row('o_dig', 'Net digital contribution — 2025 vs Jun-27 run-rate (plan)', [`=${X(dg, 'dig_net', 'C')}`, `=${Pj('h_dignet', 'C')}`, c => `=D${s.n('o_dig')}-C${s.n('o_dig')}`], { unit: 'USD m', key: true, note: 'Column C here = 2025 actual, not base' });
  s.row('o_stretch', 'Run-rate EBITDA at 100% realisation (stretch) / 50% (downside)', [`=${X(sn, 'eb', 'E')}`, `=${X(sn, 'eb', 'C')}`], { unit: 'USD m', note: 'C = stretch, D = downside' });
  s.blank();
  s.sub('Integrity checks (all should read OK)');
  s.header(['Check', '', 'Value', 'Status', '', '']);
  const chk = (key, label, expr, note) => s.row(key, label, [expr, c => `=IF(ABS(C${s.n(key)})<0.001,"OK","CHECK")`], { note, fmtList: ['num2', 'text'] });
  const abs4 = (sh, k, cs = ['C', 'D', 'E', 'F']) => '=' + cs.map(c => `ABS(${X(sh, k, c)})`).join('+');
  chk('c_bs', 'Balance sheet balances (2022–25)', abs4(cf, 'bs_chk'));
  chk('c_eb', 'Rebuilt EBITDA = case-reported (2022–25)', '=' + ['C', 'D', 'E', 'F'].map(c => `ABS(${X(cf, 'ebitda', c)}-${X(cf, 'ebitda_case', c)})`).join('+'));
  chk('c_ni', 'Rebuilt net income = case-reported (2022–25)', '=' + ['C', 'D', 'E', 'F'].map(c => `ABS(${X(cf, 'ni', c)}-${X(cf, 'ni_case', c)})`).join('+'));
  chk('c_opex', 'Opex breakdown = case total (2022–25)', '=' + ['C', 'D', 'E', 'F'].map(c => `ABS(${X(cf, 'opex', c)}-${X(cf, 'opex_case', c)})`).join('+'));
  chk('c_seg', 'Segments reconcile to Group revenue & EBITDA', '=' + ['C', 'D', 'E', 'F'].map(c => `ABS(${X(cf, 'rev_seg', c)}-${X(cf, 'rev', c)})+ABS(${X(cf, 'eb_seg', c)}-${X(cf, 'ebitda', c)})`).join('+'));
  chk('c_cash', 'Cash-flow closing cash = balance sheet (2023–25)', abs4(cf, 'cf_chk', ['D', 'E', 'F']));
  chk('c_debt', 'Debt raised = change in total debt (2023–25)', abs4(cf, 'cf_dchk', ['D', 'E', 'F']));
  chk('c_da', 'D&A split = total D&A (2023–25)', abs4(cf, 'da_chk', ['D', 'E', 'F']));
  chk('c_wc', 'Working-capital change = cash-flow line (2023–25)', abs4(dg, 'owc_chk', ['D', 'E', 'F']));
  chk('c_ex6', 'Ex.6 cost breakdown = Ex.5 operating cost', abs4(cd, 'opex_chk', ['C', 'D', 'E']));
  chk('c_dig', 'Project + central digital opex = Ex.1 digital opex', `=${X(dg, 'dig_chk', 'C')}`);
  chk('c_br', 'EBITDA bridge 2022→25 closes', `=${X(dg, 'br_chk', 'C')}`);
  chk('c_split', 'Initiative segment splits sum to 100%', `=SUM(${ini.name}!$X$${bFirst()}:$X$${bLast()})-ROWS(${ini.name}!$X$${bFirst()}:$X$${bLast()})`);
  chk('c_ws', 'Workstream view = initiative total', `=${X(ini, 'ws_chk', 'C')}`);
  chk('c_segrr', 'Segment run-rates sum to Group run-rate', `=${X(sg, 'rr_chk', 'F')}`);
  chk('c_su', 'Sources = uses (plan)', `=${Pj('s_tot', 'D')}-${Pj('u_tot', 'D')}`);
  s.row('c_tax', 'Zero cash tax valid: highest projected PBT', [`=MAX(${pj.name}!$D$${pj.n('pbt')}:$K$${pj.n('pbt')})`, c => `=IF(C${s.n('c_tax')}<0,"OK","CHECK")`], { fmtList: ['num', 'text'], note: 'Must be negative' });
  s.blank();
  s.sub('How to read this workbook');
  s.row('l1', 'Blue text', ['Input typed from the case or an assumption'], { fmt: 'text', legend: 'input' });
  s.row('l2', 'Black text', ['Formula'], { fmt: 'text' });
  s.row('l3', 'Green text', ['Direct link to another sheet'], { fmt: 'text', legend: 'link' });
  s.row('l4', 'Yellow fill', ['Key driver or headline output'], { fmt: 'text', legend: 'key' });
  s.blank();
  s.sub('Sheet guide');
  [['Case_Financials', 'Exhibits 1–4 typed in, subtotals rebuilt and reconciled'],
  ['Case_Digital', 'Exhibits 5–7: programme economics, cost breakdown, KPIs'],
  ['Case_Ops', 'Exhibit 8: footprint, energy, labour, digital readiness'],
  ['Diagnosis', 'Ratios, EBITDA bridge, programme scorecard, Auto digital burden, consistency flag'],
  ['Assumptions', 'Every judgement call with rationale, benchmark, funding bridge and win-condition targets'],
  ['Initiatives', 'Run-rate economics, overlap netting, phasing, workstreams, segment split, working capital'],
  ['Projection', 'Base vs plan EBITDA, cash, net debt, lender (LTM) view, sources & uses'],
  ['Segments', 'Jun-27 run-rate by business, SMC break-even price, SMC exit case'],
  ['Sensitivity', 'Realisation scenarios and one-at-a-time shocks'],
  ['Sources', 'External benchmarks with URLs']].forEach(([nm, d], i) => s.row(`g${i}`, nm, [d], { fmt: 'text' }));
}

// =====================================================================
// Render → HyperFormula → ExcelJS
// =====================================================================
const FMT = {
  num: '#,##0.0;(#,##0.0);"-"', num0: '#,##0;(#,##0);"-"', num2: '#,##0.00;(#,##0.00);"-"',
  pct: '0.0%;(0.0%);"-"', x: '0.0"x";(0.0"x");"-"', int: '0', text: '@',
};
for (const s of sheets) s.items.forEach((it, i) => { it.n = i + 1; });

const grids = {}, meta = {};
for (const s of sheets) {
  const cells = [];
  const put = (r, c, v, st = {}) => cells.push({ r, c, v, st });
  for (const it of s.items) {
    const r = it.n;
    if (it.kind === 'title') put(r, 0, it.t, { title: true });
    else if (it.kind === 'sub') put(r, 0, it.t, { sub: true });
    else if (it.kind === 'note') put(r, 0, it.t, { noteRow: true });
    else if (it.kind === 'header') it.cells.forEach((v, j) => { if (v !== '' && v != null) put(r, j, v, { header: true }); });
    else if (it.kind === 'row') {
      const o = it.o;
      put(r, 0, it.label, { label: true, bold: o.total, italic: o.italic });
      if (o.unit) put(r, 1, o.unit, { unit: true });
      const start = idx(o.start || 'C');
      it.vals.forEach((v, j) => {
        if (v === null || v === undefined) return;
        const spec = (typeof v === 'object') ? v : { v };
        let val = spec.v;
        if (typeof val === 'function') val = val(L(start + j));
        const fmt = spec.fmt || (o.fmtList && o.fmtList[j]) || o.fmt || 'num';
        put(r, start + j, val, { fmt, total: o.total, key: o.key, italic: o.italic, legend: o.legend });
      });
      if (o.note) put(r, idx(s.noteCol), o.note, { noteText: true });
    }
  }
  const maxR = Math.max(...cells.map(x => x.r)), maxC = Math.max(...cells.map(x => x.c));
  const g = Array.from({ length: maxR }, () => Array(maxC + 1).fill(null));
  for (const x of cells) {
    let v = x.v;
    if (typeof v === 'string' && v.startsWith('=')) { /* formula */ }
    else if (typeof v === 'string' && /^[\d.,-]+$/.test(v)) v = `'${v}`; // keep header years as text for HF
    g[x.r - 1][x.c] = v;
  }
  grids[s.name] = g; meta[s.name] = cells;
}

const hf = HyperFormula.buildFromSheets(grids, { licenseKey: 'gpl-v3' });
let errors = 0;
const wb = new ExcelJS.Workbook();
wb.creator = 'Team'; wb.lastModifiedBy = 'Team';
wb.calcProperties = { fullCalcOnLoad: true };
const font = (st, isFormula, isLink, isInput) => {
  const f = { name: 'Arial', size: 10 };
  if (st.title) { f.size = 14; f.bold = true; f.color = { argb: 'FF1F3864' }; }
  if (st.sub) { f.bold = true; f.size = 11; f.color = { argb: 'FFFFFFFF' }; }
  if (st.header) { f.bold = true; }
  if (st.noteRow || st.noteText) { f.italic = true; f.color = { argb: 'FF595959' }; }
  if (st.bold || st.total) f.bold = true;
  if (st.italic) f.italic = true;
  if (isInput || st.legend === 'input') f.color = { argb: 'FF0000FF' };
  if (isLink || st.legend === 'link') f.color = { argb: 'FF008000' };
  return f;
};
for (const s of sheets) {
  const ws = wb.addWorksheet(s.name, { views: [{ showGridLines: false }] });
  for (const [col, w] of Object.entries(s.widths)) ws.getColumn(idx(col) + 1).width = w;
  const sid = hf.getSheetId(s.name);
  const subRows = new Set();
  for (const x of meta[s.name]) {
    const cell = ws.getCell(x.r, x.c + 1);
    const isFormula = typeof x.v === 'string' && x.v.startsWith('=');
    const isLink = isFormula && /^=[A-Za-z_]+!\$?[A-Z]+\$?\d+$/.test(x.v);
    const isInput = typeof x.v === 'number' && !x.st.header;
    if (isFormula) {
      const res = hf.getCellValue({ sheet: sid, row: x.r - 1, col: x.c });
      if (res && typeof res === 'object' && res.type) {
        errors++; console.error(`ERROR ${s.name}!${L(x.c)}${x.r} ${x.v} → ${res.type} ${res.message || ''}`);
        cell.value = { formula: x.v.slice(1) };
      } else cell.value = { formula: x.v.slice(1), result: res };
    } else cell.value = x.v;
    cell.font = font(x.st, isFormula, isLink, isInput);
    if (x.st.fmt && !x.st.label) cell.numFmt = FMT[x.st.fmt] || FMT.num;
    if (x.st.header) { cell.border = { bottom: { style: 'thin' } }; cell.alignment = { horizontal: x.c >= 2 ? 'right' : 'left', wrapText: true }; }
    if (x.st.total && !x.st.label) cell.border = { top: { style: 'thin' } };
    if ((x.st.key && !x.st.label && !x.st.noteText) || x.st.legend === 'key') cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
    if (x.st.noteText) cell.alignment = { wrapText: false };
    if (x.st.sub) subRows.add(x.r);
  }
  const lastCol = Math.max(...Object.keys(s.widths).map(idx)) + 1;
  for (const r of subRows) for (let c = 1; c <= lastCol; c++) ws.getCell(r, c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3864' } };
}

(async () => {
  await wb.xlsx.writeFile(OUT);
  const v = (sh, key, col) => hf.getCellValue({ sheet: hf.getSheetId(sh.name), row: sh.n(key) - 1, col: idx(col) });
  // Export every keyed row's computed values so the deck reads the same numbers as the workbook
  const dump = {};
  for (const sh of sheets) {
    dump[sh.name] = {};
    for (const key of Object.keys(sh.keys)) {
      const row = {};
      for (let c = 0; c < 24; c++) {
        const val = hf.getCellValue({ sheet: hf.getSheetId(sh.name), row: sh.n(key) - 1, col: c });
        if (val !== null && val !== '' && !(typeof val === 'object')) row[L(c)] = val;
      }
      dump[sh.name][key] = row;
    }
  }
  require('fs').writeFileSync(path.join(__dirname, '..', 'deck', 'model_data.json'), JSON.stringify(dump, null, 1));
  const f1 = x => typeof x === 'number' ? x.toFixed(1) : x;
  console.log(`Wrote ${OUT}\nFormula errors: ${errors}`);
  console.log('Checks:', ['c_bs', 'c_eb', 'c_ni', 'c_opex', 'c_seg', 'c_cash', 'c_debt', 'c_da', 'c_wc', 'c_ex6', 'c_dig', 'c_br', 'c_split', 'c_ws', 'c_segrr', 'c_su', 'c_tax'].map(k => `${k}=${v(cov, k, 'D')}`).join(' '));
  console.log('Win condition:', ['w_liq', 'w_cov', 'w_auto', 'w_dig'].map(k => `${k}: target ${f1(v(cov, k, 'C'))} plan ${typeof v(cov, k, 'D') === 'number' ? v(cov, k, 'D').toFixed(3) : v(cov, k, 'D')} → ${v(cov, k, 'E')}`).join(' | '));
  console.log('Workstreams (netRR / 2026 / H1-27 / 18m / one-off / capex):');
  for (let i = 0; i < WORKSTREAMS.length; i++) console.log('  ' + WORKSTREAMS[i].padEnd(28), ['C', 'D', 'E', 'F', 'G', 'H'].map(c => f1(v(ini, `ws_${i}`, c)).padStart(7)).join(''));
  console.log('Lender view (base / plan):', ['l_eb', 'l_int', 'l_cov', 'l_nd', 'l_lev', 'r_eb', 'r_cov', 'r_lev', 'be_eb', 'be_gap'].map(k => `${k}=${f1(v(pj, k, 'C'))}/${f1(v(pj, k, 'D'))}`).join(' '));
  console.log('Sources&uses (base / plan):', ['u_fcf', 'u_std', 'u_tot', 's_roll', 's_disp', 's_slb', 's_scf', 's_new'].map(k => `${k}=${f1(v(pj, k, 'C'))}/${f1(v(pj, k, 'D'))}`).join(' '));
  console.log('SMC: break-even price', (v(sg, 'smc_be', 'E') * 100).toFixed(2) + '%', 'exit ΔEBITDA', f1(v(sg, 'x_net', 'F')), '| build %', (v(pj, 'h_build', 'C') * 100).toFixed(0) + '%');
  console.log('Shocks Δ/after/cover:', ['sh_price', 'sh_vol', 'sh_energy', 'sh_scale', 'sh_comm', 'sh_smc'].map(k => `${k}=${f1(v(sn, k, 'D'))}/${f1(v(sn, k, 'E'))}/${v(sn, k, 'F').toFixed(2)}`).join(' '), 'rate+200bp cover', v(sn, 'sh_rate', 'F').toFixed(2));
  console.log('\nInitiatives (benefit RR / cost RR / net RR / 2026 / H1-27 / capex18):');
  for (const k of LEVERS) console.log(k.padEnd(3), ['C', 'D', 'E', 'N', 'O', 'L'].map(c => f1(v(ini, `b_${k}`, c)).padStart(7)).join(''));
  console.log('TOT', ['C', 'D', 'E', 'N', 'O', 'L'].map(c => f1(v(ini, 'b_tot', c)).padStart(7)).join(''));
  console.log('\nProjection  2025A 26B H127B 18mB 26P H127P 18mP RRB RRP');
  for (const k of ['ebitda', 'int_b', 'int_p', 'int', 'wc', 'ocf', 'capex', 'fcf', 'debt', 'nd', 'lev', 'icov', 'pbt']) console.log(k.padEnd(8), ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'].map(c => f1(v(pj, k, c) ?? '').toString().padStart(7)).join(''));
  console.log('\nHeadlines:', ['h_eb', 'h_fcf', 'h_nd', 'h_digben', 'h_digcost', 'h_dignet'].map(k => `${k}=${f1(v(pj, k, 'C'))}`).join(' '));
  console.log('Segments RR EBITDA:', ['C', 'D', 'E', 'F'].map(c => f1(v(sg, 'rr', c))).join(' / '), ' margins:', ['C', 'D', 'E', 'F'].map(c => (v(sg, 'mrr', c) * 100).toFixed(1) + '%').join(' / '));
  console.log('Diagnosis: lev25', f1(v(dg, 'lev', 'F')), 'icov25', v(dg, 'icov', 'F').toFixed(2), 'rate', (v(dg, 'rate', 'F') * 100).toFixed(2) + '%', 'invd', f1(v(dg, 'invd', 'F')), 'dso', f1(v(dg, 'dso', 'F')), 'dig_net', f1(v(dg, 'dig_net', 'C')), 'au_net', f1(v(dg, 'au_net', 'C')), 'au_exm', (v(dg, 'au_exm', 'C') * 100).toFixed(1) + '%', 'vis_share', (v(dg, 'vis_share', 'C') * 100).toFixed(1) + '%');
  console.log('Payback yrs', ['C', 'D', 'E'].map(c => f1(v(dg, 'sc_payback', c))).join(' / '));
  console.log('Sensitivity EBITDA', ['C', 'D', 'E', 'F'].map(c => f1(v(sn, 'eb', c))).join(' / '), 'icov', ['C', 'D', 'E', 'F'].map(c => v(sn, 'icov', c).toFixed(2)).join(' / '), 'f15', (v(sn, 'f15', 'C') * 100).toFixed(0) + '%', 'f20', (v(sn, 'f20', 'C') * 100).toFixed(0) + '%');
  console.log('WC release', f1(v(ini, 'w_rel', 'D')), f1(v(ini, 'w_rel', 'E')));
})();
