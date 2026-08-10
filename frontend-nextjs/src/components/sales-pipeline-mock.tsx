"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  CalendarCheck,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  UserPlus,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/components/lang";

type StageId = "lead" | "qualified" | "quote" | "booked" | "closed";

type Stage = {
  id: StageId;
  label: string;
  icon: React.ReactNode;
};

type LeadCard = {
  id: string;
  name: string;
  source: string;
  meta: string;
};

const COPY = {
  es: {
    title: "Embudo automatizado",
    subtitle: "Lead → seguimiento → cierre · sin chase manual",
    toast: "Seguimiento enviado · WhatsApp + CRM",
    rule: "Regla IA",
    stages: [
      { id: "lead" as const, label: "Nuevo", icon: <UserPlus className="h-3 w-3" /> },
      { id: "qualified" as const, label: "Calificado", icon: <Sparkles className="h-3 w-3" /> },
      { id: "quote" as const, label: "Cotización", icon: <MessageSquare className="h-3 w-3" /> },
      { id: "booked" as const, label: "Cita", icon: <CalendarCheck className="h-3 w-3" /> },
      { id: "closed" as const, label: "Cerrado", icon: <CheckCircle2 className="h-3 w-3" /> },
    ],
    leads: [
      { id: "a", name: "Ana R.", source: "IG Ads", meta: "Score 82" },
      { id: "b", name: "Luis M.", source: "Web", meta: "Hot" },
      { id: "c", name: "Sofía K.", source: "WA", meta: "Reply 12s" },
    ] satisfies LeadCard[],
  },
  en: {
    title: "Automated funnel",
    subtitle: "Lead → follow-up → close · no manual chase",
    toast: "Follow-up sent · WhatsApp + CRM",
    rule: "AI rule",
    stages: [
      { id: "lead" as const, label: "New", icon: <UserPlus className="h-3 w-3" /> },
      { id: "qualified" as const, label: "Qualified", icon: <Sparkles className="h-3 w-3" /> },
      { id: "quote" as const, label: "Quote", icon: <MessageSquare className="h-3 w-3" /> },
      { id: "booked" as const, label: "Booked", icon: <CalendarCheck className="h-3 w-3" /> },
      { id: "closed" as const, label: "Closed", icon: <CheckCircle2 className="h-3 w-3" /> },
    ],
    leads: [
      { id: "a", name: "Ana R.", source: "IG Ads", meta: "Score 82" },
      { id: "b", name: "Luis M.", source: "Web", meta: "Hot" },
      { id: "c", name: "Sofía K.", source: "WA", meta: "Reply 12s" },
    ] satisfies LeadCard[],
  },
};

function LeadChip({
  lead,
  auto,
  compact,
}: {
  lead: LeadCard;
  auto?: boolean;
  compact?: boolean;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className={cn(
        "rounded-md border border-white/10 bg-[#141a24] shadow-lg shadow-black/20",
        compact ? "px-2.5 py-2" : "p-1.5 sm:p-2"
      )}
    >
      <p
        className={cn(
          "truncate font-semibold text-ok-text",
          compact ? "text-[12px]" : "text-[10px] sm:text-[11px]"
        )}
      >
        {lead.name}
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-1">
        <span
          className={cn(
            "rounded bg-white/5 px-1.5 py-px text-ok-mute",
            compact ? "text-[9px]" : "text-[8px] sm:text-[9px]"
          )}
        >
          {lead.source}
        </span>
        <span
          className={cn(
            "rounded bg-[var(--ok-indigo)]/15 px-1.5 py-px text-[var(--ok-indigo)]",
            compact ? "text-[9px]" : "text-[8px] sm:text-[9px]"
          )}
        >
          {lead.meta}
        </span>
      </div>
      {auto ? (
        <div
          className={cn(
            "mt-1.5 flex items-center gap-0.5 text-[var(--ok-emphasis)]",
            compact ? "text-[9px]" : "text-[8px] sm:text-[9px]"
          )}
        >
          <Zap className="h-2.5 w-2.5" />
          Auto
        </div>
      ) : null}
    </motion.div>
  );
}

/**
 * Simulación de pipeline CRM: leads avanzan de etapa a etapa.
 * Desktop = columnas; compact (móvil) = embudo vertical legible.
 */
export function SalesPipelineMock({
  className,
  active = true,
  compact = false,
}: {
  className?: string;
  active?: boolean;
  compact?: boolean;
}) {
  const { lang } = useLang();
  const t = COPY[lang] ?? COPY.es;
  const stages = t.stages as Stage[];

  const [positions, setPositions] = useState<number[]>([0, 1, 2]);
  const [step, setStep] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const stageCount = stages.length;

  useEffect(() => {
    if (!active) {
      setPositions([0, 1, 2]);
      setStep(0);
      setShowToast(false);
      return;
    }

    let cancelled = false;
    let toastTimer: number;
    let loopTimer: number;

    setPositions([0, 1, 2]);
    setStep(0);

    const tick = () => {
      if (cancelled) return;
      setStep((s) => s + 1);
      setPositions((prev) => prev.map((p) => (p + 1) % stageCount));
      setShowToast(true);
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => {
        if (!cancelled) setShowToast(false);
      }, 1400);
      loopTimer = window.setTimeout(tick, 2200);
    };

    loopTimer = window.setTimeout(tick, 900);

    return () => {
      cancelled = true;
      window.clearTimeout(toastTimer);
      window.clearTimeout(loopTimer);
    };
  }, [active, stageCount]);

  const byStage: Record<number, LeadCard[]> = {};
  stages.forEach((_, i) => {
    byStage[i] = [];
  });
  t.leads.forEach((lead, i) => {
    const stageIdx = positions[i] ?? 0;
    byStage[stageIdx]?.push(lead);
  });

  const hotStage = Math.max(...positions, 0);

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col overflow-hidden bg-[#0c1018]",
        className
      )}
      aria-hidden
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,oklch(0.55_0.2_265_/_0.18),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden
      />

      <div className="relative z-10 flex shrink-0 items-center justify-between gap-2 border-b border-white/[0.06] px-3 py-2.5 sm:px-4">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[var(--ok-indigo)]/25 text-[var(--ok-indigo)]">
              <Zap className="h-3 w-3" />
            </span>
            <p className="truncate text-[12px] font-semibold text-ok-text sm:text-[13px]">
              {t.title}
            </p>
          </div>
          <p className="mt-0.5 truncate text-[10px] text-ok-mute sm:text-[11px]">
            {t.subtitle}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-ok-mute">
          <Bot className="h-3 w-3 text-[var(--ok-emphasis)]" />
          {t.rule}
        </span>
      </div>

      {compact ? (
        /* Móvil: embudo vertical — etapas completas, sin columnas aplastadas */
        <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto px-3 py-3">
          {stages.map((stage, si) => {
            const cards = byStage[si] ?? [];
            const isHot = si === hotStage;
            return (
              <div
                key={stage.id}
                className={cn(
                  "flex items-stretch gap-2.5 rounded-xl border px-2.5 py-2 transition-colors",
                  isHot
                    ? "border-[var(--ok-indigo)]/50 bg-[var(--ok-indigo)]/10"
                    : "border-white/[0.06] bg-white/[0.03]"
                )}
              >
                <div className="flex w-[5.75rem] shrink-0 flex-col justify-center gap-1">
                  <span
                    className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-md",
                      isHot
                        ? "bg-[var(--ok-indigo)]/35 text-[var(--ok-indigo)]"
                        : "bg-white/5 text-ok-mute"
                    )}
                  >
                    {stage.icon}
                  </span>
                  <span
                    className={cn(
                      "text-[11px] font-semibold leading-tight tracking-wide",
                      isHot ? "text-ok-text" : "text-ok-mute"
                    )}
                  >
                    {stage.label}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <AnimatePresence mode="popLayout">
                    {cards.length > 0 ? (
                      <div className="flex flex-col gap-1.5">
                        {cards.map((lead) => (
                          <LeadChip
                            key={lead.id}
                            lead={lead}
                            auto={si >= 3}
                            compact
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex h-full min-h-[2.75rem] items-center">
                        <div className="h-1 w-8 rounded-full bg-white/8" />
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Desktop: columnas kanban */
        <div className="relative z-10 flex min-h-0 flex-1 gap-1.5 overflow-x-auto overflow-y-hidden p-2 sm:gap-2 sm:p-3">
          {stages.map((stage, si) => {
            const cards = byStage[si] ?? [];
            const isHot = si === hotStage;
            return (
              <div
                key={stage.id}
                className={cn(
                  "flex min-w-[4.75rem] flex-1 flex-col rounded-lg border bg-white/[0.03] sm:min-w-0",
                  isHot
                    ? "border-[var(--ok-indigo)]/45"
                    : "border-white/[0.06]"
                )}
              >
                <div className="flex items-center gap-1 border-b border-white/[0.05] px-1.5 py-1.5 sm:px-2">
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded text-[10px]",
                      isHot
                        ? "bg-[var(--ok-indigo)]/30 text-[var(--ok-indigo)]"
                        : "bg-white/5 text-ok-mute"
                    )}
                  >
                    {stage.icon}
                  </span>
                  <span className="truncate text-[9px] font-semibold uppercase tracking-wide text-ok-mute sm:text-[10px]">
                    {stage.label}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-1.5 p-1.5 sm:p-2">
                  <AnimatePresence mode="popLayout">
                    {cards.map((lead) => (
                      <LeadChip key={lead.id} lead={lead} auto={si >= 3} />
                    ))}
                  </AnimatePresence>

                  {cards.length === 0 && (
                    <div className="flex flex-1 items-center justify-center py-2">
                      <div className="h-1 w-6 rounded-full bg-white/5" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="relative z-10 border-t border-white/[0.06] px-3 py-2 sm:px-4">
        <div className="mb-1 flex items-center justify-between text-[9px] text-ok-mute">
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--ok-indigo)]" />
            Live funnel
          </span>
          <span className="font-mono tabular-nums">
            {String((step % 5) + 1).padStart(2, "0")} / 05
          </span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-white/5">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[var(--ok-indigo)] to-[var(--ok-emphasis)]"
            animate={{ width: `${((step % 5) + 1) * 20}%` }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      <AnimatePresence>
        {showToast && active && (
          <motion.div
            initial={{ opacity: 0, y: 12, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 8, x: "-50%" }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-12 left-1/2 z-20 flex max-w-[90%] items-center gap-1.5 rounded-full border border-white/10 bg-[#1a2230]/95 px-3 py-1.5 text-[10px] text-ok-text shadow-xl backdrop-blur-md sm:text-[11px]"
          >
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[var(--ok-indigo)]" />
            <span className="truncate">{t.toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
