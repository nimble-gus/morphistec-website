"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { useScroll } from "@/components/ui/use-scroll";
import { OktaeLogo } from "@/components/logo";
import { useLang } from "@/components/lang";
import { WHATSAPP_URL } from "@/lib/contact";
import { LegalModal } from "@/components/ui/legal-modal";
import { MobileStickyCta } from "@/components/mobile-sticky-cta";
import type { LegalDoc } from "@/lib/legal-content";

type NavItem =
  | { kind: "link"; label: string; href: string }
  | { kind: "legal"; label: string };

export function TopNav() {
  const [open, setOpen] = React.useState(false);
  const [legalOpen, setLegalOpen] = React.useState(false);
  const [mobileLegalOpen, setMobileLegalOpen] = React.useState(false);
  const [legalDoc, setLegalDoc] = React.useState<LegalDoc | null>(null);
  const legalRef = React.useRef<HTMLDivElement>(null);
  const scrolled = useScroll(10);
  const { lang, setLang, t } = useLang();
  const pathname = usePathname();
  const isHome = pathname === "/";

  const legalItems: { doc: LegalDoc; label: string; href: string }[] = [
    { doc: "terms", label: t.footer_terms, href: "/terminos" },
    { doc: "privacy", label: t.footer_privacy, href: "/privacidad" },
    { doc: "deletion", label: t.footer_deletion, href: "/eliminacion-datos" },
  ];

  const items: NavItem[] = [
    { kind: "link", label: t.nav[0]!, href: "/" },
    {
      kind: "link",
      label: t.nav[1]!,
      href: isHome ? "#services" : "/#services",
    },
    { kind: "link", label: t.nav[2]!, href: "/nosotros" },
    { kind: "legal", label: t.nav[3]! },
  ];

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    document.body.classList.toggle("nav-menu-open", open);
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("nav-menu-open");
    };
  }, [open]);

  React.useEffect(() => {
    setOpen(false);
    setMobileLegalOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (!legalOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (!legalRef.current?.contains(e.target as Node)) {
        setLegalOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLegalOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [legalOpen]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function closeMenu() {
    setOpen(false);
    setMobileLegalOpen(false);
  }

  function openLegal(doc: LegalDoc) {
    setLegalDoc(doc);
    setLegalOpen(false);
    closeMenu();
  }

  const ghostLink = "text-ok-mute hover:text-ok-text";
  const headerOffset =
    "calc(3.5rem + max(0.5rem, env(safe-area-inset-top, 0px)))";

  return (
    <>
      {/* Panel móvil fuera del header: evita que backdrop-filter rompa position:fixed */}
      {open ? (
        <div
          id="mobile-nav-panel"
          className="fixed inset-0 z-[55] flex flex-col md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menú"
        >
          <div
            className="shrink-0"
            style={{ height: headerOffset }}
            aria-hidden
          />
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain border-t border-border bg-[var(--ok-bg)]/98 px-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-2 backdrop-blur-xl">
            <div className="grid flex-1 content-start gap-y-1 py-2">
              {items.map((item) => {
                if (item.kind === "legal") {
                  return (
                    <div key={item.label} className="grid gap-y-0.5">
                      <button
                        type="button"
                        className={cn(
                          buttonVariants({
                            variant: "ghost",
                            className: "h-12 justify-between px-3 text-base",
                          })
                        )}
                        aria-expanded={mobileLegalOpen}
                        onClick={() => setMobileLegalOpen((v) => !v)}
                      >
                        {item.label}
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            mobileLegalOpen && "rotate-180"
                          )}
                          aria-hidden
                        />
                      </button>
                      {mobileLegalOpen
                        ? legalItems.map((li) => (
                            <a
                              key={li.doc}
                              href={li.href}
                              className={buttonVariants({
                                variant: "ghost",
                                className:
                                  "h-11 justify-start pl-8 text-sm text-ok-mute",
                              })}
                              onClick={(e) => {
                                e.preventDefault();
                                openLegal(li.doc);
                              }}
                            >
                              {li.label}
                            </a>
                          ))
                        : null}
                    </div>
                  );
                }

                if (item.href.startsWith("#") || item.href.startsWith("/#")) {
                  return (
                    <a
                      key={item.label}
                      className={buttonVariants({
                        variant: "ghost",
                        className: "h-12 justify-start px-3 text-base",
                      })}
                      href={item.href}
                      onClick={closeMenu}
                    >
                      {item.label}
                    </a>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    className={buttonVariants({
                      variant: "ghost",
                      className: "h-12 justify-start px-3 text-base",
                    })}
                    href={item.href}
                    onClick={closeMenu}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] px-3 pt-[max(0.5rem,env(safe-area-inset-top,0px))] md:px-4">
        <header
          className={cn(
            "pointer-events-auto mx-auto w-full max-w-5xl border-b border-transparent md:rounded-md md:border md:transition-all md:ease-out",
            {
              "border-border bg-background/95 shadow supports-[backdrop-filter]:bg-background/50 backdrop-blur-lg md:max-w-4xl":
                scrolled && !open,
              "border-border bg-[var(--ok-bg)]": open,
              "md:border-transparent": !scrolled && !open,
            }
          )}
        >
          <nav
            className={cn(
              "flex h-14 w-full items-center justify-between px-3 sm:px-4 md:h-12 md:transition-all md:ease-out",
              {
                "md:px-2": scrolled,
              }
            )}
            aria-label="Principal"
          >
            <Link
              href="/"
              className="max-w-[min(180px,52vw)] shrink-0 sm:max-w-none"
              onClick={closeMenu}
            >
              <OktaeLogo className="h-7 sm:h-[39px]" />
            </Link>

            <div className="hidden items-center gap-1 md:flex">
              {items.map((item) => {
                if (item.kind === "legal") {
                  return (
                    <div key={item.label} ref={legalRef} className="relative">
                      <button
                        type="button"
                        className={cn(
                          buttonVariants({ variant: "ghost" }),
                          ghostLink,
                          "gap-1"
                        )}
                        aria-expanded={legalOpen}
                        aria-haspopup="menu"
                        onClick={() => setLegalOpen((v) => !v)}
                      >
                        {item.label}
                        <ChevronDown
                          className={cn(
                            "h-3.5 w-3.5 transition-transform",
                            legalOpen && "rotate-180"
                          )}
                          aria-hidden
                        />
                      </button>
                      {legalOpen ? (
                        <div
                          role="menu"
                          className="absolute left-0 top-full z-50 mt-1 min-w-[220px] overflow-hidden rounded-lg border border-white/10 bg-[var(--ok-bg-elevated)] py-1 shadow-xl shadow-black/40"
                        >
                          {legalItems.map((li) => (
                            <a
                              key={li.doc}
                              role="menuitem"
                              href={li.href}
                              className="block px-3.5 py-2.5 text-sm text-ok-mute transition-colors hover:bg-white/[0.06] hover:text-ok-text"
                              onClick={(e) => {
                                e.preventDefault();
                                openLegal(li.doc);
                              }}
                            >
                              {li.label}
                            </a>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                }

                if (item.href.startsWith("#") || item.href.startsWith("/#")) {
                  return (
                    <a
                      key={item.label}
                      className={buttonVariants({
                        variant: "ghost",
                        className: ghostLink,
                      })}
                      href={item.href}
                    >
                      {item.label}
                    </a>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    className={buttonVariants({
                      variant: "ghost",
                      className: ghostLink,
                    })}
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <div className="ml-1 flex rounded-full border border-border p-[2px] font-mono text-[10px]">
                {(["es", "en"] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLang(l)}
                    className={cn(
                      "rounded-full px-2 py-1 font-semibold uppercase transition-colors",
                      lang === l
                        ? "bg-primary text-primary-foreground"
                        : "text-ok-mute hover:text-ok-text"
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>

              <Button asChild className="ml-1">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t.cta_nav}
                </a>
              </Button>
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <div
                className="flex rounded-full border border-border p-[2px] font-mono text-[10px]"
                role="group"
                aria-label="Idioma"
              >
                {(["es", "en"] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLang(l)}
                    className={cn(
                      "rounded-full px-2 py-1 font-semibold uppercase transition-colors",
                      lang === l
                        ? "bg-primary text-primary-foreground"
                        : "text-ok-mute hover:text-ok-text"
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setOpen((v) => !v)}
                className="relative z-[61] shrink-0"
                aria-expanded={open}
                aria-controls="mobile-nav-panel"
                aria-label={open ? "Cerrar menú" : "Abrir menú"}
              >
                <MenuToggleIcon open={open} className="size-5" duration={300} />
              </Button>
            </div>
          </nav>
        </header>
      </div>

      <MobileStickyCta />
      <LegalModal doc={legalDoc} onClose={() => setLegalDoc(null)} />
    </>
  );
}

/** Alias del componente importado como Header en demos. */
export const Header = TopNav;
