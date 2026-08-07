"use client";

import { TopNav } from "@/components/top-nav";
import { EcommerceHero } from "@/components/ecommerce-hero";
import { Footer } from "@/components/footer";

export default function EcommercePage() {
  return (
    <main className="min-h-screen bg-ok-black">
      <TopNav />
      <EcommerceHero />
      <div className="relative z-[20] bg-ok-black">
        <Footer />
      </div>
    </main>
  );
}
