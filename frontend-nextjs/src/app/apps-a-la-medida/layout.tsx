import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apps a la medida — Oktae",
  description:
    "Aplicaciones web y móviles construidas para tu flujo: integraciones, roles, analítica y despliegue. Estudio digital LATAM + USA.",
};

export default function AppsALaMedidaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
