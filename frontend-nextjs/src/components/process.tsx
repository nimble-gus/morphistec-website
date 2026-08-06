"use client";

import { useLang } from "./lang";

/**
 * Principios Oktae (no metodología genérica en 4 pasos).
 * Anchors siguen en #process para no romper nav / deep links.
 */
export function Process() {
  const { t } = useLang();

  return (
    <section
      id="process"
      className="relative scroll-mt-28 px-4 py-16 sm:px-6 sm:py-20 md:px-10 md:py-28"
    >
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-14 md:gap-10">
          <div>
            <span className="ok-eyebrow">{t.process_eyebrow}</span>
            <h2
              className="mt-3 max-w-[720px] font-medium leading-[1.05]"
              style={{
                fontSize: "clamp(2rem, 4.5vw, 3.75rem)",
                letterSpacing: "-0.035em",
              }}
            >
              {t.process_title}
              <br />
              <em
                className="font-script not-italic font-normal"
                style={{
                  color: "var(--ok-emphasis)",
                  fontFamily: "var(--font-script)",
                  fontStyle: "normal",
                }}
              >
                {t.process_title_accent}
              </em>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {t.process.map((p) => (
            <article
              key={p.n}
              className="flex flex-col border border-white/[0.07] bg-ok-card/40 px-5 py-6 sm:px-6 sm:py-7"
            >
              <span className="font-mono text-[11px] font-medium tracking-[0.18em] text-ok-mute">
                {p.n}
              </span>
              <h3
                className="mt-4 text-xl font-semibold leading-snug text-ok-text sm:text-[1.35rem]"
                style={{ letterSpacing: "-0.02em" }}
              >
                {p.name}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ok-mute sm:text-[15px] sm:leading-7">
                {p.desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
