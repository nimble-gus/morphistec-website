import type { LegalDocument, LegalDoc } from "@/lib/legal-content";
import { LEGAL } from "@/lib/legal-content";

export function LegalDocumentView({ content }: { content: LegalDocument }) {
  return (
    <div className="space-y-6 text-sm leading-relaxed text-ok-mute">
      <p className="text-ok-text">{content.intro}</p>
      {content.sections.map((section) => (
        <section key={section.heading}>
          <h2 className="mb-2 text-base font-semibold text-ok-text">
            {section.heading}
          </h2>
          <div className="space-y-2">
            {section.body.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </section>
      ))}
      <p className="border-t border-ok-line pt-4 text-ok-text">{content.contact}</p>
    </div>
  );
}

/** Contenido ES estático para páginas crawlables (Meta / SEO). */
export function getStaticLegal(doc: LegalDoc): LegalDocument {
  return LEGAL.es[doc];
}
