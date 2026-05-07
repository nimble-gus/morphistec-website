/**
 * Visor 3D de la página Apps a la medida.
 *
 * Orden de uso: primero estas constantes; si están vacías, se usan (si existen)
 * `NEXT_PUBLIC_SPLINE_EMBED_URL` y `NEXT_PUBLIC_SPLINE_SCENE_CUSTOM_APPS` en `.env`.
 *
 * Recomendado: Spline → Share → URL del **Embed** en `SPLINE_CUSTOM_APPS_EMBED_URL`.
 * Alternativa: Code → React (`.splinecode`) en `SPLINE_CUSTOM_APPS_SCENE_URL`.
 */
export const SPLINE_CUSTOM_APPS_EMBED_URL =
  "";
export const SPLINE_CUSTOM_APPS_SCENE_URL =
  "https://prod.spline.design/FcIobxDnE9Zmzwby/scene.splinecode";
  

export function getCustomAppsSplineUrls(): { embedUrl: string; scene: string } {
  const cfgEmbed = SPLINE_CUSTOM_APPS_EMBED_URL.trim();
  const cfgScene = SPLINE_CUSTOM_APPS_SCENE_URL.trim();

  const envEmbed =
    typeof process.env.NEXT_PUBLIC_SPLINE_EMBED_URL === "string"
      ? process.env.NEXT_PUBLIC_SPLINE_EMBED_URL.trim()
      : "";
  const envScene =
    typeof process.env.NEXT_PUBLIC_SPLINE_SCENE_CUSTOM_APPS === "string"
      ? process.env.NEXT_PUBLIC_SPLINE_SCENE_CUSTOM_APPS.trim()
      : "";

  return {
    embedUrl: cfgEmbed || envEmbed,
    scene: cfgScene || envScene,
  };
}
