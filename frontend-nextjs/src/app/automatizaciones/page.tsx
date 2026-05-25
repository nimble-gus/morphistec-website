"use client";

import { LangProvider } from "@/components/lang";
import { DemoCartProvider } from "@/context/demo-cart";
import { TopNav } from "@/components/top-nav";
import { AutomationHero } from "@/components/automation-hero";
import { Footer } from "@/components/footer";

export default function AutomatizacionesPage() {
  return (
    <LangProvider>
      <DemoCartProvider>
        <main className="min-h-screen bg-ok-black">
          <TopNav />
          <AutomationHero />
          <div className="relative z-[20] bg-ok-black">
            <Footer />
          </div>
        </main>
      </DemoCartProvider>
    </LangProvider>
  );
}
