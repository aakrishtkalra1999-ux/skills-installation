/** "Mor", the app's peacock mascot (mor means peacock in Hindi and Punjabi). Original artwork. */
export function Mascot({ size = 96, mood = 'happy' }: { size?: number; mood?: 'happy' | 'sad' | 'cheer' }) {
  const mouth =
    mood === 'sad' ? 'M44 66 Q50 61 56 66' : mood === 'cheer' ? 'M42 62 Q50 72 58 62 Z' : 'M44 63 Q50 68 56 63';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="Mor the peacock">
      {[-38, -19, 0, 19, 38].map((deg) => (
        <g key={deg} transform={`rotate(${deg} 50 58)`}>
          <ellipse cx="50" cy="22" rx="9" ry="18" fill="var(--feather)" />
          <circle cx="50" cy="14" r="5" fill="var(--saffron)" />
          <circle cx="50" cy="14" r="2.4" fill="var(--indigo)" />
        </g>
      ))}
      <ellipse cx="50" cy="62" rx="22" ry="25" fill="var(--indigo)" />
      <ellipse cx="50" cy="68" rx="13" ry="15" fill="var(--teal-light)" />
      <circle cx="42" cy="52" r="6" fill="#fff" />
      <circle cx="58" cy="52" r="6" fill="#fff" />
      <circle cx="43" cy="53" r="3" fill="#1b1b2f" />
      <circle cx="57" cy="53" r="3" fill="#1b1b2f" />
      <path d="M47 57 L50 61 L53 57 Z" fill="var(--saffron)" />
      <path d={mouth} stroke="#1b1b2f" strokeWidth="1.8" fill={mood === 'cheer' ? '#e85d75' : 'none'} />
      <path d="M50 37 L46 28 M50 37 L50 27 M50 37 L54 28" stroke="var(--indigo)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
