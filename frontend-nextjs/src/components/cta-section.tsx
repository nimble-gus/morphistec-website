"use client";

import { useLang } from "./lang";
import { WhatsAppButton } from "./whatsapp-button";
import KineticGrid from "@/components/ui/kinetic-grid";

/**
 * Cierre del home: Kinetic Grid + CTA.
 * Fundidos largos hacia arriba y hacia el footer (mismo --ok-bg).
 */
export function CTASection() {
  const { t } = useLang();

  return (
    <section className="relative overflow-hidden bg-[var(--ok-bg)]">
      <KineticGrid
        className="min-h-[min(640px,88vh)] bg-transparent"
        spacing={32}
        lineColor="rgba(160, 170, 190, 0.2)"
        accentColor="rgba(130, 190, 255, 0.95)"
      >
        <div className="relative flex min-h-[min(640px,88vh)] flex-col items-center justify-center px-4 pb-28 pt-24 text-center sm:px-6 sm:pb-36 md:px-10 md:pb-40 md:pt-32">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 46%, oklch(0.24 0.005 260 / 0.5) 0%, oklch(0.24 0.005 260 / 0.18) 48%, transparent 74%)",
            }}
            aria-hidden
          />

          <div className="relative z-10 mx-auto max-w-[900px]">
            <h2
              className={`font-medium text-ok-text ${t.cta_sub.trim() ? "mb-6" : "mb-8"}`}
              style={{
                fontSize: "clamp(2.25rem, 6vw, 4.5rem)",
                letterSpacing: "-0.035em",
                lineHeight: 1.05,
              }}
            >
              {t.cta_title}
            </h2>
            {t.cta_sub.trim() ? (
              <p className="mx-auto mb-8 max-w-[520px] text-base leading-snug text-ok-mute sm:mb-10 sm:text-lg">
                {t.cta_sub}
              </p>
            ) : null}
            <WhatsAppButton className="ok-btn ok-btn-primary w-full px-7 py-4 text-base sm:w-auto sm:py-[18px]">
              {t.cta_button}
            </WhatsAppButton>
          </div>
        </div>
      </KineticGrid>

      {/* Fundido superior → principios */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-32 sm:h-40"
        style={{
          background:
            "linear-gradient(to bottom, var(--ok-bg) 0%, color-mix(in oklch, var(--ok-bg) 70%, transparent) 45%, transparent 100%)",
        }}
        aria-hidden
      />
      {/* Fundido inferior → footer (mismo --ok-bg; sin arista ni color-mix) */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-40 sm:h-52"
        style={{
          background:
            "linear-gradient(to top, var(--ok-bg) 0%, var(--ok-bg) 12%, transparent 100%)",
        }}
        aria-hidden
      />
    </section>
  );
}
