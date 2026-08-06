"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Linkedin } from "lucide-react";
import { LangProvider, useLang } from "@/components/lang";
import { TopNav } from "@/components/top-nav";
import { AboutHero } from "@/components/about-hero";
import AetherFlowHero from "@/components/ui/aether-flow-hero";
import { Footer } from "@/components/footer";

const HOME_SECTION_HASHES = new Set(["#services", "#process", "#work", "#contact"]);

function NosotrosContent() {
  const { t } = useLang();
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    if (HOME_SECTION_HASHES.has(hash)) {
      router.replace(`/${hash}`);
    }
  }, [router]);

  return (
    <main className="relative min-h-screen">
      <div
        className="pointer-events-none fixed inset-0 z-[5] h-[100dvh] min-h-[100vh] w-full overflow-hidden"
        aria-hidden
      >
        <div className="ok-grid-bg absolute inset-0 opacity-40" />
        <div className="absolute inset-0 opacity-80">
          <AetherFlowHero className="min-h-[100dvh] h-full" />
        </div>
        <div
          className="pointer-events-none absolute"
          style={{
            left: "15%",
            top: "35%",
            width: 520,
            height: 520,
            background:
              "radial-gradient(circle, oklch(0.55 0.2 265 / 0.08) 0%, transparent 65%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      <div className="relative z-10">
      <TopNav />
      <AboutHero />

      <div className="relative">
        {/* Mission */}
        <section className="relative scroll-mt-28 border-b border-ok-line px-4 py-20 sm:px-6 md:px-10 md:py-36">
          <div className="mx-auto max-w-[1280px]">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
              <div>
                <span className="ok-eyebrow">{t.about_mission_title}</span>
                <h2
                  className="mt-4 max-w-[520px] font-medium leading-none"
                  style={{
                    fontSize: "clamp(32px, 4.5vw, 64px)",
                    letterSpacing: "-0.035em",
                  }}
                >
                  {t.about_mission_title.split(" ").slice(0, 1).join(" ")}
                  <br />
                  <em
                    className="font-serif italic font-normal"
                    style={{ color: "var(--ok-neon)" }}
                  >
                    {t.about_mission_title.split(" ").slice(1).join(" ")}
                  </em>
                </h2>
              </div>
              <p className="max-w-[560px] self-end text-base leading-relaxed text-ok-mute sm:text-lg">
                {t.about_mission_body}
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="relative border-b border-ok-line px-4 py-20 sm:px-6 md:px-10 md:py-36">
          <div className="mx-auto max-w-[1280px]">
            <span className="ok-eyebrow">{t.about_eyebrow}</span>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {t.about_values.map((v, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/[0.08] bg-ok-card p-6 transition-colors duration-300 hover:border-[oklch(0.55 0.2 265 / 0.28)] sm:p-8"
                >
                  <span className="mb-4 block font-mono text-xs text-ok-neon">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mb-2 text-base font-medium text-ok-text sm:text-lg">
                    {v.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-ok-mute sm:text-base">
                    {v.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Founder */}
        <section className="relative px-4 py-20 sm:px-6 md:px-10 md:py-36">
          <div className="mx-auto max-w-[1280px]">
            <span className="ok-eyebrow">{t.about_team_eyebrow}</span>
            <h2
              className="mt-4 max-w-[700px] font-medium leading-none"
              style={{
                fontSize: "clamp(32px, 4.5vw, 64px)",
                letterSpacing: "-0.035em",
              }}
            >
              {t.about_team_name.split(" ")[0]}
              <br />
              <em
                className="font-serif italic font-normal"
                style={{ color: "var(--ok-neon)" }}
              >
                {t.about_team_name.split(" ").slice(1).join(" ")}
              </em>
            </h2>

            <div className="relative mt-12 max-w-2xl">
              <div
                className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-[var(--ok-neon)]/10 blur-3xl"
                aria-hidden
              />
              <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white shadow-[0_32px_90px_-24px_rgba(0,0,0,0.65)] sm:rounded-3xl">
                <div className="flex flex-col sm:flex-row sm:items-stretch">
                  <div className="relative h-[280px] w-full shrink-0 overflow-hidden sm:h-[300px] sm:w-[240px]">
                    <Image
                      src="/founder.jpg"
                      alt={`${t.about_team_name}, CEO`}
                      width={576}
                      height={720}
                      sizes="240px"
                      className="h-full w-full object-cover object-top"
                      priority
                    />
                    <a
                      href={t.about_team_linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn"
                      className="absolute bottom-3 left-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md transition-transform hover:scale-105"
                    >
                      <Linkedin size={13} className="text-[#0077b5]" />
                    </a>
                  </div>

                  <div className="flex flex-col justify-center gap-4 px-5 py-6 sm:px-6 sm:py-7">
                    <div>
                      <h3 className="text-xl font-semibold text-neutral-900 sm:text-2xl">
                        {t.about_team_name}
                      </h3>
                      <p className="mt-1 text-xs font-medium text-neutral-500 sm:text-sm">
                        {t.about_team_role}
                      </p>
                    </div>
                    <div className="space-y-2.5">
                      {t.about_team_bio.map((para, i) => (
                        <p key={i} className="text-xs leading-relaxed text-neutral-600 sm:text-sm">
                          {para}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="[&_footer]:bg-transparent">
          <Footer />
        </div>
      </div>
      </div>
    </main>
  );
}

export default function NosotrosPage() {
  return (
    <LangProvider>
      <NosotrosContent />
    </LangProvider>
  );
}
