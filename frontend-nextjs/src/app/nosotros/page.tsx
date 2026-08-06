"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Linkedin, Plus, Minus } from "lucide-react";
import { LangProvider, useLang } from "@/components/lang";
import { TopNav } from "@/components/top-nav";
import { AboutHero } from "@/components/about-hero";
import { Footer } from "@/components/footer";
import { CTASection } from "@/components/cta-section";
import { cn } from "@/lib/utils";

const HOME_SECTION_HASHES = new Set(["#services", "#process", "#work", "#contact"]);

/**
 * Estructura inspirada en Zacsa /nosotros:
 * intro → visión / misión + equipo compacto → valores → CTA
 * Visual e identidad: Oktae (carbon, indigo, amber, Poppins, Oldport).
 * @see https://zacsaweb.vercel.app/nosotros
 */
function NosotrosContent() {
  const { t } = useLang();
  const router = useRouter();
  const [openValue, setOpenValue] = useState(0);

  useEffect(() => {
    const hash = window.location.hash;
    if (HOME_SECTION_HASHES.has(hash)) {
      router.replace(`/${hash}`);
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-ok-black pb-[9.5rem] sm:pb-0">
      <TopNav />
      <AboutHero />

      <div className="relative z-[20] bg-ok-black">
        {/* Visión + Misión → Equipo (compacto, mobile + desktop) */}
        <section className="px-4 py-10 sm:px-6 sm:py-14 md:px-10 md:py-20">
          <div className="mx-auto max-w-[1280px]">
            <div className="grid gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-16">
              <div>
                <span className="ok-eyebrow">{t.about_vision_title}</span>
                <h2
                  className="mt-2.5 font-medium leading-[1.1] text-ok-text sm:mt-3"
                  style={{
                    fontSize: "clamp(1.35rem, 4.2vw, 2.25rem)",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {t.about_vision_lead}
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-ok-mute sm:mt-4 sm:text-[15px] sm:leading-7">
                  {t.about_vision_body}
                </p>
              </div>
              <div>
                <span className="ok-eyebrow">{t.about_mission_title}</span>
                <h2
                  className="mt-2.5 font-medium leading-[1.1] text-ok-text sm:mt-3"
                  style={{
                    fontSize: "clamp(1.35rem, 4.2vw, 2.25rem)",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {t.about_mission_lead}
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-ok-mute sm:mt-4 sm:text-[15px] sm:leading-7">
                  {t.about_mission_body}
                </p>
              </div>
            </div>

            {/* Perfil fundador — móvil: retrato + datos; sm+: banda horizontal */}
            <div className="mt-8 border-t border-white/[0.08] pt-7 sm:mt-12 sm:pt-10 md:mt-16 md:pt-12">
              <div className="mb-5 flex flex-col gap-1.5 sm:mb-6 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-3">
                <h2
                  className="font-medium text-ok-text"
                  style={{
                    fontSize: "clamp(1.35rem, 3.5vw, 1.75rem)",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {t.about_team_eyebrow}
                </h2>
                <p className="max-w-md text-sm leading-relaxed text-ok-mute">
                  {t.about_team_intro}
                </p>
              </div>

              <article className="border border-white/[0.08] bg-ok-card/25 sm:overflow-hidden">
                {/* Móvil: foto cuadrada + identidad en fila */}
                <div className="flex gap-4 p-4 sm:hidden">
                  <div className="relative h-[112px] w-[112px] shrink-0 overflow-hidden bg-ok-card">
                    <Image
                      src="/founder.jpg"
                      alt={`${t.about_team_name}, ${t.about_team_role}`}
                      fill
                      sizes="112px"
                      className="object-cover object-[center_15%]"
                      priority
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <h3
                      className="text-base font-semibold text-ok-text"
                      style={{ letterSpacing: "-0.02em" }}
                    >
                      {t.about_team_name}
                    </h3>
                    <span className="mt-0.5 text-[13px] leading-snug text-[var(--ok-emphasis)]">
                      {t.about_team_role}
                    </span>
                    <a
                      href="mailto:gus@oktae.tech"
                      className="mt-2 w-fit text-[13px] text-ok-mute underline-offset-4 transition-colors hover:text-ok-text hover:underline"
                    >
                      gus@oktae.tech
                    </a>
                    <a
                      href={t.about_team_linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2.5 inline-flex w-fit items-center gap-1.5 text-[13px] text-ok-text transition-colors hover:text-[var(--ok-indigo)]"
                    >
                      <Linkedin className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                      LinkedIn
                    </a>
                  </div>
                </div>
                <div className="space-y-2.5 border-t border-white/[0.06] px-4 pb-5 pt-4 sm:hidden">
                  {t.about_team_bio.map((para, i) => (
                    <p key={i} className="text-sm leading-relaxed text-ok-mute">
                      {para}
                    </p>
                  ))}
                </div>

                {/* Desktop / tablet: banda horizontal */}
                <div className="group hidden sm:flex sm:items-stretch">
                  <div className="relative w-[180px] shrink-0 overflow-hidden bg-ok-card md:w-[220px]">
                    <div className="relative h-full min-h-[240px] w-full">
                      <Image
                        src="/founder.jpg"
                        alt={`${t.about_team_name}, ${t.about_team_role}`}
                        fill
                        sizes="220px"
                        className="object-cover object-[center_12%] scale-[1.1] origin-top transition-transform duration-500 group-hover:scale-[1.12]"
                      />
                      <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(to top, oklch(0.24 0.005 260 / 0.35) 0%, transparent 40%)",
                        }}
                        aria-hidden
                      />
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center px-7 py-6 md:px-8">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h3
                        className="text-xl font-semibold text-ok-text"
                        style={{ letterSpacing: "-0.02em" }}
                      >
                        {t.about_team_name}
                      </h3>
                      <span className="text-sm text-[var(--ok-emphasis)]">
                        {t.about_team_role}
                      </span>
                    </div>
                    <a
                      href="mailto:gus@oktae.tech"
                      className="mt-1.5 w-fit text-sm text-ok-mute underline-offset-4 transition-colors hover:text-ok-text hover:underline"
                    >
                      gus@oktae.tech
                    </a>
                    <div className="mt-3 max-w-2xl space-y-2">
                      {t.about_team_bio.map((para, i) => (
                        <p key={i} className="text-sm leading-relaxed text-ok-mute">
                          {para}
                        </p>
                      ))}
                    </div>
                    <a
                      href={t.about_team_linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex w-fit items-center gap-2 text-sm text-ok-text transition-colors hover:text-[var(--ok-indigo)]"
                    >
                      <Linkedin className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                      LinkedIn
                    </a>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Valores — acordeón (ritmo Zacsa) */}
        <section className="px-4 py-16 sm:px-6 sm:py-20 md:px-10 md:py-28">
          <div className="mx-auto max-w-[1280px]">
            <h2
              className="max-w-xl font-medium leading-[1.05] text-ok-text"
              style={{
                fontSize: "clamp(2rem, 4.5vw, 3.5rem)",
                letterSpacing: "-0.035em",
              }}
            >
              {t.about_values_title}
            </h2>

            <div className="mt-12 border-t border-white/[0.08]">
              {t.about_values.map((v, i) => {
                const open = openValue === i;
                return (
                  <div
                    key={v.title}
                    className="border-b border-white/[0.08]"
                  >
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenValue(open ? -1 : i)}
                      className="flex w-full items-center justify-between gap-6 py-6 text-left transition-colors hover:text-white sm:py-7"
                    >
                      <span className="flex min-w-0 items-baseline gap-4">
                        <span className="shrink-0 font-mono text-xs tracking-widest text-ok-mute">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span
                          className="text-xl font-medium text-ok-text sm:text-2xl"
                          style={{ letterSpacing: "-0.02em" }}
                        >
                          {v.title}
                        </span>
                      </span>
                      <span className="shrink-0 text-ok-mute" aria-hidden>
                        {open ? (
                          <Minus className="h-5 w-5" strokeWidth={1.5} />
                        ) : (
                          <Plus className="h-5 w-5" strokeWidth={1.5} />
                        )}
                      </span>
                    </button>
                    <div
                      className={cn(
                        "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
                        open
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      )}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <p className="max-w-2xl pb-7 pl-0 text-[15px] leading-relaxed text-ok-mute sm:pl-11 sm:text-base sm:leading-7">
                          {v.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <CTASection />
        <Footer />
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
