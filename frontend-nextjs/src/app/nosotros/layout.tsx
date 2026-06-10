import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nosotros · Oktae",
  description:
    "Conoce al equipo detrás de Oktae. Un estudio de tecnología enfocado en construir software que resuelve problemas reales para empresas en LATAM y USA.",
};

export default function NosotrosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
