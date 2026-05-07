"use client";

import { useLang } from "./lang";
import AetherFlowHero from "@/components/ui/aether-flow-hero";
import { BookCallModal } from "@/components/ui/book-call-modal";

export function Hero() {
  const { t } = useLang();
  return (
    <section className="relative min-h-[880px] px-10 pt-40 pb-20 overflow-hidden border-b border-ok-line hero-section">
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

      <div className="relative z-10 max-w-[1280px] mx-auto">
        <h1
          className="font-medium max-w-[1000px]"
          style={{
            fontSize: "clamp(64px, 9.5vw, 148px)",
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

        <div className="flex gap-20 mt-14 max-w-[900px] items-end flex-wrap">
          <p className="text-ok-mute text-lg leading-snug max-w-[460px]">
            {t.hero_sub}
          </p>
          <div className="flex gap-3">
            <BookCallModal triggerLabel={t.hero_cta} />
            <a href="#services" className="ok-btn ok-btn-ghost">
              {t.hero_cta_2}
            </a>
          </div>
        </div>

        <div className="mt-24 pt-8 border-t border-ok-line grid grid-cols-4 gap-10">
          {t.stats.map((s, i) => (
            <div key={i}>
              <div
                className="text-5xl font-medium text-ok-text"
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