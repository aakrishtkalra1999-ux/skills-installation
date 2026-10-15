// Model kit: build a formula-driven Excel model in plain JavaScript.
// Every formula is calculated with HyperFormula, so the .xlsx opens with values already in it,
// formula errors are caught before you ship, and every number can be exported to JSON for the deck.
//
// Usage (see templates/model.template.js):
//   const { createBook, X, R, all, P } = require('../lib/model-kit');
//   const book = createBook();
//   const inp = book.sheet('Inputs', { noteCol: 'G', widths: { A: 40, C: 11, D: 11, G: 60 } });
//   inp.row('rev', 'Revenue', [1150, 1205], { note: 'Exhibit 1' });
//   inp.row('gm', 'Gross margin', all(2, c => `=${c}${inp.n('gp')}/${c}${inp.n('rev')}`), { fmt: 'pct' });
//   book.render({ xlsx: 'Model.xlsx', json: 'deck/model_data.json' });
//
// Conventions: blue = hard-coded input, black = formula, green = straight link to another sheet,
// yellow fill = key driver or headline output. Values start in column C unless { start } says otherwise.
const ExcelJS = require('exceljs');
const { HyperFormula } = require('hyperformula');
const fs = require('fs');
const path = require('path');

const L = i => String.fromCharCode(65 + i);          // 0 -> A
const idx = c => c.charCodeAt(0) - 65;               // A -> 0
const P = c => String.fromCharCode(c.charCodeAt(0) - 1); // previous column letter
const all = (n, fn) => Array.from({ length: n }, () => fn); // same formula across n columns

class Sheet {
  constructor(name, o = {}) {
    this.name = name; this.items = []; this.keys = {};
    this.noteCol = o.noteCol || 'H'; this.widths = o.widths || {};
  }
  add(it) { this.items.push(it); it.n = this.items.length; return it; }
  title(t) { this.add({ kind: 'title', t }); }
  sub(t) { this.add({ kind: 'sub', t }); }
  note(t) { this.add({ kind: 'note', t }); }
  blank() { this.add({ kind: 'blank' }); }
  header(cells) { this.add({ kind: 'header', cells }); }
  // vals: array of numbers, strings, formulas ('=...'), functions (col letter => formula) or { v, fmt }
  // o: { unit, fmt, fmtList, note, total, key, italic, start, legend }
  row(key, label, vals, o = {}) {
    const it = this.add({ kind: 'row', key, label, vals, o });
    if (key) { if (this.keys[key]) throw new Error(`${this.name}: duplicate key ${key}`); this.keys[key] = it; }
    return it;
  }
  n(key) { const it = this.keys[key]; if (!it) throw new Error(`${this.name}: missing key ${key}`); return it.n; }
}
const X = (s, k, c) => `${s.name}!$${c}$${s.n(k)}`; // absolute cross-sheet reference
const R = (s, k, c) => `${c}${s.n(k)}`;              // same-sheet reference
// Tip: a formula that points at a row defined LATER must be written as a function (c => `=...`),
// because row numbers only exist once the row has been added.

const FMT = {
  num: '#,##0.0;(#,##0.0);"-"', num0: '#,##0;(#,##0);"-"', num2: '#,##0.00;(#,##0.00);"-"',
  pct: '0.0%;(0.0%);"-"', x: '0.0"x";(0.0"x");"-"', int: '0', text: '@',
};

function createBook() {
  const sheets = [];
  return {
    sheets,
    sheet(name, o) { const s = new Sheet(name, o); sheets.push(s); return s; },
    // Writes the workbook, returns { errors, value(sheet, key, col) }. Optional json export for the deck.
    async render({ xlsx, json, author = 'Team' }) {
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
        const maxR = Math.max(1, ...cells.map(x => x.r)), maxC = Math.max(0, ...cells.map(x => x.c));
        const g = Array.from({ length: maxR }, () => Array(maxC + 1).fill(null));
        for (const x of cells) {
          let v = x.v;
          if (typeof v === 'string' && !v.startsWith('=') && /^[\d.,-]+$/.test(v)) v = `'${v}`; // keep "2025" headers as text
          g[x.r - 1][x.c] = v;
        }
        grids[s.name] = g; meta[s.name] = cells;
      }

      const hf = HyperFormula.buildFromSheets(grids, { licenseKey: 'gpl-v3' });
      let errors = 0;
      const wb = new ExcelJS.Workbook();
      wb.creator = author; wb.lastModifiedBy = author; // keep the file anonymous
      wb.calcProperties = { fullCalcOnLoad: true };
      const font = (st, isLink, isInput) => {
        const f = { name: 'Arial', size: 10 };
        if (st.title) { f.size = 14; f.bold = true; f.color = { argb: 'FF1F3864' }; }
        if (st.sub) { f.bold = true; f.size = 11; f.color = { argb: 'FFFFFFFF' }; }
        if (st.header) f.bold = true;
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
              errors++; console.error(`FORMULA ERROR ${s.name}!${L(x.c)}${x.r} ${x.v}: ${res.type} ${res.message || ''}`);
              cell.value = { formula: x.v.slice(1) };
            } else cell.value = { formula: x.v.slice(1), result: res };
          } else cell.value = x.v;
          cell.font = font(x.st, isLink, isInput);
          if (x.st.fmt && !x.st.label) cell.numFmt = FMT[x.st.fmt] || FMT.num;
          if (x.st.header) { cell.border = { bottom: { style: 'thin' } }; cell.alignment = { horizontal: x.c >= 2 ? 'right' : 'left', wrapText: true }; }
          if (x.st.total && !x.st.label) cell.border = { top: { style: 'thin' } };
          if ((x.st.key && !x.st.label && !x.st.noteText) || x.st.legend === 'key') cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
          if (x.st.sub) subRows.add(x.r);
        }
        const lastCol = Math.max(1, ...Object.keys(s.widths).map(idx)) + 1;
        for (const r of subRows) for (let c = 1; c <= lastCol; c++) ws.getCell(r, c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3864' } };
      }
      await wb.xlsx.writeFile(xlsx);

      const value = (sh, key, col) => hf.getCellValue({ sheet: hf.getSheetId(sh.name), row: sh.n(key) - 1, col: idx(col) });
      if (json) {
        const dump = {};
        for (const sh of sheets) {
          dump[sh.name] = {};
          for (const key of Object.keys(sh.keys)) {
            const row = {};
            for (let c = 0; c < 26; c++) {
              const v = hf.getCellValue({ sheet: hf.getSheetId(sh.name), row: sh.n(key) - 1, col: c });
              if (v !== null && v !== '' && typeof v !== 'object') row[L(c)] = v;
            }
            dump[sh.name][key] = row;
          }
        }
        fs.mkdirSync(path.dirname(json), { recursive: true });
        fs.writeFileSync(json, JSON.stringify(dump, null, 1));
      }
      console.log(`Wrote ${xlsx}. Formula errors: ${errors}`);
      return { errors, value };
    },
  };
}

// Builds an "integrity check" row: value should be 0, status reads OK or CHECK.
const check = (sheet, key, label, expr) =>
  sheet.row(key, label, [expr, c => `=IF(ABS(C${sheet.n(key)})<0.001,"OK","CHECK")`], { fmtList: ['num2', 'text'] });

module.exports = { createBook, Sheet, X, R, all, P, L, idx, check, FMT };
