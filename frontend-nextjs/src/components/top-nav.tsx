"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { OktaeLogo } from "./logo";
import { useLang } from "./lang";
import { WHATSAPP_URL } from "@/lib/contact";

export function TopNav() {
  const { lang, setLang, t } = useLang();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const navHrefs = ["#services", "#process", "#work", "/nosotros"];

  function resolveHref(href: string) {
    if (href.startsWith("#") && !isHome) {
      return `/${href}`;
    }
    return href;
  }
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none px-4 pt-[max(0.75rem,env(safe-area-inset-top,0px))] md:px-6 md:pt-5"
    >
      <nav
        className="pointer-events-auto mx-auto flex max-w-[min(100%,1200px)] items-center justify-between gap-2 rounded-full border border-white/[0.1] bg-ok-ink/80 py-2 pl-3 pr-2 shadow-[0_10px_40px_-4px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.04)_inset] backdrop-blur-xl sm:gap-3 sm:py-2.5 sm:pl-4 sm:pr-2.5 md:gap-6 md:pl-6 md:pr-3"
        aria-label="Principal"
      >
        <Link href="/" className="shrink-0">
          <OktaeLogo size={24} />
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-center gap-6 md:flex lg:gap-8">
          {t.nav.map((n, i) => {
            const href = resolveHref(navHrefs[i] ?? "#");
            const isHashOnHome = href.startsWith("#");
            return isHashOnHome ? (
              <a
                key={i}
                href={href}
                className="whitespace-nowrap text-sm text-ok-mute transition-colors hover:text-ok-text"
              >
                {n}
              </a>
            ) : (
              <Link
                key={i}
                href={href}
                className="whitespace-nowrap text-sm text-ok-mute transition-colors hover:text-ok-text"
              >
                {n}
              </Link>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          <div className="flex rounded-full border border-ok-line-2 p-[3px] font-mono text-[10px] sm:text-[11px]">
            {(["es", "en"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className="rounded-full px-2 py-1 font-semibold uppercase transition-all sm:px-2.5"
                style={{
                  background: lang === l ? "var(--ok-neon)" : "transparent",
                  color: lang === l ? "#050505" : "#8a8a8a",
                }}
              >
                {l}
              </button>
            ))}
          </div>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ok-btn ok-btn-primary rounded-full px-3 py-2 text-[11px] font-medium sm:px-4 sm:py-2.5 sm:text-[12px] md:px-5 md:text-[13px]"
          >
            {t.cta_nav}
          </a>
        </div>
      </nav>
    </header>
  );
}
