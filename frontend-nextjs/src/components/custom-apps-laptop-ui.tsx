"use client";

import { useMemo, useState } from "react";
import { useLang } from "@/components/lang";

type ViewId = "overview" | "orders";

const copy = {
  es: {
    brand: "Oktae Ops",
    search: "Buscar…",
    nav_overview: "Resumen",
    nav_orders: "Pedidos",
    nav_clients: "Clientes",
    nav_settings: "Ajustes",
    kpi_orders: "Pedidos hoy",
    kpi_revenue: "Ingresos",
    kpi_pending: "Pendientes",
    chart: "Volumen (7 días)",
    table_title: "Últimos pedidos",
    col_id: "ID",
    col_customer: "Cliente",
    col_status: "Estado",
    col_total: "Total",
    status_done: "Listo",
    status_ship: "En ruta",
    status_new: "Nuevo",
    export: "Exportar",
    saved: "Listo",
    selected: (n: number) => `${n} seleccionado(s)`,
    live: "En vivo",
  },
  en: {
    brand: "Oktae Ops",
    search: "Search…",
    nav_overview: "Overview",
    nav_orders: "Orders",
    nav_clients: "Clients",
    nav_settings: "Settings",
    kpi_orders: "Orders today",
    kpi_revenue: "Revenue",
    kpi_pending: "Pending",
    chart: "Volume (7 days)",
    table_title: "Recent orders",
    col_id: "ID",
    col_customer: "Customer",
    col_status: "Status",
    col_total: "Total",
    status_done: "Done",
    status_ship: "In transit",
    status_new: "New",
    export: "Export",
    saved: "Saved",
    selected: (n: number) => `${n} selected`,
    live: "Live",
  },
} as const;

/** Textos compartidos con el mockup móvil del hero. */
export { copy as customAppsDemoCopy };

type Row = { id: string; customer: string; status: "done" | "ship" | "new"; total: string };

export function CustomAppsLaptopUI() {
  const { lang } = useLang();
  const t = copy[lang];

  const [view, setView] = useState<ViewId>("overview");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [savedFlash, setSavedFlash] = useState(false);
  const [query, setQuery] = useState("");

  const rows: Row[] = useMemo(
    () => [
      { id: "4821", customer: "Atlas Fresh", status: "ship", total: "$18.2k" },
      { id: "4817", customer: "Norte Labs", status: "done", total: "$4.1k" },
      { id: "4812", customer: "Helio", status: "new", total: "$920" },
      { id: "4809", customer: "Calexa", status: "done", total: "$32.0k" },
    ],
    []
  );

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) => r.id.toLowerCase().includes(q) || r.customer.toLowerCase().includes(q)
    );
  }, [rows, query]);

  const chartHeightsPx = [26, 42, 30, 52, 36, 46, 34];

  function statusLabel(s: Row["status"]) {
    if (s === "done") return t.status_done;
    if (s === "ship") return t.status_ship;
    return t.status_new;
  }

  const toggleRow = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onExport = () => {
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1400);
  };

  return (
    <div className="flex h-full min-h-0 w-full select-none bg-[#0b1220] text-[10px] leading-tight text-zinc-200 sm:text-[11px]">
      <aside className="flex w-[22%] min-w-[72px] max-w-[140px] flex-col border-r border-white/10 bg-[#080d18] px-1.5 py-2 sm:px-2 sm:py-3">
        <div className="mb-2 flex items-center gap-1.5 px-1 sm:mb-3">
          <span className="h-5 w-5 shrink-0 rounded-md bg-[var(--ok-neon)]/90 shadow-[0_0_12px_rgba(184,255,46,0.35)]" />
          <span className="truncate font-semibold tracking-tight text-white">{t.brand}</span>
        </div>
        <nav className="flex flex-col gap-0.5">
          {(
            [
              ["overview", t.nav_overview],
              ["orders", t.nav_orders],
              ["clients", t.nav_clients],
              ["settings", t.nav_settings],
            ] as const
          ).map(([id, label]) => {
            const active =
              (id === "overview" && view === "overview") || (id === "orders" && view === "orders");
            const disabled = id === "clients" || id === "settings";
            return (
              <button
                key={id}
                type="button"
                disabled={disabled}
                onClick={() => {
                  if (id === "overview" || id === "orders") setView(id);
                }}
                className={`rounded-md px-1.5 py-1.5 text-left transition sm:px-2 ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                } ${disabled ? "cursor-not-allowed opacity-40 hover:bg-transparent hover:text-zinc-500" : ""}`}
              >
                {label}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto hidden border-t border-white/10 pt-2 text-[9px] text-zinc-600 sm:block">
          v0.4.2 · {t.live}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-white/10 bg-[#0c1220] px-2 py-1.5 sm:px-3 sm:py-2">
          <div className="relative min-w-0 flex-1">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.search}
              className="w-full rounded-lg border border-white/10 bg-black/30 py-1 pl-2 pr-2 text-zinc-200 placeholder:text-zinc-600 focus:border-[var(--ok-neon)]/50 focus:outline-none"
            />
          </div>
          <span className="hidden h-6 w-6 shrink-0 rounded-full border border-white/15 bg-gradient-to-br from-zinc-600 to-zinc-800 sm:block" />
        </header>

        <div className="min-h-0 flex-1 overflow-auto p-2 sm:p-3">
          {view === "overview" && (
            <>
              <div className="mb-2 grid grid-cols-3 gap-1.5 sm:mb-3 sm:gap-2">
                {[
                  { label: t.kpi_orders, value: "128", delta: "+12%" },
                  { label: t.kpi_revenue, value: "$284k", delta: "+4%" },
                  { label: t.kpi_pending, value: "9", delta: "−2" },
                ].map((k) => (
                  <div
                    key={k.label}
                    className="rounded-lg border border-white/10 bg-black/25 px-1.5 py-1.5 sm:px-2 sm:py-2"
                  >
                    <div className="text-[9px] text-zinc-500 sm:text-[10px]">{k.label}</div>
                    <div className="mt-0.5 flex items-baseline justify-between gap-1">
                      <span className="text-sm font-semibold text-white sm:text-base">{k.value}</span>
                      <span className="text-[9px] text-[var(--ok-neon)]">{k.delta}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-white/10 bg-black/20 p-2 sm:p-3">
                <div className="mb-2 text-[9px] font-medium uppercase tracking-wide text-zinc-500 sm:text-[10px]">
                  {t.chart}
                </div>
                <div className="flex h-16 items-end justify-between gap-1 sm:h-[4.5rem] sm:gap-1.5">
                  {chartHeightsPx.map((hpx, i) => (
                    <button
                      key={i}
                      type="button"
                      className="group min-w-0 flex-1 max-w-[14%] rounded-t-sm bg-white/10 transition hover:bg-[var(--ok-neon)]/35"
                      style={{ height: hpx }}
                      aria-label={`Day ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setView("orders")}
                className="mt-2 w-full rounded-lg border border-white/10 py-1.5 text-[10px] text-zinc-400 transition hover:border-[var(--ok-neon)]/40 hover:text-white sm:mt-3"
              >
                {t.table_title} →
              </button>
            </>
          )}

          {view === "orders" && (
            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-[11px] font-semibold text-white sm:text-xs">{t.table_title}</h2>
                <div className="flex items-center gap-2">
                  {selected.size > 0 && (
                    <span className="text-[9px] text-zinc-500">{t.selected(selected.size)}</span>
                  )}
                  <button
                    type="button"
                    onClick={onExport}
                    className="rounded-md border border-[var(--ok-neon)]/40 bg-[var(--ok-neon)]/10 px-2 py-1 text-[9px] font-medium text-[var(--ok-neon)] transition hover:bg-[var(--ok-neon)]/20"
                  >
                    {savedFlash ? t.saved : t.export}
                  </button>
                </div>
              </div>
              <div className="overflow-hidden rounded-lg border border-white/10">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.04] text-[9px] uppercase tracking-wide text-zinc-500">
                      <th className="w-8 p-1.5 sm:p-2" />
                      <th className="p-1.5 sm:p-2">{t.col_id}</th>
                      <th className="p-1.5 sm:p-2">{t.col_customer}</th>
                      <th className="p-1.5 sm:p-2">{t.col_status}</th>
                      <th className="p-1.5 text-right sm:p-2">{t.col_total}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row) => {
                      const isSel = selected.has(row.id);
                      return (
                        <tr
                          key={row.id}
                          className={`border-b border-white/5 transition ${
                            isSel ? "bg-[var(--ok-neon)]/8" : "hover:bg-white/[0.03]"
                          }`}
                        >
                          <td className="p-1.5 sm:p-2">
                            <input
                              type="checkbox"
                              checked={isSel}
                              onChange={() => toggleRow(row.id)}
                              className="accent-[var(--ok-neon)]"
                            />
                          </td>
                          <td className="p-1.5 font-mono text-zinc-400 sm:p-2">#{row.id}</td>
                          <td className="p-1.5 text-white sm:p-2">{row.customer}</td>
                          <td className="p-1.5 sm:p-2">
                            <span
                              className={`inline-block rounded-full px-1.5 py-0.5 text-[9px] ${
                                row.status === "done"
                                  ? "bg-emerald-500/15 text-emerald-300"
                                  : row.status === "ship"
                                    ? "bg-sky-500/15 text-sky-300"
                                    : "bg-amber-500/15 text-amber-200"
                              }`}
                            >
                              {statusLabel(row.status)}
                            </span>
                          </td>
                          <td className="p-1.5 text-right font-medium text-zinc-200 sm:p-2">{row.total}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
