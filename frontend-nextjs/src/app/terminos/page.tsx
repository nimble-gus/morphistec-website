import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Términos y condiciones · Oktae",
  description:
    "Términos y condiciones de uso del sitio web y servicios de Oktae.Tech.",
  alternates: { canonical: "/terminos" },
  openGraph: {
    title: "Términos y condiciones · Oktae",
    url: "/terminos",
    type: "website",
  },
};

export default function TerminosPage() {
  return <LegalPageShell doc="terms" />;
}
