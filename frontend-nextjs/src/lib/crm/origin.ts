// Dominios propios de este portal. No confiar en Host ni X-Forwarded-Host.
const productionOrigins = ["https://oktae.tech", "https://www.oktae.tech"];
function configuredOrigin(value: string | undefined, production: boolean) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (
      url.username ||
      url.password ||
      !["http:", "https:"].includes(url.protocol)
    )
      return null;
    if (production && url.protocol !== "https:") return null;
    return url.origin;
  } catch {
    return null;
  }
}
export function isAllowedOrigin(
  origin: string | null,
  options: { production: boolean; appUrl?: string; developmentOrigin?: string },
) {
  if (!origin) return false;
  const allowed = new Set(options.production ? productionOrigins : []);
  const configured = configuredOrigin(options.appUrl, options.production);
  if (configured) allowed.add(configured);
  if (!options.production && !options.appUrl) {
    const local = configuredOrigin(options.developmentOrigin, false);
    if (local) allowed.add(local);
  }
  return allowed.has(origin);
}
