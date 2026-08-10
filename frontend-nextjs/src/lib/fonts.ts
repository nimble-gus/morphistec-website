import localFont from "next/font/local";

/**
 * Oldport Script — preload + display:block evita el FOIT/swap
 * que recorta “crece” en el primer paint móvil.
 */
export const oldportScript = localFont({
  src: "../../public/fonts/Oldport Script.ttf",
  variable: "--font-oldport",
  display: "block",
  preload: true,
  weight: "400",
  style: "normal",
});
