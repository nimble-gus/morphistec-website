"use client";

import { useEffect, useId, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    tabKpis: "Resumen",
    tabChart: "Gráfico",
    tabInsight: "Insight",
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
    tabKpis: "Summary",
    tabChart: "Chart",
    tabInsight: "Insight",
  },
};

type MobileTab = "kpis" | "chart" | "insight";

function useIsNarrow(breakpoint = 1024) {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const apply = () => setNarrow(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [breakpoint]);
  return narrow;
}

/**
 * Dashboard de consultoría: Meta leads vs ventas.
 * Desktop = panel apilado; móvil = pestañas segmentadas (más limpio que un carrusel).
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
  const isNarrow = useIsNarrow(1024);
  const [tab, setTab] = useState<MobileTab>("chart");

  const totalLeads = META_LEADS.reduce((a, b) => a + b, 0);
  const totalSales = SALES.reduce((a, b) => a + b, 0);
  const gap = totalLeads - totalSales;
  const convPct = ((totalSales / totalLeads) * 100).toFixed(1);

  useEffect(() => {
    if (!active) {
      setDrawn(false);
      return;
    }
    const id = window.setTimeout(() => setDrawn(true), 120);
    return () => window.clearTimeout(id);
  }, [active]);

  // Al reactivar el servicio, arranca en el gráfico (mensaje principal)
  useEffect(() => {
    if (active && isNarrow) setTab("chart");
  }, [active, isNarrow]);

  const tabs: { id: MobileTab; label: string }[] = [
    { id: "kpis", label: t.tabKpis },
    { id: "chart", label: t.tabChart },
    { id: "insight", label: t.tabInsight },
  ];

  const kpis = (
    <KpiRow
      drawn={drawn}
      leadsLabel={t.leads}
      salesLabel={t.sales}
      gapLabel={t.gap}
      totalLeads={totalLeads}
      totalSales={totalSales}
      gap={gap}
      large={isNarrow}
    />
  );

  const chart = (
    <ChartBlock
      uid={uid}
      months={months}
      drawn={drawn}
      leadsLabel={t.leads}
      salesLabel={t.sales}
    />
  );

  const insight = <InsightBlock text={t.insight} />;

  return (
    <div
      className={cn(
        "relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[var(--ok-bg-deep)] text-ok-text",
        className
      )}
      aria-hidden
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 55% at 85% -10%, oklch(0.55 0.2 265 / 0.18), transparent 55%), radial-gradient(ellipse 50% 40% at 10% 100%, oklch(0.78 0.16 70 / 0.06), transparent 50%)",
        }}
      />

      <header className="relative z-10 flex shrink-0 items-start justify-between gap-3 border-b border-white/[0.07] px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--ok-indigo)]/20 text-[var(--ok-indigo)] sm:h-7 sm:w-7">
              <LineChart className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
            </span>
            <p className="truncate text-[13px] font-semibold leading-tight tracking-tight sm:text-sm">
              {t.title}
            </p>
          </div>
          <p className="mt-0.5 truncate pl-8 text-[10px] text-ok-mute sm:pl-9 sm:text-[11px]">
            {t.subtitle}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-0.5 rounded-lg border border-[var(--ok-emphasis)]/25 bg-[var(--ok-emphasis)]/10 px-2 py-1.5 sm:px-2.5">
          <span className="max-w-[7rem] text-right text-[8px] font-medium uppercase leading-tight tracking-[0.08em] text-ok-mute sm:max-w-none sm:text-[9px]">
            {t.conv}
          </span>
          <span className="font-mono text-base font-semibold tabular-nums text-[var(--ok-emphasis)] sm:text-lg">
            {convPct}%
          </span>
        </div>
      </header>

      {/* Desktop / lg: stack completo */}
      {!isNarrow ? (
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <div className="shrink-0 border-b border-white/[0.07] px-3 py-2.5 sm:px-4 sm:py-3">
            {kpis}
          </div>
          <div className="min-h-0 flex-1 px-2 py-2 sm:px-3 sm:py-3">{chart}</div>
          <div className="shrink-0 border-t border-white/[0.07]">{insight}</div>
        </div>
      ) : (
        /* Móvil: tabs segmentadas — explícitas, sin autoplay ni gesture */
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <div className="shrink-0 px-3 pt-2.5 pb-2">
            <div
              className="grid grid-cols-3 gap-0.5 rounded-lg border border-white/[0.08] bg-black/30 p-0.5"
              role="tablist"
            >
              {tabs.map((item) => {
                const selected = tab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setTab(item.id)}
                    className={cn(
                      "relative rounded-md px-1.5 py-2 text-center text-[11px] font-medium transition-colors",
                      selected
                        ? "text-ok-text"
                        : "text-ok-mute active:text-ok-text"
                    )}
                  >
                    {selected ? (
                      <motion.span
                        layoutId="consulting-tab-pill"
                        className="absolute inset-0 rounded-md bg-white/[0.1] ring-1 ring-white/[0.12]"
                        transition={{
                          type: "spring",
                          stiffness: 420,
                          damping: 34,
                        }}
                      />
                    ) : null}
                    <span className="relative z-10">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative min-h-0 flex-1">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={tab}
                role="tabpanel"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 flex flex-col overflow-hidden"
              >
                {tab === "kpis" ? (
                  <div className="flex h-full flex-col justify-center gap-4 px-3 py-3">
                    {kpis}
                    <p className="text-center text-[11px] leading-snug text-ok-mute">
                      {t.conv}:{" "}
                      <span className="font-mono font-semibold text-[var(--ok-emphasis)]">
                        {convPct}%
                      </span>
                    </p>
                  </div>
                ) : null}
                {tab === "chart" ? (
                  <div className="flex h-full min-h-0 flex-col px-2 py-2">
                    {chart}
                  </div>
                ) : null}
                {tab === "insight" ? (
                  <div className="flex h-full flex-col justify-center px-1 py-3">
                    {insight}
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiRow({
  drawn,
  leadsLabel,
  salesLabel,
  gapLabel,
  totalLeads,
  totalSales,
  gap,
  large,
}: {
  drawn: boolean;
  leadsLabel: string;
  salesLabel: string;
  gapLabel: string;
  totalLeads: number;
  totalSales: number;
  gap: number;
  large?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-3",
        large ? "gap-2" : "gap-1.5 sm:gap-2.5"
      )}
    >
      <Kpi
        label={leadsLabel}
        value={String(totalLeads)}
        color="var(--ok-indigo)"
        drawn={drawn}
        large={large}
      />
      <Kpi
        label={salesLabel}
        value={String(totalSales)}
        color="var(--ok-emphasis)"
        drawn={drawn}
        large={large}
      />
      <Kpi
        label={gapLabel}
        value={`−${gap}`}
        color="#e85d5d"
        drawn={drawn}
        large={large}
        warn
      />
    </div>
  );
}

function Kpi({
  label,
  value,
  color,
  drawn,
  large,
  warn,
}: {
  label: string;
  value: string;
  color: string;
  drawn: boolean;
  large?: boolean;
  warn?: boolean;
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-lg border bg-white/[0.03]",
        warn
          ? "border-[#e85d5d]/25 bg-[#e85d5d]/[0.06]"
          : "border-white/[0.07]",
        large ? "px-2.5 py-3" : "px-2 py-1.5 sm:px-2.5 sm:py-2"
      )}
    >
      <p
        className={cn(
          "truncate font-medium uppercase tracking-[0.08em] text-ok-mute",
          large ? "text-[9px]" : "text-[8px] sm:text-[9px]"
        )}
      >
        {label}
      </p>
      <motion.p
        className={cn(
          "mt-1 font-mono font-semibold tabular-nums leading-none",
          large ? "text-xl" : "text-sm sm:text-base md:text-lg"
        )}
        style={{ color }}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: drawn ? 1 : 0.35, y: drawn ? 0 : 4 }}
        transition={{ duration: 0.4 }}
      >
        {value}
      </motion.p>
    </div>
  );
}

function ChartBlock({
  uid,
  months,
  drawn,
  leadsLabel,
  salesLabel,
}: {
  uid: string;
  months: string[];
  drawn: boolean;
  leadsLabel: string;
  salesLabel: string;
}) {
  const maxY = 160;
  const W = 360;
  const H = 148;
  const padL = 20;
  const padR = 6;
  const padT = 8;
  const padB = 20;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const xAt = (i: number) => padL + (i / (META_LEADS.length - 1)) * chartW;
  const yAt = (v: number) => padT + chartH - (v / maxY) * chartH;

  const leadPoints = META_LEADS.map((v, i) => `${xAt(i)},${yAt(v)}`).join(" ");
  const salesPoints = SALES.map((v, i) => `${xAt(i)},${yAt(v)}`).join(" ");

  const leadArea = [
    `${xAt(0)},${padT + chartH}`,
    ...META_LEADS.map((v, i) => `${xAt(i)},${yAt(v)}`),
    `${xAt(META_LEADS.length - 1)},${padT + chartH}`,
  ].join(" ");

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 px-0.5 text-[9px] text-ok-mute sm:text-[10px]">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-3.5 rounded-sm bg-[var(--ok-indigo)]" />
          {leadsLabel}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-3.5 rounded-sm bg-[var(--ok-emphasis)]" />
          {salesLabel}
        </span>
      </div>

      <div className="relative min-h-[120px] w-full flex-1">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id={`${uid}-lead`} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="oklch(0.55 0.2 265)"
                stopOpacity="0.38"
              />
              <stop
                offset="100%"
                stopColor="oklch(0.55 0.2 265)"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>

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

          {META_LEADS.map((v, i) => {
            const bw = chartW / META_LEADS.length - 3.5;
            const x =
              padL + (i + 0.5) * (chartW / META_LEADS.length) - bw / 2;
            const barH = (v / maxY) * chartH;
            return (
              <motion.rect
                key={`b-${i}`}
                x={x}
                width={Math.max(bw, 2)}
                rx={1.5}
                fill="oklch(0.55 0.2 265 / 0.2)"
                initial={false}
                animate={
                  drawn
                    ? { y: padT + chartH - barH, height: barH }
                    : { y: padT + chartH, height: 0 }
                }
                transition={{
                  duration: 0.55,
                  delay: i * 0.03,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            );
          })}

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
          />
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

          {months.map((m, i) => (
            <text
              key={`${m}-${i}`}
              x={xAt(i)}
              y={H - 5}
              textAnchor="middle"
              fill="rgba(255,255,255,0.38)"
              fontSize="8"
              fontFamily="ui-monospace, monospace"
            >
              {m}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

function InsightBlock({ text }: { text: string }) {
  return (
    <div className="bg-black/25 px-3 py-3 sm:px-4 sm:py-3.5">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#e85d5d]/15 text-[#e85d5d]">
          <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <p className="mb-1 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ok-emphasis)] sm:text-[11px]">
            <TrendingDown className="h-3 w-3" strokeWidth={2} />
            Insight
          </p>
          <p className="text-[11px] leading-relaxed text-ok-mute sm:text-xs sm:leading-snug">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}
