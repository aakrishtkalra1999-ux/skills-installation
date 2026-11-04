/**
 * Rooty, the little sprout from the Rootling landing page. A new leaf grows for
 * every word the child learns (drawn up to 16; the count shows the rest).
 */
export function Rooty({ leaves = 2, size = 120, mood = 'happy' }: { leaves?: number; size?: number; mood?: 'happy' | 'cheer' | 'think' }) {
  const shown = Math.min(Math.max(leaves, 0), 16);
  const stemTop = 70 - Math.min(shown, 16) * 2.6;
  const leafNodes = Array.from({ length: shown }, (_, i) => {
    const y = 68 - i * 2.6 - 4;
    const left = i % 2 === 0;
    const len = 9 + (i % 3);
    return (
      <ellipse
        key={i}
        cx={left ? 50 - len / 1.4 : 50 + len / 1.4}
        cy={y}
        rx={len / 1.6}
        ry={3.6}
        fill={i % 3 === 0 ? 'var(--leaf-light)' : 'var(--leaf)'}
        transform={`rotate(${left ? -28 : 28} ${left ? 50 - len / 1.4 : 50 + len / 1.4} ${y})`}
      />
    );
  });
  const mouth =
    mood === 'cheer' ? (
      <path d="M43 93 Q50 101 57 93 Z" fill="#5c1d10" />
    ) : mood === 'think' ? (
      <path d="M45 95 L55 95" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
    ) : (
      <path d="M44 93 Q50 98 56 93" stroke="var(--ink)" strokeWidth="2" fill="none" strokeLinecap="round" />
    );
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 100 115" role="img" aria-label={`Rooty with ${leaves} leaves`}>
      <path d={`M50 76 C 49 ${(76 + stemTop) / 2}, 51 ${(76 + stemTop) / 2}, 50 ${stemTop}`} stroke="var(--stem)" strokeWidth="3" fill="none" strokeLinecap="round" />
      {leafNodes}
      <ellipse cx="41" cy={stemTop - 3} rx="9" ry="5" fill="var(--leaf)" transform={`rotate(-30 41 ${stemTop - 3})`} />
      <ellipse cx="59" cy={stemTop - 3} rx="9" ry="5" fill="var(--leaf-light)" transform={`rotate(30 59 ${stemTop - 3})`} />
      <path d="M26 76 H74 L68 110 Q67 113 64 113 H36 Q33 113 32 110 Z" fill="var(--pot)" />
      <rect x="22" y="72" width="56" height="10" rx="4" fill="var(--pot-rim)" />
      <circle cx="42" cy="89" r="3" fill="var(--ink)" />
      <circle cx="58" cy="89" r="3" fill="var(--ink)" />
      <circle cx="43" cy="88" r="1" fill="#fff" />
      <circle cx="59" cy="88" r="1" fill="#fff" />
      <circle cx="36" cy="95" r="3" fill="var(--blush)" opacity="0.7" />
      <circle cx="64" cy="95" r="3" fill="var(--blush)" opacity="0.7" />
      {mouth}
    </svg>
  );
}
