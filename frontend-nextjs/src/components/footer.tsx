"use client";

import { useCallback, useState } from "react";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import { OktaeLogo } from "./logo";
import { useLang } from "./lang";
import { LegalModal } from "@/components/ui/legal-modal";
import type { LegalDoc } from "@/lib/legal-content";

const LINKEDIN_URL =
  process.env.NEXT_PUBLIC_LINKEDIN_URL?.trim() || "https://www.linkedin.com/";
const INSTAGRAM_URL =
  process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() || "https://www.instagram.com/";
const FACEBOOK_URL =
  process.env.NEXT_PUBLIC_FACEBOOK_URL?.trim() ||
  "https://www.facebook.com/people/Oktae/61591909352976/";

const legalLinkClass =
  "cursor-pointer text-sm text-ok-text underline-offset-4 transition-colors hover:text-[var(--ok-neon)] hover:underline";

export function Footer() {
  const { t } = useLang();
  const [legalDoc, setLegalDoc] = useState<LegalDoc | null>(null);
  const closeLegal = useCallback(() => setLegalDoc(null), []);

  const openLegal = useCallback((doc: LegalDoc) => {
    setLegalDoc(doc);
  }, []);

  return (
    <footer className="relative z-30 -mt-10 bg-[var(--ok-bg)] px-4 pb-8 pt-10 sm:-mt-12 sm:px-6 sm:pt-12 md:px-10 md:pt-14">
      <div className="relative z-10 mb-12 grid grid-cols-1 gap-10 sm:grid-cols-2 md:mb-14 md:gap-12 lg:grid-cols-3 lg:gap-14">
        <div>
          <OktaeLogo size={52} />
          <p className="mt-4 max-w-[320px] text-sm leading-relaxed text-ok-mute">
            {t.footer_tag}
          </p>
        </div>

        <div>
          <ul className="flex list-none flex-col gap-2.5">
            <li>
              <a
                href="/terminos"
                className={legalLinkClass}
                onClick={(e) => {
                  e.preventDefault();
                  openLegal("terms");
                }}
              >
                {t.footer_terms}
              </a>
            </li>
            <li>
              <a
                href="/privacidad"
                className={legalLinkClass}
                onClick={(e) => {
                  e.preventDefault();
                  openLegal("privacy");
                }}
              >
                {t.footer_privacy}
              </a>
            </li>
            <li>
              <a
                href="/eliminacion-datos"
                className={legalLinkClass}
                onClick={(e) => {
                  e.preventDefault();
                  openLegal("deletion");
                }}
              >
                {t.footer_deletion}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <a
            href="mailto:hola@oktae.tech"
            className="block text-sm text-ok-text underline-offset-4 transition-colors hover:text-[var(--ok-neon)] hover:underline"
          >
            hola@oktae.tech
          </a>
          <div className="mt-4 flex items-center gap-3">
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/14 text-ok-text transition-colors hover:border-[var(--ok-neon)] hover:text-[var(--ok-neon)]"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" strokeWidth={1.5} aria-hidden />
            </a>
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

      <div className="flex flex-col items-start justify-between gap-3 border-t border-ok-line pt-6 text-sm leading-normal text-ok-mute sm:flex-row sm:items-center sm:gap-4">
        <span>© 2026 Oktae.Tech</span>
        <span>{t.footer_made}</span>
      </div>

      <LegalModal doc={legalDoc} onClose={closeLegal} />
    </footer>
  );
}
