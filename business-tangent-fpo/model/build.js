// Business Tangent 2026 (St. Stephen's FnIC): KAP / FPO sustainability model.
// All money in Rs lakh unless the unit column says otherwise. Run: node build.js
const path = require('path');
const { createBook, X, R, all, check } = require('../../case-comp-kit/lib/model-kit');

const book = createBook();
const W = { A: 52, B: 9, C: 12, D: 12, E: 12, F: 12, G: 12, H: 12, I: 70 };
const cd = book.sheet('Case_Data', { noteCol: 'E', widths: { A: 52, B: 9, C: 12, D: 12, E: 70 } });
const asm = book.sheet('Assumptions', { noteCol: 'E', widths: { A: 52, B: 9, C: 12, D: 12, E: 100 } });
const ue = book.sheet('Unit_Econ', { noteCol: 'G', widths: { A: 52, B: 9, C: 12, D: 12, E: 12, F: 12, G: 70 } });
const wc = book.sheet('Working_Capital', { noteCol: 'F', widths: { A: 52, B: 9, C: 12, D: 12, E: 12, F: 70 } });
const inf = book.sheet('Infra', { noteCol: 'F', widths: { A: 52, B: 9, C: 12, D: 12, E: 12, F: 70 } });
const fed = book.sheet('Federation', { noteCol: 'D', widths: { A: 52, B: 9, C: 12, D: 80 } });
const bud = book.sheet('Budget', { noteCol: 'I', widths: W });
const tgt = book.sheet('Targets', { noteCol: 'F', widths: { A: 52, B: 9, C: 12, D: 12, E: 12, F: 80 } });
const chk = book.sheet('Checks', { noteCol: 'E', widths: { A: 60, B: 9, C: 12, D: 12, E: 40 } });

// ---------------- Case data (from the case PDF) ----------------
cd.title('Case data (as given in the case)');
cd.header(['Item', 'Unit', 'Maize', 'Vegetable', 'Source']);
cd.row('n_fpo', 'Number of FPOs', [7, 5], { fmt: 'num0', note: 'Case background: 12 FPOs, 7 maize, 5 vegetables' });
cd.row('members', 'Members per typical FPO', [500, 500], { fmt: 'num0', note: 'Case background' });
cd.row('women_pct', 'Women share of members', [0.2, 0.2], { fmt: 'pct', note: 'Case background' });
cd.row('to_low', 'Annual turnover, low end', [20, 20], { unit: 'Rs lakh', note: 'Case background: Rs 20 to 35 lakh' });
cd.row('to_high', 'Annual turnover, high end', [35, 35], { unit: 'Rs lakh', note: 'Case background' });
cd.row('to_mid', 'Annual turnover, midpoint', all(2, c => `=(${R(cd, 'to_low', c)}+${R(cd, 'to_high', c)})/2`), { unit: 'Rs lakh', total: true });
cd.row('share_rs', 'Share capital per member', [2000, 2000], { unit: 'Rs', fmt: 'num0', note: 'Case background' });
cd.row('share_cap', 'Share capital per FPO', all(2, c => `=${R(cd, 'members', c)}*${R(cd, 'share_rs', c)}/100000`), { unit: 'Rs lakh', note: 'Equals the Rs 10 lakh working capital in the case: the FPO is running on its share capital alone' });
cd.row('wc_have', 'Working capital available', [10, 10], { unit: 'Rs lakh', note: 'Key challenges: financial access' });
cd.row('wc_need', 'Peak-season working capital need', [25, 25], { unit: 'Rs lakh', note: 'Key challenges: financial access' });
cd.row('wc_gap', 'Working capital gap per FPO', all(2, c => `=${R(cd, 'wc_need', c)}-${R(cd, 'wc_have', c)}`), { unit: 'Rs lakh', total: true });
cd.row('board', 'Board size / women directors', [9, 1], { fmt: 'num0', note: 'Case: nine-member board with one woman director (C = board, D = women)' });
cd.row('usd', 'Foundation commitment per year', [1, null], { unit: 'USD m', note: 'Case background: US$1 million a year for 3 to 5 years' });

// ---------------- Assumptions ----------------
asm.title('Assumptions (blue = typed input; every row has a reason and source code, see Targets sheet for the source list)');
asm.header(['Assumption', 'Unit', 'Maize', 'Vegetable', 'Reason / source']);
asm.sub('General');
asm.row('fx', 'Exchange rate', [95, null], { unit: 'Rs/USD', key: true, note: '[S13] Rupee at 94.8 to 95.95 per USD in Aug to Sep 2026; 95 used' });
asm.row('years', 'Programme years planned', [5, null], { fmt: 'num0', note: 'Case allows 3 to 5; we plan 5 with a go/no-go checkpoint at end of Year 2' });
asm.sub('Year 5 membership and participation (per FPO)');
asm.row('new_women', 'New women members added by Year 5', [150, 150], { fmt: 'num0', note: 'Enrolled through JEEViKA self-help groups already active in these villages [S10]; about 30 a year' });
asm.row('active', 'Members who sell produce through the FPO', [0.5, 0.45], { fmt: 'pct', key: true, note: '[S9] SRIJAN raised members selling to their FPOs to 39% in 2 years; we allow 5 years plus input credit tied to sales. Vegetables lower because of daily, small lots' });
asm.row('area', 'Crop area per selling member', [0.4, 0.2], { unit: 'ha', note: '[S11] 83% of Bihar holdings are under 1 ha. Maize is the main rabi crop in Kosi; vegetables are grown on small plots' });
asm.row('yield', 'Yield per hectare per year', [4.5, 22.5], { unit: 't/ha', note: '[S11] Bihar maize about 4 t/ha, rabi higher. Vegetables: 15 t/ha a season x 1.5 seasons (our assumption)' });
asm.row('mkt', 'Share of output that is sold', [0.9, 0.85], { fmt: 'pct', note: 'Maize is a cash crop; vegetables lose some to home use and damage [S12]' });
asm.row('capture', 'Share of a selling member\'s output the FPO handles', [0.65, 0.5], { fmt: 'pct', note: 'Input credit repaid in produce and assured payment in 7 days pull volume; vegetables lower because of side-selling to local markets' });
asm.row('price', 'Average farm-gate price', [22500, 14000], { unit: 'Rs/t', fmt: 'num0', note: '[S14] Maize MSP Rs 2,400/qtl but Bihar has no state maize procurement; Purnia mandi near Rs 2,100 to 2,300. Vegetables: blended Rs 14/kg (our assumption)' });
asm.row('inp_users', 'Members buying inputs through the FPO', [0.7, 0.7], { fmt: 'pct', note: '[S9] SRIJAN reached 88% of shareholders buying inputs; 70% used' });
asm.row('inp_spend', 'Input spend per member per year', [12000, 8000], { unit: 'Rs', fmt: 'num0', note: 'Seed, fertiliser and crop protection for 0.4 ha maize or 0.2 ha vegetables (our assumption)' });
asm.row('inp_wallet', 'Share of that spend bought from the FPO', [0.5, 0.5], { fmt: 'pct', note: 'Fertiliser licence and bulk buying; half, not all' });
asm.row('nursery', 'Nursery seedling sales', [0, 5], { unit: 'Rs lakh', note: 'Vegetable FPOs run a shade-net nursery (also a flood fallback: seedlings can be replanted fast)' });
asm.sub('Margins the FPO keeps');
asm.row('m_prod', 'Margin on produce sold', [0.03, 0.07], { fmt: 'pct', note: 'Maize: about Rs 65/qtl spread on bulk contracts. Vegetables: grading premium and lower loss [S12: 4.9% to 11.6% vegetable loss]' });
asm.row('hold', 'Share of maize held in storage for later sale', [0.4, 0], { fmt: 'pct', note: '[S15] Small farmers sell in distress at harvest; larger farmers hold 3 to 4 months' });
asm.row('m_store', 'Net gain on stored maize after rent, interest and shrinkage', [0.04, 0], { fmt: 'pct', note: 'Assumes about 9% to 10% price rise in 4 months less about 5% holding cost; e-NWR pledge loan pays for the stock [S7]' });
asm.row('m_inp', 'Margin on inputs', [0.08, 0.1], { fmt: 'pct', note: 'Dealer margin on bulk seed and fertiliser (our assumption)' });
asm.row('m_nur', 'Margin on nursery sales', [0, 0.3], { fmt: 'pct', note: 'Our assumption' });
asm.row('svc_fee', 'Drying, cleaning and storage fee', [400, 0], { unit: 'Rs/t', fmt: 'num0', note: 'Rs 40/qtl charged on FPO volume and on traders\' maize' });
asm.row('svc_mult', 'Third-party volume as a multiple of own volume', [0.5, 0], { fmt: 'num2', note: 'Dryer and godown rented out to non-members in spare weeks' });
asm.row('cold_fee', 'Cold room fees from non-members', [0, 0.6], { unit: 'Rs lakh', note: 'Pay-per-crate service, as in the Ecozen/Oorja model in Muzaffarpur [S8]' });
asm.row('m_today', 'Blended margin today', [0.05, 0.05], { fmt: 'pct', note: 'Small trading and input margins at current scale (our assumption)' });
asm.sub('Running cost of an independent FPO (per year)');
asm.row('ceo', 'CEO salary', [3.6, 3.6], { unit: 'Rs lakh', note: 'Rs 30,000 a month. Govt management cost norm is Rs 18 lakh over 3 years = Rs 6 lakh a year for all costs [S2]' });
asm.row('staff', 'Store, procurement and accounts assistant', [1.44, 1.8], { unit: 'Rs lakh', note: 'One full-time assistant; vegetables need extra grading help' });
asm.row('office', 'Office, travel, AGM and filing', [0.9, 0.9], { unit: 'Rs lakh' });
asm.row('fedfee', 'Fee to federation for accounts, compliance and market desk', [1.2, 1.2], { unit: 'Rs lakh', note: 'Shared chartered accountant, audit, ROC filings and sales desk; cheaper than each FPO hiring its own' });
asm.row('om', 'Upkeep and insurance of FPO assets', [0.03, 0.04], { fmt: 'pct', note: 'Share of asset cost per year; solar cold rooms and crates wear faster' });
asm.sub('Infrastructure per FPO and how it is paid for');
asm.row('capex', 'Asset kit per FPO', [10, 40], { unit: 'Rs lakh', key: true, note: 'See Infra sheet. Maize stores in leased PACS godowns, so its kit is small' });
asm.row('g_fdn', 'Foundation grant share', [0.6, 0.4], { fmt: 'pct' });
asm.row('g_gov', 'Government subsidy share', [0, 0.35], { fmt: 'pct', note: '[S6] MIDH pays 35% of cost for post-harvest units in general areas' });
asm.row('g_own', 'FPO own contribution', [0.1, 0.1], { fmt: 'pct', note: '[S5] AIF requires at least 10% borrower contribution' });
asm.row('rate', 'Loan interest after AIF subvention', [0.06, 0.06], { fmt: 'pct', note: '[S5] About 9% bank rate less 3% AIF interest subvention' });
asm.row('tenor', 'Loan tenure', [7, 7], { unit: 'years', fmt: 'num0', note: '[S5] AIF subvention runs up to 7 years' });
asm.sub('Working capital');
asm.row('wc_pct', 'Peak working capital as share of yearly produce sales', [0.45, 0.2], { fmt: 'pct', note: 'Maize is one big rabi buying season with 30 to 60 day buyer payment; vegetables turn over within days' });
asm.row('credit_pct', 'Share of input sales given on credit to members', [0.3, 0.3], { fmt: 'pct', note: 'Repaid in produce at harvest' });
asm.row('match', 'Matching equity grant per member', [2000, 2000], { unit: 'Rs', fmt: 'num0', note: '[S2] Govt matches share capital up to Rs 2,000 per member, cap Rs 15 lakh per FPO' });
asm.row('match_cap', 'Matching equity grant cap per FPO', [15, 15], { unit: 'Rs lakh' });
asm.row('fund_share', 'Share of the remaining gap met by the federation fund', [0.6, 0.6], { fmt: 'pct', note: 'Rest from banks and NBFCs, made willing by the first-loss deposit and govt credit guarantee [S4]' });

// ---------------- Unit economics ----------------
const C = (k, col) => X(asm, k, col);       // assumption cell
const M = 'C', V = 'D';                       // assumption columns for maize and vegetable
ue.title('Unit economics of one FPO: today versus Year 5 (Rs lakh a year)');
ue.header(['Rs lakh a year', 'Unit', 'Maize today', 'Maize Y5', 'Veg today', 'Veg Y5', 'How it is worked out']);
const both = (fnToday, fnY5) => [fnToday(M, 'C'), fnY5(M, 'C'), fnToday(V, 'D'), fnY5(V, 'D')];
ue.row('members', 'Members', [
  `=${X(cd, 'members', 'C')}`, `=${X(cd, 'members', 'C')}+${C('new_women', M)}`,
  `=${X(cd, 'members', 'D')}`, `=${X(cd, 'members', 'D')}+${C('new_women', V)}`], { fmt: 'num0' });
ue.row('women_pct', 'Women share of members', [
  `=${X(cd, 'women_pct', 'C')}`, c => `=(${X(cd, 'members', 'C')}*${X(cd, 'women_pct', 'C')}+${C('new_women', M)})/${c}${ue.n('members')}`,
  `=${X(cd, 'women_pct', 'D')}`, c => `=(${X(cd, 'members', 'D')}*${X(cd, 'women_pct', 'D')}+${C('new_women', V)})/${c}${ue.n('members')}`], { fmt: 'pct' });
ue.row('sellers', 'Members selling through the FPO', [null, c => `=${c}${ue.n('members')}*${C('active', M)}`, null, c => `=${c}${ue.n('members')}*${C('active', V)}`], { fmt: 'num0' });
ue.row('vol', 'Produce handled', [null, c => `=${c}${ue.n('sellers')}*${C('area', M)}*${C('yield', M)}*${C('mkt', M)}*${C('capture', M)}`, null,
  c => `=${c}${ue.n('sellers')}*${C('area', V)}*${C('yield', V)}*${C('mkt', V)}*${C('capture', V)}`], { unit: 't', fmt: 'num0', note: 'Sellers x area x yield x share sold x FPO share' });
ue.row('s_prod', 'Produce sales', [null, c => `=${c}${ue.n('vol')}*${C('price', M)}/100000`, null, c => `=${c}${ue.n('vol')}*${C('price', V)}/100000`]);
ue.row('s_inp', 'Input sales', [null, c => `=${c}${ue.n('members')}*${C('inp_users', M)}*${C('inp_spend', M)}*${C('inp_wallet', M)}/100000`, null,
  c => `=${c}${ue.n('members')}*${C('inp_users', V)}*${C('inp_spend', V)}*${C('inp_wallet', V)}/100000`]);
ue.row('s_nur', 'Nursery sales', [null, `=${C('nursery', M)}`, null, `=${C('nursery', V)}`]);
ue.row('turnover', 'Turnover', [`=${X(cd, 'to_mid', 'C')}`, c => `=SUM(${c}${ue.n('s_prod')}:${c}${ue.n('s_nur')})`,
  `=${X(cd, 'to_mid', 'D')}`, c => `=SUM(${c}${ue.n('s_prod')}:${c}${ue.n('s_nur')})`], { total: true, key: true, note: 'Today = case midpoint' });
ue.blank();
ue.row('gm_prod', 'Margin on produce', [null, c => `=${c}${ue.n('s_prod')}*${C('m_prod', M)}`, null, c => `=${c}${ue.n('s_prod')}*${C('m_prod', V)}`]);
ue.row('gm_store', 'Net gain on stored maize', [null, c => `=${c}${ue.n('s_prod')}*${C('hold', M)}*${C('m_store', M)}`, null, 0]);
ue.row('gm_inp', 'Margin on inputs', [null, c => `=${c}${ue.n('s_inp')}*${C('m_inp', M)}`, null, c => `=${c}${ue.n('s_inp')}*${C('m_inp', V)}`]);
ue.row('gm_nur', 'Margin on nursery', [null, 0, null, c => `=${c}${ue.n('s_nur')}*${C('m_nur', V)}`]);
ue.row('gm_svc', 'Service fees (drying, storage, cold room)', [null, c => `=${c}${ue.n('vol')}*(1+${C('svc_mult', M)})*${C('svc_fee', M)}/100000`, null, `=${C('cold_fee', V)}`]);
ue.row('income', 'Income the FPO keeps', [`=${X(cd, 'to_mid', 'C')}*${C('m_today', M)}`, c => `=SUM(${c}${ue.n('gm_prod')}:${c}${ue.n('gm_svc')})`,
  `=${X(cd, 'to_mid', 'D')}*${C('m_today', V)}`, c => `=SUM(${c}${ue.n('gm_prod')}:${c}${ue.n('gm_svc')})`], { total: true });
ue.blank();
ue.row('c_ceo', 'CEO', [`=${C('ceo', M)}`, `=${C('ceo', M)}`, `=${C('ceo', V)}`, `=${C('ceo', V)}`]);
ue.row('c_staff', 'Assistant', [`=${C('staff', M)}`, `=${C('staff', M)}`, `=${C('staff', V)}`, `=${C('staff', V)}`]);
ue.row('c_off', 'Office, travel, AGM, filing', [`=${C('office', M)}`, `=${C('office', M)}`, `=${C('office', V)}`, `=${C('office', V)}`]);
ue.row('c_fed', 'Federation fee', [0, `=${C('fedfee', M)}`, 0, `=${C('fedfee', V)}`]);
ue.row('c_om', 'Asset upkeep and insurance', [0, `=${C('capex', M)}*${C('om', M)}`, 0, `=${C('capex', V)}*${C('om', V)}`]);
ue.row('c_debt', 'Loan repayment (principal and interest)', [0, () => `=${X(inf, 'emi', 'C')}`, 0, () => `=${X(inf, 'emi', 'D')}`]);
ue.row('cost', 'Full running cost without any grant', all(4, c => `=SUM(${c}${ue.n('c_ceo')}:${c}${ue.n('c_debt')})`), { total: true });
ue.row('cover', 'Share of running cost the FPO covers itself', all(4, c => `=${c}${ue.n('income')}/${c}${ue.n('cost')}`), { fmt: 'pct', key: true, note: 'Exit test: at least 100% for two years in a row' });
ue.row('surplus', 'Surplus (deficit)', all(4, c => `=${c}${ue.n('income')}-${c}${ue.n('cost')}`));
ue.row('be_to', 'Turnover needed to break even at Year 5 margins', [null, c => `=${c}${ue.n('cost')}/(${c}${ue.n('income')}/${c}${ue.n('turnover')})`, null,
  c => `=${c}${ue.n('cost')}/(${c}${ue.n('income')}/${c}${ue.n('turnover')})`], { note: 'Running cost / income per rupee of turnover' });
ue.row('mult', 'Year 5 turnover as a multiple of today', [null, c => `=${c}${ue.n('turnover')}/C${ue.n('turnover')}`, null, c => `=${c}${ue.n('turnover')}/E${ue.n('turnover')}`], { fmt: 'x' });

// ---------------- Infrastructure ----------------
inf.title('Infrastructure kit per FPO and funding stack (Rs lakh)');
inf.header(['Rs lakh', 'Unit', 'Maize', 'Vegetable', '', 'Basis']);
inf.sub('Kit');
inf.row('k1', 'Drying yard, tarpaulins, moisture meter, scale, sampling kit', [4, 0], { note: 'Meets ethanol and feed-mill moisture specs (14% or lower)' });
inf.row('k2', 'Mobile maize dryer share and cleaner/grader', [5, 0], { note: 'One mobile dryer shared by two FPOs' });
inf.row('k3', 'PACS godown upgrade to WDRA standard (raised stacking, fumigation, fire kit)', [1, 0], { note: '[S16] Lease idle PACS godowns (Bihar built 6,158 with 16.9 lakh t) instead of building new' });
inf.row('k4', 'Two 5 t solar cold rooms', [0, 18], { note: '[S8] Ecozen-type units; pay-per-crate service model' });
inf.row('k5', 'Pack shed with grading tables on raised plinth', [0, 8], { note: 'Built above the local high-flood level' });
inf.row('k6', 'Three village collection points and 2,000 crates', [0, 8] , { note: 'Crates cut handling loss' });
inf.row('k7', 'Shade-net nursery', [0, 6], { note: 'Seedlings for replanting after floods; sold to members' });
inf.row('kit', 'Total kit', all(2, c => `=SUM(${c}${inf.n('k1')}:${c}${inf.n('k7')})`), { total: true });
inf.sub('Who pays');
inf.row('p_fdn', 'Foundation grant', [`=C${inf.n('kit')}*${C('g_fdn', M)}`, `=D${inf.n('kit')}*${C('g_fdn', V)}`]);
inf.row('p_gov', 'Government subsidy (MIDH)', [`=C${inf.n('kit')}*${C('g_gov', M)}`, `=D${inf.n('kit')}*${C('g_gov', V)}`]);
inf.row('p_own', 'FPO own funds', [`=C${inf.n('kit')}*${C('g_own', M)}`, `=D${inf.n('kit')}*${C('g_own', V)}`]);
inf.row('p_loan', 'AIF bank loan', all(2, c => `=${c}${inf.n('kit')}-${c}${inf.n('p_fdn')}-${c}${inf.n('p_gov')}-${c}${inf.n('p_own')}`));
inf.row('emi', 'Yearly loan repayment', [`=PMT(${C('rate', M)},${C('tenor', M)},-C${inf.n('p_loan')})`, `=PMT(${C('rate', V)},${C('tenor', V)},-D${inf.n('p_loan')})`], { note: 'Annuity at the AIF rate' });
inf.sub('Programme totals');
inf.row('t_fdn', 'Foundation grant, all 12 FPOs', [`=C${inf.n('p_fdn')}*${X(cd, 'n_fpo', 'C')}+D${inf.n('p_fdn')}*${X(cd, 'n_fpo', 'D')}`], { total: true });
inf.row('t_kit', 'Total asset value, all 12 FPOs', [`=C${inf.n('kit')}*${X(cd, 'n_fpo', 'C')}+D${inf.n('kit')}*${X(cd, 'n_fpo', 'D')}`]);
inf.row('lev', 'Asset value per rupee of Foundation grant', [`=C${inf.n('t_kit')}/C${inf.n('t_fdn')}`], { fmt: 'x' });

// ---------------- Working capital ----------------
wc.title('Working capital in Year 5 (Rs lakh)');
wc.header(['Rs lakh', 'Unit', 'Maize FPO', 'Veg FPO', 'All 12', 'Basis']);
const tot = k => `=C${wc.n(k)}*${X(cd, 'n_fpo', 'C')}+D${wc.n(k)}*${X(cd, 'n_fpo', 'D')}`;
wc.row('w_prod', 'Peak cash tied up in produce buying', [`=${X(ue, 's_prod', 'D')}*${C('wc_pct', M)}`, `=${X(ue, 's_prod', 'F')}*${C('wc_pct', V)}`, c => tot('w_prod')], { note: 'Stored maize is financed separately by e-NWR pledge loans [S7]' });
wc.row('w_cred', 'Input credit to members', [`=${X(ue, 's_inp', 'D')}*${C('credit_pct', M)}`, `=${X(ue, 's_inp', 'F')}*${C('credit_pct', V)}`, c => tot('w_cred')]);
wc.row('w_need', 'Peak need', all(3, c => `=${c}${wc.n('w_prod')}+${c}${wc.n('w_cred')}`), { total: true });
wc.row('w_share', 'Members\' share capital', [`=${X(ue, 'members', 'D')}*${X(cd, 'share_rs', 'C')}/100000`, `=${X(ue, 'members', 'F')}*${X(cd, 'share_rs', 'D')}/100000`, c => tot('w_share')]);
wc.row('w_match', 'Govt matching equity grant (claim it)', [`=MIN(${X(ue, 'members', 'D')}*${C('match', M)}/100000,${C('match_cap', M)})`, `=MIN(${X(ue, 'members', 'F')}*${C('match', V)}/100000,${C('match_cap', V)})`, c => tot('w_match')], { note: '[S2] Free money most FPOs leave unclaimed; needs clean share register' });
wc.row('w_capex', 'Less own share of asset kit', [`=-${X(inf, 'p_own', 'C')}`, `=-${X(inf, 'p_own', 'D')}`, c => tot('w_capex')]);
wc.row('w_own', 'Own funds for working capital', all(3, c => `=SUM(${c}${wc.n('w_share')}:${c}${wc.n('w_capex')})`), { total: true });
wc.row('w_gap', 'Gap to finance', all(3, c => `=MAX(0,${c}${wc.n('w_need')}-${c}${wc.n('w_own')})`), { total: true });
wc.row('w_fund', 'From federation revolving fund', all(3, c => `=${c}${wc.n('w_gap')}*${C('fund_share', M)}`), { key: true });
wc.row('w_bank', 'From banks / NBFCs', all(3, c => `=${c}${wc.n('w_gap')}-${c}${wc.n('w_fund')}`));
wc.row('today_gap', 'For comparison: gap today, all 12', [null, null, `=${X(cd, 'wc_gap', 'C')}*${X(cd, 'n_fpo', 'C')}+${X(cd, 'wc_gap', 'D')}*${X(cd, 'n_fpo', 'D')}`]);

// ---------------- Federation ----------------
fed.title('Kosi FPO federation in Year 5: running cost and income once grants end (Rs lakh a year)');
fed.header(['Rs lakh a year', 'Unit', 'Value', 'Basis']);
fed.row('f_n', 'Member FPOs (cohort 1 + cohort 2)', [36], { fmt: 'num0' });
fed.row('f_c2', 'Cohort 2 business as a share of cohort 1 in Year 5', [1.2], { fmt: 'pct', note: '24 FPOs at 60% of a cohort 1 FPO each (they join later: 6 in Y1, 18 in Y3)' });
fed.row('f_ceo', 'Federation CEO', [9]);
fed.row('f_mkt', 'Market desk (2 sales managers)', [12]);
fed.row('f_fin', 'Accounts and compliance (CA on retainer + 2 accountants)', [9]);
fed.row('f_off', 'Office, software, travel, audit', [5]);
fed.row('f_var', 'Extra servicing cost per FPO beyond 12', [`=0.4*(C${fed.n('f_n')}-12)`], { note: 'Rs 0.4 lakh per extra FPO' });
fed.row('f_cost', 'Running cost', [`=SUM(C${fed.n('f_ceo')}:C${fed.n('f_var')})`], { total: true });
fed.row('f_fees', 'Fees from member FPOs', [`=${C('fedfee', M)}*C${fed.n('f_n')}`], { note: 'Rs 1.2 lakh per FPO, already inside each FPO\'s running cost' });
fed.row('f_share', 'Share of maize sold through federation contracts', [0.7], { fmt: 'pct' });
fed.row('f_comm', 'Federation commission on that maize', [0.01], { fmt: 'pct', note: 'Earned from better price on 1,000 t+ lots' });
fed.row('f_trade', 'Maize commission income', [`=${X(ue, 's_prod', 'D')}*${X(cd, 'n_fpo', 'C')}*(1+C${fed.n('f_c2')})*C${fed.n('f_share')}*C${fed.n('f_comm')}`]);
fed.row('f_inpm', 'Bulk input buying margin', [0.015], { fmt: 'pct', note: 'Federation buys seed and fertiliser in bulk for all FPOs' });
fed.row('f_inp', 'Input buying income', [`=(${X(ue, 's_inp', 'D')}*${X(cd, 'n_fpo', 'C')}+${X(ue, 's_inp', 'F')}*${X(cd, 'n_fpo', 'D')})*(1+C${fed.n('f_c2')})*C${fed.n('f_inpm')}`]);
fed.row('f_lent', 'Average amount lent out by the revolving fund', [`=${X(wc, 'w_fund', 'E')}*(1+C${fed.n('f_c2')})`], { note: 'Fund share of the working capital gap of both cohorts' });
fed.row('f_corpus', 'Revolving fund capital (incl. flood window)', [() => `=${X(bud, 'b_fund', 'H')}+${X(bud, 'b_cont', 'H')}`], { note: 'From Budget sheet' });
fed.row('f_util', 'Share of fund lent out on average', [`=C${fed.n('f_lent')}/C${fed.n('f_corpus')}`], { fmt: 'pct', note: 'Below 100% on purpose: the flood window is kept liquid' });
fed.row('f_rate', 'Lending rate to FPOs', [0.1], { fmt: 'pct', note: '[S4] Below the 14% to 15% NBFC rate for FPO loans' });
fed.row('f_loss', 'Loan loss and running cost of the fund', [0.04], { fmt: 'pct', note: 'Prudent: 3% loss + 1% admin' });
fed.row('f_spread', 'Net interest income', [`=C${fed.n('f_lent')}*(C${fed.n('f_rate')}-C${fed.n('f_loss')})`]);
fed.row('f_inc', 'Income', [`=C${fed.n('f_fees')}+C${fed.n('f_trade')}+C${fed.n('f_inp')}+C${fed.n('f_spread')}`], { total: true });
fed.row('f_cover', 'Share of running cost covered', [`=C${fed.n('f_inc')}/C${fed.n('f_cost')}`], { fmt: 'pct', key: true });

// ---------------- Budget ----------------
bud.title('Indicative budget: US$1 million a year (Rs lakh)');
bud.header(['Rs lakh', '', 'Y1 26-27', 'Y2 27-28', 'Y3 28-29', 'Y4 29-30', 'Y5 30-31', '5-yr total', 'What it pays for and why it changes']);
const B = (key, label, vals, note, o = {}) => bud.row(key, label, [...vals, c => `=SUM(C${bud.n(key)}:G${bud.n(key)})`], { note, ...o });
bud.sub('Intervention 1: Sell together (market access)');
B('b_mkt', 'Market desk, buyer onboarding, quality testing, certification', [120, 120, 100, 70, 40], 'Desk moves onto the federation payroll from Year 4, paid by its commission');
B('b_didi', 'Women procurement agents (2 per FPO) start-up stipend', [12, 12, 8, 4, 0], 'Paid by FPO commission from Year 3; 24 women earn on volume');
bud.sub('Intervention 2: Fund the season (finance)');
B('b_fund', 'Revolving fund capital (owned by the federation)', [100, 50, 50, 0, 0], 'Sized to the gap left after the govt matching equity grant; lent and repaid, never spent');
B('b_fldg', 'First-loss deposit with partner bank', [50, 0, 0, 0, 0], 'Unlocks bank lines; returns to the federation if unused');
B('b_cont', 'Flood contingency window in the fund', [0, 50, 0, 0, 0], 'Emergency loans after a flood; kept liquid');
bud.sub('Intervention 3: Store and grade (infrastructure)');
B('b_infra', 'Asset kits co-funded with AIF and MIDH', [`=${X(inf, 't_fdn', 'C')}*0.6`, `=${X(inf, 't_fdn', 'C')}*0.4`, 0, 0, 0], 'From Infra sheet: 60% in Year 1, 40% in Year 2');
bud.sub('Cross-cutting: run it professionally, include women, plan for floods');
B('b_mgmt', 'CEO and assistant salary support (tapering)', [`=12*5.4*0.8`, `=12*5.4*0.6`, `=12*5.4*0.4`, `=12*5.4*0.2`, 0], '80%, 60%, 40%, 20%, 0% of salary; FPO margin takes over');
B('b_sys', 'Accounting software, compliance clean-up, board training', [30, 25, 15, 10, 5], 'Front-loaded: one-time clean-up of share registers and filings');
B('b_women', 'Women membership drive, leadership fellowship, creche at centres', [50, 50, 45, 40, 30], '150 new women members per FPO via SHGs; fellows stand for board seats');
B('b_clim', 'Climate: flood alerts, resilient seed trials, BRFSY claims help', [40, 40, 35, 30, 25], 'Bihar left PMFBY; farmers must be helped to claim state aid [S17]');
bud.sub('KAP support, federation and learning');
B('b_kap', 'KAP field team (business, finance, gender, climate leads)', [150, 160, 130, 90, 50], 'Peaks while KAP still has the govt CBBO fee, then shrinks as the federation takes over');
B('b_fed', 'Federation set-up and staff (tapering)', [25, 40, 35, 20, 0], 'Foundation pays most of the running cost in Years 2 and 3; federation pays itself by Year 5');
B('b_eval', 'Independent evaluation and audit', [20, 15, 25, 15, 25], 'Baseline, mid-term at the Year 2 checkpoint, endline');
bud.sub('Second cohort: 6 Kosi FPOs already without govt support from Year 1; 18 more from Year 3 only if the Year 2 checkpoint is met');
B('b_coh2', 'Playbook, kits, salary taper, fund access for cohort 2', ['C', 'D', 'E', 'F', 'G'].map(c => `=950-SUM(${c}${bud.n('b_mkt')}:${c}${bud.n('b_eval')})`),
  'What is left after cohort 1 is fully funded; see cost per FPO-year below');
bud.row('b_tot', 'Total', ['C', 'D', 'E', 'F', 'G', 'H'].map(c => `=SUM(${c}${bud.n('b_mkt')}:${c}${bud.n('b_coh2')})`), { total: true, key: true });
bud.row('b_usd', 'Total in USD m', ['C', 'D', 'E', 'F', 'G', 'H'].map(c => `=${c}${bud.n('b_tot')}*100000/${C('fx', M)}/1000000`), { fmt: 'num2' });
bud.blank();
bud.sub('Shares of the 5-year total');
const share = (key, label, rows) => bud.row(key, label, [null, null, null, null, null, `=(${rows.map(r => `H${bud.n(r)}`).join('+')})/H${bud.n('b_tot')}`], { fmt: 'pct' });
share('sh_mkt', 'Sell together', ['b_mkt', 'b_didi']);
share('sh_fin', 'Fund the season (capital that stays)', ['b_fund', 'b_fldg', 'b_cont']);
share('sh_inf', 'Store and grade', ['b_infra']);
share('sh_cap', 'People, women, climate', ['b_mgmt', 'b_sys', 'b_women', 'b_clim']);
share('sh_kap', 'KAP, federation, evaluation', ['b_kap', 'b_fed', 'b_eval']);
share('sh_coh', 'Second cohort', ['b_coh2']);
bud.blank();
bud.sub('Value for money');
bud.row('c1_cost', 'Cohort 1 cost per FPO per year', [null, null, null, null, null, `=(H${bud.n('b_tot')}-H${bud.n('b_coh2')})/12/5`], { note: 'Includes capital that stays (fund, assets)' });
bud.row('c2_fy', 'Cohort 2 FPO-years supported', [null, null, null, null, null, `=6*5+18*3`], { fmt: 'num0' });
bud.row('c2_cost', 'Cohort 2 cost per FPO per year', [null, null, null, null, null, `=H${bud.n('b_coh2')}/H${bud.n('c2_fy')}`], { note: 'About 75% of cohort 1: desk, fund and federation already exist. Govt pays a CBBO Rs 5 lakh per FPO a year [S2]' });
bud.row('farmers', 'Farmer members reached in Year 5 (both cohorts)', [null, null, null, null, null, `=${X(fed, 'f_n', 'C')}*${X(ue, 'members', 'D')}`], { fmt: 'num0' });
bud.row('per_farmer', 'Cost per farmer member over 5 years', [null, null, null, null, null, `=H${bud.n('b_tot')}*100000/H${bud.n('farmers')}`], { unit: 'Rs', fmt: 'num0' });

// ---------------- Targets and evidence ----------------
tgt.title('Targets at end of Year 5 versus what similar programmes achieved');
tgt.header(['Measure', 'Unit', 'Today', 'Year 5 target', 'Benchmark', 'Benchmark source']);
tgt.row('t_sell', 'Members selling through FPO (maize / veg avg)', [0.15, `=(${C('active', M)}*7+${C('active', V)}*5)/12`, 0.39], { fmt: 'pct', note: '[S9] SRIJAN: 39% after 2 years. Today: our estimate (case: weak engagement)' });
tgt.row('t_to', 'Average turnover per FPO', [`=${X(cd, 'to_mid', 'C')}`, `=(${X(ue, 'turnover', 'D')}*7+${X(ue, 'turnover', 'F')}*5)/12`, 100], { unit: 'Rs lakh', note: '[S3] 1,135 of 8,961 scheme FPOs (12.7%) crossed Rs 1 crore in FY25' });
tgt.row('t_cov', 'FPOs covering 100% of running cost', [0, 6, 4], { fmt: 'num0', note: '[S1] About one third of FPOs viable (ICAR-NIAP), i.e. 4 of 12. Target 6 of 12, and all 12 above 85%' });
tgt.row('t_women', 'Women share of members', [`=${X(cd, 'women_pct', 'C')}`, `=${X(ue, 'women_pct', 'D')}`, null], { fmt: 'pct' });
tgt.row('t_wdir', 'Women directors per board', [1, 3, null], { fmt: 'num0', note: '[S10] FPOs with female or mixed leadership survive past support 4 to 13 points more often' });
tgt.row('t_bank', 'FPOs with a bank or NBFC credit line', [0, 12, 0.3], { fmt: 'num0', note: '[S4] Only 30% of FPOs got bank loans; those with credit: 61% profitable without support vs 43%' });
tgt.row('t_fed', 'Federation covers its own running cost', [0, 1, null], { fmt: 'num0', note: '1 = yes' });

// ---------------- Checks ----------------
chk.title('Integrity checks (all should read OK)');
check(chk, 'c1', 'Budget each year equals Rs 950 lakh (USD 1m at Rs 95)', `=${['C', 'D', 'E', 'F', 'G'].map(c => `ABS(${X(bud, 'b_tot', c)}-950)`).join('+')}`);
check(chk, 'c2', 'Budget shares add to 100%', `=${X(bud, 'sh_mkt', 'H')}+${X(bud, 'sh_fin', 'H')}+${X(bud, 'sh_inf', 'H')}+${X(bud, 'sh_cap', 'H')}+${X(bud, 'sh_kap', 'H')}+${X(bud, 'sh_coh', 'H')}-1`);
check(chk, 'c3', 'Infra funding stack adds to kit cost', `=ABS(${X(inf, 'p_fdn', 'C')}+${X(inf, 'p_gov', 'C')}+${X(inf, 'p_own', 'C')}+${X(inf, 'p_loan', 'C')}-${X(inf, 'kit', 'C')})+ABS(${X(inf, 'p_fdn', 'D')}+${X(inf, 'p_gov', 'D')}+${X(inf, 'p_own', 'D')}+${X(inf, 'p_loan', 'D')}-${X(inf, 'kit', 'D')})`);
check(chk, 'c4', 'Infra in budget equals Infra sheet', `=${X(bud, 'b_infra', 'H')}-${X(inf, 't_fdn', 'C')}`);
check(chk, 'c5', 'Case: share capital equals working capital available', `=${X(cd, 'share_cap', 'C')}-${X(cd, 'wc_have', 'C')}`);
check(chk, 'c6', 'Working capital sources add to gap', `=${X(wc, 'w_fund', 'E')}+${X(wc, 'w_bank', 'E')}-${X(wc, 'w_gap', 'E')}`);
check(chk, 'c7', 'Fund capital covers what is lent out (0 if yes)', `=MAX(0,${X(fed, 'f_lent', 'C')}-${X(fed, 'f_corpus', 'C')})`);
check(chk, 'c8', 'Federation covers its running cost (0 if yes)', `=MAX(0,1-${X(fed, 'f_cover', 'C')})`);

book.render({ xlsx: path.join(__dirname, 'KAP_FPO_Model.xlsx'), json: path.join(__dirname, '..', 'deck', 'model_data.json') })
  .then(({ errors }) => { if (errors) process.exit(1); });
