"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRightLeft,
  Bot,
  MessageCircle,
  Plug,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/components/lang";

const EVENTS_ES = [
  "Nuevo lead capturado",
  "Contacto creado en CRM",
  "Etapa → Calificado",
  "Nota de conversación sync",
  "Tarea al vendedor",
] as const;

const EVENTS_EN = [
  "New lead captured",
  "Contact created in CRM",
  "Stage → Qualified",
  "Conversation note synced",
  "Task for salesperson",
] as const;

const COPY = {
  es: {
    title: "Canales conectados",
    subtitle: "Chatbot · WhatsApp → CRM en tiempo real",
    chatbot: "Chatbot IA",
    channel: "WhatsApp · Web",
    bridge: "Oktae Sync",
    crm: "Tu CRM",
    footer: "Un solo recorrido para el prospecto — sin copiar y pegar.",
    events: EVENTS_ES,
  },
  en: {
    title: "Connected channels",
    subtitle: "Chatbot · WhatsApp → CRM in real time",
    chatbot: "AI chatbot",
    channel: "WhatsApp · Web",
    bridge: "Oktae Sync",
    crm: "Your CRM",
    footer: "One prospect journey — no copy-paste.",
    events: EVENTS_EN,
  },
};

const CRMS = [
  { id: "hubspot", name: "HubSpot" },
  { id: "salesforce", name: "Salesforce" },
  { id: "pipedrive", name: "Pipedrive" },
] as const;

type CrmId = (typeof CRMS)[number]["id"];

type LogItem = { id: number; text: string; crm: string };

/**
 * Visual de integraciones: chatbot / canal → sync → CRM
 * con logos de HubSpot, Salesforce y Pipedrive.
 */
export function ChannelsIntegrationsMock({
  className,
  active = true,
}: {
  className?: string;
  active?: boolean;
}) {
  const { lang } = useLang();
  const t = COPY[lang] ?? COPY.es;
  const events = t.events;

  const [pulse, setPulse] = useState(0);
  const [crmIdx, setCrmIdx] = useState(0);
  const [log, setLog] = useState<LogItem[]>([]);

  useEffect(() => {
    if (!active) {
      setPulse(0);
      setCrmIdx(0);
      setLog([]);
      return;
    }

    let step = 0;
    let idCounter = 0;

    // primer evento inmediato
    const push = () => {
      const text = events[step % events.length]!;
      const crm = CRMS[step % CRMS.length]!;
      idCounter += 1;
      setLog((prev) =>
        [{ id: idCounter, text, crm: crm.name }, ...prev].slice(0, 4)
      );
      setCrmIdx(step % CRMS.length);
      setPulse((p) => p + 1);
      step += 1;
    };

    push();
    const interval = window.setInterval(push, 1600);

    return () => window.clearInterval(interval);
  }, [active, lang, events]);

  const flowActive = active && pulse > 0;
  const activeCrm = CRMS[crmIdx]!;

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col overflow-hidden bg-[#0a0d12]",
        className
      )}
      aria-hidden
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,oklch(0.55_0.2_265_/_0.2),transparent_55%)]"
        aria-hidden
      />

      <div className="relative z-10 flex shrink-0 items-center justify-between gap-2 border-b border-white/[0.06] px-3 py-2.5 sm:px-4">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[var(--ok-indigo)]/25 text-[var(--ok-indigo)]">
              <Plug className="h-3 w-3" />
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
          <ArrowRightLeft className="h-3 w-3 text-[var(--ok-emphasis)]" />
          2-way
        </span>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-center gap-3 overflow-hidden px-3 py-3 sm:px-4 sm:py-3">
        <div className="relative flex shrink-0 items-center justify-between gap-2 sm:gap-3">
          <NodeCard
            icon={
              <span className="relative flex h-full w-full items-center justify-center">
                <Bot className="absolute h-3.5 w-3.5 text-[var(--ok-indigo)]" />
                <WhatsAppMark className="absolute -bottom-0.5 -right-0.5 h-3 w-3" />
              </span>
            }
            title={t.chatbot}
            sub={t.channel}
            accent="indigo"
            active={flowActive}
          />

          <div className="relative flex min-w-0 flex-1 flex-col items-center px-1">
            <div className="relative h-[2px] w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                key={pulse}
                className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-gradient-to-r from-transparent via-[var(--ok-indigo)] to-[var(--ok-emphasis)]"
                initial={{ x: "-100%" }}
                animate={{ x: "320%" }}
                transition={{ duration: 1.15, ease: "linear" }}
              />
            </div>
            <div className="mt-2 rounded-full border border-white/10 bg-[#121820] px-2 py-0.5 text-[9px] font-medium text-ok-mute sm:text-[10px]">
              {t.bridge}
            </div>
            <AnimatePresence mode="popLayout">
              {flowActive && (
                <motion.div
                  key={`pkt-${pulse}`}
                  className="absolute -top-1 left-0 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--ok-indigo)] text-white shadow-lg shadow-[var(--ok-indigo)]/30"
                  initial={{ left: "8%", opacity: 0, scale: 0.6 }}
                  animate={{ left: "78%", opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
                >
                  <UserRound className="h-2.5 w-2.5" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <NodeCard
            icon={<CrmLogo id={activeCrm.id} className="h-5 w-5" />}
            title={activeCrm.name}
            sub={t.crm}
            accent="amber"
            active={flowActive}
            delayGlow
          />
        </div>

        {/* Live events — log apilado (siempre visible el movimiento) */}
        <div className="flex min-h-0 shrink-0 flex-col rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-ok-mute">
              <MessageCircle className="h-3 w-3" />
              Live events
            </div>
            <span className="flex items-center gap-1 text-[9px] text-[var(--ok-indigo)]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--ok-indigo)]" />
              live
            </span>
          </div>
          <div className="flex h-[5.5rem] flex-col gap-1 overflow-hidden sm:h-[5.75rem]">
            <AnimatePresence initial={false} mode="popLayout">
              {log.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: -12, height: 0 }}
                  animate={{ opacity: i === 0 ? 1 : 0.45 - i * 0.08, y: 0, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="flex min-h-[1.25rem] items-center gap-1.5 overflow-hidden"
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 shrink-0 rounded-full",
                      i === 0 ? "bg-[var(--ok-indigo)]" : "bg-white/25"
                    )}
                  />
                  <p
                    className={cn(
                      "truncate text-[11px] leading-tight sm:text-[12px]",
                      i === 0 ? "font-medium text-ok-text" : "text-ok-mute"
                    )}
                  >
                    {item.text}
                    <span className="text-ok-mute"> · {item.crm}</span>
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
            {log.length === 0 && (
              <p className="text-[11px] text-ok-mute">…</p>
            )}
          </div>
        </div>
      </div>

      <div className="relative z-10 shrink-0 border-t border-white/[0.06] px-3 py-2 text-[10px] leading-snug text-ok-mute sm:px-4 sm:text-[11px]">
        {t.footer}
      </div>
    </div>
  );
}

function NodeCard({
  icon,
  title,
  sub,
  accent,
  active,
  delayGlow,
}: {
  icon: ReactNode;
  title: string;
  sub: string;
  accent: "indigo" | "amber";
  active?: boolean;
  delayGlow?: boolean;
}) {
  const ring =
    accent === "indigo"
      ? "border-[var(--ok-indigo)]/50 shadow-[0_0_20px_oklch(0.55_0.2_265_/_0.25)]"
      : "border-[var(--ok-emphasis)]/45 shadow-[0_0_20px_oklch(0.78_0.16_70_/_0.2)]";
  const iconBg =
    accent === "indigo"
      ? "bg-[var(--ok-indigo)]/20 text-[var(--ok-indigo)]"
      : "bg-white/[0.06] text-ok-text";

  return (
    <motion.div
      animate={{
        borderColor: active
          ? accent === "indigo"
            ? "oklch(0.55 0.2 265 / 0.55)"
            : "oklch(0.78 0.16 70 / 0.5)"
          : "rgba(255,255,255,0.08)",
      }}
      transition={{ delay: delayGlow && active ? 0.35 : 0, duration: 0.35 }}
      className={cn(
        "flex w-[6.5rem] shrink-0 flex-col items-center rounded-xl border bg-[#121820] px-2 py-3 text-center sm:w-[7.75rem] sm:px-2.5",
        active && ring
      )}
    >
      <span
        className={cn(
          "mb-1.5 flex h-9 w-9 items-center justify-center rounded-lg",
          iconBg
        )}
      >
        {icon}
      </span>
      <p className="text-[10px] font-semibold leading-tight text-ok-text sm:text-[11px]">
        {title}
      </p>
      <p className="mt-0.5 text-[8px] leading-tight text-ok-mute sm:text-[9px]">
        {sub}
      </p>
    </motion.div>
  );
}

function CrmLogo({ id, className }: { id: CrmId; className?: string }) {
  if (id === "hubspot") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path
          fill="#FF7A59"
          d="M18.16 8.83V6.43a1.86 1.86 0 0 0 .92-1.6 1.88 1.88 0 1 0-3.75 0c0 .66.34 1.24.86 1.58v2.44a5.33 5.33 0 0 0-2.74 1.2l-7.2-5.58a2.4 2.4 0 0 0 .1-.67 2.42 2.42 0 1 0-2.42 2.42c.5 0 .95-.15 1.34-.4l7.1 5.5a5.35 5.35 0 0 0-.06.76c0 .5.07.98.2 1.44L8.1 16.35a2.1 2.1 0 0 0-1.3-.46 2.12 2.12 0 1 0 2.12 2.12c0-.35-.09-.68-.24-.97l4.3-3.28c.63.7 1.48 1.22 2.44 1.48v2.53a1.87 1.87 0 1 0 1.88-1.6 1.86 1.86 0 0 0-.94 1.58v-2.52a5.3 5.3 0 0 0 2.08-4.17 5.32 5.32 0 0 0-2.26-4.28z"
        />
      </svg>
    );
  }
  if (id === "salesforce") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path
          fill="#00A1E0"
          d="M10.3 6.2c.7-1 1.8-1.6 3-1.6 1.3 0 2.5.7 3.2 1.8.6-.3 1.3-.4 2-.4 2.3 0 4.1 1.9 4.1 4.2 0 .2 0 .4-.05.6 1.3.5 2.2 1.8 2.2 3.3 0 1.9-1.6 3.5-3.5 3.5H6.1c-2.4 0-4.3-1.9-4.3-4.3 0-1.8 1.1-3.3 2.7-4 .2-2.1 2-3.8 4.2-3.8.6 0 1.2.1 1.7.4z"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#017737"
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3.2c1.55 0 2.8 1.12 2.8 2.5S13.55 10.2 12 10.2 9.2 9.08 9.2 7.7 10.45 5.2 12 5.2zM12 19.2c-2.6 0-4.9-1.33-6.2-3.35.03-2.05 4.13-3.17 6.2-3.17s6.17 1.12 6.2 3.17c-1.3 2.02-3.6 3.35-6.2 3.35z"
      />
    </svg>
  );
}

function WhatsAppMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="11" fill="#25D366" />
      <path
        fill="#fff"
        d="M16.6 14.2c-.2-.1-1.3-.6-1.5-.7-.2-.1-.4-.1-.5.1-.2.2-.6.7-.7.9-.1.2-.3.2-.5.1-.2-.1-.9-.3-1.7-1.1-.6-.6-1.1-1.3-1.2-1.5-.1-.2 0-.4.1-.5l.4-.4c.1-.1.1-.3.1-.4 0-.1 0-.3-.1-.4-.1-.1-.5-1.3-.7-1.8-.2-.5-.4-.4-.5-.4h-.4c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.3c.1.1 1.6 2.4 3.8 3.4 1.4.6 1.9.6 2.6.5.4-.1 1.3-.5 1.5-1.1.2-.5.2-1 .1-1.1 0-.1-.2-.2-.4-.3z"
      />
    </svg>
  );
}
