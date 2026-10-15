// Search the reference casebooks (and any other PDFs' text in reference/casebooks) and get book + page hits.
// Usage: node tools/search-casebooks.js "market entry" [more words...] [--book IIMA] [--context 1] [--max 40]
// All words must appear on the same page (case-insensitive). Prints matching lines with their page numbers.
// Build the page map once: node tools/search-casebooks.js --pagemap   (writes <book>-pages.md beside each text)
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'reference', 'casebooks');
const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); if (i < 0) return def; const v = args[i + 1]; args.splice(i, 2); return v; };
const bookFilter = opt('--book', '');
const context = Number(opt('--context', 0));
const max = Number(opt('--max', 40));
const pagemap = args.includes('--pagemap');
const terms = args.filter(a => !a.startsWith('--')).map(t => t.toLowerCase());

const books = fs.readdirSync(dir).filter(f => f.endsWith('.txt') && f.toUpperCase().includes(bookFilter.toUpperCase()));
const clean = s => s.replace(/[ \t]{2,}/g, '  ').trim();

for (const f of books) {
  const name = f.replace(/\.txt$/, '');
  const pages = fs.readFileSync(path.join(dir, f), 'utf8').split('\f');
  if (pagemap) {
    // first three meaningful lines of each page, skipping footers and bare numbers
    const out = [`# ${name}: page map`, '', 'PDF page, then the first lines on that page. Search this file to find cases, frameworks and industry primers fast.', ''];
    pages.forEach((p, i) => {
      const lines = p.split('\n').map(clean).filter(l => l.length > 3 && !/^\d+$/.test(l) && !/©|Click here|Main Contents|All rights reserved/i.test(l));
      if (lines.length) out.push(`- p${i + 1}: ${lines.slice(0, 3).join(' | ').slice(0, 220)}`);
    });
    fs.writeFileSync(path.join(dir, `${name}-pages.md`), out.join('\n'));
    console.log(`Wrote ${name}-pages.md (${pages.length} pages)`);
    continue;
  }
  if (!terms.length) { console.log('Give search words, or --pagemap'); process.exit(1); }
  let hits = 0;
  pages.forEach((p, i) => {
    const low = p.toLowerCase();
    if (!terms.every(t => low.includes(t)) || hits >= max) return;
    hits++;
    const lines = p.split('\n');
    const shown = new Set();
    lines.forEach((l, j) => { if (terms.some(t => l.toLowerCase().includes(t))) for (let k = j - context; k <= j + context; k++) if (lines[k] !== undefined) shown.add(k); });
    console.log(`\n[${name} p${i + 1}]`);
    [...shown].sort((a, b) => a - b).slice(0, 8).forEach(k => console.log('  ' + clean(lines[k]).slice(0, 200)));
  });
  if (hits) console.log(`\n${name}: ${hits} page(s)${hits >= max ? ' (limit reached, use --max)' : ''}`);
}
