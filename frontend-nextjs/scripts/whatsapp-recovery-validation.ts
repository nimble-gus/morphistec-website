export const RECOVERY_WABA = "2344814286288523";
export const RECOVERY_PHONE = "1325177197338100";
export const RECOVERY_NUMBER = "50231174640";
export const RECOVERY_APP = "1028300093286703";

export function validateRecovery(debug: Record<string, unknown>, phones: unknown, apps: unknown, now = Date.now()) {
  const permissions = ["whatsapp_business_management", "whatsapp_business_messaging"];
  const scopes = debug.scopes;
  if (debug.is_valid !== true || debug.app_id !== RECOVERY_APP || !Array.isArray(scopes) || permissions.some(p => !scopes.includes(p)))
    throw new Error("El token no es válido para ChatOktae y ambos permisos de WhatsApp.");
  const expirations = [debug.expires_at, debug.data_access_expires_at].filter((v): v is number => typeof v === "number" && Number.isFinite(v) && v > 0);
  if (!expirations.length || expirations.some(v => v * 1000 <= now + 300000))
    throw new Error("El token no tiene una vigencia comprobable de al menos cinco minutos.");
  const phone = Array.isArray(phones) ? phones.find(p => p?.id === RECOVERY_PHONE) : null;
  if (!phone || phone.display_phone_number?.replace(/\D/g, "") !== RECOVERY_NUMBER || phone.platform_type !== "CLOUD_API" || phone.is_on_biz_app !== true)
    throw new Error("Meta no confirma el número esperado con Cloud API y coexistencia.");
  if (!Array.isArray(apps) || !apps.some(a => a?.whatsapp_business_api_data?.id === RECOVERY_APP))
    throw new Error("ChatOktae no está suscrita a esta cuenta.");
  return { displayNumber: String(phone.display_phone_number), expiresAt: new Date(Math.min(...expirations) * 1000) };
}
