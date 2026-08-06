"use client";

import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/components/lang";

export const ECOMMERCE_PREVIEW_URL = "https://www.topcellgt.com/catalogo";

/**
 * Preview embebido del catálogo e-commerce (TopCell) con link al sitio real.
 */
export function EcommerceSitePreview({
  className,
  active = true,
}: {
  className?: string;
  active?: boolean;
}) {
  const { lang } = useLang();
  const label =
    lang === "es" ? "Ver catálogo en vivo" : "View live catalog";
  const host = "topcellgt.com/catalogo";

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col overflow-hidden bg-[#0c0c0c]",
        className
      )}
    >
      {/* Chrome de browser */}
      <div className="flex shrink-0 items-center gap-2 border-b border-white/10 bg-[#1a1a1a] px-2.5 py-2">
        <div className="hidden items-center gap-1 sm:flex" aria-hidden>
          <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
          <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
          <span className="h-2 w-2 rounded-full bg-[#28c840]" />
        </div>
        <div className="min-w-0 flex-1 truncate rounded-md bg-white/[0.06] px-2.5 py-1 text-[10px] text-ok-mute sm:text-[11px]">
          {host}
        </div>
        <a
          href={ECOMMERCE_PREVIEW_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-medium text-ok-text transition-colors hover:border-[var(--ok-indigo)]/50 hover:bg-[var(--ok-indigo)]/15 sm:text-[11px]"
        >
          <ExternalLink className="h-3 w-3" />
          <span className="hidden sm:inline">{label}</span>
        </a>
      </div>

      <div className="relative min-h-0 flex-1 bg-white">
        {active ? (
          <iframe
            title="TopCell catálogo e-commerce"
            src={ECOMMERCE_PREVIEW_URL}
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#111] text-[11px] text-ok-mute">
            topcellgt.com
          </div>
        )}

        {active && (
          <a
            href={ECOMMERCE_PREVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-3 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/15 bg-black/75 px-3 py-1.5 text-[11px] font-medium text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-[var(--ok-indigo)]"
            aria-label={label}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {label}
          </a>
        )}
      </div>
    </div>
  );
}
