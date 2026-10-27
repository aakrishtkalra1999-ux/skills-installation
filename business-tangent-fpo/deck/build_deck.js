// Starter deck for a new case. Copy into <case folder>/deck/build_deck.js and replace the example slides.
// Run: node build_deck.js --png --pdf   (PNG previews in deck/preview, PDF one folder up)
const path = require('path');
const K = require('../../case-comp-kit/lib/deck-kit');
const g = K.loadData(path.join(__dirname, 'model_data.json'));
const { n0, p1, s0 } = K.F;

const TEAM_NAME = process.env.TEAM_NAME || 'TeamName';
K.setChrome({ sections: ['Answer', 'Diagnosis', 'Choices', 'Impact', 'Roadmap'], header: 'Company name | Competition name' });

const rev25 = g('Outputs', 'rev', 'C'), rev26 = g('Outputs', 'rev', 'D');

const s1 = K.slide({
  n: 1, section: 'Answer',
  title: `Our answer in one sentence: revenue grows from ${n0(rev25)} to ${n0(rev26)} next year`,
  source: 'All figures USD million. Sources: case exhibits and our model.',
  body: `
  <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 26px;">
    <div class="panel"><h3>The problem</h3><ul><li>Plain sentence one.</li><li>Plain sentence two.</li></ul></div>
    <div class="panel"><h3>How we get there</h3>
      ${K.waterfall({ w: 540, h: 220, max: Math.ceil(rev26 * 1.1), fmt: n0, items: [
    { label: '2025', v: rev25, kind: 'total' },
    { label: 'Growth', v: rev26 - rev25 },
    { label: '2026', v: rev26, kind: 'total' },
  ] })}
      <div class="callout">Growth adds ${s0(rev26 - rev25)} (${p1(rev26 / rev25 - 1)}).</div>
    </div>
  </div>`,
});

K.writeDeck({
  slides: [s1],
  outHtml: path.join(__dirname, 'deck.html'),
  outPdf: path.join(__dirname, '..', `${TEAM_NAME}_Competition.pdf`),
  title: 'Company name, Competition name',
  pdf: process.argv.includes('--pdf'),
  png: process.argv.includes('--png'),
});
