// Turns a Claude Code session export (transcript.jsonl) into a readable Markdown conversation:
// every user message and every assistant reply, in order, without tool calls or tool output.
// Usage: node transcript-to-md.js <transcript.jsonl> <out.md>
const fs = require('fs');
const [, , inFile, outFile] = process.argv;
const lines = fs.readFileSync(inFile, 'utf8').split('\n').filter(Boolean);
const out = ['# Conversation transcript (readable)', ''];
const textOf = content => {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content.filter(b => b.type === 'text').map(b => b.text).join('\n');
};
let turn = 0;
for (const line of lines) {
  let e; try { e = JSON.parse(line); } catch { continue; }
  const msg = e.message; if (!msg || !msg.role) continue;
  let text = textOf(msg.content).trim();
  if (!text) continue;
  if (msg.role === 'user') {
    if (/^<(system-reminder|local-command|command-)/.test(text) || text.startsWith('Base directory for this skill')) continue;
    text = text.replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, '').trim();
    if (!text) continue;
    turn++;
    out.push(`---`, ``, `## ${turn}. User`, ``, text, ``);
  } else if (msg.role === 'assistant') {
    out.push(`**Claude:**`, ``, text, ``);
  }
}
fs.writeFileSync(outFile, out.join('\n'));
console.log(`Wrote ${outFile}: ${turn} user turns`);
