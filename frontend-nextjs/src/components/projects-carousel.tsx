"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLang } from "@/components/lang";

export function ProjectsCarousel() {
  const { t } = useLang();
  const projects = t.projects_items;
  const [index, setIndex] = useState(0);
  const total = projects.length;

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => (i + delta + total) % total);
    },
    [total]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const current = projects[index]!;

  return (
    <section
      id="work"
      className="scroll-mt-28 border-b border-ok-line px-4 py-14 sm:px-6 sm:py-16 md:px-10 md:py-20"
      aria-roledescription="carousel"
      aria-label={t.projects_carousel_label}
    >
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-10">
          <div>
            <span className="ok-eyebrow">{t.projects_eyebrow}</span>
            <h2
              className="mt-3 font-medium leading-tight"
              style={{
                fontSize: "clamp(28px, 4vw, 48px)",
                letterSpacing: "-0.03em",
              }}
            >
              {t.projects_title}
            </h2>
          </div>
          <span className="font-mono text-xs tabular-nums tracking-widest text-ok-mute">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>

        <div className="relative">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-ok-ink shadow-[0_24px_80px_-20px_rgba(0,0,0,0.65)] sm:rounded-3xl md:aspect-[16/9]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={current.src}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src={current.src}
                  alt={current.title}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, 1280px"
                  className="object-cover object-center"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"
                  aria-hidden
                />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 md:p-10">
                  <span className="mb-2 inline-block rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-zinc-300 backdrop-blur-sm sm:text-[11px]">
                    {current.industry}
                  </span>
                  <h3 className="max-w-2xl text-lg font-medium leading-snug text-white sm:text-xl md:text-2xl">
                    {current.title}
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-300 sm:text-base">
                    {current.brief}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={() => go(-1)}
            className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-md transition hover:border-[var(--ok-neon)]/40 hover:bg-black/70 sm:left-5 sm:h-12 sm:w-12"
            aria-label={t.projects_prev}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-md transition hover:border-[var(--ok-neon)]/40 hover:bg-black/70 sm:right-5 sm:h-12 sm:w-12"
            aria-label={t.projects_next}
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 sm:mt-8">
          {projects.map((p, i) => (
            <button
              key={p.src}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === index
                  ? "w-8 bg-[var(--ok-neon)]"
                  : "w-2 bg-white/20 hover:bg-white/35"
              }`}
              aria-label={t.projects_go_to(i + 1)}
              aria-current={i === index ? "true" : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
