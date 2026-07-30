import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Eliminación de datos · Oktae",
  description:
    "Instrucciones para solicitar la eliminación de tus datos personales en Oktae.Tech. Envía tu solicitud a contacto@oktae.tech.",
  alternates: { canonical: "/eliminacion-datos" },
  openGraph: {
    title: "Eliminación de datos · Oktae",
    url: "/eliminacion-datos",
    type: "website",
  },
};

export default function EliminacionDatosPage() {
  return <LegalPageShell doc="deletion" />;
}
