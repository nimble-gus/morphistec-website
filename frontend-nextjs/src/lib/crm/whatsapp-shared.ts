export const META_APP_ID = "1028300093286703";
export const WHATSAPP_CONFIG_ID = "1786565612453704";
export const WHATSAPP_NUMBER = "50231174640";
export const GRAPH_VERSION = "v26.0";
export const COEXISTENCE_EVENT = "FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING";

export function metaId(value: unknown): value is string {
  return typeof value === "string" && /^[1-9][0-9]{4,29}$/.test(value);
}
export function expectedCoexistencePhone(phone: { display_phone_number?: string; is_on_biz_app?: boolean; platform_type?: string }) {
  return phone.display_phone_number?.replace(/\D/g, "") === WHATSAPP_NUMBER && phone.is_on_biz_app === true && phone.platform_type === "CLOUD_API";
}
export function parseCoexistenceEvent(origin: string, value: unknown): { wabaId: string } | null {
  if (!["https://www.facebook.com", "https://web.facebook.com", "https://business.facebook.com"].includes(origin)) return null;
  let event: unknown;
  try { event = typeof value === "string" ? JSON.parse(value) : value; } catch { return null; }
  if (!event || typeof event !== "object") return null;
  const e = event as { type?: string; event?: string; data?: { waba_id?: string } };
  if (e.type !== "WA_EMBEDDED_SIGNUP" || e.event !== COEXISTENCE_EVENT || !metaId(e.data?.waba_id)) return null;
  return { wabaId: e.data!.waba_id! };
}
