"use client";

import Link from "next/link";
import { useLang } from "@/components/lang";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { AutomationLaptopUI } from "@/components/automation-laptop-ui";

export function AutomationHero() {
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
            right: 200,
            top: 300,
            width: 500,
            height: 500,
            background:
              "radial-gradient(circle, oklch(0.55 0.2 265 / 0.1) 0%, transparent 60%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1600px]">
        <div className="relative grid min-h-0 grid-cols-1 gap-10 py-8 md:min-h-[760px] lg:grid-cols-[440px_minmax(0,1fr)] lg:items-start lg:gap-x-6 lg:gap-y-10 lg:py-8 xl:gap-x-10">
          <div className="w-full max-w-xl pl-3 sm:pl-6 lg:max-w-xl lg:pl-4 lg:pr-4">
            <span className="ok-eyebrow">{t.automation_eyebrow}</span>
            <h1
              className="mt-4 font-medium max-w-[1000px]"
              style={{
                fontSize: "clamp(36px, 11vw, 96px)",
                lineHeight: 0.95,
                letterSpacing: "-0.045em",
              }}
            >
              {t.automation_hero_title.map((line, i) => (
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
              {t.automation_hero_sub}
            </p>

            <div className="mt-10 flex w-full max-w-[900px] flex-col gap-3 sm:flex-row">
              <WhatsAppButton className="ok-btn ok-btn-primary w-full text-center sm:w-auto">
                {t.hero_cta}
              </WhatsAppButton>
              <Link href="/" className="ok-btn ok-btn-ghost w-full text-center sm:w-auto">
                {t.automation_cta_home}
              </Link>
            </div>
          </div>

          <div className="flex min-h-0 w-full min-w-0 justify-center self-stretch lg:items-start lg:justify-end lg:pt-10 xl:pt-12">
            <div className="w-full max-w-[min(920px,100%)]">
              <div className="relative overflow-hidden rounded-t-[20px] border border-[#3a4254] bg-[#0c101a] shadow-[0_30px_90px_rgba(0,0,0,.55)]">
                <div className="flex h-9 items-center gap-2 border-b border-white/10 bg-[#161c29] px-4 sm:h-10">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                </div>
                <div className="relative aspect-[16/10] w-full bg-[#0f172a]">
                  <div className="absolute inset-0 overflow-hidden p-0.5 sm:p-1">
                    <AutomationLaptopUI />
                  </div>
                </div>
              </div>
              <div className="mx-auto h-5 w-[100%] rounded-b-[16px] bg-gradient-to-b from-[#9ca3b4] to-[#4b5567]" />
              <div className="mx-auto mt-1 h-2 w-[42%] rounded-full bg-[#2c3444]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
