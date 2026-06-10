import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "E-commerce — Oktae",
  description:
    "Tiendas online a medida para retail, telecom, alimentos, B2B y más. Catálogo, checkout, pagos locales e integración logística.",
};

export default function EcommerceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
