export function WireGlobe() {
  const lats = [0, 15, 30, 45, 60, 75, -15, -30, -45, -60, -75];
  const longs = 12;
  const accent = "var(--ok-neon)";
  const cities = [
    { x: 160, y: 220, label: "CDMX" },
    { x: 200, y: 260, label: "BOG" },
    { x: 220, y: 310, label: "SCL" },
    { x: 240, y: 240, label: "SAO" },
  ];
  return (
    <svg viewBox="0 0 400 400" className="w-full h-full">
      <defs>
        <radialGradient id="globe-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.18" />
          <stop offset="70%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="180" fill="url(#globe-glow)" />
      <g
        className="animate-spin-slow"
        style={{ transformOrigin: "200px 200px" }}
      >
        {lats.map((lat, i) => {
          const ry = 180 * Math.cos((lat * Math.PI) / 180);
          return (
            <ellipse
              key={`lat-${i}`}
              cx="200"
              cy="200"
              rx="180"
              ry={Math.abs(ry)}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="0.7"
            />
          );
        })}
        {Array.from({ length: longs }).map((_, i) => {
          const angle = (i * 180) / longs;
          const rx = 180 * Math.abs(Math.cos((angle * Math.PI) / 180));
          return (
            <ellipse
              key={`long-${i}`}
              cx="200"
              cy="200"
              rx={rx}
              ry="180"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="0.7"
            />
          );
        })}
        <circle
          cx="200"
          cy="200"
          r="180"
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1"
        />
        {cities.map((d, i) => (
          <g key={i}>
            <circle cx={d.x} cy={d.y} r="3" fill={accent} />
            <circle
              cx={d.x}
              cy={d.y}
              r="10"
              fill="none"
              stroke={accent}
              strokeWidth="1"
              opacity="0.4"
            >
              <animate
                attributeName="r"
                from="3"
                to="20"
                dur="2.4s"
                repeatCount="indefinite"
                begin={`${i * 0.5}s`}
              />
              <animate
                attributeName="opacity"
                from="0.6"
                to="0"
                dur="2.4s"
                repeatCount="indefinite"
                begin={`${i * 0.5}s`}
              />
            </circle>
          </g>
        ))}
      </g>
    </svg>
  );
}
