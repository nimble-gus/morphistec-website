"use client";

import { TopNav } from "@/components/top-nav";
import { Hero } from "@/components/hero";
import { ClientsMarquee } from "@/components/clients-marquee";
import { SitesScrollShowcase } from "@/components/sites-scroll-showcase";
import { ServicesBento } from "@/components/services-bento";
import { Process } from "@/components/process";
import { CTASection } from "@/components/cta-section";
import { Footer } from "@/components/footer";
import { Reveal } from "@/components/reveal";

export default function Page() {
  return (
    <main className="min-h-screen bg-ok-black">
      <TopNav />
      <Hero />
      <div className="relative z-[20] bg-ok-black">
        <Reveal>
          <ClientsMarquee />
        </Reveal>
        <Reveal>
          <SitesScrollShowcase />
        </Reveal>
        <Reveal>
          <ServicesBento />
        </Reveal>
        <Reveal>
          <Process />
        </Reveal>
        <Reveal>
          <CTASection />
        </Reveal>
        <Reveal y={20}>
          <Footer />
        </Reveal>
      </div>
    </main>
  );
}
