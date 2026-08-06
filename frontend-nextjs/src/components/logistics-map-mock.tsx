"use client";

import { useEffect, useId, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/components/lang";

const COPY = {
  es: {
    title: "Rutas logísticas",
    subtitle: "Ciudad de Guatemala · tráfico en vivo",
    optimized: "Ruta optimizada",
    heavy: "Tráfico denso",
    free: "Flujo libre",
    eta: "ETA medio",
    vehicles: "Unidades",
    zones: "Zonas",
  },
  en: {
    title: "Logistics routes",
    subtitle: "Guatemala City · live traffic",
    optimized: "Optimized route",
    heavy: "Heavy traffic",
    free: "Free flow",
    eta: "Avg ETA",
    vehicles: "Units",
    zones: "Zones",
  },
};

/** Puntos de interés / zonas (coords SVG 0–400 × 0–280). */
const PLACES = [
  { id: "z10", label: "Zona 10", x: 248, y: 118 },
  { id: "z4", label: "Zona 4", x: 198, y: 102 },
  { id: "z1", label: "Zona 1", x: 168, y: 88 },
  { id: "aurora", label: "Aurora", x: 292, y: 168 },
  { id: "mixco", label: "Mixco", x: 88, y: 112 },
  { id: "vn", label: "V. Nueva", x: 212, y: 218 },
] as const;

/**
 * Rutas simplificadas por CDGT.
 * stroke: green = libre, amber = densa, indigo = optimizada Oktae
 */
const ROUTES = [
  {
    id: "r1",
    kind: "optimized" as const,
    d: "M88 112 C120 120, 160 110, 198 102 S230 108, 248 118",
    duration: 4.2,
  },
  {
    id: "r2",
    kind: "heavy" as const,
    d: "M168 88 C190 100, 210 130, 230 150 S260 160, 292 168",
    duration: 5.5,
  },
  {
    id: "r3",
    kind: "free" as const,
    d: "M248 118 C260 140, 250 170, 230 195 S220 210, 212 218",
    duration: 3.8,
  },
  {
    id: "r4",
    kind: "optimized" as const,
    d: "M88 112 C140 150, 170 180, 200 200 S210 215, 212 218",
    duration: 4.8,
  },
];

/**
 * Mapa simulado CDGT + rutas rápidas por tráfico (logística a medida).
 */
export function LogisticsMapMock({
  className,
  active = true,
}: {
  className?: string;
  active?: boolean;
}) {
  const { lang } = useLang();
  const t = COPY[lang] ?? COPY.es;
  const uid = useId().replace(/:/g, "");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!active) {
      setTick(0);
      return;
    }
    const id = window.setInterval(() => setTick((n) => n + 1), 2800);
    return () => window.clearInterval(id);
  }, [active]);

  const colorFor = (kind: (typeof ROUTES)[number]["kind"]) => {
    if (kind === "optimized") return "var(--ok-indigo)";
    if (kind === "heavy") return "var(--ok-emphasis)";
    return "#22c55e";
  };

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col overflow-hidden bg-[#0b1210]",
        className
      )}
      aria-hidden
    >
      {/* sky / terrain wash */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_60%_30%,oklch(0.55_0.12_145_/_0.15),transparent_55%)]"
        aria-hidden
      />

      <div className="relative z-10 flex shrink-0 items-center justify-between gap-2 border-b border-white/[0.06] px-3 py-2.5 sm:px-4">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[var(--ok-indigo)]/25 text-[var(--ok-indigo)]">
              <Navigation className="h-3 w-3" />
            </span>
            <p className="truncate text-[12px] font-semibold text-ok-text sm:text-[13px]">
              {t.title}
            </p>
          </div>
          <p className="mt-0.5 truncate text-[10px] text-ok-mute sm:text-[11px]">
            {t.subtitle}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-[9px] text-ok-mute">
          <span className="tabular-nums text-ok-text">
            <span className="text-ok-mute">{t.eta} </span>
            {12 + (tick % 5)} min
          </span>
        </div>
      </div>

      {/* Map canvas */}
      <div className="relative min-h-0 flex-1">
        <svg
          viewBox="0 0 400 280"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern
              id={`${uid}-grid`}
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="0.8"
              />
            </pattern>
            <linearGradient id={`${uid}-land`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#122018" />
              <stop offset="100%" stopColor="#0c1412" />
            </linearGradient>
            <filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect width="400" height="280" fill={`url(#${uid}-land)`} />
          <rect width="400" height="280" fill={`url(#${uid}-grid)`} />

          {/* city silhouette / valleys (abstract) */}
          <path
            d="M20 200 Q80 160 140 175 T260 190 T380 165 L380 280 L20 280 Z"
            fill="rgba(34,80,50,0.12)"
          />
          <path
            d="M0 60 Q60 40 100 55 T200 45 T320 70 T400 50 L400 0 L0 0 Z"
            fill="rgba(255,255,255,0.02)"
          />

          {/* major corridors (ring road / calzada feel) */}
          <path
            d="M40 140 C100 100, 160 90, 220 100 S320 130, 360 160"
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M60 40 C90 100, 100 160, 120 230"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M120 250 C180 230, 240 220, 320 240"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M280 30 C270 90, 290 150, 340 200"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* traffic routes */}
          {ROUTES.map((r) => (
            <g key={r.id}>
              <path
                d={r.d}
                fill="none"
                stroke={colorFor(r.kind)}
                strokeOpacity={0.25}
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                id={`${uid}-${r.id}`}
                d={r.d}
                fill="none"
                stroke={colorFor(r.kind)}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={r.kind === "optimized" ? `url(#${uid}-glow)` : undefined}
                strokeDasharray={r.kind === "heavy" ? "6 6" : undefined}
              />
              {/* moving dash for free/optimized */}
              {r.kind !== "heavy" && active && (
                <path
                  d={r.d}
                  fill="none"
                  stroke="white"
                  strokeOpacity="0.55"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="10 28"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="0"
                    to="-76"
                    dur={`${r.duration}s`}
                    repeatCount="indefinite"
                  />
                </path>
              )}
              {/* truck along path */}
              {active && (
                <g>
                  <animateMotion
                    dur={`${r.duration}s`}
                    repeatCount="indefinite"
                    rotate="auto"
                    path={r.d}
                  />
                  <circle r="5" fill={colorFor(r.kind)} opacity="0.9" />
                  <circle r="2.2" fill="#0b1210" />
                </g>
              )}
            </g>
          ))}

          {/* places */}
          {PLACES.map((p) => (
            <g key={p.id} transform={`translate(${p.x}, ${p.y})`}>
              <circle r="10" fill="rgba(12,18,16,0.75)" stroke="rgba(255,255,255,0.12)" />
              <circle r="3.5" fill="var(--ok-emphasis)" />
              <text
                y="-14"
                textAnchor="middle"
                fill="rgba(237,237,237,0.85)"
                fontSize="9"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
                fontWeight="600"
              >
                {p.label}
              </text>
            </g>
          ))}

          {/* depot hub */}
          <g transform="translate(198, 148)">
            <rect
              x="-14"
              y="-10"
              width="28"
              height="20"
              rx="4"
              fill="var(--ok-indigo)"
              opacity="0.9"
            />
            <text
              y="4"
              textAnchor="middle"
              fill="white"
              fontSize="8"
              fontFamily="ui-sans-serif, system-ui"
              fontWeight="700"
            >
              HQ
            </text>
          </g>
        </svg>

        {/* floating legenda */}
        <div className="absolute bottom-2 left-2 z-10 flex flex-col gap-1 rounded-md border border-white/10 bg-black/55 px-2 py-1.5 text-[8px] backdrop-blur-sm sm:text-[9px]">
          <LegendDot color="var(--ok-indigo)" label={t.optimized} />
          <LegendDot color="var(--ok-emphasis)" label={t.heavy} />
          <LegendDot color="#22c55e" label={t.free} />
        </div>

        <div className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full border border-white/10 bg-black/50 px-2 py-1 text-[9px] text-ok-text backdrop-blur-sm">
          <MapPin className="h-3 w-3 text-[var(--ok-emphasis)]" />
          Guatemala
        </div>
      </div>

      {/* footer strip */}
      <div className="relative z-10 flex shrink-0 items-center justify-between gap-2 border-t border-white/[0.06] px-3 py-2 text-[10px] text-ok-mute sm:px-4 sm:text-[11px]">
        <span className="inline-flex items-center gap-1.5">
          <Truck className="h-3.5 w-3.5 text-[var(--ok-indigo)]" />
          {t.vehicles}
          <strong className="font-mono text-ok-text"> {12 + (tick % 4)}</strong>
        </span>
        <span>
          {t.zones}
          <strong className="ml-1 font-mono text-ok-text">6</strong>
        </span>
        <motion.span
          key={tick}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 1 }}
          className="tabular-nums text-[var(--ok-emphasis)]"
        >
          −{8 + (tick % 6)}% tiempo
        </motion.span>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-ok-mute">
      <span className="h-1.5 w-3 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
