"use client";

import { useLang } from "./lang";

export function CTASection() {
  const { t } = useLang();
  return (
    <section className="relative overflow-hidden border-t border-ok-line px-4 py-20 sm:px-6 md:px-10 md:py-36">
      <div className="ok-grid-bg absolute inset-0 opacity-50" />
      <div
        className="absolute pointer-events-none"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(184,255,46,0.13) 0%, transparent 60%)",
          filter: "blur(40px)",
        }}
      />
      <div className="relative mx-auto max-w-[900px] text-center">
        <span className="ok-pill">
          <span className="dot" />
          {t.cta_pill}
        </span>
        <h2
          className={`font-medium mt-6 ${t.cta_sub.trim() ? "mb-6" : "mb-8"}`}
          style={{
            fontSize: "clamp(48px, 7vw, 96px)",
            letterSpacing: "-0.04em",
            lineHeight: 1.02,
          }}
        >
          {t.cta_title}
        </h2>
        {t.cta_sub.trim() ? (
          <p className="mx-auto mb-8 max-w-[520px] text-base leading-snug text-ok-mute sm:mb-10 sm:text-lg">
            {t.cta_sub}
          </p>
        ) : null}
        <button className="ok-btn ok-btn-primary w-full px-7 py-4 text-base sm:w-auto sm:py-[18px]">
          {t.cta_button} <span className="font-mono">→</span>
        </button>
      </div>
    </section>
  );
}
