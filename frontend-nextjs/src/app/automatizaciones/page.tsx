"use client";

import { TopNav } from "@/components/top-nav";
import { AutomationHero } from "@/components/automation-hero";
import { Footer } from "@/components/footer";

export default function AutomatizacionesPage() {
  return (
    <main className="min-h-screen bg-ok-black">
      <TopNav />
      <AutomationHero />
      <div className="relative z-[20] bg-ok-black">
        <Footer />
      </div>
    </main>
  );
}
