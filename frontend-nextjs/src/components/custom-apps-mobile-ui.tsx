"use client";

import { useMemo, useState } from "react";
import { useLang } from "@/components/lang";
import { customAppsDemoCopy } from "@/components/custom-apps-laptop-ui";

type Tab = "overview" | "orders";

const rowsMobile = [
  { id: "4821", customer: "Atlas", status: "ship" as const, total: "$18.2k" },
  { id: "4817", customer: "Norte", status: "done" as const, total: "$4.1k" },
  { id: "4812", customer: "Helio", status: "new" as const, total: "$920" },
];

export function CustomAppsMobileUI() {
  const { lang } = useLang();
  const t = customAppsDemoCopy[lang];
  const [tab, setTab] = useState<Tab>("overview");

  const chartHeightsPx = useMemo(() => [22, 36, 26, 44, 30, 40, 28], []);

  function statusLabel(s: (typeof rowsMobile)[0]["status"]) {
    if (s === "done") return t.status_done;
    if (s === "ship") return t.status_ship;
    return t.status_new;
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-[#0b1220] text-[8px] leading-tight text-zinc-200">
      <header className="shrink-0 border-b border-white/10 bg-[#0c1220] px-2 pb-2 pt-1">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1">
            <span className="h-3.5 w-3.5 shrink-0 rounded-md bg-[var(--ok-neon)]/90 shadow-[0_0_8px_rgba(184,255,46,0.3)]" />
            <span className="truncate font-semibold text-white">{t.brand}</span>
          </div>
          <span className="h-5 w-5 shrink-0 rounded-full border border-white/15 bg-gradient-to-br from-zinc-600 to-zinc-800" />
        </div>
        <input
          type="search"
          readOnly
          placeholder={t.search}
          className="w-full rounded-md border border-white/10 bg-black/30 py-1 pl-1.5 text-[8px] text-zinc-200 placeholder:text-zinc-600"
        />
      </header>

      <div className="min-h-0 flex-1 overflow-auto px-2 py-2">
        {tab === "overview" && (
          <>
            <div className="mb-2 space-y-1.5">
              {[
                { label: t.kpi_orders, value: "128", delta: "+12%" },
                { label: t.kpi_revenue, value: "$284k", delta: "+4%" },
                { label: t.kpi_pending, value: "9", delta: "−2" },
              ].map((k) => (
                <div
                  key={k.label}
                  className="flex items-center justify-between rounded-md border border-white/10 bg-black/25 px-2 py-1.5"
                >
                  <div>
                    <div className="text-[7px] text-zinc-500">{k.label}</div>
                    <div className="text-xs font-semibold text-white">{k.value}</div>
                  </div>
                  <span className="text-[7px] text-[var(--ok-neon)]">{k.delta}</span>
                </div>
              ))}
            </div>
            <div className="rounded-md border border-white/10 bg-black/20 p-2">
              <div className="mb-1.5 text-[7px] font-medium uppercase tracking-wide text-zinc-500">
                {t.chart}
              </div>
              <div className="flex h-12 items-end justify-between gap-0.5">
                {chartHeightsPx.map((hpx, i) => (
                  <div
                    key={i}
                    className="min-w-0 flex-1 rounded-t-sm bg-white/10"
                    style={{ height: hpx }}
                  />
                ))}
              </div>
            </div>
          </>
        )}
        {tab === "orders" && (
          <div>
            <div className="mb-1.5 text-[9px] font-semibold text-white">{t.table_title}</div>
            <div className="space-y-1">
              {rowsMobile.map((row) => (
                <div
                  key={row.id}
                  className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.03] px-2 py-1.5"
                >
                  <div className="min-w-0">
                    <div className="font-mono text-[7px] text-zinc-500">#{row.id}</div>
                    <div className="truncate text-[9px] text-white">{row.customer}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span
                      className={`inline-block rounded-full px-1 py-0.5 text-[7px] ${
                        row.status === "done"
                          ? "bg-emerald-500/15 text-emerald-300"
                          : row.status === "ship"
                            ? "bg-sky-500/15 text-sky-300"
                            : "bg-amber-500/15 text-amber-200"
                      }`}
                    >
                      {statusLabel(row.status)}
                    </span>
                    <div className="text-[8px] font-medium text-zinc-300">{row.total}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <nav className="flex shrink-0 border-t border-white/10 bg-[#080d18] px-1 py-1.5">
        {(
          [
            ["overview", t.nav_overview],
            ["orders", t.nav_orders],
          ] as const
        ).map(([id, label]) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex-1 rounded-md py-1.5 text-center text-[8px] font-medium transition ${
                active ? "bg-white/10 text-white" : "text-zinc-500"
              }`}
            >
              {label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
