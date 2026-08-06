"use client";

import { useEffect, useId, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, LineChart, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/components/lang";

/** Leads Meta altos vs ventas cerradas (demo). Eje Y normalizado 0–150. */
const MONTHS_ES = ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const MONTHS_EN = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

const META_LEADS = [72, 88, 95, 110, 124, 118, 132, 140, 128, 135, 142, 130];
const SALES = [18, 16, 22, 19, 21, 17, 20, 15, 18, 14, 16, 19];

const COPY = {
  es: {
    title: "Leads Meta vs ventas",
    subtitle: "Enero — Diciembre · vista diagnóstica",
    leads: "Leads Meta",
    sales: "Ventas",
    insight:
      "Los ads sí traen demanda. El hueco está en seguimiento y cierre — no en la captación.",
    gap: "Brecha de cierre",
    conv: "Conversión lead→venta",
  },
  en: {
    title: "Meta leads vs sales",
    subtitle: "Jan — Dec · diagnostic view",
    leads: "Meta leads",
    sales: "Sales",
    insight:
      "Ads are bringing demand. The gap is follow-up and close — not acquisition.",
    gap: "Close gap",
    conv: "Lead → sale conversion",
  },
};

/**
 * Dashboard de consultoría: gráfica dual Meta leads vs ventas anuales
 * para mostrar que el problema suele ser cierre, no captación.
 */
export function ConsultingAnalyticsMock({
  className,
  active = true,
}: {
  className?: string;
  active?: boolean;
}) {
  const { lang } = useLang();
  const t = COPY[lang] ?? COPY.es;
  const months = lang === "es" ? MONTHS_ES : MONTHS_EN;
  const uid = useId().replace(/:/g, "");
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    if (!active) {
      setDrawn(false);
      return;
    }
    const id = window.setTimeout(() => setDrawn(true), 120);
    return () => window.clearTimeout(id);
  }, [active]);

  const maxY = 160;
  const totalLeads = META_LEADS.reduce((a, b) => a + b, 0);
  const totalSales = SALES.reduce((a, b) => a + b, 0);
  const convPct = ((totalSales / totalLeads) * 100).toFixed(1);

  // SVG chart viewBox
  const W = 360;
  const H = 140;
  const padL = 28;
  const padR = 8;
  const padT = 10;
  const padB = 22;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const xAt = (i: number) =>
    padL + (i / (META_LEADS.length - 1)) * chartW;
  const yAt = (v: number) => padT + chartH - (v / maxY) * chartH;

  const leadPoints = META_LEADS.map((v, i) => `${xAt(i)},${yAt(v)}`).join(" ");
  const salesPoints = SALES.map((v, i) => `${xAt(i)},${yAt(v)}`).join(" ");

  // area under leads
  const leadArea = [
    `${xAt(0)},${yAt(0) + chartH}`,
    ...META_LEADS.map((v, i) => `${xAt(i)},${yAt(v)}`),
    `${xAt(META_LEADS.length - 1)},${padT + chartH}`,
  ].join(" ");

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col overflow-hidden bg-[#0a0e14]",
        className
      )}
      aria-hidden
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,oklch(0.55_0.2_265_/_0.16),transparent_50%)]"
        aria-hidden
      />

      {/* header */}
      <div className="relative z-10 flex shrink-0 items-start justify-between gap-2 border-b border-white/[0.06] px-3 py-2.5 sm:px-4">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[var(--ok-indigo)]/25 text-[var(--ok-indigo)]">
              <LineChart className="h-3 w-3" />
            </span>
            <p className="truncate text-[12px] font-semibold text-ok-text sm:text-[13px]">
              {t.title}
            </p>
          </div>
          <p className="mt-0.5 truncate text-[10px] text-ok-mute sm:text-[11px]">
            {t.subtitle}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-0.5">
          <span className="text-[9px] uppercase tracking-wider text-ok-mute">
            {t.conv}
          </span>
          <span className="font-mono text-sm font-semibold tabular-nums text-[var(--ok-emphasis)]">
            {convPct}%
          </span>
        </div>
      </div>

      {/* KPIs */}
      <div className="relative z-10 grid shrink-0 grid-cols-3 gap-1.5 border-b border-white/[0.06] px-3 py-2 sm:gap-2 sm:px-4">
        <Kpi
          label={t.leads}
          value={String(totalLeads)}
          color="var(--ok-indigo)"
          drawn={drawn}
        />
        <Kpi
          label={t.sales}
          value={String(totalSales)}
          color="var(--ok-emphasis)"
          drawn={drawn}
        />
        <Kpi
          label={t.gap}
          value={String(totalLeads - totalSales)}
          color="#e85d5d"
          drawn={drawn}
          icon
        />
      </div>

      {/* Chart */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-2 py-2 sm:px-3">
        <div className="mb-1 flex items-center gap-3 px-1 text-[9px] text-ok-mute">
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-3 rounded-sm bg-[var(--ok-indigo)]" />
            {t.leads}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-3 rounded-sm bg-[var(--ok-emphasis)]" />
            {t.sales}
          </span>
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-full w-full min-h-[100px] flex-1"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={`${uid}-lead`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.55 0.2 265)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="oklch(0.55 0.2 265)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* grid */}
          {[0, 0.33, 0.66, 1].map((p) => {
            const y = padT + chartH * (1 - p);
            return (
              <line
                key={p}
                x1={padL}
                x2={W - padR}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
              />
            );
          })}

          {/* bars Meta (faint) */}
          {META_LEADS.map((v, i) => {
            const bw = chartW / META_LEADS.length - 4;
            const x = padL + (i + 0.5) * (chartW / META_LEADS.length) - bw / 2;
            const barH = (v / maxY) * chartH;
            return (
              <motion.rect
                key={`b-${i}`}
                x={x}
                width={bw}
                y={drawn ? padT + chartH - barH : padT + chartH}
                height={drawn ? barH : 0}
                rx={2}
                fill="oklch(0.55 0.2 265 / 0.22)"
                initial={false}
                animate={
                  drawn
                    ? { y: padT + chartH - barH, height: barH }
                    : { y: padT + chartH, height: 0 }
                }
                transition={{ duration: 0.55, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
              />
            );
          })}

          {/* lead area + line */}
          <motion.polygon
            points={leadArea}
            fill={`url(#${uid}-lead)`}
            initial={{ opacity: 0 }}
            animate={{ opacity: drawn ? 1 : 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          />
          <motion.polyline
            points={leadPoints}
            fill="none"
            stroke="oklch(0.55 0.2 265)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: drawn ? 1 : 0,
              opacity: drawn ? 1 : 0,
            }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            style={{ pathLength: drawn ? 1 : 0 }}
          />
          {/* sales line */}
          <motion.polyline
            points={salesPoints}
            fill="none"
            stroke="oklch(0.78 0.16 70)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: drawn ? 1 : 0,
              opacity: drawn ? 1 : 0,
            }}
            transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* month labels */}
          {months.map((m, i) => (
            <text
              key={m + i}
              x={xAt(i)}
              y={H - 6}
              textAnchor="middle"
              fill="rgba(255,255,255,0.35)"
              fontSize="8"
              fontFamily="ui-monospace, monospace"
            >
              {m}
            </text>
          ))}
        </svg>
      </div>

      {/* insight */}
      <div className="relative z-10 shrink-0 border-t border-white/[0.06] bg-[#0f141c]/90 px-3 py-2.5 sm:px-4">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#e85d5d]/15 text-[#e85d5d]">
            <AlertTriangle className="h-3 w-3" />
          </span>
          <p className="text-[10px] leading-snug text-ok-mute sm:text-[11px]">
            <span className="mr-1 inline-flex items-center gap-0.5 font-semibold text-[var(--ok-emphasis)]">
              <TrendingDown className="h-3 w-3" />
              Insight
            </span>
            {t.insight}
          </p>
        </div>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  color,
  drawn,
  icon,
}: {
  label: string;
  value: string;
  color: string;
  drawn: boolean;
  icon?: boolean;
}) {
  return (
    <div className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-1.5">
      <p className="truncate text-[8px] uppercase tracking-wider text-ok-mute sm:text-[9px]">
        {label}
      </p>
      <motion.p
        className="mt-0.5 font-mono text-sm font-semibold tabular-nums sm:text-base"
        style={{ color }}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: drawn ? 1 : 0.35, y: drawn ? 0 : 4 }}
        transition={{ duration: 0.4 }}
      >
        {icon ? `−${value}` : value}
      </motion.p>
    </div>
  );
}
