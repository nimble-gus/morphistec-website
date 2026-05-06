"use client";

import { useLang } from "./lang";

export function Process() {
  const { t } = useLang();
  return (
    <section className="relative border-t border-ok-line bg-[#070707] px-4 py-20 sm:px-6 md:px-10 md:py-36">
      <div className="max-w-[1280px] mx-auto">
        <div className="mb-10 max-w-[700px] md:mb-20">
          <span className="ok-eyebrow">{t.process_eyebrow}</span>
          <h2
            className="mt-4 font-medium leading-none"
            style={{
              fontSize: "clamp(40px, 5.5vw, 84px)",
              letterSpacing: "-0.035em",
            }}
          >
            {t.process_title.split(".")[0]}.{" "}
            <em
              className="font-serif italic font-normal"
              style={{ color: "var(--ok-neon)" }}
            >
              {t.process_title.split(".")[1]}.
            </em>
          </h2>
        </div>

        <div className="relative grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          <div
            className="absolute hidden h-px lg:block"
            style={{
              left: "6%",
              right: "6%",
              top: 32,
              background:
                "linear-gradient(to right, var(--ok-neon), rgba(184,255,46,0.33), transparent)",
            }}
          />
          {t.process.map((p, i) => (
            <div
              key={i}
              className={`relative rounded-xl border border-white/[0.08] px-5 py-6 sm:px-6 lg:rounded-none lg:border-0 lg:py-0 ${i < 3 ? "lg:border-r lg:border-white/[0.08]" : ""}`}
            >
              <div
                className="w-16 h-16 rounded-full border flex items-center justify-center font-mono text-sm font-semibold mb-8"
                style={{
                  background: i === 0 ? "var(--ok-neon)" : "var(--tw-color-ok-card, #0f0f10)",
                  borderColor: "rgba(255,255,255,0.14)",
                  color: i === 0 ? "#000" : "var(--ok-neon)",
                }}
              >
                {p.n}
              </div>
              <h3
                className="text-2xl font-medium mb-3"
                style={{ letterSpacing: "-0.02em" }}
              >
                {p.name}
              </h3>
              <p className="text-ok-mute text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
