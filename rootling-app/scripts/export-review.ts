// Writes content/review.csv: every word and line, for native-speaker review and recording.
// Run with `npm run content:export` after changing src/data/courses.ts.
import { writeFileSync } from 'node:fs';
import { COURSES } from '../src/data/courses';
import { reviewCsv } from '../src/lib/clips';

const out = new URL('../content/review.csv', import.meta.url).pathname;
// The byte-order mark makes Excel open the Indian scripts correctly; Google Sheets ignores it.
writeFileSync(out, '\uFEFF' + reviewCsv(COURSES));
console.log(`Wrote ${out}`);
