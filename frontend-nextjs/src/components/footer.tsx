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
    <footer className="border-t border-ok-line px-10 pt-16 pb-8 bg-ok-black">
      <div className="grid gap-14 mb-14" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr" }}>
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
      <div className="flex justify-between items-center pt-6 border-t border-ok-line font-mono text-[11px] text-ok-dim uppercase tracking-[0.1em]">
        <span>© 2026 Oktae Studio</span>
        <span>{t.footer_made}</span>
        <span>v1.0 — May 2026</span>
      </div>
    </footer>
  );
}
