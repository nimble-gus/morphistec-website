"use client";

import { useState } from "react";
import { useLang } from "./lang";
import { CardVisual } from "./card-visual";

const LAYOUT = [
  { col: "span 6", row: "span 2", featured: true },
  { col: "span 3", row: "span 1", featured: false },
  { col: "span 3", row: "span 1", featured: false },
  { col: "span 3", row: "span 1", featured: false },
  { col: "span 3", row: "span 1", featured: false },
  { col: "span 6", row: "span 1", featured: false },
];

export function ServicesBento() {
  const { t } = useLang();
  return (
    <section id="services" className="px-10 py-36 relative scroll-mt-28">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex justify-between items-end mb-14 gap-10 flex-wrap">
          <div>
            <span className="ok-eyebrow">{t.services_eyebrow}</span>
            <h2
              className="mt-4 font-medium leading-none max-w-[700px]"
              style={{
                fontSize: "clamp(40px, 5.5vw, 84px)",
                letterSpacing: "-0.035em",
              }}
            >
              {t.services_title.split(",")[0]},
              <br />
              <em
                className="font-serif italic font-normal"
                style={{ color: "var(--ok-neon)" }}
              >
                {t.services_title.split(",").slice(1).join(",").trim()}
              </em>
            </h2>
          </div>
          <p className="text-ok-mute text-base max-w-[380px] leading-snug">
            {t.services_sub}
          </p>
        </div>

        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "repeat(6, 1fr)",
            gridAutoRows: "minmax(220px, auto)",
          }}
        >
          {t.services.map((s, i) => (
            <BentoCard
              key={i}
              service={s}
              layout={LAYOUT[i]}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

type Service = { tag: string; name: string; desc: string };

function BentoCard({
  service,
  layout,
  index,
}: {
  service: Service;
  layout: { col: string; row: string; featured: boolean };
  index: number;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
      style={{
        gridColumn: layout.col,
        gridRow: layout.row,
        background: layout.featured ? "#0c0c0c" : "var(--tw-color-ok-card, #0f0f10)",
        border: `1px solid ${hover ? "rgba(184,255,46,0.28)" : "rgba(255,255,255,0.08)"}`,
        padding: layout.featured ? 36 : 28,
      }}
    >
      <div
        className="absolute -right-5 -top-5 transition-all duration-500"
        style={{ opacity: hover ? 0.9 : 0.7 }}
      >
        <CardVisual index={index} featured={layout.featured} />
      </div>

      <div className="relative h-full flex flex-col justify-between">
        <div className="font-mono text-[11px] text-ok-dim tracking-[0.1em]">
          {service.tag} / {String(index + 1).padStart(2, "0")}
        </div>

        <div>
          <h3
            className="font-medium mb-3"
            style={{
              fontSize: layout.featured ? 36 : 22,
              letterSpacing: "-0.02em",
            }}
          >
            {service.name}
          </h3>
          <p
            className="text-ok-mute leading-snug"
            style={{
              fontSize: layout.featured ? 16 : 14,
              maxWidth: layout.featured ? 420 : 280,
            }}
          >
            {service.desc}
          </p>
          <div
            className="mt-5 flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.08em] transition-colors"
            style={{ color: hover ? "var(--ok-neon)" : "#8a8a8a" }}
          >
            <span>Ver más</span>
            <span
              className="transition-transform"
              style={{ transform: hover ? "translateX(4px)" : "none" }}
            >
              →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
