"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLang } from "./lang";
import { CardVisual } from "./card-visual";
import { useDemoCart } from "@/context/demo-cart";

const LAYOUT = [
  { spanClass: "md:col-span-6 md:row-span-2", featured: true },
  { spanClass: "md:col-span-3 md:row-span-1", featured: false },
  { spanClass: "md:col-span-3 md:row-span-1", featured: false },
  { spanClass: "md:col-span-3 md:row-span-1", featured: false },
  { spanClass: "md:col-span-3 md:row-span-1", featured: false },
  { spanClass: "md:col-span-6 md:row-span-1", featured: false },
];

export function ServicesBento() {
  const { t } = useLang();
  return (
    <section id="services" className="relative scroll-mt-28 px-4 py-20 sm:px-6 md:px-10 md:py-36">
      <div className="max-w-[1280px] mx-auto">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-14 md:gap-10">
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
          <p className="max-w-[380px] text-sm leading-snug text-ok-mute sm:text-base">
            {t.services_sub}
          </p>
        </div>

        <div
          className="grid grid-cols-1 gap-4 md:grid-cols-6"
          style={{
            gridAutoRows: "minmax(180px, auto)",
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
  layout: { spanClass: string; featured: boolean };
  index: number;
}) {
  const router = useRouter();
  const { t } = useLang();
  const { cartVisible, activateEcommerceDemo, completeEcommerceCheckout } =
    useDemoCart();
  const isEcommerce = index === 0;
  const isCustomApps = index === 1;
  const [hover, setHover] = useState(false);

  function handleCardClick() {
    if (isEcommerce) activateEcommerceDemo();
    else if (isCustomApps) router.push("/apps-a-la-medida");
  }

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={isEcommerce || isCustomApps ? handleCardClick : undefined}
      className={`relative cursor-pointer overflow-hidden rounded-2xl transition-all duration-300 ${layout.spanClass}`}
      style={{
        background: layout.featured ? "#0c0c0c" : "var(--tw-color-ok-card, #0f0f10)",
        border: `1px solid ${hover ? "rgba(184,255,46,0.28)" : "rgba(255,255,255,0.08)"}`,
        padding: layout.featured ? 24 : 20,
      }}
    >
      {!(isEcommerce && cartVisible) && (
        <div
          className="absolute -right-5 -top-5 transition-all duration-500"
          style={{ opacity: hover ? 0.9 : 0.7 }}
        >
          <CardVisual index={index} featured={layout.featured} />
        </div>
      )}

      {isEcommerce && cartVisible ? (
        <div className="relative z-10 flex h-full min-h-[280px] flex-col gap-8 md:flex-row md:items-start md:justify-between md:gap-10">
          <div className="max-w-[420px] md:pt-4">
            <h3
              className="mb-3 font-medium"
              style={{
                fontSize: layout.featured ? 30 : 22,
                letterSpacing: "-0.02em",
              }}
            >
              {service.name}
            </h3>
            <p
              className="leading-snug text-ok-mute"
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
          <div className="flex shrink-0 flex-col items-end gap-4 self-end md:self-start">
            <div
              className="transition-opacity duration-500"
              style={{ opacity: hover ? 0.9 : 0.7 }}
            >
              <CardVisual index={index} featured={layout.featured} />
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                completeEcommerceCheckout();
              }}
              className="ok-btn ok-btn-primary w-full max-w-[280px] justify-center py-2.5 text-sm sm:w-auto"
            >
              {t.ecommerce_checkout}
            </button>
          </div>
        </div>
      ) : (
        <div className="relative flex h-full flex-col justify-end">
          <div>
            <h3
              className="mb-3 font-medium"
              style={{
                fontSize: layout.featured ? 30 : 22,
                letterSpacing: "-0.02em",
              }}
            >
              {service.name}
            </h3>
            <p
              className="leading-snug text-ok-mute"
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
      )}
    </div>
  );
}
