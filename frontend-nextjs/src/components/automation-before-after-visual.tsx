"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLang } from "@/components/lang";

type Mode = "manual" | "auto";

const copy = {
  es: {
    manual: "Manual",
    auto: "Automatizado",
    hours_bad: "~18 h/semana",
    hours_bad_sub: "en tareas repetidas",
    tasks_bad: "14 pasos manuales",
    hours_good: "−12 h/semana",
    hours_good_sub: "recuperadas",
    errors_good: "0 errores de copiar/pegar",
  },
  en: {
    manual: "Manual",
    auto: "Automated",
    hours_bad: "~18 h/week",
    hours_bad_sub: "lost to repeat work",
    tasks_bad: "14 manual steps",
    hours_good: "−12 h/week",
    hours_good_sub: "reclaimed",
    errors_good: "0 copy-paste errors",
  },
} as const;

export function AutomationBeforeAfterVisual() {
  const { lang } = useLang();
  const t = copy[lang];
  const [mode, setMode] = useState<Mode>("manual");

  const cycle = useCallback(() => {
    setMode((m) => (m === "manual" ? "auto" : "manual"));
  }, []);

  useEffect(() => {
    const id = window.setInterval(cycle, 4800);
    return () => window.clearInterval(id);
  }, [cycle]);

  const isAuto = mode === "auto";
  const line = isAuto ? "var(--ok-neon)" : "rgba(161,161,170,0.5)";
  const nodeStroke = isAuto ? "var(--ok-neon)" : "rgba(161,161,170,0.55)";
  const hubFill = isAuto ? "var(--ok-neon)" : "rgb(82,82,91)";

  return (
    <div
      className="flex w-[min(232px,52vw)] flex-col items-stretch gap-3"
      role="group"
      aria-label={isAuto ? t.auto : t.manual}
    >
      <div className="flex gap-0.5 rounded-full border border-white/10 bg-black/35 p-0.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMode("manual");
          }}
          className={`flex-1 rounded-full px-2 py-1 text-center text-[10px] font-medium uppercase tracking-wide transition ${
            !isAuto ? "bg-white/12 text-white" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          {t.manual}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMode("auto");
          }}
          className={`flex-1 rounded-full px-2 py-1 text-center text-[10px] font-medium uppercase tracking-wide transition ${
            isAuto ? "bg-[var(--ok-neon)]/20 text-[var(--ok-neon)]" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          {t.auto}
        </button>
      </div>

      <div className="relative mx-auto aspect-square w-full max-w-[200px]">
        <svg viewBox="0 0 200 200" className="h-full w-full" fill="none" aria-hidden>
          <motion.line
            x1="40"
            y1="50"
            x2="100"
            y2="80"
            stroke={line}
            strokeWidth="1.2"
            strokeLinecap="round"
            animate={{ opacity: isAuto ? 1 : 0.55 }}
            transition={{ duration: 0.35 }}
          />
          <motion.line
            x1="100"
            y1="80"
            x2="160"
            y2="50"
            stroke={line}
            strokeWidth="1.2"
            strokeLinecap="round"
            animate={{ opacity: isAuto ? 1 : 0.55 }}
            transition={{ duration: 0.35 }}
          />
          <motion.line
            x1="100"
            y1="80"
            x2="100"
            y2="130"
            stroke={line}
            strokeWidth="1.2"
            strokeLinecap="round"
            animate={{ opacity: isAuto ? 1 : 0.55 }}
            transition={{ duration: 0.35 }}
          />
          <rect
            x="30"
            y="40"
            width="20"
            height="20"
            rx="4"
            fill="var(--ok-bg-deep)"
            stroke={nodeStroke}
            strokeWidth="1.2"
          />
          <rect
            x="150"
            y="40"
            width="20"
            height="20"
            rx="4"
            fill="var(--ok-bg-deep)"
            stroke={nodeStroke}
            strokeWidth="1.2"
          />
          <motion.circle
            cx="100"
            cy="80"
            r="12"
            fill={hubFill}
            animate={
              isAuto
                ? { scale: [1, 1.12, 1], opacity: [1, 0.92, 1] }
                : { scale: 1, opacity: 0.85 }
            }
            transition={
              isAuto
                ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.3 }
            }
          />
          <rect
            x="90"
            y="120"
            width="20"
            height="20"
            rx="10"
            fill="var(--ok-bg-deep)"
            stroke={isAuto ? "oklch(0.55 0.2 265 / 0.5)" : "rgba(255,255,255,0.25)"}
            strokeWidth="1.2"
          />
          {isAuto && (
            <motion.circle
              cx="100"
              cy="80"
              r="18"
              fill="none"
              stroke="var(--ok-neon)"
              strokeWidth="0.8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0.35, 0], scale: [0.85, 1.35] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
            />
          )}
        </svg>
      </div>

      <motion.div
        key={mode}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="grid grid-cols-1 gap-1.5 text-[10px] leading-tight sm:text-[11px]"
      >
        {!isAuto ? (
          <>
            <div className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5">
              <div className="font-medium text-rose-200/90">{t.hours_bad}</div>
              <div className="text-zinc-500">{t.hours_bad_sub}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5">
              <div className="font-medium text-zinc-400">{t.tasks_bad}</div>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-lg border border-[var(--ok-neon)]/25 bg-[var(--ok-neon)]/10 px-2 py-1.5">
              <div className="font-semibold text-[var(--ok-neon)]">{t.hours_good}</div>
              <div className="text-zinc-500">{t.hours_good_sub}</div>
            </div>
            <div className="rounded-lg border border-[var(--ok-neon)]/20 bg-[var(--ok-neon)]/5 px-2 py-1.5">
              <div className="font-semibold text-emerald-200/95">{t.errors_good}</div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
