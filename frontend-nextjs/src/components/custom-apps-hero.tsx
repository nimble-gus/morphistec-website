"use client";

import Link from "next/link";
import Image from "next/image";
import { useLang } from "@/components/lang";
import { BookCallModal } from "@/components/ui/book-call-modal";

export function CustomAppsHero() {
  const { t } = useLang();

  return (
    <section className="relative min-h-[720px] overflow-hidden border-b border-ok-line px-4 pb-14 pt-28 sm:px-6 sm:pt-32 md:min-h-[880px] md:px-10 md:pb-20 md:pt-40">
      <div
        className="pointer-events-none fixed inset-0 z-[5] h-[100dvh] min-h-[100vh] w-full overflow-hidden"
        aria-hidden
      >
        <div className="ok-grid-bg absolute inset-0 opacity-40" />
        <div
          className="absolute pointer-events-none"
          style={{
            right: 200,
            top: 300,
            width: 500,
            height: 500,
            background:
              "radial-gradient(circle, rgba(184,255,46,0.12) 0%, transparent 60%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1600px]">
        <div className="relative min-h-[620px] py-8 md:min-h-[760px]">
          <div className="pl-3 sm:pl-6 md:pl-10 md:pr-[760px] lg:pl-14 lg:pr-[940px]">
            <span className="ok-eyebrow">{t.custom_apps_eyebrow}</span>
            <h1
              className="mt-4 font-medium max-w-[1000px]"
              style={{
                fontSize: "clamp(36px, 11vw, 96px)",
                lineHeight: 0.95,
                letterSpacing: "-0.045em",
              }}
            >
              {t.custom_apps_hero_title.map((line, i) => (
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

            <p className="mt-8 max-w-[520px] text-base leading-snug text-ok-mute sm:text-lg">
              {t.custom_apps_hero_sub}
            </p>

            <div className="mt-10 flex w-full max-w-[900px] flex-col gap-3 sm:flex-row">
              <BookCallModal triggerLabel={t.hero_cta} />
              <Link href="/" className="ok-btn ok-btn-ghost w-full text-center sm:w-auto">
                {t.custom_apps_cta_home}
              </Link>
            </div>
          </div>

          <div className="relative mt-10 flex items-center justify-center md:absolute md:right-8 md:top-1/2 md:mt-0 md:-translate-y-1/2 lg:right-12">
            <div className="w-[832px] max-w-[95vw]">
              <div className="relative overflow-hidden rounded-t-[20px] border border-[#3a4254] bg-[#0c101a] shadow-[0_30px_90px_rgba(0,0,0,.55)]">
                <div className="flex h-9 items-center gap-2 border-b border-white/10 bg-[#161c29] px-4">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                </div>
                <div className="relative aspect-[16/10] w-full bg-[#0f172a]">
                  <Image
                    src="/app.png"
                    alt="Vista de la app en MacBook"
                    fill
                    className="object-contain object-center"
                    priority
                  />
                </div>
              </div>
              <div className="mx-auto h-6 w-[100%] rounded-b-[18px] bg-gradient-to-b from-[#9ca3b4] to-[#4b5567]" />
              <div className="mx-auto mt-1 h-2 w-[42%] rounded-full bg-[#2c3444]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
