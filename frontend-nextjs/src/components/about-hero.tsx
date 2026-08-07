"use client";

import { useLang } from "@/components/lang";
import { useShaderBackground } from "@/hooks/use-shader-background";
import { AboutSplineFeature } from "@/components/about-spline-feature";

/** Hero Nosotros + bloque Spline sobre el mismo shader (sin corte negro). */
export function AboutHero() {
  const { t } = useLang();
  const canvasRef = useShaderBackground();
  const title = t.about_hero_title[0] ?? "Nosotros";

  return (
    <section className="relative isolate w-full max-w-full overflow-hidden bg-ok-black">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none object-cover"
        style={{ background: "var(--ok-bg)" }}
        aria-hidden
      />
      {/* Vignette suave (no aplasta a negro) */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 28%, transparent 12%, oklch(0.2 0.005 260 / 0.28) 55%, oklch(0.2 0.005 260 / 0.55) 100%)",
        }}
        aria-hidden
      />
      {/* Fundido solo al final del bloque (tras el robot) */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-40"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, var(--ok-bg, #0a0a0b) 100%)",
        }}
        aria-hidden
      />

      {/* Título + intro → (móvil: robot → caption) / (desktop: caption + robot) */}
      <div className="relative z-10 mx-auto max-w-[1280px] px-4 pb-4 pt-28 sm:px-6 sm:pb-6 sm:pt-32 md:px-10 md:pt-36">
        <h1
          className="max-w-[960px] font-medium tracking-tight text-ok-text"
          style={{
            fontSize: "clamp(3.25rem, 12vw, 7.5rem)",
            lineHeight: 0.92,
            letterSpacing: "-0.04em",
          }}
        >
          {title}
        </h1>
        <p className="mt-5 max-w-[38rem] text-base leading-relaxed text-ok-mute sm:mt-7 sm:max-w-[640px] sm:text-lg md:mt-8 md:text-xl md:leading-relaxed">
          {t.about_hero_sub}
        </p>
      </div>

      <div className="relative z-10 pb-14 pt-6 sm:pb-20 sm:pt-10 md:pb-24 md:pt-12">
        <AboutSplineFeature embedded />
      </div>
    </section>
  );
}
