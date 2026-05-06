import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Oktae — Estudio digital para PYMEs en LATAM",
  description:
    "Construimos el software que tu negocio necesita ahora. E-commerce, dashboards, automatizaciones y apps a la medida.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
