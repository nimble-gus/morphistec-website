"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLang } from "./lang";
import { cn } from "@/lib/utils";
import { WhatsAppChatMock } from "@/components/whatsapp-chat-mock";
import { SalesPipelineMock } from "@/components/sales-pipeline-mock";
import { EcommerceSitePreview } from "@/components/ecommerce-site-preview";
import { ConsultingAnalyticsMock } from "@/components/consulting-analytics-mock";
import { ChannelsIntegrationsMock } from "@/components/channels-integrations-mock";
import { LogisticsMapMock } from "@/components/logistics-map-mock";

const EASE = "cubic-bezier(0.33, 0.1, 0.25, 1)";
const DURATION = "duration-[360ms]";
// (efecto vinilo usa tween corto; el spring en hover/z pelearía con el click)

/** E-commerce = índice 0 */
const ECOMMERCE_INDEX = 0;
/** Chatbots con IA = índice 1 */
const CHATBOT_INDEX = 1;
/** Automatización de ventas = índice 2 */
const AUTOMATION_INDEX = 2;
/** Consultoría y análisis = índice 3 */
const CONSULTING_INDEX = 3;
/** Canales e integraciones = índice 4 */
const CHANNELS_INDEX = 4;
/** Sistemas a medida = índice 5 */
const CUSTOM_SYSTEMS_INDEX = 5;

/** Una imagen por servicio (assets existentes en /public). */
const SERVICE_IMAGES = [
  "/pic6.png", // E-commerce
  "/pic2.png", // Chatbots (fallback; se usa mock)
  "/pic1.png", // Automatización
  "/pic3.png", // Embudo
  "/pic5.png", // Canales
  "/pic4.png", // Sistemas a medida
] as const;

type ServiceItem = {
  tag: string;
  name: string;
  desc: string;
};

/**
 * Stack con acento “caja de vinilos”: profundidad sutil,
 * títulos siempre legibles y clic al primer toque.
 */
function VinylCrateStack({
  services,
  active,
  onSelect,
}: {
  services: readonly ServiceItem[];
  active: number;
  onSelect: (i: number) => void;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="relative isolate pb-8 pt-2"
      style={
        reduceMotion
          ? undefined
          : {
              perspective: "1600px",
              perspectiveOrigin: "50% 20%",
            }
      }
    >
      <div
        className="pointer-events-none absolute inset-x-6 bottom-0 h-10 rounded-[100%] bg-black/45 blur-2xl"
        aria-hidden
      />

      <div
        className="relative flex flex-col gap-2.5"
        style={reduceMotion ? undefined : { transformStyle: "preserve-3d" }}
      >
        {services.map((s, i) => {
          const isActive = i === active;
          const abs = Math.min(Math.abs(i - active), 3);

          // Poca inclinación: se lee el texto; el “vinilo” viene del lomo, disco y sombra
          const rotateX = reduceMotion ? 0 : isActive ? 0 : 10 + abs * 2;
          const translateZ = reduceMotion ? 0 : isActive ? 24 : -abs * 4;
          const scale = reduceMotion ? 1 : isActive ? 1 : 0.99;

          return (
            <motion.div
              key={s.tag}
              className="relative"
              style={{ zIndex: isActive ? 40 : 10 + i }}
              initial={false}
              animate={{ opacity: isActive ? 1 : 0.38 }}
              whileHover={
                reduceMotion || isActive ? undefined : { opacity: 0.72 }
              }
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 32,
                mass: 0.7,
              }}
            >
              <motion.div
                aria-hidden
                className={cn(
                  "pointer-events-none relative overflow-hidden border will-change-transform",
                  isActive
                    ? "border-[var(--ok-indigo)] bg-[var(--ok-indigo)]"
                    : "border-white/[0.08] bg-ok-card"
                )}
                style={{
                  transformOrigin: "50% 100%",
                  transformStyle: "preserve-3d",
                  boxShadow: isActive
                    ? "0 22px 40px -16px oklch(0.55 0.2 265 / 0.5), 0 1px 0 rgba(255,255,255,0.12) inset"
                    : "0 1px 0 rgba(255,255,255,0.06) inset, 0 10px 24px -14px rgba(0,0,0,0.85), 0 3px 0 -1px oklch(0.26 0.01 260)",
                }}
                initial={false}
                animate={{ rotateX, z: translateZ, scale }}
                transition={{
                  type: "spring",
                  stiffness: 320,
                  damping: 32,
                  mass: 0.7,
                }}
              >
                <span
                  className={cn(
                    "absolute inset-0 bg-gradient-to-b",
                    isActive
                      ? "from-white/10 via-transparent to-black/10"
                      : "from-white/[0.06] via-transparent to-black/25"
                  )}
                />
                {/* Lomo */}
                <span
                  className={cn(
                    "absolute inset-y-0 left-0 w-[3px]",
                    isActive
                      ? "bg-[var(--ok-amber)]/85"
                      : "bg-gradient-to-b from-white/30 via-white/10 to-white/5"
                  )}
                />
                {/* Centro del disco */}
                <span
                  className={cn(
                    "absolute left-3 top-1/2 hidden size-8 -translate-y-1/2 rounded-full border sm:block",
                    isActive
                      ? "border-white/28 bg-white/12"
                      : "border-white/14 bg-black/30"
                  )}
                >
                  <span className="absolute inset-[9px] rounded-full border border-white/22 bg-black/30" />
                  <span className="absolute inset-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40" />
                </span>
                {/* Surcos sutiles */}
                <span
                  className="absolute inset-y-3 right-3 w-10 opacity-[0.09]"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(90deg, transparent 0 2px, currentColor 2px 3px)",
                  }}
                />

                <div className="relative flex min-h-[3.5rem] items-center px-5 py-3.5 pl-5 sm:pl-14">
                  <div className="w-full">
                    <h3
                      className={cn(
                        "text-lg font-bold leading-snug sm:text-xl",
                        isActive ? "text-white" : "text-ok-text"
                      )}
                    >
                      <span className="mr-2 font-mono text-xs font-medium tracking-widest opacity-60">
                        {s.tag}
                      </span>
                      {s.name}
                    </h3>
                    <div
                      className={cn(
                        "grid transition-[grid-template-rows,opacity,margin] duration-[360ms]",
                        isActive
                          ? "mt-2.5 grid-rows-[1fr] opacity-100"
                          : "mt-0 grid-rows-[0fr] opacity-0"
                      )}
                      style={{ transitionTimingFunction: EASE }}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <p className="max-w-md pb-0.5 text-[14px] leading-6 text-white/80 sm:text-[15px] sm:leading-7">
                          {s.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <button
                type="button"
                aria-expanded={isActive}
                aria-label={`${s.tag} ${s.name}`}
                onClick={() => onSelect(i)}
                className={cn(
                  "absolute inset-0 z-10 cursor-pointer border-0 bg-transparent",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ok-indigo)]"
                )}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function ServiceVisual({
  index,
  name,
  active,
  fill = false,
}: {
  index: number;
  name: string;
  active: boolean;
  fill?: boolean;
}) {
  if (index === ECOMMERCE_INDEX) {
    return (
      <div className={cn("relative h-full w-full", fill && "absolute inset-0")}>
        <EcommerceSitePreview active={active} />
        {!active && (
          <div className="absolute inset-0 z-20 bg-ok-ink/35 grayscale" aria-hidden />
        )}
      </div>
    );
  }

  if (index === CHATBOT_INDEX) {
    return (
      <div className={cn("relative h-full w-full", fill && "absolute inset-0")}>
        <WhatsAppChatMock active={active} />
        {!active && (
          <div className="absolute inset-0 bg-ok-ink/35 grayscale" aria-hidden />
        )}
      </div>
    );
  }

  if (index === AUTOMATION_INDEX) {
    return (
      <div className={cn("relative h-full w-full", fill && "absolute inset-0")}>
        <SalesPipelineMock active={active} />
        {!active && (
          <div className="absolute inset-0 bg-ok-ink/35 grayscale" aria-hidden />
        )}
      </div>
    );
  }

  if (index === CONSULTING_INDEX) {
    return (
      <div className={cn("relative h-full w-full", fill && "absolute inset-0")}>
        <ConsultingAnalyticsMock active={active} />
        {!active && (
          <div className="absolute inset-0 bg-ok-ink/35 grayscale" aria-hidden />
        )}
      </div>
    );
  }

  if (index === CHANNELS_INDEX) {
    return (
      <div className={cn("relative h-full w-full", fill && "absolute inset-0")}>
        <ChannelsIntegrationsMock active={active} />
        {!active && (
          <div className="absolute inset-0 bg-ok-ink/35 grayscale" aria-hidden />
        )}
      </div>
    );
  }

  if (index === CUSTOM_SYSTEMS_INDEX) {
    return (
      <div className={cn("relative h-full w-full", fill && "absolute inset-0")}>
        <LogisticsMapMock active={active} />
        {!active && (
          <div className="absolute inset-0 bg-ok-ink/35 grayscale" aria-hidden />
        )}
      </div>
    );
  }

  const src = SERVICE_IMAGES[index] ?? SERVICE_IMAGES[0];
  return (
    <>
      <Image
        src={src}
        alt={name}
        fill
        sizes={fill ? "100vw" : "(max-width: 1024px) 100vw, 50vw"}
        className={cn(
          "object-cover transition-[transform,filter]",
          DURATION,
          active ? "scale-100 grayscale-0" : "scale-105 grayscale"
        )}
        style={{ transitionTimingFunction: EASE }}
        priority={index === 0}
      />
      {!active && <div className="absolute inset-0 bg-ok-ink/40" aria-hidden />}
    </>
  );
}

/**
 * Servicios expandibles (desktop split + mobile accordion).
 * Base de interacción inspirada en el patrón Zacsa accordion/flex-grow.
 */
export function ServicesBento() {
  const { t } = useLang();
  const services = t.services;
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion || services.length <= 1) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % services.length);
    }, 3000);
    return () => window.clearInterval(id);
  }, [reduceMotion, services.length, active]);

  return (
    <section
      id="services"
      className="relative scroll-mt-28 px-4 py-10 sm:px-6 sm:py-12 md:px-10 md:py-16"
    >
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6 md:mb-12 md:gap-10">
          <div>
            <span className="ok-eyebrow">{t.services_eyebrow}</span>
            <h2
              className="mt-3 max-w-[960px] font-medium leading-[1.05]"
              style={{
                fontSize: "clamp(3rem, 6.75vw, 5.625rem)",
                letterSpacing: "-0.035em",
              }}
            >
              {t.services_title}
              <br />
              <em
                className="font-script not-italic font-normal"
                style={{
                  color: "var(--ok-emphasis)",
                  fontFamily: "var(--font-script)",
                  fontStyle: "normal",
                }}
              >
                {t.services_title_accent}
              </em>
            </h2>
          </div>
          <p className="max-w-[360px] text-sm leading-relaxed text-ok-mute sm:text-base">
            {t.services_sub}
          </p>
        </div>

        {/* ── Desktop: vinilos (izq) + visual (der, mismo alto) ── */}
        <div className="mt-10 hidden lg:mt-14 lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-6">
          <VinylCrateStack
            services={services}
            active={active}
            onSelect={setActive}
          />

          {/* Un solo panel: mismo alto que el stack izquierdo; cambia al seleccionar */}
          <div className="relative min-h-0 overflow-hidden border border-[var(--ok-indigo)] bg-ok-card">
            {services.map((s, i) => {
              const isActive = i === active;
              return (
                <div
                  key={`img-${s.tag}`}
                  aria-hidden={!isActive}
                  className={cn(
                    "absolute inset-0 transition-[opacity,transform]",
                    DURATION,
                    isActive
                      ? "z-10 scale-100 opacity-100"
                      : "pointer-events-none z-0 scale-[1.02] opacity-0"
                  )}
                  style={{ transitionTimingFunction: EASE }}
                >
                  <ServiceVisual index={i} name={s.name} active={isActive} fill />
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Mobile / tablet ── */}
        <div className="mt-10 flex flex-col gap-2.5 lg:hidden">
          <div className="flex flex-col gap-2">
            {services.map((s, i) => {
              const isActive = i === active;
              return (
                <button
                  key={`m-${s.tag}`}
                  type="button"
                  aria-expanded={isActive}
                  onClick={() => setActive(i)}
                  className={cn(
                    "flex min-h-[52px] w-full items-center justify-between gap-3 px-5 py-3.5 text-left transition-[colors,opacity] duration-[280ms]",
                    isActive
                      ? "bg-[var(--ok-indigo)] opacity-100"
                      : "bg-ok-card opacity-[0.38] active:opacity-70"
                  )}
                  style={{ transitionTimingFunction: EASE }}
                >
                  <h3
                    className={cn(
                      "text-base font-bold tracking-[0.02em] sm:text-lg",
                      isActive ? "text-white" : "text-ok-text"
                    )}
                  >
                    <span className="mr-2 font-mono text-[11px] tracking-widest opacity-55">
                      {s.tag}
                    </span>
                    {s.name}
                  </h3>
                  <span
                    className={cn(
                      "text-lg leading-none",
                      isActive ? "text-white/90" : "text-ok-mute"
                    )}
                    aria-hidden
                  >
                    {isActive ? "–" : "+"}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative flex min-h-[420px] flex-col overflow-hidden border border-[var(--ok-indigo)]/40 sm:min-h-[520px] sm:h-[min(600px,85vw)]">
            {services.map((s, i) => {
              const isActive = i === active;
              return (
                <div
                  key={`panel-${s.tag}`}
                  aria-hidden={!isActive}
                  className={cn(
                    "absolute inset-0 flex flex-col transition-[opacity,transform]",
                    DURATION,
                    isActive
                      ? "z-10 translate-y-0 opacity-100"
                      : "pointer-events-none z-0 translate-y-1.5 opacity-0"
                  )}
                  style={{ transitionTimingFunction: EASE }}
                >
                  <div className="shrink-0 bg-[var(--ok-indigo)] px-4 py-3 sm:px-5 sm:py-3.5">
                    <p className="text-[13px] leading-5 text-white/80 sm:text-[15px] sm:leading-7">
                      {s.desc}
                    </p>
                  </div>
                  <div className="relative min-h-0 flex-1">
                    <ServiceVisual
                      index={i}
                      name={s.name}
                      active={isActive}
                      fill
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
