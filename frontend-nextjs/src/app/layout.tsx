import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "../index.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Header from "@/components/Header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Oktae.tech - Tecnología y Automatización en Guatemala",
  description: "Transformamos operaciones empresariales con software personalizado, automatización e inteligencia artificial. Soluciones tecnológicas a medida en Guatemala.",
  keywords: "tecnología Guatemala, automatización empresarial, software personalizado, IA Guatemala, desarrollo web, aplicaciones móviles, OCR inteligente, CRM, ecommerce",
  authors: [{ name: "Oktae.tech" }],
  creator: "Oktae.tech",
  publisher: "Oktae.tech",
  robots: "index, follow",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/faviconoktae.png", type: "image/png" },
    ],
    apple: "/faviconoktae.png",
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "es_GT",
    url: "https://oktae.tech",
    siteName: "Oktae.tech",
    title: "Oktae.tech - Tecnología y Automatización",
    description: "Transformamos operaciones empresariales con tecnología a medida en Guatemala",
    images: [
      {
        url: "https://oktae.tech/assets/logo.png",
        width: 1200,
        height: 630,
        alt: "Oktae.tech - Tecnología y Automatización",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@oktae.tech",
    creator: "@oktae.tech",
    title: "Oktae.tech - Tecnología y Automatización",
    description: "Transformamos operaciones empresariales con tecnología a medida en Guatemala",
    images: ["https://oktae.tech/assets/logo.png"],
  },
  alternates: {
    canonical: "https://oktae.tech",
  },
  verification: {
    google: "your-google-verification-code", // Reemplaza con tu código de verificación
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon-test.ico" />
        <link rel="icon" type="image/png" href="/faviconoktae.png" />
        <link rel="apple-touch-icon" href="/faviconoktae.png" />
        <link rel="shortcut icon" href="/favicon-test.ico" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${inter.variable} ${montserrat.variable} antialiased`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}