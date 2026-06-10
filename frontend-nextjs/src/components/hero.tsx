"use client";

import { useLang } from "./lang";
import AetherFlowHero from "@/components/ui/aether-flow-hero";
import { WhatsAppButton } from "@/components/whatsapp-button";

export function Hero() {
  const { t } = useLang();
  return (
    <section className="hero-section relative min-h-[760px] overflow-hidden border-b border-ok-line px-4 pb-14 pt-28 sm:min-h-[820px] sm:px-6 sm:pt-32 md:min-h-[880px] md:px-10 md:pb-20 md:pt-40">
      {/* Fondo fijo al viewport (no se mueve al hacer scroll dentro del hero) */}
      <div
        className="pointer-events-none fixed inset-0 z-[5] h-[100dvh] min-h-[100vh] w-full overflow-hidden"
        aria-hidden
      >
        <div className="ok-grid-bg absolute inset-0 opacity-40" />
        <div className="absolute inset-0 opacity-80">
          <AetherFlowHero className="min-h-[100dvh] h-full" />
        </div>
        <div
          className="absolute pointer-events-none"
          style={{
            right: 200,
            top: 300,
            width: 500,
            height: 500,
            background:
              "radial-gradient(circle, rgba(184,255,46,0.12) 0%, transparent 60%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1280px]">
        <h1
          className="font-medium max-w-[1000px]"
          style={{
            fontSize: "clamp(48px, 10vw, 148px)",
            lineHeight: 0.95,
            letterSpacing: "-0.045em",
          }}
        >
          {t.hero_title.map((line, i) => (
            <span
              key={i}
              className="block animate-float-in"
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              {i === 1 ? (
                <em
                  className="font-serif italic font-normal"
                  style={{
                    color: "var(--ok-neon)",
                    fontSize: "clamp(74px, 11vw, 176px)",
                    lineHeight: 0.88,
                  }}
                >
                  {line}
                </em>
              ) : (
                line
              )}
            </span>
          ))}
        </h1>

        <div className="mt-12 flex max-w-[900px] flex-col gap-8 sm:mt-14 sm:gap-10 md:flex-row md:items-end md:gap-20">
          <p className="max-w-[460px] text-base leading-snug text-ok-mute sm:text-lg">
            {t.hero_sub}
          </p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <WhatsAppButton>{t.hero_cta}</WhatsAppButton>
            <a href="#services" className="ok-btn ok-btn-ghost">
              {t.hero_cta_2}
            </a>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-8 border-t border-ok-line pt-8 sm:mt-20 md:mt-24 md:grid-cols-4 md:gap-10">
          {t.stats.map((s, i) => (
            <div key={i}>
              <div
                className="text-4xl font-medium text-ok-text sm:text-5xl"
                style={{ letterSpacing: "-0.03em" }}
              >
                {s.k}
              </div>
              <div className="font-mono text-[11px] text-ok-mute uppercase tracking-[0.1em] mt-2">
                {s.v}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}