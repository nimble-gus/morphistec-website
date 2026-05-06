"use client";

import { useLang } from "./lang";

export function CTASection() {
  const { t } = useLang();
  return (
    <section className="px-10 py-36 relative overflow-hidden border-t border-ok-line">
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
      <div className="relative text-center max-w-[900px] mx-auto">
        <span className="ok-pill">
          <span className="dot" />
          {t.cta_pill}
        </span>
        <h2
          className="font-medium mt-6 mb-6"
          style={{
            fontSize: "clamp(48px, 7vw, 96px)",
            letterSpacing: "-0.04em",
            lineHeight: 1.02,
          }}
        >
          {t.cta_title}
        </h2>
        <p className="text-ok-mute text-lg max-w-[520px] mx-auto mb-10 leading-snug">
          {t.cta_sub}
        </p>
        <button className="ok-btn ok-btn-primary text-base py-[18px] px-7">
          {t.cta_button} <span className="font-mono">→</span>
        </button>
      </div>
    </section>
  );
}
