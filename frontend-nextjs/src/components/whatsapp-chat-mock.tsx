"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCheck, Phone, Video, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/components/lang";

type Msg = { from: "bot" | "user"; text: string };

const TRANSCRIPTS: Record<"es" | "en", Msg[]> = {
  es: [
    { from: "user", text: "Hola, vi su anuncio en Instagram. ¿Tienen citas esta semana?" },
    {
      from: "bot",
      text: "¡Hola! 👋 Soy el asistente de *Tu Marca*. Sí, tenemos cupos. ¿Prefieres martes o jueves?",
    },
    { from: "user", text: "Jueves por la tarde" },
    {
      from: "bot",
      text: "Perfecto. Tengo 3:00 p.m. o 5:30 p.m. ¿Cuál te acomoda?",
    },
    { from: "user", text: "5:30 p.m." },
    {
      from: "bot",
      text: "Listo ✓ Te agendé el jueves 5:30 p.m. Te envío la confirmación aquí y un recordatorio 2h antes.",
    },
  ],
  en: [
    { from: "user", text: "Hi — saw your Instagram ad. Any slots this week?" },
    {
      from: "bot",
      text: "Hi! 👋 I’m *Your Brand*’s assistant. Yes — Tue or Thu works better?",
    },
    { from: "user", text: "Thursday afternoon" },
    {
      from: "bot",
      text: "Great. I have 3:00 p.m. or 5:30 p.m. Which one?",
    },
    { from: "user", text: "5:30 p.m." },
    {
      from: "bot",
      text: "Booked ✓ Thursday 5:30 p.m. Confirmation here + a reminder 2h before.",
    },
  ],
};

/**
 * Simulación compacta de chat WhatsApp / Meta Business.
 * Ideal para previews de servicio “Chatbots con IA”.
 */
export function WhatsAppChatMock({
  className,
  active = true,
  compact = false,
}: {
  className?: string;
  /** Si es true, anima los mensajes en secuencia */
  active?: boolean;
  compact?: boolean;
}) {
  const { lang } = useLang();
  const all = TRANSCRIPTS[lang] ?? TRANSCRIPTS.es;
  const [visible, setVisible] = useState(0);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (!active) {
      setVisible(0);
      setTyping(false);
      return;
    }

    let cancelled = false;
    let i = 0;
    let timer: number;
    setVisible(0);
    setTyping(false);

    // Compact (carrusel móvil): más lento para que se lea bien
    const pauseBot = compact ? 900 : 650;
    const pauseNext = compact ? 1400 : 1000;
    const pauseUser = compact ? 1200 : 850;
    const pauseStart = compact ? 500 : 350;

    const schedule = (fn: () => void, ms: number) => {
      timer = window.setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
    };

    const step = () => {
      if (cancelled || i >= all.length) return;
      const next = all[i]!;
      if (next.from === "bot" && i > 0) {
        setTyping(true);
        schedule(() => {
          setTyping(false);
          i += 1;
          setVisible(i);
          schedule(step, pauseNext);
        }, pauseBot);
      } else {
        i += 1;
        setTyping(false);
        setVisible(i);
        schedule(step, pauseUser);
      }
    };

    schedule(step, pauseStart);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [active, lang, all, compact]);

  const shown = all.slice(0, visible);

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col overflow-hidden bg-[#0b141a]",
        className
      )}
      aria-hidden
    >
      {/* Header estilo WhatsApp */}
      <div className="flex shrink-0 items-center gap-2.5 bg-[#1f2c34] px-3 py-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00a884] to-[#025c4c] text-sm font-semibold text-white">
          AI
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-[#e9edef]">
            {lang === "es" ? "Asistente comercial" : "Sales assistant"}
          </p>
          <p className="truncate text-[11px] text-[#8696a0]">
            {lang === "es" ? "en línea · WhatsApp Business" : "online · WhatsApp Business"}
          </p>
        </div>
        <div className="flex items-center gap-3 text-[#aebac1]">
          <Video className="h-4 w-4 opacity-80" />
          <Phone className="h-4 w-4 opacity-80" />
          <MoreVertical className="h-4 w-4 opacity-80" />
        </div>
      </div>

      {/* Fondo chat WA-like */}
      <div
        className={cn(
          "relative flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden px-2.5 py-3 sm:px-3",
          compact ? "gap-1" : "gap-1.5"
        )}
        style={{
          backgroundColor: "#0b141a",
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        <div className="mx-auto mb-1 rounded-full bg-[#182229] px-2.5 py-0.5 text-[10px] text-[#8696a0]">
          {lang === "es" ? "Hoy" : "Today"}
        </div>

        <div className="flex min-h-0 flex-1 flex-col justify-end gap-1.5 overflow-hidden">
          <AnimatePresence initial={false}>
            {shown.map((m, idx) => {
              const isUser = m.from === "user";
              return (
                <motion.div
                  key={`${lang}-${idx}-${m.text.slice(0, 12)}`}
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className={cn("flex", isUser ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "relative max-w-[88%] rounded-lg px-2.5 py-1.5 text-[12.5px] leading-snug shadow-sm sm:max-w-[82%] sm:text-[13px]",
                      isUser
                        ? "rounded-tr-sm bg-[#005c4b] text-[#e9edef]"
                        : "rounded-tl-sm bg-[#1f2c34] text-[#e9edef]"
                    )}
                  >
                    <p className="whitespace-pre-wrap pr-8">{formatWhatsAppText(m.text)}</p>
                    <span className="absolute bottom-1 right-1.5 flex items-center gap-0.5 text-[9px] text-white/45">
                      {`${10 + Math.floor(idx / 2)}:${String(42 + idx).padStart(2, "0").slice(-2)}`}
                      {isUser && (
                        <CheckCheck className="ml-0.5 h-3 w-3 text-[#53bdeb]" />
                      )}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {typing && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-center gap-1 rounded-lg rounded-tl-sm bg-[#1f2c34] px-3 py-2.5 shadow-sm">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8696a0] [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8696a0] [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8696a0] [animation-delay:300ms]" />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Input mock */}
      <div className="flex shrink-0 items-center gap-2 bg-[#1f2c34] px-2 py-2">
        <div className="flex h-9 flex-1 items-center rounded-full bg-[#2a3942] px-3 text-[12px] text-[#8696a0]">
          {lang === "es" ? "Mensaje" : "Message"}
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#00a884] text-white">
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
            <path d="M1.101 21.757 23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function formatWhatsAppText(text: string) {
  // *bold* simple
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("*") && p.endsWith("*")) {
      return (
        <strong key={i} className="font-semibold">
          {p.slice(1, -1)}
        </strong>
      );
    }
    return <span key={i}>{p}</span>;
  });
}
