"use client";

import Image from "next/image";
import Link from "next/link";
import { Lock } from "lucide-react";
import { useLang } from "@/components/lang";
import { WhatsAppButton } from "@/components/whatsapp-button";

export function EcommerceHero() {
  const { t } = useLang();

  return (
    <section className="relative min-h-0 overflow-hidden border-b border-ok-line px-4 pb-14 pt-28 sm:px-6 sm:pt-32 md:min-h-[880px] md:px-10 md:pb-20 md:pt-40">
      <div
        className="pointer-events-none fixed inset-0 z-[5] h-[100dvh] min-h-[100vh] w-full overflow-hidden"
        aria-hidden
      >
        <div className="ok-grid-bg absolute inset-0 opacity-40" />
        <div
          className="absolute pointer-events-none"
          style={{
            left: "20%",
            top: "40%",
            width: 480,
            height: 480,
            background:
              "radial-gradient(circle, oklch(0.55 0.2 265 / 0.08) 0%, transparent 65%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1600px]">
        <div className="relative grid min-h-0 grid-cols-1 gap-10 py-8 md:min-h-[760px] lg:grid-cols-[440px_minmax(0,1fr)] lg:items-start lg:gap-x-6 lg:gap-y-10 lg:py-8 xl:gap-x-10">
          <div className="w-full max-w-xl pl-3 sm:pl-6 lg:max-w-xl lg:pl-4 lg:pr-4">
            <span className="ok-eyebrow">{t.ecommerce_eyebrow}</span>
            <h1
              className="mt-4 font-medium max-w-[1000px]"
              style={{
                fontSize: "clamp(36px, 11vw, 96px)",
                lineHeight: 0.95,
                letterSpacing: "-0.045em",
              }}
            >
              {t.ecommerce_hero_title.map((line, i) => (
                <span
                  key={i}
                  className="block animate-float-in"
                  style={{ animationDelay: `${i * 0.12}s` }}
                >
                  {i === 1 ? (
                    <em
                      className="font-serif italic font-normal"
                      style={{
                        color: "var(--ok-emphasis)",
                        fontSize: "clamp(40px, 12vw, 108px)",
                        lineHeight: 0.88,
                      }}
                    >
                      {line}
                    </em>
                  ) : (
                    line
                  )}
                </span>
              ))}
            </h1>

            <p className="mt-8 max-w-[520px] text-base leading-snug text-ok-mute sm:text-lg">
              {t.ecommerce_hero_sub}
            </p>

            <ul className="mt-6 space-y-2 text-sm text-ok-mute sm:text-base">
              {t.ecommerce_bullets.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ok-neon)]"
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap gap-2">
              {t.ecommerce_industries.map((industry) => (
                <span
                  key={industry}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-300"
                >
                  {industry}
                </span>
              ))}
            </div>

            <div className="mt-10 flex w-full max-w-[900px] flex-col gap-3 sm:flex-row">
              <WhatsAppButton className="ok-btn ok-btn-primary w-full text-center sm:w-auto">
                {t.hero_cta}
              </WhatsAppButton>
              <Link href="/" className="ok-btn ok-btn-ghost w-full text-center sm:w-auto">
                {t.ecommerce_cta_home}
              </Link>
            </div>
          </div>

          <div className="flex min-h-0 w-full min-w-0 justify-center self-stretch lg:items-start lg:justify-end lg:pt-8 xl:pt-10">
            <div className="relative w-full max-w-[min(920px,100%)]">
              <div
                className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-[var(--ok-neon)]/10 blur-3xl"
                aria-hidden
              />
              <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-[#f4f4f5] shadow-[0_32px_90px_-24px_rgba(0,0,0,0.65)] sm:rounded-3xl">
                <div className="flex items-center gap-3 border-b border-black/[0.06] bg-white px-3 py-2.5 sm:px-4 sm:py-3">
                  <div className="flex gap-1.5" aria-hidden>
                    <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                  </div>
                  <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-black/[0.06] bg-[#f8f8f8] px-3 py-1.5">
                    <Lock className="h-3 w-3 shrink-0 text-emerald-600" aria-hidden />
                    <span className="truncate font-mono text-[10px] text-zinc-500 sm:text-[11px]">
                      {t.ecommerce_frame_url}
                    </span>
                  </div>
                </div>
                <div className="relative aspect-[16/10] w-full bg-white">
                  <Image
                    src="/pic6.png"
                    alt={t.ecommerce_frame_alt}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 920px"
                    className="object-cover object-top"
                  />
                </div>
              </div>
              <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500 sm:text-[11px]">
                {t.ecommerce_frame_caption}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
