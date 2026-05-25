import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Automatizaciones — Oktae",
  description:
    "Integraciones entre formularios, CRMs, mensajería y planillas. Reglas, reintentos y alertas. Estudio digital LATAM + USA.",
};

export default function AutomatizacionesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
