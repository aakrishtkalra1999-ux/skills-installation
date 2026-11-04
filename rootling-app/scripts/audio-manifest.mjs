// Lists the recordings in public/audio/<language>/<id>.mp3 so the app knows,
// without a network request, which lines have a native-speaker recording.
// Runs automatically before `npm run dev`, `npm run build` and `npm test`.
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../public/audio/', import.meta.url).pathname;
const files = [];
for (const lang of readdirSync(root).sort()) {
  const dir = join(root, lang);
  if (!statSync(dir).isDirectory()) continue;
  for (const f of readdirSync(dir).sort()) if (f.endsWith('.mp3')) files.push(`${lang}/${f.slice(0, -4)}`);
}
const out = new URL('../src/data/audio-manifest.json', import.meta.url).pathname;
writeFileSync(out, JSON.stringify({ files }, null, 2) + '\n');
console.log(`audio-manifest: ${files.length} recording${files.length === 1 ? '' : 's'}`);
