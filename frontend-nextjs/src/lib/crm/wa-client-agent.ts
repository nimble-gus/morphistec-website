import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "./db";
import { clientPrompt } from "./wa-client-protocol";
import { HttpError } from "./errors";
import { botConfigured } from "./whatsapp-bot";
export const clientAgentUrl =
  "https://n8n-production-2af53.up.railway.app/webhook/oktae-client-whatsapp-ai";
export function parseClientAnswer(b: unknown) {
  if (!b || typeof b !== "object") throw new Error("Invalid agent output");
  const v = b as Record<string, unknown>;
  if (
    v.protocol !== "oktae_clients_v1" ||
    typeof v.reply !== "string" ||
    !v.reply.trim() ||
    v.reply.length > 1500
  )
    throw new Error("Invalid client protocol");
  const q = (
    v.qualification && typeof v.qualification === "object"
      ? v.qualification
      : {}
  ) as Record<string, unknown>;
  const interest =
    typeof q.interest === "string" ? q.interest.trim().slice(0, 500) : "";
  return {
    reply: v.reply.trim(),
    handoff: q.handoff === true,
    qualified:
      q.businessFit === true &&
      q.commercialIntent === true &&
      Boolean(interest),
    interest,
    summary: typeof v.summary === "string" ? v.summary.slice(0, 1500) : "",
  };
}
export async function askClientAgent(
  client: Parameters<typeof clientPrompt>[0] & { id: string },
  text: string,
  history: unknown[],
) {
  if (!botConfigured())
    throw new HttpError(503, "El motor privado de n8n no está configurado.");
  const r = await fetch(clientAgentUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Oktae-WhatsApp-Key": process.env.WHATSAPP_N8N_TOKEN!,
    },
    body: JSON.stringify({
      client_id: client.id,
      system_prompt: clientPrompt(client),
      text,
      history,
    }),
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(20000),
  });
  if (!r.ok)
    throw new HttpError(
      502,
      "El agente de clientes no respondió. Revisa el flujo publicado en n8n.",
    );
  const raw = await r.text();
  if (raw.length > 16000) throw new Error("Response too large");
  return parseClientAnswer(JSON.parse(raw));
}
export async function testClientAgent(id: string, text: string) {
  const c = await db().connect();
  let version = 0;
  try {
    await c.query("BEGIN");
    const { rows } = await c.query(
      "SELECT * FROM oktae.wa_clients WHERE id=$1 FOR UPDATE",
      [id],
    );
    const client = rows[0];
    if (!client) throw new HttpError(404, "Cliente no encontrado.");
    if (!client.instructions.trim() || !client.knowledge.trim())
      throw new HttpError(
        409,
        "Guarda el objetivo y la información del negocio antes de probar.",
      );
    const usage = await c.query(
      "INSERT INTO oktae.wa_client_usage(client_id,month,tests) VALUES($1,date_trunc('month',now() AT TIME ZONE 'UTC')::date,1) ON CONFLICT(client_id,month) DO UPDATE SET tests=oktae.wa_client_usage.tests+1 WHERE oktae.wa_client_usage.tests<100 RETURNING tests",
      [id],
    );
    if (!usage.rowCount)
      throw new HttpError(
        429,
        "Se alcanzó el límite de 100 pruebas de este mes.",
      );
    version = client.config_version;
    await c.query("COMMIT");
    const answer = await askClientAgent(client, text, []);
    await db().query(
      "UPDATE oktae.wa_clients SET tested_version=$2,tested_at=now(),status=CASE WHEN status IN ('pending','configuration') THEN 'testing' ELSE status END WHERE id=$1 AND config_version=$2",
      [id, version],
    );
    return { reply: answer.reply, testedVersion: version };
  } catch (e) {
    await c.query("ROLLBACK").catch(() => {});
    throw e;
  } finally {
    c.release();
  }
}
export async function setClientState(
  id: string,
  active: boolean,
  user: string,
) {
  const c = await db().connect();
  try {
    await c.query("BEGIN");
    const row = (
      await c.query("SELECT * FROM oktae.wa_clients WHERE id=$1 FOR UPDATE", [
        id,
      ])
    ).rows[0];
    if (!row) throw new HttpError(404, "Cliente no encontrado.");
    if (active) {
      const n = (
        await c.query(
          "SELECT 1 FROM oktae.wa_client_connections WHERE client_id=$1 AND status='connected' AND token_expires_at>now() AND regexp_replace(display_phone_number,'[^0-9]','','g')=regexp_replace($2,'[^0-9]','','g')",
          [id,row.phone],
        )
      ).rowCount;
      if (!n)
        throw new HttpError(
          409,
          "Primero conecta el número y verifica su autorización.",
        );
      if (!row.tested_at || row.tested_version !== row.config_version)
        throw new HttpError(
          409,
          "Prueba la configuración actual antes de activar.",
        );
      if (!botConfigured() || process.env.WHATSAPP_BOT_ENABLED !== "true")
        throw new HttpError(409, "El motor global está desactivado.");
    }
    await c.query(
      "UPDATE oktae.wa_clients SET status=$2,updated_at=now() WHERE id=$1",
      [id, active ? "active" : "paused"],
    );
    await c.query(
      "INSERT INTO oktae.wa_client_audit(client_id,user_id,action) VALUES($1,$2,$3)",
      [id, user, active ? "activated" : "paused"],
    );
    await c.query("COMMIT");
  } catch (e) {
    await c.query("ROLLBACK");
    throw e;
  } finally {
    c.release();
  }
}
export const newClientLease = () => randomUUID();
