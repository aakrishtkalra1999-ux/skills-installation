// Creates a new case folder next to the kit, ready to work in.
// Usage: node case-comp-kit/tools/new-case.js <folder-name> [path to case PDF]
// Result: <claude code>/<folder-name>/{case,model,deck,final} with starter model and deck, DECISIONS.md, and the case text extracted.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const [, , name, pdf] = process.argv;
if (!name) { console.error('Usage: node tools/new-case.js <folder-name> [case.pdf]'); process.exit(1); }
const kit = path.resolve(__dirname, '..');
const root = path.join(path.dirname(kit), name);
if (fs.existsSync(root)) { console.error(`${root} already exists`); process.exit(1); }
for (const d of ['case', 'model', 'deck', 'final']) fs.mkdirSync(path.join(root, d), { recursive: true });
fs.copyFileSync(path.join(kit, 'templates', 'model.template.js'), path.join(root, 'model', 'build.js'));
fs.copyFileSync(path.join(kit, 'templates', 'deck.template.js'), path.join(root, 'deck', 'build_deck.js'));
fs.writeFileSync(path.join(root, 'DECISIONS.md'), `# ${name}: decisions log\n\nRules (slide limit, anonymity, file name, deadline, judging weights):\n\n- \n\nDecisions and user answers, newest last:\n\n1. \n`);
if (pdf) {
  const dest = path.join(root, 'case', path.basename(pdf));
  fs.copyFileSync(pdf, dest);
  const exe = ['C:\\Program Files\\Git\\mingw64\\bin\\pdftotext.exe', '/usr/bin/pdftotext'].find(p => fs.existsSync(p));
  if (!exe) console.warn('pdftotext not found: case text not extracted');
  if (exe) {
    execFileSync(exe, ['-raw', '-enc', 'UTF-8', dest, path.join(root, 'case', 'case-text-clean.txt')]);
    execFileSync(exe, ['-layout', '-enc', 'UTF-8', dest, path.join(root, 'case', 'case-text-layout.txt')]);
  }
}
console.log(`Created ${root}`);
