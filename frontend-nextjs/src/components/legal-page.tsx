import Link from "next/link";
import { OktaeLogo } from "@/components/logo";
import {
  LegalDocumentView,
  getStaticLegal,
} from "@/components/legal-document-view";
import type { LegalDoc } from "@/lib/legal-content";

export function LegalPageShell({ doc }: { doc: LegalDoc }) {
  const content = getStaticLegal(doc);

  return (
    <main className="min-h-screen bg-ok-black">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 md:py-16">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center">
            <OktaeLogo size={24} />
          </Link>
          <Link
            href="/"
            className="font-mono text-[11px] uppercase tracking-[0.1em] text-ok-dim underline-offset-4 transition-colors hover:text-[var(--ok-neon)] hover:underline"
          >
            Volver al inicio
          </Link>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-ok-text sm:text-4xl">
          {content.title}
        </h1>
        <p className="mt-2 text-xs text-ok-dim">{content.updated}</p>

        <div className="mt-8 border-t border-ok-line pt-8">
          <LegalDocumentView content={content} />
        </div>
      </div>
    </main>
  );
}
