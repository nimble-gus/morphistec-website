import "server-only";
import { randomBytes } from "node:crypto";
import { db } from "./db";
import { clientHash } from "./wa-clients";
import { HttpError } from "./errors";
import {
  META_APP_ID,
  GRAPH_VERSION,
  COEXISTENCE_EVENT,
  metaId,
  encryptionKey,
  sealToken,
} from "./whatsapp-protocol";
export async function clientInvite(token: string) {
  if (!/^[a-f0-9]{64}$/.test(token))
    throw new HttpError(404, "Enlace no válido.");
  const row = (
    await db().query(
      `SELECT i.client_id,c.name,c.phone FROM oktae.wa_client_invites i JOIN oktae.wa_clients c ON c.id=i.client_id WHERE token_hash=$1 AND expires_at>now() AND consumed_at IS NULL AND revoked_at IS NULL`,
      [clientHash(token)],
    )
  ).rows[0];
  if (!row)
    throw new HttpError(
      410,
      "El enlace expiró o ya se utilizó. Pide otro al equipo de Oktae.",
    );
  return row;
}
export async function prepareClientConnection(token: string) {
  await clientInvite(token);
  if (!process.env.META_APP_SECRET)
    throw new HttpError(503, "La conexión con Meta no está configurada.");
  encryptionKey(process.env.WHATSAPP_ENCRYPTION_KEY);
  const nonce = randomBytes(32).toString("hex");
  const claim = await db().query(
    "UPDATE oktae.wa_client_invites SET nonce_hash=$2 WHERE token_hash=$1 AND expires_at>now() AND consumed_at IS NULL AND revoked_at IS NULL RETURNING client_id",
    [clientHash(token), clientHash(nonce)],
  );
  if (!claim.rowCount) throw new HttpError(410, "Enlace vencido.");
  return nonce;
}
async function graph(path: string, token: string, post = false) {
  const r = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${path}`, {
    method: post ? "POST" : "GET",
    headers: { Authorization: "Bearer " + token },
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(12000),
  });
  const b = await r.json().catch(() => null);
  if (!r.ok || !b || b.error)
    throw new HttpError(
      502,
      "Meta no permitió verificar o suscribir la cuenta. Revisa los permisos con el equipo de Oktae.",
    );
  return b;
}
export async function finishClientConnection(
  token: string,
  nonce: string,
  b: Record<string, unknown>,
) {
  if (
    !/^[a-f0-9]{64}$/.test(nonce) ||
    b.consent !== true ||
    b.event !== COEXISTENCE_EVENT ||
    !metaId(b.wabaId) ||
    typeof b.code !== "string" ||
    b.code.length < 10 ||
    b.code.length > 8192
  )
    throw new HttpError(
      400,
      "Completa la autorización de tu WhatsApp Business en Meta.",
    );
  const invite = await clientInvite(token);
  const claimed = await db().query(
    "UPDATE oktae.wa_client_invites SET consumed_at=now() WHERE token_hash=$1 AND nonce_hash=$2 AND consumed_at IS NULL AND revoked_at IS NULL AND expires_at>now() RETURNING client_id",
    [clientHash(token), clientHash(nonce)],
  );
  if (!claimed.rowCount)
    throw new HttpError(
      409,
      "Esta autorización ya se utilizó. Solicita un nuevo enlace.",
    );
  const query = new URLSearchParams({
    client_id: META_APP_ID,
    client_secret: process.env.META_APP_SECRET!,
    code: b.code,
  });
  const r = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token?${query}`,
    {
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(12000),
    },
  );
  const auth = await r.json().catch(() => null);
  if (!r.ok || typeof auth?.access_token !== "string")
    throw new HttpError(
      400,
      "Meta no confirmó la autorización. Solicita otro enlace.",
    );
  const access = auth.access_token;
  // The API token must belong to this app. Never accept an arbitrary access token supplied by the browser.
  const debug = await graph(
    "debug_token?input_token=" + encodeURIComponent(access),
    META_APP_ID + "|" + process.env.META_APP_SECRET,
  );
  if (
    debug.data?.is_valid !== true ||
    String(debug.data.app_id) !== META_APP_ID ||
    !["whatsapp_business_management", "whatsapp_business_messaging"].every(
      (scope) =>
        Array.isArray(debug.data.scopes) && debug.data.scopes.includes(scope),
    )
  )
    throw new HttpError(403, "Autorización de otra aplicación.");
  const phones = await graph(
    `${b.wabaId}/phone_numbers?fields=id,display_phone_number`,
    access,
  );
  const target = invite.phone.replace(/\D/g, "");
  const phone = Array.isArray(phones.data)
    ? phones.data.find(
        (p: { id?: string; display_phone_number?: string }) =>
          metaId(p.id) && p.display_phone_number?.replace(/\D/g, "") === target,
      )
    : null;
  if (!phone)
    throw new HttpError(
      409,
      "La cuenta autorizada no contiene el número registrado por Oktae. Pide al equipo que revise la ficha.",
    );
  const mode = await graph(
    `${phone.id}?fields=is_on_biz_app,platform_type`,
    access,
  );
  if (mode.is_on_biz_app !== true || mode.platform_type !== "CLOUD_API")
    throw new HttpError(
      409,
      "Meta no confirmó coexistencia con WhatsApp Business. No elimines la aplicación del teléfono.",
    );
  const expires =
    Number(debug.data.expires_at) ||
    Math.floor(Date.now() / 1000) +
      Math.min(Number(auth.expires_in) || 86400 * 60, 86400 * 60);
  if (expires * 1000 <= Date.now())
    throw new HttpError(400, "Autorización vencida.");
  const c = await db().connect();
  try {
    await c.query("BEGIN");
    await c.query("SELECT pg_advisory_xact_lock(528194118)");
    const conflict = await c.query(
      `SELECT 1 FROM oktae.whatsapp_connections WHERE waba_id=$1 OR phone_number_id=$2 UNION ALL SELECT 1 FROM oktae.wa_client_connections WHERE (waba_id=$1 OR phone_number_id=$2) AND client_id<>$3`,
      [b.wabaId, phone.id, invite.client_id],
    );
    if (conflict.rowCount)
      throw new HttpError(
        409,
        "Esta cuenta o número ya está conectado a otro negocio. No se modificó la conexión existente.",
      );
    await c.query(
      `INSERT INTO oktae.wa_client_connections(client_id,waba_id,phone_number_id,display_phone_number,token_encrypted,token_expires_at,status) VALUES($1,$2,$3,$4,$5,$6,'pending') ON CONFLICT(client_id) DO UPDATE SET waba_id=EXCLUDED.waba_id,phone_number_id=EXCLUDED.phone_number_id,display_phone_number=EXCLUDED.display_phone_number,token_encrypted=EXCLUDED.token_encrypted,token_expires_at=EXCLUDED.token_expires_at,status='pending',connected_at=now()`,
      [
        invite.client_id,
        b.wabaId,
        phone.id,
        phone.display_phone_number,
        sealToken(
          access,
          encryptionKey(process.env.WHATSAPP_ENCRYPTION_KEY),
          "client:" + invite.client_id + ":" + b.wabaId,
        ),
        new Date(expires * 1000),
      ],
    );
    await c.query(
      "UPDATE oktae.wa_clients SET status='configuration',tested_version=NULL,updated_at=now() WHERE id=$1",
      [invite.client_id],
    );
    await c.query(
      "INSERT INTO oktae.wa_client_audit(client_id,action) VALUES($1,'owner_authorized_meta')",
      [invite.client_id],
    );
    await c.query("COMMIT");
  } catch (e) {
    await c.query("ROLLBACK");
    throw e;
  } finally {
    c.release();
  }
  const subscribed = await graph(`${b.wabaId}/subscribed_apps`, access, true);
  if (subscribed.success !== true)
    throw new HttpError(
      502,
      "Cuenta guardada; falta suscribir los eventos. Pide otro enlace al equipo.",
    );
  await db().query(
    "UPDATE oktae.wa_client_connections SET status='connected' WHERE client_id=$1 AND phone_number_id=$2",
    [invite.client_id, phone.id],
  );
  return { connected: true };
}
