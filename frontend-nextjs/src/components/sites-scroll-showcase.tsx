"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { useLang } from "@/components/lang";
import { cn } from "@/lib/utils";

const ROTATING_WORDS = {
  es: ["impactan", "venden", "suman"],
  en: ["impact", "sell", "add up"],
} as const;

const SPRING = { type: "spring" as const, stiffness: 260, damping: 28, mass: 0.7 };

/** Palabra que gira con ancho animado — el lead no salta en seco. */
function RotatingKeyword({
  words,
  index,
}: {
  words: readonly string[];
  index: number;
}) {
  const word = words[index] ?? words[0]!;
  const measureRef = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    el.textContent = word;
    setWidth(el.offsetWidth);
  }, [word]);

  return (
    <motion.span
      className="relative inline-block overflow-x-clip overflow-y-visible align-baseline text-left font-bold text-ok-indigo"
      initial={false}
      animate={{ width: width ?? "auto" }}
      transition={SPRING}
      style={{ minHeight: "1.15em", verticalAlign: "baseline" }}
    >
      {/* medidor invisible — misma tipografía que la palabra visible */}
      <span
        ref={measureRef}
        className="invisible absolute left-0 top-0 whitespace-nowrap font-bold"
        aria-hidden
      />
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={word}
          className="inline-block whitespace-nowrap font-bold text-ok-indigo"
          initial={{ y: "45%", opacity: 0, filter: "blur(5px)" }}
          animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-45%", opacity: 0, filter: "blur(5px)" }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        >
          {word}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
}

const SITES = [
  {
    id: "altus",
    name: "Altus",
    url: "https://www.altus.gt",
    icon: "/12.png",
  },
  {
    id: "zacsa",
    name: "Zacsa",
    url: "https://zacsaweb.vercel.app",
    icon: "/11.png",
  },
  {
    id: "topcell",
    name: "Topcell",
    url: "https://topcellgt.com",
    icon: "/3.png",
  },
] as const;

export function SitesScrollShowcase() {
  const { lang, t } = useLang();
  const words = ROTATING_WORDS[lang];
  const [wordIndex, setWordIndex] = useState(0);
  const [activeSite, setActiveSite] = useState<(typeof SITES)[number]["id"]>("altus");

  useEffect(() => {
    const id = window.setInterval(() => {
      setWordIndex((i) => (i + 1) % words.length);
    }, 2600);
    return () => window.clearInterval(id);
  }, [words.length]);

  const site: (typeof SITES)[number] =
    SITES.find((s) => s.id === activeSite) ?? SITES[0];

  return (
    <section
      aria-label={t.sites_scroll_aria}
      id="work"
      className="relative scroll-mt-28"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,oklch(0.55_0.2_265_/_0.08),transparent_50%)]"
        aria-hidden
      />

      <div className="flex flex-col">
        <ContainerScroll
          titleComponent={
            <div className="flex justify-center px-4">
              <h2 className="inline-flex max-w-full flex-wrap items-baseline justify-center gap-x-[0.3em] text-center text-[clamp(1.85rem,5vw,3.5rem)] font-semibold leading-[1.12] tracking-tight text-ok-text">
                <span className="whitespace-nowrap">{t.sites_scroll_lead}</span>
                <RotatingKeyword words={words} index={wordIndex} />
              </h2>
            </div>
          }
        >
          <div className="relative flex h-full w-full flex-col">
            {/* Chrome / switcher */}
            <div className="z-20 flex shrink-0 items-center gap-1.5 border-b border-white/[0.08] bg-[#1a1a1a] px-2 py-2 pt-7 md:gap-3 md:px-4 md:py-2.5 md:pt-2.5">
              <div className="mr-1 hidden items-center gap-1.5 md:flex" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              </div>

              <div
                className="flex min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto md:justify-start md:gap-2"
                role="tablist"
                aria-label={t.sites_scroll_switcher}
              >
                {SITES.map((s) => {
                  const active = s.id === activeSite;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setActiveSite(s.id)}
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors sm:gap-2 sm:px-3 sm:py-1.5 sm:text-xs md:text-sm",
                        active
                          ? "bg-white/12 text-ok-text ring-1 ring-white/15"
                          : "text-ok-mute hover:bg-white/[0.06] hover:text-ok-text"
                      )}
                    >
                      {s.icon ? (
                        <span className="relative h-3.5 w-3.5 overflow-hidden sm:h-4 sm:w-4 md:h-5 md:w-5">
                          <Image
                            src={s.icon}
                            alt=""
                            fill
                            className="object-contain"
                            sizes="20px"
                          />
                        </span>
                      ) : null}
                      <span className="md:inline">{s.name}</span>
                    </button>
                  );
                })}
              </div>

              {site.url ? (
                <a
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/10 p-1.5 text-[11px] text-ok-mute transition-colors hover:border-white/20 hover:text-ok-text md:gap-1.5 md:px-2.5 md:py-1.5 md:text-xs"
                  aria-label={t.sites_scroll_open}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">{t.sites_scroll_open}</span>
                </a>
              ) : null}
            </div>

            {/* Viewport del sitio */}
            <div className="relative min-h-0 flex-1 bg-white pb-4 md:bg-ok-ink md:pb-0">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={site.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="absolute inset-0"
                >
                  <iframe
                    title={`${site.name} website`}
                    src={site.url}
                    className="h-full w-full border-0 bg-white"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </ContainerScroll>
      </div>
    </section>
  );
}
