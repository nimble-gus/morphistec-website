export function CardVisual({
  index,
  featured,
}: {
  index: number;
  featured: boolean;
}) {
  const accent = "var(--ok-neon)";
  const size = featured ? 280 : 180;
  switch (index) {
    case 0:
      return (
        <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
          <rect
            x="40" y="30" width="120" height="80" rx="8"
            fill="none" stroke={accent} strokeWidth="1" opacity="0.5"
            transform="rotate(-6 100 70)"
          />
          <rect
            x="40" y="50" width="120" height="80" rx="8"
            fill="var(--ok-bg-deep)" stroke={accent} strokeWidth="1.4"
          />
          <rect x="56" y="68" width="40" height="6" rx="2" fill={accent} opacity="0.7" />
          <rect x="56" y="82" width="80" height="4" rx="2" fill="rgba(255,255,255,0.2)" />
          <rect x="56" y="92" width="60" height="4" rx="2" fill="rgba(255,255,255,0.15)" />
          <circle cx="140" cy="118" r="14" fill={accent} />
          <path d="M134 118 l4 4 l8 -8" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 1:
      return (
        <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
          <rect x="20" y="30" width="140" height="100" rx="6" fill="var(--ok-bg-deep)" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
          <circle cx="32" cy="42" r="2.5" fill={accent} />
          <circle cx="42" cy="42" r="2.5" fill="rgba(255,255,255,0.3)" />
          <circle cx="52" cy="42" r="2.5" fill="rgba(255,255,255,0.3)" />
          <rect x="32" y="58" width="50" height="6" rx="2" fill={accent} opacity="0.6" />
          <rect x="32" y="72" width="80" height="4" rx="2" fill="rgba(255,255,255,0.2)" />
          <rect x="32" y="82" width="60" height="4" rx="2" fill="rgba(255,255,255,0.2)" />
          <rect x="100" y="58" width="46" height="46" rx="4" fill="none" stroke={accent} strokeWidth="1" opacity="0.7" />
        </svg>
      );
    case 2:
      return (
        <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
          <line x1="40" y1="50" x2="100" y2="80" stroke={accent} strokeWidth="1" opacity="0.6" />
          <line x1="100" y1="80" x2="160" y2="50" stroke={accent} strokeWidth="1" opacity="0.6" />
          <line x1="100" y1="80" x2="100" y2="130" stroke={accent} strokeWidth="1" opacity="0.6" />
          <rect x="30" y="40" width="20" height="20" rx="4" fill="var(--ok-bg-deep)" stroke={accent} strokeWidth="1.2" />
          <rect x="150" y="40" width="20" height="20" rx="4" fill="var(--ok-bg-deep)" stroke={accent} strokeWidth="1.2" />
          <circle cx="100" cy="80" r="12" fill={accent} />
          <rect x="90" y="120" width="20" height="20" rx="10" fill="var(--ok-bg-deep)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
        </svg>
      );
    case 3:
      return (
        <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
          <rect x="30" y="100" width="14" height="40" fill="rgba(255,255,255,0.2)" />
          <rect x="50" y="80" width="14" height="60" fill="rgba(255,255,255,0.3)" />
          <rect x="70" y="60" width="14" height="80" fill={accent} />
          <rect x="90" y="90" width="14" height="50" fill="rgba(255,255,255,0.2)" />
          <rect x="110" y="70" width="14" height="70" fill="rgba(255,255,255,0.3)" />
          <rect x="130" y="50" width="14" height="90" fill={accent} opacity="0.7" />
          <path d="M30 80 Q70 30 130 60 T170 40" stroke={accent} strokeWidth="1.5" fill="none" />
        </svg>
      );
    case 4:
      return (
        <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
          <rect x="60" y="20" width="80" height="140" rx="14" fill="var(--ok-bg-deep)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <rect x="68" y="32" width="64" height="8" rx="2" fill={accent} opacity="0.8" />
          <rect x="68" y="48" width="50" height="4" rx="1" fill="rgba(255,255,255,0.2)" />
          <rect x="68" y="62" width="64" height="40" rx="4" fill="oklch(0.55 0.2 265 / 0.08)" stroke={accent} strokeWidth="0.6" />
          <rect x="68" y="110" width="30" height="20" rx="3" fill="rgba(255,255,255,0.08)" />
          <rect x="102" y="110" width="30" height="20" rx="3" fill="rgba(255,255,255,0.08)" />
          <circle cx="100" cy="148" r="3" fill="rgba(255,255,255,0.4)" />
        </svg>
      );
    case 5:
      return (
        <svg width={size * 1.2} height={size * 0.7} viewBox="0 0 280 160" fill="none">
          <text x="20" y="60" fontFamily="JetBrains Mono" fontSize="14" fill="rgba(255,255,255,0.4)">{"<build>"}</text>
          <text x="40" y="90" fontFamily="JetBrains Mono" fontSize="14" fill={accent}>{"whatever you imagine"}</text>
          <text x="20" y="120" fontFamily="JetBrains Mono" fontSize="14" fill="rgba(255,255,255,0.4)">{"</build>"}</text>
          <rect x="20" y="138" width="240" height="2" fill={accent} opacity="0.5" />
        </svg>
      );
    default:
      return null;
  }
}
