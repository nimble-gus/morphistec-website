"use client";

import { SplineScene } from "@/components/ui/splite";
import { useLang } from "@/components/lang";
import { cn } from "@/lib/utils";

/** Escena demo del componente 21st Spline Scene (serafimcloud). */
const SPLINE_SCENE =
  "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

/**
 * Bloque Spline bajo Nosotros.
 * Móvil: robot → caption. Desktop: caption izquierda + robot (trazas → texto).
 * `embedded`: sin fondo propio — usa el shader del hero.
 * @see https://21st.dev/@serafimcloud/components/splite
 */
export function AboutSplineFeature({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const { t } = useLang();

  return (
    <section
      className={cn(
        embedded ? "px-4 sm:px-6 md:px-10" : "px-4 pb-6 sm:px-6 md:px-10"
      )}
      aria-label={t.about_featured_caption}
    >
      <div className="mx-auto max-w-[1280px]">
        <div
          className={cn(
            "relative w-full overflow-visible md:overflow-hidden",
            "md:h-[min(676px,85vh)] md:min-h-[416px]",
            embedded
              ? "bg-transparent"
              : "border border-white/[0.08] bg-black/[0.96]"
          )}
        >
          <div className="relative z-[2] flex flex-col md:h-full md:flex-row">
            {/* Caption: debajo en móvil, izquierda en desktop */}
            <div className="relative z-10 order-2 flex flex-1 flex-col justify-center px-1 pt-2 text-center sm:px-2 md:order-1 md:max-w-[38%] md:py-8 md:pr-6 md:text-left">
              <span className="ok-eyebrow">{t.about_featured_caption}</span>
              <h2
                className="mt-2 font-medium leading-[1.1] tracking-tight text-ok-text md:mt-3"
                style={{
                  fontSize: "clamp(1.35rem, 3.2vw, 2.25rem)",
                  letterSpacing: "-0.03em",
                }}
              >
                {t.about_spline_title}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ok-mute md:mx-0 md:mt-3 md:text-[15px]">
                {t.about_spline_body}
              </p>
            </div>

            {/* Robot: arriba en móvil, derecha en desktop */}
            <div className="relative order-1 h-[min(420px,58vh)] min-h-[280px] flex-[1.35] md:order-2 md:h-auto md:min-h-0">
              <div
                className="absolute inset-0 origin-center scale-[1.25] md:scale-[1.3]"
                style={{
                  WebkitMaskImage:
                    "linear-gradient(to bottom, black 0%, black 55%, transparent 90%)",
                  maskImage:
                    "linear-gradient(to bottom, black 0%, black 55%, transparent 90%)",
                }}
              >
                <SplineScene scene={SPLINE_SCENE} className="h-full w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
