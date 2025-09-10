import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "../index.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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
  title: "MorphisTec",
  description: "Sitio web de MorphisTec - Tecnología, automatización, ecommerce, inteligencia artificial en Guatemala",
  keywords: "tecnología, automatización, ecommerce, inteligencia artificial, Guatemala",
  robots: "index, follow",
  openGraph: {
    type: "website",
    title: "MorphisTec",
    description: "Sitio web de MorphisTec - Tecnología, automatización, ecommerce, inteligencia artificial en Guatemala",
    url: "https://morphistec.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "MorphisTec",
    description: "Sitio web de MorphisTec - Tecnología, automatización, ecommerce, inteligencia artificial en Guatemala",
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
        <link rel="icon" href="/assets/logo2.png" />
        <link rel="apple-touch-icon" href="/assets/logo2.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${inter.variable} ${montserrat.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
