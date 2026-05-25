"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { useLang } from "@/components/lang";

type Tab = "canvas" | "runs";
type NodeState = "idle" | "running" | "done";

const copy = {
  es: {
    brand: "Oktae Flow",
    draft: "Borrador",
    live: "Activo",
    tab_canvas: "Editor",
    tab_runs: "Ejecuciones",
    trigger: "Webhook",
    trigger_sub: "POST /lead",
    filter: "IF",
    filter_sub: "email válido",
    notify: "Slack",
    notify_sub: "#ventas",
    crm: "HTTP",
    crm_sub: "POST CRM",
    execute: "Ejecutar flujo",
    running: "Ejecutando…",
    runs_title: "Últimas ejecuciones",
    col_time: "Hora",
    col_flow: "Flujo",
    col_status: "Estado",
    ok: "Listo",
    flow_name: "Lead → CRM",
    canvas_hint: "Arrastra para mover · demo",
    output_title: "Salida",
    output_idle: "Ejecuta el flujo para ver el registro aquí.",
    log_start: '> Workflow "Lead → CRM"',
    log_webhook: "✓ Webhook · 38 ms",
    log_if: "✓ IF · 12 ms",
    log_slack: "✓ Slack · 210 ms",
    log_http: "✓ HTTP · 94 ms",
    log_done: "— Listo · 4 nodos",
  },
  en: {
    brand: "Oktae Flow",
    draft: "Draft",
    live: "Active",
    tab_canvas: "Editor",
    tab_runs: "Runs",
    trigger: "Webhook",
    trigger_sub: "POST /lead",
    filter: "IF",
    filter_sub: "valid email",
    notify: "Slack",
    notify_sub: "#sales",
    crm: "HTTP",
    crm_sub: "POST CRM",
    execute: "Execute workflow",
    running: "Running…",
    runs_title: "Recent runs",
    col_time: "Time",
    col_flow: "Flow",
    col_status: "Status",
    ok: "OK",
    flow_name: "Lead → CRM",
    canvas_hint: "Drag to pan · demo",
    output_title: "Output",
    output_idle: "Run the workflow to see logs here.",
    log_start: '> Workflow "Lead → CRM"',
    log_webhook: "✓ Webhook · 38 ms",
    log_if: "✓ IF · 12 ms",
    log_slack: "✓ Slack · 210 ms",
    log_http: "✓ HTTP · 94 ms",
    log_done: "— Done · 4 nodes",
  },
} as const;

type RunRow = { id: string; at: string; flow: string; status: string };

function formatNow(lang: "es" | "en") {
  const d = new Date();
  return d.toLocaleTimeString(lang === "es" ? "es-GT" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function Wire({ lit, className }: { lit: boolean; className?: string }) {
  return (
    <svg
      className={`pointer-events-none min-w-[18px] flex-1 text-zinc-600 ${className ?? "min-h-[32px] max-h-[48px]"}`}
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d="M0,20 C28,6 72,34 100,20"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        className={lit ? "stroke-[var(--ok-neon)] opacity-95" : "stroke-current opacity-55"}
        style={{
          strokeDasharray: lit ? undefined : "6 5",
        }}
      />
    </svg>
  );
}

function N8nNode({
  title,
  sub,
  accent,
  state,
  showIn,
  showOut,
}: {
  title: string;
  sub: string;
  accent: string;
  state: NodeState;
  showIn: boolean;
  showOut: boolean;
}) {
  return (
    <div
      className={`relative z-10 flex w-[5rem] shrink-0 flex-col overflow-hidden rounded-md border bg-[#1a1d21] shadow-[0_2px_8px_rgba(0,0,0,0.45)] transition-[box-shadow,border-color] duration-200 sm:w-[5.75rem] ${
        state === "running"
          ? "border-[var(--ok-neon)]/80 shadow-[0_0_0_1px_rgba(184,255,46,0.35),0_4px_20px_rgba(184,255,46,0.12)]"
          : state === "done"
            ? "border-emerald-500/55"
            : "border-white/[0.12]"
      }`}
    >
      <div className="h-[3px] w-full shrink-0" style={{ background: accent }} />
      <div className="relative px-1.5 pb-1.5 pt-1 sm:px-2 sm:pb-2 sm:pt-1.5">
        <div className="flex items-start justify-between gap-0.5">
          <div className="min-w-0 text-[9px] font-semibold leading-tight text-white sm:text-[10px]">{title}</div>
          {state === "running" && (
            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-[var(--ok-neon)]" aria-hidden />
          )}
          {state === "done" && (
            <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" strokeWidth={2.5} aria-hidden />
          )}
        </div>
        <div className="mt-1 line-clamp-2 text-[8px] leading-snug text-zinc-500 sm:text-[9px]">{sub}</div>
      </div>
      {showIn && (
        <span
          className="absolute -left-[5px] top-1/2 z-20 h-2 w-2 -translate-y-1/2 rounded-full border border-white/25 bg-[#1a1d21]"
          aria-hidden
        />
      )}
      {showOut && (
        <span
          className="absolute -right-[5px] top-1/2 z-20 h-2 w-2 -translate-y-1/2 rounded-full border border-white/35 bg-[#1a1d21]"
          aria-hidden
        />
      )}
    </div>
  );
}

export function AutomationLaptopUI() {
  const { lang } = useLang();
  const t = copy[lang];
  const [tab, setTab] = useState<Tab>("canvas");
  const [nodeStates, setNodeStates] = useState<NodeState[]>(() => ["idle", "idle", "idle", "idle"]);
  const [busy, setBusy] = useState(false);
  const [logs, setLogs] = useState<string[]>(() => [copy.es.output_idle]);
  const [runs, setRuns] = useState<RunRow[]>(() => [
    { id: "1", at: "09:41:02", flow: copy.es.flow_name, status: copy.es.ok },
    { id: "2", at: "09:12:18", flow: copy.es.flow_name, status: copy.es.ok },
  ]);
  const runSeq = useRef(0);
  const busyRef = useRef(false);
  const playRef = useRef<() => Promise<void>>(async () => {});

  const playSequence = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setTab("canvas");
    setNodeStates(["idle", "idle", "idle", "idle"]);
    const tr = copy[lang];
    const stepLogs = [tr.log_webhook, tr.log_if, tr.log_slack, tr.log_http];
    setLogs([tr.log_start]);
    const n = 4;

    for (let i = 0; i < n; i++) {
      setNodeStates((prev) => {
        const next = [...prev];
        next[i] = "running";
        return next;
      });
      await new Promise((r) => window.setTimeout(r, 560));
      setNodeStates((prev) => {
        const next = [...prev];
        next[i] = "done";
        return next;
      });
      setLogs((prev) => [...prev, stepLogs[i]]);
      await new Promise((r) => window.setTimeout(r, 200));
    }

    await new Promise((r) => window.setTimeout(r, 450));
    setNodeStates(["idle", "idle", "idle", "idle"]);
    setLogs((prev) => [...prev, tr.log_done]);

    runSeq.current += 1;
    setRuns((prev) => [
      {
        id: `r-${runSeq.current}`,
        at: formatNow(lang),
        flow: tr.flow_name,
        status: tr.ok,
      },
      ...prev.slice(0, 7),
    ]);

    busyRef.current = false;
    setBusy(false);
  }, [lang]);

  playRef.current = playSequence;

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.hidden) return;
      void playRef.current();
    }, 12000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const tr = copy[lang];
    setRuns((prev) =>
      prev.map((r) =>
        r.id === "1" || r.id === "2" ? { ...r, flow: tr.flow_name, status: tr.ok } : r
      )
    );
    setLogs((prev) => {
      if (prev.length === 1 && prev[0] === copy.es.output_idle) return [tr.output_idle];
      if (prev.length === 1 && prev[0] === copy.en.output_idle) return [tr.output_idle];
      return prev;
    });
  }, [lang]);

  const accents = ["#3b82f6", "#f59e0b", "#a78bfa", "#34d399"] as const;
  const nodesMeta = [
    { title: t.trigger, sub: t.trigger_sub },
    { title: t.filter, sub: t.filter_sub },
    { title: t.notify, sub: t.notify_sub },
    { title: t.crm, sub: t.crm_sub },
  ] as const;

  return (
    <div className="flex h-full min-h-0 w-full select-none flex-col bg-[#0b1220] text-[10px] leading-tight text-zinc-200 sm:text-[11px]">
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-[#0c1220] px-2 py-1.5 sm:px-3 sm:py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--ok-neon)] shadow-[0_0_8px_rgba(184,255,46,0.45)]" />
          <span className="truncate font-semibold tracking-tight text-white">{t.brand}</span>
          <span className="hidden rounded border border-white/10 px-1.5 py-0.5 text-[9px] text-zinc-500 sm:inline">
            {t.draft}
          </span>
        </div>
        <span className="shrink-0 rounded-full border border-[var(--ok-neon)]/35 bg-[var(--ok-neon)]/10 px-2 py-0.5 text-[9px] font-medium text-[var(--ok-neon)]">
          {t.live}
        </span>
      </header>

      <div className="flex shrink-0 gap-1 border-b border-white/10 px-2 py-1 sm:px-3">
        {(
          [
            ["canvas", t.tab_canvas],
            ["runs", t.tab_runs],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-md px-2 py-1 text-[10px] font-medium transition sm:px-3 ${
              tab === id ? "bg-white/10 text-white" : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-2 sm:p-2">
        {tab === "canvas" && (
          <div className="flex min-h-0 flex-1 flex-col gap-2">
            <div className="flex shrink-0 items-center justify-between gap-2">
              <span className="text-[9px] font-medium uppercase tracking-wide text-zinc-500">
                {t.flow_name}
              </span>
              <span className="hidden text-[8px] text-zinc-600 sm:inline">{t.canvas_hint}</span>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-2">
              <div
                className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-lg border border-white/[0.08] bg-[#080c14]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)",
                  backgroundSize: "14px 14px",
                }}
              >
                <div className="relative z-10 flex items-center justify-center px-1 py-4 sm:px-2 sm:py-5">
                  <div className="relative z-10 flex w-full max-w-[100%] items-center justify-between gap-0">
                    {nodesMeta.map((meta, i) => (
                      <div key={meta.title} className="contents">
                        <N8nNode
                          title={meta.title}
                          sub={meta.sub}
                          accent={accents[i]}
                          state={nodeStates[i]}
                          showIn={i > 0}
                          showOut={i < nodesMeta.length - 1}
                        />
                        {i < nodesMeta.length - 1 && (
                          <Wire
                            lit={nodeStates[i] === "done" || nodeStates[i] === "running"}
                            className="min-h-[40px] max-h-[52px] self-center"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex min-h-0 flex-col border-t border-white/10 bg-black/40">
                  <div className="shrink-0 border-b border-white/5 px-2 py-1 font-mono text-[9px] uppercase tracking-wide text-zinc-500">
                    {t.output_title}
                  </div>
                  <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2 font-mono text-[8px] leading-relaxed text-zinc-400 sm:text-[9px]">
                    {logs.map((line, idx) => (
                      <div key={`${idx}-${line.slice(0, 24)}`} className="whitespace-pre-wrap break-words">
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={busy}
                onClick={() => void playSequence()}
                className="flex w-full shrink-0 items-center justify-center gap-2 rounded-md border border-orange-500/50 bg-gradient-to-b from-[#e85d2c] to-[#c2410c] py-1.5 text-[10px] font-semibold text-white shadow-[0_2px_8px_rgba(234,88,12,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-55 sm:py-2"
              >
                {busy ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                    {t.running}
                  </>
                ) : (
                  <>
                    <span className="inline-block h-2 w-2 rounded-full bg-white/90" aria-hidden />
                    {t.execute}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {tab === "runs" && (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="mb-2 shrink-0 text-[10px] font-semibold text-white">{t.runs_title}</div>
            <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-white/10">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.04] text-[9px] uppercase tracking-wide text-zinc-500">
                    <th className="p-1.5 sm:p-2">{t.col_time}</th>
                    <th className="p-1.5 sm:p-2">{t.col_flow}</th>
                    <th className="p-1.5 text-right sm:p-2">{t.col_status}</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((r) => (
                    <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                      <td className="p-1.5 font-mono text-zinc-400 sm:p-2">{r.at}</td>
                      <td className="p-1.5 text-white sm:p-2">{r.flow}</td>
                      <td className="p-1.5 text-right sm:p-2">
                        <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] text-emerald-300">
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
