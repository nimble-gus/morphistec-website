import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Política de privacidad · Oktae",
  description:
    "Política de privacidad de Oktae.Tech: cómo recopilamos, usamos y protegemos tus datos personales, incluyendo el uso de Meta Ads.",
  alternates: { canonical: "/privacidad" },
  openGraph: {
    title: "Política de privacidad · Oktae",
    url: "/privacidad",
    type: "website",
  },
};

export default function PrivacidadPage() {
  return <LegalPageShell doc="privacy" />;
}
