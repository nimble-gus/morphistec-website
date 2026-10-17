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
export type EmbeddedSignupEvent =
  | { kind: "connected"; wabaId: string }
  | { kind: "cancelled" }
  | { kind: "error"; code?: string }
  | { kind: "different_flow" };

export function parseEmbeddedSignupEvent(origin: string, value: unknown): EmbeddedSignupEvent | null {
  if (!["https://www.facebook.com", "https://web.facebook.com", "https://business.facebook.com"].includes(origin)) return null;
  let event: unknown;
  try { event = typeof value === "string" ? JSON.parse(value) : value; } catch { return null; }
  if (!event || typeof event !== "object") return null;
  const e = event as { type?: string; event?: string; data?: { waba_id?: string; error_code?: unknown; error_id?: unknown; error_message?: unknown } };
  if (e.type !== "WA_EMBEDDED_SIGNUP") return null;
  if (e.event === COEXISTENCE_EVENT && metaId(e.data?.waba_id)) return {kind:"connected", wabaId:e.data.waba_id};
  if (["FINISH", "FINISH_ONLY_WABA", "FINISH_OBO_MIGRATION", "FINISH_GRANT_ONLY_API_ACCESS"].includes(e.event ?? "")) return {kind:"different_flow"};
  // Meta also reports user-reported errors with event CANCEL and data.error_code.
  if (e.event === "ERROR" || (e.event === "CANCEL" && (e.data?.error_code !== undefined || typeof e.data?.error_message === "string"))) {
    // Keep only a bounded numeric reference. Raw messages can contain private account data.
    const rawCode = e.data?.error_code ?? e.data?.error_id;
    const code = (typeof rawCode === "number" && Number.isSafeInteger(rawCode)) || typeof rawCode === "string" ? String(rawCode) : "";
    return /^[0-9]{1,12}$/.test(code) ? {kind:"error",code} : {kind:"error"};
  }
  if (e.event === "CANCEL") return {kind:"cancelled"};
  return null;
}

export function parseCoexistenceEvent(origin: string, value: unknown): { wabaId: string } | null {
  const result = parseEmbeddedSignupEvent(origin,value);
  return result?.kind === "connected" ? {wabaId:result.wabaId} : null;
}
