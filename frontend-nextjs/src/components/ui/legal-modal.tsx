"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLang } from "@/components/lang";
import { LegalDocumentView } from "@/components/legal-document-view";
import { LEGAL, type LegalDoc } from "@/lib/legal-content";

type LegalModalProps = {
  doc: LegalDoc | null;
  onClose: () => void;
};

export function LegalModal({ doc, onClose }: LegalModalProps) {
  const { lang, t } = useLang();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!doc) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [doc, onClose]);

  if (!mounted || !doc) return null;

  const content = LEGAL[lang][doc];

  return createPortal(
    <div
      className="fixed inset-0 z-[120] bg-black/75 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      onClick={onClose}
    >
      <div className="mx-auto flex h-full w-full max-w-2xl items-center justify-center">
        <div
          className="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-2xl border border-ok-line-2 bg-[#0b0b0d] shadow-[0_20px_80px_-20px_rgba(0,0,0,0.8)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-ok-line px-4 py-4 sm:px-6">
            <div>
              <h3
                id="legal-modal-title"
                className="text-xl font-semibold text-ok-text"
              >
                {content.title}
              </h3>
              <p className="mt-1 text-xs text-ok-dim">{content.updated}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 cursor-pointer rounded-full border border-ok-line px-2.5 py-1 text-[11px] text-ok-mute transition-colors hover:text-ok-text sm:text-xs"
              aria-label={t.legal_close}
            >
              {t.legal_close}
            </button>
          </div>

          <div className="overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
            <LegalDocumentView content={content} />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
