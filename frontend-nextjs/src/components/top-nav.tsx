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
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-[max(0.5rem,env(safe-area-inset-top,0px))] md:px-4">
      <header
        className={cn(
          "pointer-events-auto sticky top-0 z-50 mx-auto w-full max-w-5xl border-b border-transparent md:rounded-md md:border md:transition-all md:ease-out",
          {
            "border-border bg-background/95 shadow supports-[backdrop-filter]:bg-background/50 backdrop-blur-lg md:top-0 md:max-w-4xl":
              scrolled && !open,
            "border-border bg-background/90 backdrop-blur-md": open,
            "md:border-transparent": !scrolled && !open,
          }
        )}
      >
        <nav
          className={cn(
            "flex h-14 w-full items-center justify-between px-4 md:h-12 md:transition-all md:ease-out",
            {
              "md:px-2": scrolled,
            }
          )}
          aria-label="Principal"
        >
          <Link
            href="/"
            className="max-w-[min(200px,58vw)] shrink-0 sm:max-w-none"
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
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                {t.cta_nav}
              </a>
            </Button>
          </div>

          <Button
            size="icon"
            variant="outline"
            onClick={() => setOpen(!open)}
            className="md:hidden"
            aria-expanded={open}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
          >
            <MenuToggleIcon open={open} className="size-5" duration={300} />
          </Button>
        </nav>

        <div
          className={cn(
            "fixed top-[calc(3.5rem+max(0.5rem,env(safe-area-inset-top,0px)))] right-0 bottom-0 left-0 z-50 flex flex-col overflow-hidden border-y border-border bg-background/95 backdrop-blur-lg md:hidden",
            open ? "block" : "hidden"
          )}
        >
          <div className="flex h-full w-full flex-col justify-between gap-y-2 p-4">
            <div className="grid gap-y-1">
              {items.map((item) => {
                if (item.kind === "legal") {
                  return (
                    <div key={item.label} className="grid gap-y-0.5">
                      <button
                        type="button"
                        className={cn(
                          buttonVariants({
                            variant: "ghost",
                            className: "justify-between text-base",
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
                                  "justify-start pl-8 text-sm text-ok-mute",
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
                        className: "justify-start text-base",
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
                      className: "justify-start text-base",
                    })}
                    href={item.href}
                    onClick={closeMenu}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                {(["es", "en"] as const).map((l) => (
                  <Button
                    key={l}
                    type="button"
                    variant={lang === l ? "default" : "outline"}
                    className="flex-1 uppercase"
                    onClick={() => setLang(l)}
                  >
                    {l}
                  </Button>
                ))}
              </div>
              <Button asChild className="w-full">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMenu}
                >
                  {t.cta_nav}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <LegalModal doc={legalDoc} onClose={() => setLegalDoc(null)} />
    </div>
  );
}

/** Alias del componente importado como Header en demos. */
export const Header = TopNav;
