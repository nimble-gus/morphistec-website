"use client";

import { TopNav } from "@/components/top-nav";
import { CustomAppsHero } from "@/components/custom-apps-hero";
import { Footer } from "@/components/footer";

export default function AppsALaMedidaPage() {
  return (
    <main className="min-h-screen bg-ok-black">
      <TopNav />
      <CustomAppsHero />
      <div className="relative z-[20] bg-ok-black">
        <Footer />
      </div>
    </main>
  );
}
