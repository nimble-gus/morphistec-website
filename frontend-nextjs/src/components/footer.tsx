"use client";

import { useCallback, useState } from "react";
import { Instagram, Linkedin } from "lucide-react";
import { OktaeLogo } from "./logo";
import { useLang } from "./lang";
import { LegalModal } from "@/components/ui/legal-modal";
import type { LegalDoc } from "@/lib/legal-content";

const LINKEDIN_URL =
  process.env.NEXT_PUBLIC_LINKEDIN_URL?.trim() || "https://www.linkedin.com/";
const INSTAGRAM_URL =
  process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() || "https://www.instagram.com/";

function Col({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="font-mono text-[11px] text-ok-dim uppercase tracking-[0.12em] mb-4">
        {title}
      </div>
      <ul className="list-none flex flex-col gap-2.5">
        {items.map((it, i) => (
          <li key={i} className="text-sm text-ok-text cursor-pointer">
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const { t } = useLang();
  const [legalDoc, setLegalDoc] = useState<LegalDoc | null>(null);
  const closeLegal = useCallback(() => setLegalDoc(null), []);

  return (
    <footer className="bg-ok-black border-t border-ok-line px-4 pb-8 pt-12 sm:px-6 md:px-10 md:pt-16">
      <div className="mb-12 grid grid-cols-1 gap-10 sm:grid-cols-2 md:mb-14 md:gap-12 lg:grid-cols-3 lg:gap-14">
        <div>
          <OktaeLogo size={26} />
          <p className="mt-4 text-ok-mute text-sm max-w-[320px] leading-relaxed">
            {t.footer_tag}
          </p>
        </div>
        <Col title="Services" items={["E-commerce", "Custom apps", "Automations", "Dashboards"]} />
        <div>
          <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.12em] text-ok-dim">
            Contact
          </div>
          <a
            href="mailto:hola@oktae.tech"
            className="block text-sm text-ok-text underline-offset-4 transition-colors hover:text-[var(--ok-neon)] hover:underline"
          >
            hola@oktae.tech
          </a>
          <div className="mt-4 flex items-center gap-3">
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/14 text-ok-text transition-colors hover:border-[var(--ok-neon)] hover:text-[var(--ok-neon)]"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" strokeWidth={1.5} aria-hidden />
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/14 text-ok-text transition-colors hover:border-[var(--ok-neon)] hover:text-[var(--ok-neon)]"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" strokeWidth={1.5} aria-hidden />
            </a>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-start justify-between gap-3 border-t border-ok-line pt-6 font-mono text-[11px] uppercase tracking-[0.1em] text-ok-dim sm:flex-row sm:items-center sm:gap-4">
        <span>© 2026 Oktae.Tech</span>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 normal-case tracking-normal">
          <a
            href="/terminos"
            className="cursor-pointer text-ok-dim underline-offset-4 transition-colors hover:text-[var(--ok-neon)] hover:underline"
            onClick={(e) => {
              e.preventDefault();
              setLegalDoc("terms");
            }}
          >
            {t.footer_terms}
          </a>
          <a
            href="/privacidad"
            className="cursor-pointer text-ok-dim underline-offset-4 transition-colors hover:text-[var(--ok-neon)] hover:underline"
            onClick={(e) => {
              e.preventDefault();
              setLegalDoc("privacy");
            }}
          >
            {t.footer_privacy}
          </a>
          <a
            href="/eliminacion-datos"
            className="cursor-pointer text-ok-dim underline-offset-4 transition-colors hover:text-[var(--ok-neon)] hover:underline"
            onClick={(e) => {
              e.preventDefault();
              setLegalDoc("deletion");
            }}
          >
            {t.footer_deletion}
          </a>
        </div>
        <span>{t.footer_made}</span>
      </div>

      <LegalModal doc={legalDoc} onClose={closeLegal} />
    </footer>
  );
}
