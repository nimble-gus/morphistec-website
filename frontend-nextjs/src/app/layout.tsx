import type { Metadata } from "next";
import localFont from "next/font/local";
import { LangProvider } from "@/components/lang";
import "./globals.css";

/** Precarga Oldport para evitar que “crece” se corte en el primer paint (móvil). */
const oldportScript = localFont({
  src: "../../public/fonts/Oldport Script.ttf",
  variable: "--font-oldport",
  display: "swap",
  preload: true,
  weight: "400",
  style: "normal",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.oktae.tech"),
  title: "Oktae | Chatbots con IA, ventas automáticas y e-commerce",
  description:
    "Diseñamos el sistema comercial de tu negocio: chatbots con IA, seguimiento automático de leads y e-commerce. Del primer mensaje al cierre. Agenda un diagnóstico.",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "256x256" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "Oktae — Del lead al cierre con IA",
    description:
      "Chatbots, automatización de ventas y e-commerce para negocios que necesitan vender más sin multiplicar el equipo.",
    url: "/",
    type: "website",
    siteName: "Oktae",
  },
  twitter: {
    card: "summary_large_image",
    title: "Oktae | Chatbots con IA, ventas automáticas y e-commerce",
    description:
      "Del primer mensaje al cierre: chatbots con IA, automatización de leads y e-commerce.",
  },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={oldportScript.variable}>
      <body>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
