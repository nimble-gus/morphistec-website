"use client";

import { useLang } from "./lang";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { useShaderBackground } from "@/hooks/use-shader-background";

/** Línea de énfasis en script (índice 1: "Grows" / "crece"). */
const SCRIPT_LINE_INDEX = 1;

export function Hero() {
  const { t } = useLang();
  const canvasRef = useShaderBackground();

  return (
    <section className="hero-section relative isolate min-h-0 w-full max-w-full overflow-x-clip overflow-y-visible bg-ok-black sm:min-h-[88dvh] md:min-h-[90dvh]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none object-cover"
        style={{ background: "var(--ok-bg)" }}
        aria-hidden
      />
      {/* Vignette + lectura del copy */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 35%, transparent 8%, oklch(0.2 0.005 260 / 0.35) 50%, oklch(0.2 0.005 260 / 0.72) 100%)",
        }}
        aria-hidden
      />
      {/* Fundido al resto de la página (sin línea dura) */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[min(42%,280px)]"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, oklch(0.2 0.005 260 / 0.45) 45%, var(--ok-bg, #0a0a0b) 100%)",
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-[1280px] flex-col justify-start px-4 pb-8 pt-[5.25rem] sm:min-h-[88dvh] sm:justify-center sm:px-6 sm:pb-10 sm:pt-28 md:min-h-[90dvh] md:px-10 md:pb-12 md:pt-32">
        <h1 className="max-w-[min(100%,22rem)] overflow-visible font-semibold tracking-tight text-ok-text sm:max-w-[36rem] sm:font-medium md:max-w-[1000px]">
          {t.hero_title.map((line, i) => {
            const isScript = i === SCRIPT_LINE_INDEX;
            return (
              <span
                key={i}
                className="block max-w-full overflow-visible animate-float-in"
                style={{
                  animationDelay: `${i * 0.08}s`,
                  fontSize: isScript
                    ? "clamp(3.1rem, 15.5vw, 11rem)"
                    : "clamp(2.85rem, 15vw, 9.25rem)",
                  /* Script tiene ascenders/descenders amplios: line-height < 1 lo recorta en el 1er paint */
                  lineHeight: isScript ? 1.15 : 0.9,
                  letterSpacing: isScript ? "0.01em" : "-0.045em",
                  ...(isScript
                    ? { paddingBlock: "0.06em", marginBlock: "-0.02em" }
                    : null),
                }}
              >
                {isScript ? (
                  <em
                    className="font-script not-italic font-normal"
                    style={{
                      color: "var(--ok-emphasis)",
                      fontFamily: "var(--font-script)",
                      fontStyle: "normal",
                      display: "inline-block",
                      maxWidth: "100%",
                      overflow: "visible",
                      /* Reserva métricas estables mientras carga Oldport */
                      fontSize: "1em",
                      lineHeight: "inherit",
                      paddingInline: "0.02em",
                    }}
                  >
                    {line}
                  </em>
                ) : (
                  line
                )}
              </span>
            );
          })}
        </h1>

        <div
          className="mt-5 flex w-full max-w-[900px] flex-col gap-4 animate-float-in sm:mt-10 sm:gap-8 md:mt-14 md:flex-row md:items-end md:gap-16"
          style={{ animationDelay: "0.4s" }}
        >
          <p className="max-w-[32rem] text-[0.9375rem] leading-relaxed text-ok-mute sm:text-base sm:leading-snug md:text-lg">
            {t.hero_sub}
          </p>
          <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:gap-3">
            <WhatsAppButton className="ok-btn ok-btn-primary w-full justify-center px-5 py-3.5 text-sm sm:w-auto sm:px-6 sm:py-3.5 sm:text-[15px]">
              {t.hero_cta}
            </WhatsAppButton>
            <a
              href="#services"
              className="ok-btn ok-btn-ghost w-full justify-center px-5 py-3.5 text-sm sm:w-auto sm:px-6 sm:text-[15px]"
            >
              {t.hero_cta_2}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
