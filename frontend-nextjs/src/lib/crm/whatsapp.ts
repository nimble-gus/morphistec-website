import "server-only";
import {botConfigured,botEnabled,verifyAgentReady} from "./whatsapp-bot";
import { createHash, randomBytes } from "node:crypto";
import { db } from "./db";
import { HttpError } from "./errors";
import { META_APP_ID, GRAPH_VERSION, WHATSAPP_CONFIG_ID, WHATSAPP_NUMBER, COEXISTENCE_EVENT, encryptionKey, sealToken, metaId, expectedCoexistencePhone } from "./whatsapp-protocol";

export function whatsappEnvironment() {
  const missing: string[] = [];
  if (!process.env.META_APP_SECRET?.trim()) missing.push("META_APP_SECRET");
  try { encryptionKey(process.env.WHATSAPP_ENCRYPTION_KEY); } catch { missing.push("WHATSAPP_ENCRYPTION_KEY"); }
  if (!process.env.WHATSAPP_VERIFY_TOKEN || process.env.WHATSAPP_VERIFY_TOKEN.length < 32) missing.push("WHATSAPP_VERIFY_TOKEN");
  return { missing, ready: !missing.length, appId: META_APP_ID, configId: WHATSAPP_CONFIG_ID, number: WHATSAPP_NUMBER };
}
export async function whatsappStatus() {
  const environment = whatsappEnvironment();
  const [setup, connection, events] = await Promise.all([
    db().query("SELECT webhook_verified_at FROM oktae.whatsapp_setup WHERE id=1"),
    db().query("SELECT waba_id,phone_number_id,display_phone_number,token_expires_at,status,connected_at FROM oktae.whatsapp_connections WHERE id=1"),
    db().query("SELECT count(*)::integer AS count FROM oktae.whatsapp_events"),
  ]);
  const replies = await db().query("SELECT count(*) FILTER(WHERE status='answered')::integer AS answered,count(*) FILTER(WHERE status IN ('failed','send_uncertain'))::integer AS review FROM oktae.whatsapp_jobs");
  return { ...environment, botConfigured:botConfigured(),botEnabled:botEnabled(),answered:replies.rows[0].answered as number,review:replies.rows[0].review as number,onboardingEnabled: process.env.WHATSAPP_ONBOARDING_ENABLED === "true", webhookVerified: Boolean(setup.rows[0]?.webhook_verified_at), connection: connection.rows[0] ?? null, receivedEvents: events.rows[0].count as number };
}
export async function beginWhatsappOnboarding(userId: string) {
  const status = await whatsappStatus();
  if (!status.ready) throw new HttpError(503, "Faltan las claves de WhatsApp en el servidor.");
  if (!status.webhookVerified) throw new HttpError(409, "Primero verifica el webhook de WhatsApp en Meta.");
  if (!status.onboardingEnabled) throw new HttpError(409, "La finalización de coexistencia todavía está en preparación. El número no se modificó.");
  try {await verifyAgentReady();}catch{throw new HttpError(409, "El agente privado de n8n todavía no está listo. Revisa su publicación y clave de acceso antes de vincular el número.");}
  const recent = await db().query("SELECT count(*)::integer AS count FROM oktae.whatsapp_onboarding_attempts WHERE user_id=$1 AND created_at>now()-interval '10 minutes'", [userId]);
  if (recent.rows[0].count >= 5) throw new HttpError(429, "Has abierto varias conexiones. Espera diez minutos antes de reintentar.");
  const nonce = randomBytes(32).toString("hex");
  await db().query("INSERT INTO oktae.whatsapp_onboarding_attempts(nonce_hash,user_id,expires_at) VALUES($1,$2,now()+interval '10 minutes')", [hash(nonce), userId]);
  return { nonce };
}
const hash = (value: string) => createHash("sha256").update(value).digest("hex");

// Never include Graph URLs, token codes or Meta error bodies in logs or responses.
async function graph(path: string, token: string, init?: RequestInit) {
  let response: Response;
  try {
    response = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${path}`, {
      ...init, headers: { ...init?.headers, Authorization: `Bearer ${token}` },
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(12000),
    });
  } catch { throw new HttpError(502, "Meta no respondió. Reintenta la conexión desde el portal."); }
  const body = await response.json().catch(() => null);
  if (!response.ok || !body || body.error) throw new HttpError(502, "Meta no permitió verificar esta cuenta. Revisa los permisos de WhatsApp en ChatOktae.");
  return body;
}
async function exchangeCode(code: string): Promise<{ token: string; expiresIn: number }> {
  const query = new URLSearchParams({ client_id: META_APP_ID, client_secret: process.env.META_APP_SECRET!, code });
  let response: Response;
  try {
    response = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token?${query}`, { cache: "no-store", redirect: "error", signal: AbortSignal.timeout(12000) });
  } catch { throw new HttpError(502, "No se pudo confirmar la autorización con Meta. Vuelve a conectar."); }
  const body = await response.json().catch(() => null);
  if (!response.ok || typeof body?.access_token !== "string" || !body.access_token) throw new HttpError(400, "La autorización de Meta expiró o no es válida. Inicia de nuevo la conexión.");
  const seconds = typeof body.expires_in === "number" && body.expires_in > 0 ? Math.min(body.expires_in, 60*86400) : 60*86400;
  return { token: body.access_token, expiresIn: seconds };
}
export async function finishWhatsappOnboarding(userId: string, body: Record<string, unknown>) {
  if (!whatsappEnvironment().ready) throw new HttpError(503, "Faltan las claves de WhatsApp en el servidor.");
  if (process.env.WHATSAPP_ONBOARDING_ENABLED !== "true") throw new HttpError(409, "La conexión está en preparación. Intenta cuando finalice la configuración.");
  if (typeof body.nonce !== "string" || !/^[a-f0-9]{64}$/.test(body.nonce) || typeof body.code !== "string" || body.code.length < 10 || body.code.length > 8192 || !metaId(body.wabaId) || body.event !== COEXISTENCE_EVENT) throw new HttpError(400, "La conexión no corresponde al flujo de coexistencia. Vuelve a abrirla desde el portal.");
  const claim = await db().query("UPDATE oktae.whatsapp_onboarding_attempts SET consumed_at=now() WHERE nonce_hash=$1 AND user_id=$2 AND expires_at>now() AND consumed_at IS NULL RETURNING nonce_hash", [hash(body.nonce),userId]);
  if (!claim.rowCount) throw new HttpError(409, "Esta conexión ya se utilizó o expiró. Inicia una nueva.");
  const { token, expiresIn } = await exchangeCode(body.code);
  const phones = await graph(`${body.wabaId}/phone_numbers?fields=id,display_phone_number`, token);
  if (!Array.isArray(phones.data)) throw new HttpError(400, "Meta no devolvió los números de esta cuenta.");
  const phone = phones.data.find((p: { id?: string; display_phone_number?: string }) => metaId(p.id) && p.display_phone_number?.replace(/\D/g, "") === WHATSAPP_NUMBER);
  if (!phone) throw new HttpError(400, "Selecciona la cuenta que contiene +502 3117 4640. No se guardó otro número.");
  const coexistence = await graph(`${phone.id}?fields=is_on_biz_app,platform_type`, token);
  if (!expectedCoexistencePhone({ ...coexistence, display_phone_number: phone.display_phone_number })) throw new HttpError(409, "Meta todavía no confirma coexistencia con la aplicación del teléfono. El bot sigue pendiente.");
  const encrypted = sealToken(token, encryptionKey(process.env.WHATSAPP_ENCRYPTION_KEY), body.wabaId);
  await db().query(`INSERT INTO oktae.whatsapp_connections(id,waba_id,phone_number_id,display_phone_number,token_encrypted,token_expires_at,status,connected_by)
    VALUES(1,$1,$2,$3,$4,now()+$5*interval '1 second','subscription_pending',$6)
    ON CONFLICT(id) DO UPDATE SET waba_id=EXCLUDED.waba_id,phone_number_id=EXCLUDED.phone_number_id,display_phone_number=EXCLUDED.display_phone_number,token_encrypted=EXCLUDED.token_encrypted,token_expires_at=EXCLUDED.token_expires_at,status='subscription_pending',connected_by=EXCLUDED.connected_by,connected_at=now()`,
    [body.wabaId,phone.id,phone.display_phone_number,encrypted,expiresIn,userId]);
  // Coexistence numbers are already registered. NEVER call /register or /deregister.
  // Do not import history/contacts or send messages during onboarding.
  const subscribed = await graph(`${body.wabaId}/subscribed_apps`, token, { method: "POST" });
  if (subscribed.success !== true) throw new HttpError(502, "El número quedó guardado, pero falta suscribir los eventos en Meta. El bot sigue pendiente.");
  await db().query("UPDATE oktae.whatsapp_connections SET status='linked_bot_paused' WHERE id=1 AND waba_id=$1", [body.wabaId]);
  return { linked: true, botActive: false };
}
