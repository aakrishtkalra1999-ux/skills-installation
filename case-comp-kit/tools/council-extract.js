// Pulls the final text of each LLM-council sub-agent out of a session export into one Markdown record.
// Usage: node council-extract.js <unzipped export folder> <out.md>
const fs = require('fs');
const [, , dir, out] = process.argv;
const names = {
  a4d536a3dd39eaa38: 'Advisor: The Contrarian', af6cd5bd04923138e: 'Advisor: The First Principles Thinker',
  afe91fcd8bd0c97f3: 'Advisor: The Expansionist', ae57daa83a23aa766: 'Advisor: The Outsider', a079141c796de7eb2: 'Advisor: The Executor',
  a38650c81302f6f4d: 'Peer review 1 (generalist)', a70b92df277e04b96: 'Peer review 2 (sceptical judge)',
  a78de5af1eadf8de6: 'Peer review 3 (restructuring practitioner)', a0ec0250ee29de73f: 'Peer review 4 (operations and digital practitioner)',
  a6529adc9a23e77a5: 'Peer review 5 (past case-competition winner)', a83e66473b16b801b: 'Chairman verdict',
};
const md = ['# LLM council record: Armageddon 2026 recommendation stress test', '',
  'Run on 30 Sep 2026 against the "Fix, Focus, Fund" plan (model v1: run-rate EBITDA 76 at 100% realisation). Peer reviewers saw the advisor answers anonymised as A to E (A Executor, B Expansionist, C Contrarian, D Outsider, E First Principles). The changes it led to are in DECISIONS.md.', ''];
for (const [id, title] of Object.entries(names)) {
  const file = `${dir}/agent-${id}.jsonl`;
  let last = '';
  if (fs.existsSync(file)) {
    for (const l of fs.readFileSync(file, 'utf8').split('\n').filter(Boolean)) {
      try {
        const m = JSON.parse(l).message;
        if (!m || m.role !== 'assistant' || !Array.isArray(m.content)) continue;
        for (const b of m.content) {
          if (b.type === 'text' && b.text.trim()) last = b.text;
          if (b.type === 'tool_use' && b.input) {
            const t = Object.values(b.input).find(v => typeof v === 'string' && v.length > 200);
            if (t) last = t;
          }
        }
      } catch { /* skip bad line */ }
    }
  }
  md.push('---', '', `## ${title}`, '', last.trim() || '(no text found)', '');
}
fs.writeFileSync(out, md.join('\n'));
console.log('Wrote', out);
