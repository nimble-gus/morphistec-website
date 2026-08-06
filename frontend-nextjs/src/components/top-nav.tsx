"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { useScroll } from "@/components/ui/use-scroll";
import { OktaeLogo } from "@/components/logo";
import { useLang } from "@/components/lang";
import { WHATSAPP_URL } from "@/lib/contact";

const NAV_HREFS = ["#services", "#process", "#work", "/nosotros"] as const;

export function TopNav() {
  const [open, setOpen] = React.useState(false);
  const scrolled = useScroll(10);
  const { lang, setLang, t } = useLang();
  const pathname = usePathname();
  const isHome = pathname === "/";

  const links = t.nav.map((label, i) => {
    const raw = NAV_HREFS[i] ?? "#";
    const href =
      raw.startsWith("#") && !isHome ? `/${raw}` : raw;
    return { label, href };
  });

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function closeMenu() {
    setOpen(false);
  }

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
          <Link href="/" className="max-w-[min(200px,58vw)] shrink-0 sm:max-w-none" onClick={closeMenu}>
            <OktaeLogo className="h-7 sm:h-[39px]" />
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {links.map((link) =>
              link.href.startsWith("#") || link.href.startsWith("/#") ? (
                <a
                  key={link.label}
                  className={buttonVariants({
                    variant: "ghost",
                    className: "text-ok-mute hover:text-ok-text",
                  })}
                  href={link.href}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  className={buttonVariants({
                    variant: "ghost",
                    className: "text-ok-mute hover:text-ok-text",
                  })}
                  href={link.href}
                >
                  {link.label}
                </Link>
              )
            )}

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
              {links.map((link) =>
                link.href.startsWith("#") || link.href.startsWith("/#") ? (
                  <a
                    key={link.label}
                    className={buttonVariants({
                      variant: "ghost",
                      className: "justify-start text-base",
                    })}
                    href={link.href}
                    onClick={closeMenu}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    className={buttonVariants({
                      variant: "ghost",
                      className: "justify-start text-base",
                    })}
                    href={link.href}
                    onClick={closeMenu}
                  >
                    {link.label}
                  </Link>
                )
              )}
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
    </div>
  );
}

/** Alias del componente importado como Header en demos. */
export const Header = TopNav;
