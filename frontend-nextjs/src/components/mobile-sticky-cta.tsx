"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/components/lang";
import { WhatsAppButton } from "@/components/whatsapp-button";

/** CTAs fijos al hacer scroll — solo móvil. */
export function MobileStickyCta() {
  const { t } = useLang();
  const pathname = usePathname();
  const servicesHref = pathname === "/" ? "#services" : "/#services";

  return (
    <div className="mobile-floating-cta pointer-events-none fixed inset-x-0 bottom-0 z-40 sm:hidden">
      <div
        className="pointer-events-auto border-t border-white/[0.08] px-3 pt-2"
        style={{
          paddingBottom: "max(0.5rem, env(safe-area-inset-bottom, 0px))",
          background:
            "linear-gradient(to top, oklch(0.2 0.005 260 / 0.97) 55%, oklch(0.2 0.005 260 / 0.75) 100%)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="mx-auto flex max-w-lg gap-2">
          <WhatsAppButton className="ok-btn ok-btn-primary min-w-0 flex-1 justify-center px-3 py-2.5 text-center text-[13px]">
            {t.hero_cta}
          </WhatsAppButton>
          <Link
            href={servicesHref}
            className="ok-btn ok-btn-ghost min-w-0 flex-1 justify-center px-3 py-2.5 text-center text-[13px]"
          >
            {t.hero_cta_2}
          </Link>
        </div>
      </div>
    </div>
  );
}
