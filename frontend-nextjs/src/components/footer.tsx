"use client";

import { OktaeLogo } from "./logo";
import { useLang } from "./lang";

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
  return (
    <footer className="bg-ok-black border-t border-ok-line px-4 pb-8 pt-12 sm:px-6 md:px-10 md:pt-16">
      <div className="mb-12 grid grid-cols-1 gap-10 sm:grid-cols-2 md:mb-14 md:gap-12 lg:grid-cols-4 lg:gap-14">
        <div>
          <OktaeLogo size={26} />
          <p className="mt-4 text-ok-mute text-sm max-w-[320px] leading-relaxed">
            {t.footer_tag}
          </p>
        </div>
        <Col title="Studio" items={["About", "Work", "Process", "Careers"]} />
        <Col title="Services" items={["E-commerce", "Custom apps", "Automations", "Dashboards"]} />
        <Col title="Contact" items={["hola@oktae.io", "CDMX · BOG · SCL", "LinkedIn", "Instagram"]} />
      </div>
      <div className="flex flex-col items-start justify-between gap-2 border-t border-ok-line pt-6 font-mono text-[11px] uppercase tracking-[0.1em] text-ok-dim sm:flex-row sm:items-center sm:gap-4">
        <span>© 2026 Oktae Studio</span>
        <span>{t.footer_made}</span>
        <span>v1.0 — May 2026</span>
      </div>
    </footer>
  );
}
