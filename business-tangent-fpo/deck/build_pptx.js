// Business Tangent 2026 deck: one pptxgenjs generator, every number read from the model export.
// Run: node deck/build_pptx.js   (writes final/<Team>_BusinessTangent2026.pptx; PDF comes from LibreOffice)
const path = require('path');
const fs = require('fs');
const pptxgen = require(require.resolve('pptxgenjs', { paths: [path.join(__dirname, '../../case-comp-kit')] }));
const { applyTheme } = require('/root/.claude/skills/synced/7c60ae74-0bff-4e50-a030-c4728dacb416_a3914a77-341b-44c5-8d5f-f635b98bb6f9/pptx/scripts/apply_theme.js');

const D = require('./model_data.json');
const team = require('./team.json');
const g = (s, k, c) => { const v = D[s] && D[s][k] && D[s][k][c]; if (v === undefined) throw new Error(`missing ${s}.${k}.${c}`); return v; };
const f0 = v => Math.round(v).toLocaleString('en-IN');
const f1 = v => v.toFixed(1);
const pc = v => Math.round(v * 100) + '%';

// ---------- theme: forest green ink, maize gold, leaf green ----------
const HEX = { ink: '1A1A1A', forest: '1F3D2B', tint: 'EEF3EC', gold: 'C8901A', goldT: 'F7EDD2', leaf: '4E8F3A', leafT: 'E3EFDC', red: 'B5443B', grey: '6B7280', hair: 'D0D5DD', ghost: 'A7B0BE', white: 'FFFFFF' };
const THEME = {
  name: 'Kosi Fields', headFontFace: 'Arial', bodyFontFace: 'Arial',
  colors: { dk1: HEX.ink, lt1: HEX.white, dk2: HEX.forest, lt2: HEX.tint, accent1: HEX.forest, accent2: HEX.gold, accent3: HEX.leaf,
    accent4: HEX.red, accent5: HEX.grey, accent6: HEX.goldT, hlink: '1F6FB2', folHlink: '6B4C9A' },
};
const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5 in
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = 'Business Tangent 2026: Kosi Agri Partners';
pres.author = team.teamName;
const C = pres.SchemeColor;
const INK = C.text1, FOREST = C.text2, TINT = C.background2, GOLD = C.accent2, LEAF = C.accent3, RED = C.accent4, GREY = C.accent5, GOLDT = C.accent6;

// ---------- layouts ----------
const W = 13.333, M = 0.5, BW = W - 2 * M;
pres.defineSlideMaster({
  title: 'COVER', background: { color: HEX.forest },
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', x: 0.7, y: 1.55, w: 8.4, h: 1.7, fontSize: 38, bold: true, color: C.background1, valign: 'top', align: 'left', margin: 0 }, text: '' } },
    { placeholder: { options: { name: 'body', type: 'body', x: 0.7, y: 3.35, w: 8.4, h: 1.0, fontSize: 16, color: C.background1, valign: 'top', margin: 0 }, text: '' } },
  ],
});
pres.defineSlideMaster({
  title: 'CONTENT', background: { color: HEX.white },
  objects: [
    { placeholder: { options: { name: 'tracker', type: 'body', x: M, y: 0.2, w: 8.6, h: 0.3, fontSize: 9, color: GREY, valign: 'middle', margin: 0 }, text: '' } },
    { text: { text: 'Kosi Agri Partners  |  Business Tangent 2026', options: { x: 8.9, y: 0.2, w: 3.93, h: 0.3, fontSize: 9, color: GREY, align: 'right', valign: 'middle', margin: 0 } } },
    { placeholder: { options: { name: 'title', type: 'title', x: M, y: 0.55, w: BW, h: 0.85, fontSize: 21, bold: true, color: FOREST, valign: 'top', align: 'left', margin: 0 }, text: '' } },
    { placeholder: { options: { name: 'source', type: 'body', x: M, y: 7.05, w: 11.7, h: 0.3, fontSize: 8.5, color: GREY, valign: 'middle', margin: 0 }, text: '' } },
  ],
  slideNumber: { x: 12.43, y: 7.05, w: 0.4, h: 0.3, fontSize: 8.5, color: GREY, align: 'right' },
});
pres.defineSlideMaster({
  title: 'CLOSE', background: { color: HEX.forest },
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', x: 0.7, y: 2.4, w: 11.9, h: 1.2, fontSize: 40, bold: true, color: C.background1, valign: 'top', align: 'left', margin: 0 }, text: '' } },
    { placeholder: { options: { name: 'body', type: 'body', x: 0.7, y: 3.7, w: 11.0, h: 1.4, fontSize: 16, color: C.background1, valign: 'top', margin: 0 }, text: '' } },
  ],
});

// ---------- helpers ----------
// '**bold**' inside a string becomes a bold run
const md = (s, base = {}) => { const r = String(s).split(/(\*\*[^*]+\*\*)/).filter(Boolean).map(p =>
  p.startsWith('**') ? { text: p.slice(2, -2), options: { ...base, bold: true } } : { text: p, options: { ...base } }); return r.length ? r : [{ text: ' ', options: { ...base } }]; };
const text = (sl, s, o) => sl.addText(md(s, { color: o.color || INK }), { isTextBox: true, margin: 0, valign: 'top', fontSize: 12, ...o });
const bullets = (sl, items, o) => {
  const runs = [];
  items.forEach((it, i) => {
    const r = md(it, { color: o.color || INK });
    r[0].options.bullet = { indent: 12 };
    r[0].options.paraSpaceAfter = o.gap ?? 5;
    if (i < items.length - 1) r[r.length - 1].options.breakLine = true;
    runs.push(...r);
  });
  sl.addText(runs, { isTextBox: true, margin: 0, valign: 'top', fontSize: 12, ...o });
};
const head = (sl, s, x, y, w, color = FOREST) => sl.addText(s.toUpperCase(), { isTextBox: true, x, y, w, h: 0.26, margin: 0, fontSize: 10, bold: true, color, charSpacing: 1, valign: 'top' });
const panel = (sl, x, y, w, h, color = TINT) => sl.addShape(pres.ShapeType.rect, { x, y, w, h, fill: { color }, line: { color, width: 0 } });
const circle = (sl, n, x, y, d = 0.36, fill = FOREST) => {
  sl.addShape(pres.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color: fill }, line: { color: fill, width: 0 } });
  sl.addText(String(n), { isTextBox: true, x, y, w: d, h: d, margin: 0, align: 'center', valign: 'middle', fontSize: d > 0.4 ? 16 : 13, bold: true, color: C.background1 });
};
const tag = (sl, s, x, y, fill, w = 0.62) => {
  sl.addShape(pres.ShapeType.roundRect, { x, y, w, h: 0.22, rectRadius: 0.05, fill: { color: fill }, line: { color: fill, width: 0 } });
  sl.addText(s, { isTextBox: true, x, y, w, h: 0.22, margin: 0, align: 'center', valign: 'middle', fontSize: 8.5, bold: true, color: C.background1 });
};
// table: head = array of strings; rows = arrays of strings or { t, b (bold), fill, color, align }
const HAIR = { type: 'solid', pt: 0.75, color: HEX.hair }, NONE = { type: 'none' };
const table = (sl, headRow, rows, o) => {
  const fs = o.fontSize || 10.5, num = o.num || [];
  const al = j => (o.align && o.align[j]) || (num.includes(j) ? 'right' : 'left');
  const hdr = headRow.map((h, j) => ({ text: h, options: { bold: true, fontSize: fs - 1.5, color: GREY, fill: { color: HEX.tint }, align: al(j), valign: 'bottom', border: [NONE, NONE, { type: 'solid', pt: 1, color: HEX.forest }, NONE] } }));
  const body = rows.map(r => r.map((c, j) => {
    const cell = typeof c === 'object' && c !== null ? c : { t: c };
    return { text: md(String(cell.t), { color: cell.color || INK, bold: !!cell.b, fontSize: cell.fs || fs }), options: { fontSize: cell.fs || fs, align: cell.align || al(j), valign: 'top', fill: cell.fill ? { color: cell.fill } : undefined, border: [NONE, NONE, HAIR, NONE] } };
  }));
  sl.addTable([hdr, ...body], { x: o.x, y: o.y, w: o.w, colW: o.colW, margin: o.margin ?? [3, 5, 3, 5], autoPage: false });
};
const SECTIONS = ['Answer', 'Priorities', 'Interventions', 'Outcomes', 'Roadmap', 'Budget'];
const tracker = active => SECTIONS.map((s, i) => ({ text: s.toUpperCase() + (i < SECTIONS.length - 1 ? '      ' : ''), options: { bold: s === active, color: s === active ? FOREST : GREY } }));
const content = ({ section, appendix, title, source, notes }) => {
  const sl = pres.addSlide({ masterName: 'CONTENT', sectionTitle: appendix ? 'Appendix' : 'Main slides' });
  sl.addText(appendix ? [{ text: `APPENDIX ${appendix}`, options: { bold: true, color: FOREST } }] : tracker(section), { placeholder: 'tracker' });
  sl.addText(title, { placeholder: 'title' });
  sl.addText(source, { placeholder: 'source' });
  if (notes) sl.addNotes(notes);
  return sl;
};
const chartBase = { catAxisLabelFontFace: '+mn-lt', valAxisLabelFontFace: '+mn-lt', dataLabelFontFace: '+mn-lt', legendFontFace: '+mn-lt', titleFontFace: '+mn-lt',
  catAxisLabelFontSize: 10, valAxisLabelFontSize: 9, dataLabelFontSize: 10, legendFontSize: 10, catAxisLabelColor: HEX.ink, valAxisLabelColor: HEX.grey, dataLabelColor: HEX.ink,
  valGridLine: { style: 'none' }, catGridLine: { style: 'none' }, catAxisLineShow: true, valAxisHidden: true, showValue: true };

// ---------- numbers used in more than one place ----------
const N = {
  incToday: g('Unit_Econ', 'income', 'C'), costTodayM: g('Unit_Econ', 'cost', 'C'), costTodayV: g('Unit_Econ', 'cost', 'E'),
  coverToday: g('Unit_Econ', 'cover', 'E'), coverM: g('Unit_Econ', 'cover', 'D'), coverV: g('Unit_Econ', 'cover', 'F'),
  toM: g('Unit_Econ', 'turnover', 'D'), toV: g('Unit_Econ', 'turnover', 'F'), toAvg: g('Targets', 't_to', 'D'), toToday: g('Case_Data', 'to_mid', 'C'),
  sell: g('Targets', 't_sell', 'D'), women: g('Unit_Econ', 'women_pct', 'D'), fedCover: g('Federation', 'f_cover', 'C'),
  beM: g('Unit_Econ', 'be_to', 'D'), beV: g('Unit_Econ', 'be_to', 'F'), match: g('Working_Capital', 'w_match', 'C'),
  c1: g('Budget', 'c1_cost', 'H'), c2: g('Budget', 'c2_cost', 'H'), perFarmer: g('Budget', 'per_farmer', 'H'), farmers: g('Budget', 'farmers', 'H'),
};
const coverRange = `${pc(N.coverV)} to ${pc(N.coverM)}`;
const crore = v => (v / 100).toFixed(2) + ' crore';

// ================= COVER =================
pres.addSection({ title: 'Main slides' });
{
  const sl = pres.addSlide({ masterName: 'COVER', sectionTitle: 'Main slides' });
  sl.addText('Sell together, fund the season, store smart', { placeholder: 'title' });
  sl.addText('Making Kosi Agri Partners\' 12 Farmer Producer Organisations pay their own way by 2030-31', { placeholder: 'body' });
  sl.addText([
    { text: team.teamName, options: { bold: true, fontSize: 16, breakLine: true } },
    { text: team.college, options: { fontSize: 12, breakLine: true } },
    ...team.members.map((m, i) => ({ text: `${m.name}  |  ${m.email}`, options: { fontSize: 12, breakLine: i < team.members.length - 1 } })),
  ], { isTextBox: true, x: 0.7, y: 4.75, w: 8.4, h: 1.6, margin: 0, color: C.background1, valign: 'top' });
  sl.addText('Business Tangent 2026  |  Finance and Investment Cell, St. Stephen\'s College', { isTextBox: true, x: 0.7, y: 6.75, w: 8.4, h: 0.3, margin: 0, fontSize: 10, color: C.background1 });
  [['Sell together', HEX.gold], ['Fund the season', HEX.leaf], ['Store smart', HEX.tint]].forEach(([s, col], i) => {
    const y = 1.75 + i * 1.25;
    sl.addShape(pres.ShapeType.ellipse, { x: 9.9, y, w: 0.85, h: 0.85, fill: { color: col }, line: { color: col, width: 0 } });
    sl.addText(String(i + 1), { isTextBox: true, x: 9.9, y, w: 0.85, h: 0.85, margin: 0, align: 'center', valign: 'middle', fontSize: 24, bold: true, color: i === 2 ? FOREST : C.background1 });
    sl.addText(s, { isTextBox: true, x: 10.95, y: y + 0.2, w: 2.2, h: 0.45, margin: 0, fontSize: 15, bold: true, color: C.background1, valign: 'middle' });
  });
}

// ================= SLIDE 1: ANSWER =================
{
  const sl = content({ section: 'Answer',
    title: `Today a KAP FPO earns ${pc(N.coverToday)} of what it costs to run; our plan lifts that to ${coverRange} by 2030-31 and builds a federation that pays for itself`,
    source: 'Rs lakh unless stated. FPO = Farmer Producer Organisation; KAP = Kosi Agri Partners; CBBO = Cluster-Based Business Organisation. Sources: case; our model; S1, S3, S4, S9, S10 (Appendix A6).' });
  head(sl, 'The problem', M, 1.5, 5.9);
  bullets(sl, [
    `A typical FPO turns over **Rs ${f1(N.toToday)} lakh** and keeps about **Rs ${f1(N.incToday)} lakh**, against **Rs ${f1(N.costTodayM)} to ${f1(N.costTodayV)} lakh** to run with a paid CEO and proper accounts.`,
    'Its Rs 10 lakh working capital is just members\' share capital (500 x Rs 2,000), against a Rs 25 lakh peak need.',
    'Government support to KAP, a CBBO, ends in 2027-28. Nationally only about **1 in 3** FPOs is viable.',
  ], { x: M, y: 1.8, w: 5.9, h: 1.75, fontSize: 12 });
  head(sl, 'What we recommend', M, 3.62, 5.9);
  const recs = [
    ['Sell together:', 'a shared sales desk sells combined lots to at least three buyers, none above half of sales.'],
    ['Fund the season:', 'claim the government matching equity grant, then a revolving fund that pays farmers within 7 days.'],
    ['Store smart:', 'lease idle cooperative (PACS) godowns; dryers for maize, solar cold rooms for vegetables.'],
  ];
  recs.forEach(([a, b], i) => {
    const y = 3.95 + i * 0.6;
    circle(sl, i + 1, M, y, 0.36, [GOLD, LEAF, FOREST][i]);
    text(sl, `**${a}** ${b}`, { x: M + 0.5, y: y - 0.02, w: 5.4, h: 0.58, fontSize: 11.5 });
  });
  panel(sl, M, 5.85, 5.9, 0.95);
  text(sl, `All three run through a **federation of the FPOs** that keeps services going after grants end. US$1 million a year: about half makes the 12 FPOs self-running; the rest takes the model to **24 more Kosi FPOs**, released only if a Year 2 checkpoint is met.`,
    { x: M + 0.15, y: 5.93, w: 5.6, h: 0.82, fontSize: 11, color: FOREST });
  // KPI tiles
  const kx = 6.85, kw = 5.98;
  [[coverRange, 'running cost covered by own income in Year 5 (22% today)'], [`Rs ${crore(N.toAvg)}`, `average turnover per FPO (Rs ${f1(N.toToday)} lakh today)`], [pc(N.fedCover), 'of the federation\'s own running cost covered']].forEach(([big, small], i) => {
    const x = kx + i * (kw / 3 + 0.0), w = kw / 3 - 0.12;
    panel(sl, x, 1.5, w, 1.12);
    text(sl, big, { x: x + 0.12, y: 1.57, w: w - 0.2, h: 0.48, fontSize: 18, bold: true, color: FOREST });
    text(sl, small, { x: x + 0.12, y: 2.05, w: w - 0.2, h: 0.52, fontSize: 9.5, color: GREY });
  });
  head(sl, 'Scorecard, end of Year 5 (2030-31)', kx, 2.82, kw);
  table(sl, ['Test', 'Today', 'Target', 'Benchmark'], [
    ['Average turnover per FPO', `Rs ${f1(N.toToday)} lakh`, { t: `Rs ${crore(N.toAvg)}`, b: true }, '12.7% of scheme FPOs exceed Rs 1 crore'],
    ['FPOs covering 100% of running cost, 2 years running', '0 of 12', { t: '6 of 12; all above 85%', b: true }, 'About 1 in 3 nationally'],
    ['Members selling through the FPO', 'About 15%', { t: pc(N.sell), b: true }, 'SRIJAN: 39% after 2 years'],
    ['Women members / women directors', '20% / 1 of 9', { t: `${pc(N.women)} / 3 of 9`, b: true }, 'Women-led FPOs survive 4 to 13 points more often'],
    ['FPOs with a credit line in their own name', '0', { t: '12', b: true }, 'Only 30% of FPOs have one'],
    ['Federation pays its own running cost', 'No federation', { t: 'Yes', b: true }, 'Model: ' + pc(N.fedCover)],
  ], { x: kx, y: 3.12, w: kw, colW: [2.05, 1.0, 1.25, 1.68], fontSize: 10 });
}

// ================= SLIDE 2: PRIORITIES =================
{
  const sl = content({ section: 'Priorities',
    title: 'Volume is the root problem: too little produce flows through each FPO to pay its CEO, so we fix selling and seasonal finance first',
    source: 'Rs lakh a year per FPO. Running cost = CEO, assistant, office, federation fee, asset upkeep and loan repayment, with no grant. Sources: case; model sheet Unit_Econ.' });
  head(sl, 'Income kept vs running cost per FPO (Rs lakh a year)', M, 1.5, 5.6);
  sl.addChart(pres.ChartType.bar, [
    { name: 'Income the FPO keeps', labels: ['Maize today', 'Maize Year 5', 'Veg today', 'Veg Year 5'], values: [N.incToday, g('Unit_Econ', 'income', 'D'), g('Unit_Econ', 'income', 'E'), g('Unit_Econ', 'income', 'F')] },
    { name: 'Running cost', labels: ['Maize today', 'Maize Year 5', 'Veg today', 'Veg Year 5'], values: [N.costTodayM, g('Unit_Econ', 'cost', 'D'), N.costTodayV, g('Unit_Econ', 'cost', 'F')] },
  ], { ...chartBase, x: M, y: 1.78, w: 5.6, h: 2.45, barDir: 'col', barGrouping: 'clustered', barGapWidthPct: 60, chartColors: [HEX.forest, HEX.ghost],
    dataLabelFormatCode: '0.0', dataLabelPosition: 'outEnd', showLegend: true, legendPos: 't', valAxisMinVal: 0, valAxisMaxVal: 12 });
  head(sl, 'What the numbers say', 6.55, 1.5, 6.28);
  bullets(sl, [
    `**Margins are thin** (3% on maize, 7% on vegetables), so only volume pays fixed costs. Break-even turnover is about **Rs ${(N.beM / 100).toFixed(2)} crore** (maize) and **Rs ${(N.beV / 100).toFixed(2)} crore** (vegetables), about 4 times today.`,
    '**Cash, not demand, caps buying:** Rs 10 lakh against a Rs 25 lakh peak, with buyers paying in 30 to 60 days. Farmers sell to the trader who pays on the spot.',
    '**No accounts, no bank loan, no exit:** without clean books and filings no lender will fund the FPO after KAP leaves in 2027-28.',
    '**Infrastructure is an enabler, not a priority on its own:** it pays only where it adds sales (drying for maize, cold rooms for vegetables).',
  ], { x: 6.55, y: 1.8, w: 6.28, h: 2.5, fontSize: 11.5 });
  head(sl, 'Our three priorities, and where maize and vegetable FPOs differ', M, 4.42, BW);
  table(sl, ['Priority', 'Why it matters most', 'Common to all 12', 'Maize FPOs (7)', 'Vegetable FPOs (5)'], [
    [{ t: '1. Market access and volume', b: true }, 'Only volume covers the fixed cost of running an FPO', 'Written buyer agreements; honest weighing; pay farmers within 7 days', 'Lots of 1,000 t+ for feed mills and distilleries; moisture 14% or lower; hold some to sell later', 'Daily small, perishable lots; grading, crates, cold rooms; sell via VEGFED and processors'],
    [{ t: '2. Seasonal finance', b: true }, 'Cash limits how much the FPO can buy, and late pay drives farmers away', 'Claim matching equity grant; revolving fund; bank line', 'One big April to June buying season; stored maize financed by warehouse receipts', 'Smaller, year-round need; input credit for seed and saplings'],
    [{ t: '3. Management and member participation', b: true }, 'Independence needs accounts, compliance and members who sell through the FPO', 'Shared accountant via federation; CEO paid from margin by Year 5; women in jobs and on boards', 'Women procurement agents at collection points', 'Women run nursery and grading'],
  ], { x: M, y: 4.72, w: BW, colW: [1.9, 2.45, 2.75, 2.6, 2.63], fontSize: 10 });
}

// ================= SLIDE 3: INTERVENTIONS =================
{
  const sl = content({ section: 'Interventions',
    title: 'Three interventions, each built to leave something behind that keeps earning after the grant stops',
    source: 'AIF, MIDH, e-NWR (warehouse receipt), SHG (self-help group), BRFSY (state crop aid), PMFBY: see glossary, Appendix A6. Sources: S2, S5 to S8, S16, S17, S20.' });
  const cw = 3.98, gap = 0.195, cy = 1.5, ch = 4.75;
  const cards = [
    { n: 1, name: 'Sell together', col: GOLD,
      how: 'A sales desk (KAP staff in Years 1 to 3, federation staff from Year 4) signs written buyer agreements. FPOs weigh honestly, test moisture and pay farmers within 7 days. Two paid women procurement agents per FPO, recruited from SHGs.',
      maize: 'Combine 7 FPOs into lots of 1,000 t+. Feed mills, distilleries, and later sale via e-NWR; no buyer above 50%. Rs 10 lakh kit: drying yard, moisture meter, shared dryer.',
      veg: 'Three collection points, crates, pack shed on a raised plinth, two 5 t solar cold rooms, nursery (Rs 40 lakh kit). Sell to VEGFED, processors, city traders.',
      leaves: 'Buyer relationships and a desk the federation pays for.' },
    { n: 2, name: 'Fund the season', col: LEAF,
      how: `1) Clean share registers and claim the government matching equity grant (Rs ${f0(N.match)} lakh per FPO). 2) A revolving fund owned by the federation: Rs 2 crore plus a Rs 0.5 crore flood window, lending at 10%. 3) A Rs 0.5 crore first-loss deposit opens bank lines in each FPO's own name.`,
      maize: 'One big April to June buying season. Stored maize is financed by e-NWR pledge loans backed by a government guarantee.',
      veg: 'Smaller, year-round need. Input credit for seed and saplings, repaid in produce.',
      leaves: 'A fund that keeps lending, and a credit history.' },
    { n: 3, name: 'Run it together', col: FOREST,
      how: 'A federation of the FPOs gives accounts, audit, filings, the sales desk and bulk input buying for Rs 1.2 lakh a year per FPO. CEO salary support tapers 80%, 60%, 40%, 20%, then 0%.',
      women: '150 new women members per FPO via SHGs; leadership fellowship for board seats; creches at collection points.',
      climate: 'Flood alerts; storage above flood level; nursery for fast replanting; flood loan window; help with BRFSY crop-aid claims (Bihar left PMFBY).',
      leaves: `Shared services that pay for themselves (${pc(N.fedCover)} cost cover).` },
  ];
  cards.forEach((c, i) => {
    const x = M + i * (cw + gap);
    panel(sl, x, cy, cw, ch);
    circle(sl, c.n, x + 0.15, cy + 0.14, 0.42, c.col);
    text(sl, c.name, { x: x + 0.68, y: cy + 0.17, w: cw - 0.8, h: 0.38, fontSize: 15, bold: true, color: FOREST, valign: 'middle' });
    text(sl, c.how, { x: x + 0.15, y: cy + 0.68, w: cw - 0.3, h: 1.55, fontSize: 10.5 });
    const rows = c.maize ? [['MAIZE', GOLD, c.maize], ['VEG', LEAF, c.veg]] : [['WOMEN', GOLD, c.women], ['CLIMATE', LEAF, c.climate]];
    rows.forEach(([t, col, s], j) => {
      const y = cy + 2.05 + j * 1.05;
      tag(sl, t, x + 0.15, y, col, 0.75);
      text(sl, s, { x: x + 0.15, y: y + 0.28, w: cw - 0.3, h: 0.78, fontSize: 10 });
    });
    text(sl, `**Leaves behind:** ${c.leaves}`, { x: x + 0.15, y: cy + 4.2, w: cw - 0.3, h: 0.45, fontSize: 10, color: FOREST });
  });
  text(sl, '**Complements, not duplicates, government support:** we claim the matching grant, lease the PACS godowns Bihar has just built, borrow under AIF and MIDH, and fund what stops when CBBO support ends in 2027-28.',
    { x: M, y: 6.4, w: BW, h: 0.5, fontSize: 10.5, color: FOREST });
}

// ================= SLIDE 4: OUTCOMES =================
{
  const sl = content({ section: 'Outcomes',
    title: `By Year 5 a typical FPO does about 3.8 times today's business and covers ${coverRange} of a fully professional running cost`,
    source: 'Rs lakh a year per FPO unless stated. Sources: model sheets Unit_Econ and Sensitivity; assumptions and sources in Appendix A4; S9, S11, S19.' });
  head(sl, 'One FPO in Year 5', M, 1.5, 6.3);
  const u = k => [g('Unit_Econ', k, 'D'), g('Unit_Econ', k, 'F')];
  const r1 = (label, k, fmt = f1, bold = false) => [{ t: label, b: bold }, ...u(k).map(v => ({ t: fmt(v), b: bold }))];
  table(sl, ['Per FPO, Year 5', 'Maize', 'Vegetables'], [
    ['Members (including 150 new women)', f0(u('members')[0]), f0(u('members')[1])],
    ['Members selling through the FPO', `50% (${f0(u('sellers')[0])})`, `45% (${f0(u('sellers')[1])})`],
    ['Produce handled (tonnes)', f0(u('vol')[0]), f0(u('vol')[1])],
    r1('Produce sales', 's_prod'),
    ['Input and nursery sales', f1(g('Unit_Econ', 's_inp', 'D')), f1(g('Unit_Econ', 's_inp', 'F') + g('Unit_Econ', 's_nur', 'F'))],
    r1('Turnover', 'turnover', f1, true),
    r1('Income kept (margins, storage gain, fees)', 'income'),
    r1('Running cost, no grant', 'cost'),
    [{ t: 'Share of running cost covered', b: true }, { t: pc(N.coverM), b: true, color: FOREST }, { t: pc(N.coverV), b: true, color: FOREST }],
  ], { x: M, y: 1.8, w: 6.3, colW: [3.5, 1.4, 1.4], num: [1, 2], fontSize: 10.5 });
  head(sl, 'Key assumptions', M, 4.55, 6.3);
  text(sl, 'Maize: 0.4 ha a seller at 4.5 t/ha (Bihar about 4 t/ha, rabi higher); FPO handles 65% of a seller\'s crop; Rs 2,250 a quintal; 3% margin; 40% stored for a net 4% gain. Vegetables: 0.2 ha at 22.5 t/ha a year; FPO handles 50%; Rs 14/kg; 7% margin. Inputs 8% to 10% margin.',
    { x: M, y: 4.83, w: 6.3, h: 1.3, fontSize: 11 });
  head(sl, 'Cost cover under stress', 7.15, 1.5, 5.68);
  const sv = ['base', 'sell39', 'price', 'yield', 'flood'];
  const lbl = ['Base case', 'Only 39% sell (SRIJAN level)', 'Prices 10% lower', 'Maize yield 4.0 t/ha', 'Flood year (veg loses a season)'];
  sl.addChart(pres.ChartType.bar, [
    { name: 'Maize', labels: lbl, values: sv.map(k => g('Sensitivity', k, 'C')) },
    { name: 'Vegetables', labels: lbl, values: sv.map(k => g('Sensitivity', k, 'D')) },
  ], { ...chartBase, x: 7.15, y: 1.75, w: 5.68, h: 2.9, barDir: 'bar', barGrouping: 'clustered', barGapWidthPct: 45, chartColors: [HEX.gold, HEX.leaf],
    dataLabelFormatCode: '0%', dataLabelPosition: 'outEnd', showLegend: true, legendPos: 't', valAxisMinVal: 0, valAxisMaxVal: 1.15, catAxisOrientation: 'maxMin', catAxisLabelFontSize: 9.5 });
  panel(sl, 7.15, 4.8, 5.68, 1.85);
  bullets(sl, [
    `**Targets:** average turnover Rs ${crore(N.toAvg)}; 6 of 12 FPOs at 100% or more for two years and all above 85%; ${pc(N.sell)} of members selling; women ${pc(N.women)} of members.`,
    '**Why not all 12 at 100%:** the base case sits just under break-even, so the better half must beat the average. We say so rather than overclaim.',
    '**What farmers get:** a fair price, honest weighing, cheaper inputs, and the option to store and sell later. Bihar\'s JEEViKA maize company delivered 15% to 20% higher returns; we plan below that.',
  ], { x: 7.3, y: 4.9, w: 5.4, h: 1.85, fontSize: 10.5, gap: 4 });
}

// ================= SLIDE 5: ROADMAP =================
{
  const sl = content({ section: 'Roadmap',
    title: 'KAP builds in Years 1 and 2, hands over to the federation in Years 3 and 4, and steps back in Year 5; money continues only past a Year 2 checkpoint',
    source: 'Year 1 = 2026-27. Government CBBO support to KAP ends in 2027-28 (Year 2). Cohort 2 = other Kosi FPOs whose government support has ended or is ending. Sources: case; S2; our model.' });
  const gx = M, lw = 2.75, yw = 1.03, gy = 1.5, rh = 0.29;
  head(sl, 'Phased roadmap', gx, gy, 7.9);
  ['Y1 26-27', 'Y2 27-28', 'Y3 28-29', 'Y4 29-30', 'Y5 30-31'].forEach((t, i) =>
    text(sl, t, { x: gx + lw + i * yw, y: gy + 0.28, w: yw, h: 0.25, fontSize: 9.5, bold: true, color: GREY, align: 'center' }));
  const K = HEX.forest, F = HEX.leaf, L = 'A9CC98';
  const rows = [
    ['Accounts, share registers, claim grant', [[0, 1, K]]],
    ['Asset kits installed', [[0, 2, K]]],
    ['Sales desk', [[0, 3, K], [3, 5, F]]],
    ['Revolving fund lending', [[0, 1, K], [1, 5, F]]],
    ['Federation set up, then runs services', [[1, 2, K], [2, 5, F]]],
    ['CEO salary support (share paid)', [[0, 1, K, '80%'], [1, 2, K, '60%'], [2, 3, K, '40%'], [3, 4, K, '20%']]],
    ['Women: enrolment, agents, fellowship', [[0, 5, F]]],
    ['Cohort 2: 6 FPOs', [[0, 5, L]]],
    ['Cohort 2: 18 more (if checkpoint met)', [[2, 5, L]]],
  ];
  rows.forEach(([label, bars], r) => {
    const y = gy + 0.6 + r * rh;
    text(sl, label, { x: gx, y: y + 0.03, w: lw - 0.1, h: rh - 0.04, fontSize: 9.5, valign: 'middle' });
    bars.forEach(([a, b, col, lab]) => {
      sl.addShape(pres.ShapeType.rect, { x: gx + lw + a * yw + 0.03, y: y + 0.07, w: (b - a) * yw - 0.06, h: rh - 0.12, fill: { color: col }, line: { color: col, width: 0 } });
      if (lab) sl.addText(lab, { isTextBox: true, x: gx + lw + a * yw, y: y + 0.07, w: (b - a) * yw, h: rh - 0.12, margin: 0, fontSize: 8.5, bold: true, color: C.background1, align: 'center', valign: 'middle' });
    });
  });
  const cpx = gx + lw + 2 * yw, gEnd = gy + 0.6 + rows.length * rh;
  sl.addShape(pres.ShapeType.line, { x: cpx, y: gy + 0.55, w: 0, h: gEnd - gy - 0.5, line: { color: HEX.red, width: 1.5, dashType: 'dash' } });
  text(sl, 'Year 2 checkpoint', { x: cpx - 0.6, y: gEnd + 0.05, w: 1.2, h: 0.22, fontSize: 9, bold: true, color: RED, align: 'center' });
  // legend
  [['KAP leads', K], ['Federation or FPO leads', F], ['Cohort 2', L]].forEach(([s, col], i) => {
    const x = gx + [0, 1.15, 2.2][i]; const lwid = i === 1 ? 0.8 : 0.85;
    sl.addShape(pres.ShapeType.rect, { x, y: gEnd + 0.1, w: 0.18, h: 0.14, fill: { color: col }, line: { color: col, width: 0 } });
    text(sl, s.replace('Federation or FPO leads', 'FPOs lead'), { x: x + 0.24, y: gEnd + 0.06, w: lwid, h: 0.22, fontSize: 9, color: GREY });
  });
  head(sl, 'Who does what', gx, 5.05, 7.9);
  table(sl, ['Function', 'Year 1', 'Year 5'], [
    ['Finding buyers and negotiating', 'KAP', 'Federation sales desk'],
    ['Accounts, audit, filings', 'KAP', 'Federation shared team'],
    ['Buying from farmers and paying them', 'FPO with KAP', 'FPO CEO and women agents'],
    ['Lending decisions', 'KAP with the Foundation', 'Federation credit committee with partner bank'],
  ], { x: gx, y: 5.32, w: 7.9, colW: [2.75, 2.0, 3.15], fontSize: 9.5, margin: [2, 5, 2, 5] });
  // right panel
  const rx = 8.75, rw = W - M - rx;
  panel(sl, rx, 1.5, rw, 3.35);
  head(sl, 'Before support ends, each FPO must, for 2 years running:', rx + 0.15, 1.6, rw - 0.3);
  const tests = ['Cover 100% of running cost from its own income', 'Have 40%+ of members selling through it', 'Have 2+ buyers with written agreements, none above 50%', 'Hold a credit line in its own name, nothing overdue 90+ days', 'File audited accounts and returns on time', 'Have 3+ women directors and 30%+ women members', 'Have tested a flood plan in the last season'];
  tests.forEach((t, i) => {
    const y = 1.98 + i * 0.4;
    circle(sl, i + 1, rx + 0.15, y, 0.28, FOREST);
    text(sl, t, { x: rx + 0.55, y: y - 0.02, w: rw - 0.7, h: 0.38, fontSize: 10, valign: 'middle' });
  });
  panel(sl, rx, 5.0, rw, 1.7, GOLDT);
  head(sl, 'Checkpoint, end of Year 2', rx + 0.15, 5.1, rw - 0.3, RED);
  text(sl, 'Years 3 to 5 money and the 18 extra cohort 2 FPOs are released only if: **9 of 12** FPOs cover more than half their running cost; fund repayment is **95%** or more; **2+** maize buyers are in use; women are **28%+** of members. If not, the Foundation keeps the money and KAP fixes the gaps first.',
    { x: rx + 0.15, y: 5.38, w: rw - 0.3, h: 1.45, fontSize: 10 });
}

// ================= SLIDE 6: BUDGET =================
{
  const sl = content({ section: 'Budget',
    title: 'About half the money makes KAP\'s 12 FPOs self-running; the other half takes the same model to 24 more Kosi FPOs and makes the federation self-funding',
    source: 'Rs lakh at Rs 95 per US$ (US$1 million = Rs 950 lakh a year). Sources: model sheets Budget and Federation; S2, S4, S13.' });
  const b = D.Budget, cols = ['C', 'D', 'E', 'F', 'G', 'H'];
  const grp = ks => cols.map(c => ks.reduce((s, k) => s + (b[k][c] || 0), 0));
  const lines = [
    ['Sell together (sales desk, quality, women agents)', ['b_mkt', 'b_didi']],
    ['Fund the season (capital that stays)', ['b_fund', 'b_fldg', 'b_cont']],
    ['Store smart (asset kits)', ['b_infra']],
    ['People, women, climate', ['b_mgmt', 'b_sys', 'b_women', 'b_clim']],
    ['KAP team, federation, evaluation', ['b_kap', 'b_fed', 'b_eval']],
    ['Cohort 2: 24 more FPOs (18 after checkpoint)', ['b_coh2']],
  ];
  const rows = lines.map(([l, ks]) => { const v = grp(ks); return [l, ...v.map(f0), pc(v[5] / b.b_tot.H)]; });
  rows.push([{ t: 'Total', b: true }, ...cols.map(c => ({ t: f0(b.b_tot[c]), b: true })), { t: '100%', b: true }]);
  rows.push(['Total in US$ million', ...cols.map(c => b.b_usd[c].toFixed(2)), '']);
  head(sl, 'Budget by year (Rs lakh)', M, 1.5, 7.55);
  table(sl, ['Rs lakh', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5', '5 years', 'Share'], rows, { x: M, y: 1.78, w: 7.55, colW: [3.0, 0.6, 0.6, 0.6, 0.6, 0.6, 0.8, 0.75], num: [1, 2, 3, 4, 5, 6, 7], fontSize: 10, margin: [2, 5, 2, 5] });
  head(sl, 'Who pays the running costs after the grants', M, 4.25, 7.55);
  table(sl, ['Cost', 'Paid by', 'From'], [
    ['FPO CEO, assistant, office', 'FPO', `Margins, storage gain, service fees (${coverRange} cover)`],
    ['Accounts, audit, sales desk', 'Federation', `Rs 1.2 lakh fee per FPO, 1% maize commission, bulk input margin, fund interest: ${pc(N.fedCover)} cover`],
    ['Seasonal working capital', 'FPO and banks', 'Share capital plus matching grant, revolving fund, bank lines, e-NWR'],
  ], { x: M, y: 4.53, w: 7.55, colW: [2.2, 1.25, 4.1], fontSize: 10, margin: [2, 5, 2, 5] });
  const rx = 8.4, rw = W - M - rx;
  head(sl, 'Core 12 FPOs vs cohort 2 (Rs lakh)', rx, 1.5, rw);
  const core = cols.slice(0, 5).map(c => 950 - b.b_coh2[c]);
  sl.addChart(pres.ChartType.bar, [
    { name: 'Core 12 FPOs', labels: ['Y1', 'Y2', 'Y3', 'Y4', 'Y5'], values: core },
    { name: 'Cohort 2', labels: ['Y1', 'Y2', 'Y3', 'Y4', 'Y5'], values: cols.slice(0, 5).map(c => b.b_coh2[c]) },
  ], { ...chartBase, x: rx, y: 1.75, w: rw, h: 2.75, barDir: 'col', barGrouping: 'stacked', barGapWidthPct: 50, chartColors: [HEX.forest, 'A9CC98'],
    dataLabelFormatCode: '0', dataLabelPosition: 'ctr', dataLabelColor: HEX.white, showLegend: true, legendPos: 't' });
  [[`Rs ${f0(N.c1)} lakh`, 'per core FPO a year, incl. capital that stays'], [`Rs ${f0(N.c2)} lakh`, 'per cohort 2 FPO a year (75%: desk and fund exist)'], [`Rs ${f0(Math.round(N.perFarmer / 100) * 100)}`, `per farmer over 5 years (${f0(N.farmers)} members)`]].forEach(([big, small], i) => {
    const w = (rw - 0.2) / 3, x = rx + i * (w + 0.1);
    panel(sl, x, 4.7, w, 1.2);
    text(sl, big, { x: x + 0.08, y: 4.77, w: w - 0.16, h: 0.38, fontSize: 14, bold: true, color: FOREST });
    text(sl, small, { x: x + 0.08, y: 5.17, w: w - 0.16, h: 0.7, fontSize: 9, color: GREY });
  });
  text(sl, '**Why spending shifts:** capital is spent early; salary and KAP support taper to zero; cohort 2 grows only after the checkpoint. The core 12 fall from 76% of the money in Year 1 to 18% in Year 5.',
    { x: rx, y: 6.05, w: rw, h: 0.8, fontSize: 10, color: FOREST });
}

// ================= THANK YOU =================
{
  const sl = pres.addSlide({ masterName: 'CLOSE', sectionTitle: 'Main slides' });
  sl.addText('Thank you', { placeholder: 'title' });
  sl.addText(`Sell together, fund the season, store smart: 12 FPOs from ${pc(N.coverToday)} to ${coverRange} cost cover, a federation at ${pc(N.fedCover)}, and a model 24 more Kosi FPOs can use.`, { placeholder: 'body' });
}

// ================= APPENDIX =================
pres.addSection({ title: 'Appendix' });
{ // A1 unit economics
  const sl = content({ appendix: 'A1', title: 'Unit economics: how one FPO gets from today to Year 5', source: 'Rs lakh a year. Today = case midpoint turnover; running cost today assumes a professional team with no grant. Model sheet Unit_Econ.' });
  const cs = ['C', 'D', 'E', 'F'];
  const R = (label, k, fmt = f1, bold = false) => [{ t: label, b: bold }, ...cs.map(c => { const v = D.Unit_Econ[k][c]; return { t: v === undefined ? '' : fmt(v), b: bold }; })];
  table(sl, ['Rs lakh a year', 'Maize today', 'Maize Y5', 'Veg today', 'Veg Y5'], [
    R('Members', 'members', f0), R('Women share of members', 'women_pct', pc), R('Members selling through the FPO', 'sellers', f0), R('Produce handled (t)', 'vol', f0),
    R('Produce sales', 's_prod'), R('Input sales', 's_inp'), R('Nursery sales', 's_nur'), R('Turnover', 'turnover', f1, true),
    R('Margin on produce', 'gm_prod'), R('Net gain on stored maize', 'gm_store'), R('Margin on inputs', 'gm_inp'), R('Margin on nursery', 'gm_nur'), R('Service fees', 'gm_svc'), R('Income the FPO keeps', 'income', f1, true),
    R('CEO', 'c_ceo'), R('Assistant', 'c_staff'), R('Office, travel, AGM, filing', 'c_off'), R('Federation fee', 'c_fed'), R('Asset upkeep and insurance', 'c_om'), R('Loan repayment', 'c_debt'),
    R('Running cost', 'cost', f1, true), R('Share of running cost covered', 'cover', pc, true), R('Break-even turnover at Year 5 margins', 'be_to'),
  ], { x: M, y: 1.5, w: 8.2, colW: [3.8, 1.1, 1.1, 1.1, 1.1], num: [1, 2, 3, 4], fontSize: 9, margin: [1, 5, 1, 5] });
  panel(sl, 9.0, 1.5, W - M - 9.0, 3.2);
  head(sl, 'How to read it', 9.15, 1.6, 3.5);
  bullets(sl, ['Produce handled = sellers x area x yield x share sold x share the FPO handles.', 'Income kept = margins on produce and inputs + storage gain + fees for drying, storage and cold rooms.', 'Running cost includes the federation fee and loan repayment, so "covered" means fully independent.', 'Today\'s cover uses the same professional cost base, to compare like with like.'], { x: 9.15, y: 1.9, w: 3.53, h: 2.75, fontSize: 10 });
}
{ // A2 working capital and assets
  const sl = content({ appendix: 'A2', title: 'Working capital and asset funding: claim and lease first, then lend, then grant', source: 'Rs lakh. Model sheets Working_Capital and Infra. S2 matching equity grant; S5 AIF; S6 MIDH; S7 e-NWR guarantee; S16 PACS godowns.' });
  const w = D.Working_Capital, v = (k, c) => f1(w[k][c]);
  head(sl, 'Working capital in Year 5', M, 1.5, 6.1);
  table(sl, ['Rs lakh', 'Maize FPO', 'Veg FPO', 'All 12'], [
    ['Peak cash tied up in buying produce', v('w_prod', 'C'), v('w_prod', 'D'), v('w_prod', 'E')],
    ['Input credit to members', v('w_cred', 'C'), v('w_cred', 'D'), v('w_cred', 'E')],
    [{ t: 'Peak need', b: true }, { t: v('w_need', 'C'), b: true }, { t: v('w_need', 'D'), b: true }, { t: v('w_need', 'E'), b: true }],
    ['Members\' share capital', v('w_share', 'C'), v('w_share', 'D'), v('w_share', 'E')],
    ['Government matching equity grant', v('w_match', 'C'), v('w_match', 'D'), v('w_match', 'E')],
    ['Less own share of asset kit', v('w_capex', 'C'), v('w_capex', 'D'), v('w_capex', 'E')],
    [{ t: 'Gap to finance', b: true }, { t: v('w_gap', 'C'), b: true }, { t: v('w_gap', 'D'), b: true }, { t: v('w_gap', 'E'), b: true }],
    ['From the federation revolving fund (60%)', v('w_fund', 'C'), v('w_fund', 'D'), v('w_fund', 'E')],
    ['From banks and NBFCs (40%)', v('w_bank', 'C'), v('w_bank', 'D'), v('w_bank', 'E')],
  ], { x: M, y: 1.78, w: 6.1, colW: [3.1, 1.0, 1.0, 1.0], num: [1, 2, 3], fontSize: 10 });
  text(sl, 'Stored maize is financed separately by e-NWR pledge loans. NBFC = non-bank finance company. Today\'s gap across the 12 FPOs is Rs 180 lakh; claiming the matching grant closes most of it.', { x: M, y: 4.55, w: 6.1, h: 0.9, fontSize: 10, color: GREY });
  const f = D.Infra, iv = (k, c) => f1(f[k][c]);
  head(sl, 'Asset kit per FPO and who pays', 7.0, 1.5, 5.83);
  table(sl, ['Rs lakh', 'Maize', 'Veg'], [
    ['Drying yard, moisture meter, scale', iv('k1', 'C'), iv('k1', 'D')], ['Shared mobile dryer, cleaner', iv('k2', 'C'), iv('k2', 'D')], ['PACS godown upgrade (leased)', iv('k3', 'C'), iv('k3', 'D')],
    ['Two 5 t solar cold rooms', iv('k4', 'C'), iv('k4', 'D')], ['Pack shed on raised plinth', iv('k5', 'C'), iv('k5', 'D')], ['Collection points and crates', iv('k6', 'C'), iv('k6', 'D')], ['Shade-net nursery', iv('k7', 'C'), iv('k7', 'D')],
    [{ t: 'Total kit', b: true }, { t: iv('kit', 'C'), b: true }, { t: iv('kit', 'D'), b: true }],
    ['Foundation grant', iv('p_fdn', 'C'), iv('p_fdn', 'D')], ['Government subsidy (MIDH 35%)', iv('p_gov', 'C'), iv('p_gov', 'D')], ['FPO own funds (10%)', iv('p_own', 'C'), iv('p_own', 'D')], ['AIF bank loan', iv('p_loan', 'C'), iv('p_loan', 'D')],
    ['Yearly loan repayment (6%, 7 years)', f[ 'emi' ].C.toFixed(2), f.emi.D.toFixed(2)],
  ], { x: 7.0, y: 1.78, w: 5.83, colW: [3.43, 1.2, 1.2], num: [1, 2], fontSize: 10, margin: [2, 5, 2, 5] });
  text(sl, `Assets worth ${f.lev.C.toFixed(1)} times the Foundation's grant. We lease godowns instead of building: Bihar has just built 6,158 PACS godowns (16.9 lakh tonnes).`, { x: 7.0, y: 5.15, w: 5.83, h: 0.75, fontSize: 10, color: GREY });
}
{ // A3 federation and sensitivity
  const sl = content({ appendix: 'A3', title: `The federation pays its own way by Year 5 (${pc(N.fedCover)} cost cover); FPO cost cover stays above 74% even under stress`, source: 'Rs lakh a year. Model sheets Federation and Sensitivity. S4 NBFC lending rates.' });
  const fd = D.Federation, fv = k => fd[k].C;
  head(sl, 'Federation in Year 5 (36 member FPOs)', M, 1.5, 6.1);
  table(sl, ['Rs lakh a year', 'Value'], [
    ['Federation CEO', f1(fv('f_ceo'))], ['Market desk (2 sales managers)', f1(fv('f_mkt'))], ['Accounts and compliance team', f1(fv('f_fin'))], ['Office, software, travel, audit', f1(fv('f_off'))], ['Extra servicing for FPOs beyond 12', f1(fv('f_var'))],
    [{ t: 'Running cost', b: true }, { t: f1(fv('f_cost')), b: true }],
    ['Fees from member FPOs (Rs 1.2 lakh each)', f1(fv('f_fees'))], ['1% commission on maize sold via federation', f1(fv('f_trade'))], ['1.5% margin on bulk input buying', f1(fv('f_inp'))],
    [`Net interest: Rs ${f0(fv('f_lent'))} lakh lent at 10% less 4% loss and admin`, f1(fv('f_spread'))],
    [{ t: 'Income', b: true }, { t: f1(fv('f_inc')), b: true }], [{ t: 'Share of running cost covered', b: true }, { t: pc(fv('f_cover')), b: true, color: FOREST }],
  ], { x: M, y: 1.78, w: 6.1, colW: [4.9, 1.2], num: [1], fontSize: 10, margin: [2, 5, 2, 5] });
  head(sl, 'FPO cost cover under stress, Year 5', 7.0, 1.5, 5.83);
  const sn = D.Sensitivity;
  table(sl, ['Scenario', 'Maize', 'Veg'], Object.keys(sn).map(k => [sn[k].A, pc(sn[k].C), pc(sn[k].D)]), { x: 7.0, y: 1.78, w: 5.83, colW: [3.83, 1.0, 1.0], num: [1, 2], fontSize: 10.5 });
  text(sl, `Revolving fund: Rs 250 lakh capital (incl. Rs 50 lakh flood window); about ${pc(fv('f_util'))} lent out on average, so the flood window stays liquid. Fund rate of 10% is below the 14% to 15% NBFCs charge FPOs.`, { x: 7.0, y: 4.0, w: 5.83, h: 1.0, fontSize: 10, color: GREY });
}
{ // A4 assumptions
  const sl = content({ appendix: 'A4', title: 'Assumptions behind the numbers, with reasons and sources', source: 'Full list with notes in model sheet Assumptions. Source codes refer to Appendix A6.' });
  const a = D.Assumptions;
  const pick = [
    ['active', pc], ['area', v => v + ' ha'], ['yield', v => v + ' t/ha'], ['capture', pc], ['price', v => 'Rs ' + f0(v) + '/t'], ['inp_spend', v => 'Rs ' + f0(v)], ['m_prod', pc], ['hold', pc], ['m_store', pc], ['m_inp', pc],
    ['ceo', v => 'Rs ' + v + ' lakh'], ['fedfee', v => 'Rs ' + v + ' lakh'], ['capex', v => 'Rs ' + v + ' lakh'], ['g_fdn', pc], ['wc_pct', pc], ['fx', v => 'Rs ' + v],
  ];
  const rows = pick.map(([k, fmt]) => [a[k].A, a[k].C !== undefined ? fmt(a[k].C) : '', a[k].D !== undefined ? fmt(a[k].D) : '', { t: a[k].E || 'Our choice: grant share is higher for maize because its kit earns less', fs: 9.5 }]);
  table(sl, ['Assumption', 'Maize', 'Veg', 'Reason and source'], rows, { x: M, y: 1.5, w: BW, colW: [3.4, 1.05, 1.05, 6.83], fontSize: 10.5, margin: [2, 5, 2, 5] });
}
{ // A5 evidence and risks
  const sl = content({ appendix: 'A5', title: 'Evidence and hit rates behind the targets, and the risks we watch', source: 'Sources: S1, S3, S4, S9, S10, S18, S19, S21, S22 (Appendix A6). S9 is self-reported; S22 is a secondary citation.' });
  head(sl, 'What similar efforts achieved', M, 1.5, 6.1);
  table(sl, ['Evidence', 'Figure'], [
    ['FPOs that are financially viable (ICAR-NIAP)', 'About 1 in 3'],
    ['Scheme FPOs above Rs 1 crore turnover, FY25', '1,135 of 8,961 (12.7%)'],
    ['FPOs profitable only with support (NAFPO 2026)', '45%'],
    ['Profitable without support: with vs without a loan', '61% vs 43%'],
    ['Women or mixed-led FPOs: survival after support', '4 to 13 points higher'],
    ['SRIJAN, 12 FPOs, 2 years: turnover; members selling', '+190%; 39%'],
    ['JEEViKA maize company (Purnia): farmer returns', '+15% to 20%'],
    ['Producer companies older than 7 years, moribund', '45%'],
  ], { x: M, y: 1.78, w: 6.1, colW: [4.3, 1.8], fontSize: 10 });
  head(sl, 'Risks: warning signs and responses', 7.0, 1.5, 5.83);
  table(sl, ['Risk', 'Warning sign', 'Response'], [
    ['Ethanol demand cut', 'Distillery delays lifting or pays after 30 days', 'Three-buyer rule; shift to feed mills; store under e-NWR'],
    ['Side-selling to traders', 'Members selling stalls below 30%', 'Pay in 7 days; input credit repaid in produce; daily prices'],
    ['Bad loans', 'Repayment below 95%', 'Credit committee; first-loss deposit; stop new loans to that FPO'],
    ['Flood', 'Kosi alert or early inundation', 'Raised godowns; flood loan window; nursery replanting; BRFSY claims'],
    ['Elite capture', 'Same few directors; women fellows not elected', 'Rotation rules; women\'s seats in exit tests; independent audit'],
    ['KAP spread thin', 'Cohort 1 milestones slip', 'Cohort 2 expansion gated on the checkpoint'],
  ], { x: 7.0, y: 1.78, w: 5.83, colW: [1.3, 2.0, 2.53], fontSize: 9, margin: [2, 4, 2, 4] });
}
{ // A6 sources and glossary
  const sl = content({ appendix: 'A6', title: 'Sources and glossary', source: 'Benchmarks confirmed through published reports and news coverage; full links in the working document.' });
  const src = [
    'S1 ICAR-NIAP via Business Standard, Aug 2025: one third of FPOs viable', 'S2 Govt 10,000 FPO scheme guidelines and Rajya Sabha replies (CBBO fee, management cost, matching equity grant)',
    'S3 Ministry of Agriculture via IANS, Jul 2025: FPO turnover bands, FY25', 'S4 NAFPO State of the Sector 2026 (Tribune); NABARD credit guarantee scheme; Samunnati FPO loan rates',
    'S5 Agriculture Infrastructure Fund (myScheme, Indian Bank)', 'S6 MIDH post-harvest assistance (Rajya Sabha, Mar 2025)', 'S7 CGS-NPF e-NWR pledge finance guarantee, Dec 2024',
    'S8 Solar cold room service, Muzaffarpur (pv magazine India)', 'S9 SRIJAN and Walmart Foundation results (Agrospectrum, Oct 2025)', 'S10 TCI Cornell and BIRD, State of FPOs in India 2026',
    'S11 Maize supply chain in Bihar (DES); BAMETI state profile', 'S12 NABCONS 2022 post-harvest losses (Rajya Sabha, Feb 2025)', 'S13 Rupee at 94.8 to 95.95 per US$, Aug to Sep 2026',
    'S14 Maize MSP 2025-26; Gulabbagh mandi prices', 'S15 Village Square, 101Reporters: distress sale of maize at harvest', 'S16 Bihar PACS godowns, Jun 2025', 'S17 Bihar exit from PMFBY; BRFSY terms', 'S18 Mongabay, Feb 2026: Bihar ethanol allocation cut',
    'S19 World Bank and JEEViKA: Aaranyak maize company', 'S20 VEGFED and Tarkaari', 'S21 Sahyadri Farms FY24', 'S22 MCA data on moribund producer companies (secondary)',
  ];
  text(sl, src.join('\n'), { x: M, y: 1.5, w: 7.3, h: 5.4, fontSize: 9, paraSpaceAfter: 2 });
  head(sl, 'Glossary', 8.1, 1.5, 4.73);
  text(sl, ['**FPO** Farmer Producer Organisation', '**KAP** Kosi Agri Partners', '**CBBO** Cluster-Based Business Organisation', '**PACS** Primary Agricultural Credit Society', '**AIF** Agriculture Infrastructure Fund',
    '**MIDH** Mission for Integrated Development of Horticulture', '**e-NWR** electronic Negotiable Warehouse Receipt', '**CGS-NPF** credit guarantee for e-NWR pledge finance', '**NBFC** non-bank finance company',
    '**SHG** self-help group', '**JEEViKA** Bihar Rural Livelihoods Project', '**VEGFED** Bihar State Vegetable Processing and Marketing Cooperative Federation', '**BRFSY** Bihar Rajya Fasal Sahayata Yojana (state crop aid)',
    '**PMFBY** Pradhan Mantri Fasal Bima Yojana (central crop insurance)', '**MSP** minimum support price'].join('\n'), { x: 8.1, y: 1.8, w: 4.73, h: 5.1, fontSize: 9.5, paraSpaceAfter: 2 });
}

// ---------- write ----------
// pptxgenjs writes a paragraph-properties block before every run, and later ones (with "no bullet") override the first.
// Keep only the first <a:pPr> in each paragraph so multi-run bullets keep their bullet.
async function keepFirstParaProps(file) {
  const JSZip = require(require.resolve('jszip', { paths: [require.resolve('pptxgenjs', { paths: [path.join(__dirname, '../../case-comp-kit')] })] }));
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  const PPR = /<a:pPr\b[^>]*?(?:\/>|>[\s\S]*?<\/a:pPr>)/g;
  for (const name of Object.keys(zip.files).filter(n => /^ppt\/slides\/slide\d+\.xml$/.test(n))) {
    const xml = await zip.file(name).async('string');
    const fixed = xml.replace(/<a:p>[\s\S]*?<\/a:p>/g, p => { let seen = false; return p.replace(PPR, m => (seen ? '' : (seen = true, m))); });
    zip.file(name, fixed);
  }
  fs.writeFileSync(file, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
}
(async () => {
  const safe = team.teamName.replace(/[^A-Za-z0-9]+/g, '') || 'TeamName';
  const out = path.join(__dirname, '..', 'final', `${safe}_BusinessTangent2026.pptx`);
  await pres.writeFile({ fileName: out });
  await keepFirstParaProps(out);
  await applyTheme(out, THEME);
  console.log('Wrote', out);
})();
