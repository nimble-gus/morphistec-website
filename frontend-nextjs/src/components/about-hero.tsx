"use client";

import Link from "next/link";
import { useLang } from "@/components/lang";
import { WhatsAppButton } from "@/components/whatsapp-button";

export function AboutHero() {
  const { t } = useLang();

  return (
    <section className="relative min-h-[560px] overflow-hidden border-b border-ok-line px-4 pb-14 pt-28 sm:px-6 sm:pt-32 md:min-h-[680px] md:px-10 md:pb-20 md:pt-40">
      <div className="relative z-10 mx-auto max-w-[1280px]">
        <div className="w-full max-w-3xl pl-3 sm:pl-6 lg:pl-4">
          <span className="ok-eyebrow">{t.about_eyebrow}</span>
          <h1
            className="mt-4 max-w-[900px] font-medium"
            style={{
              fontSize: "clamp(36px, 11vw, 96px)",
              lineHeight: 0.95,
              letterSpacing: "-0.045em",
            }}
          >
            {t.about_hero_title.map((line, i) => (
              <span
                key={i}
                className="block animate-float-in"
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                {i === 1 ? (
                  <em
                    className="font-serif italic font-normal"
                    style={{
                      color: "var(--ok-neon)",
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

          <p className="mt-8 max-w-[560px] text-base leading-snug text-ok-mute sm:text-lg">
            {t.about_hero_sub}
          </p>

          <div className="mt-10 flex w-full max-w-[900px] flex-col gap-3 sm:flex-row">
            <WhatsAppButton className="ok-btn ok-btn-primary w-full text-center sm:w-auto">
              {t.hero_cta}
            </WhatsAppButton>
            <Link href="/" className="ok-btn ok-btn-ghost w-full text-center sm:w-auto">
              {t.about_cta_home}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
