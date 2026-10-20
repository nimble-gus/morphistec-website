import "server-only";
import { randomBytes, createHash } from "node:crypto";
import { db } from "./db";
import { HttpError } from "./errors";
import { clientInput } from "./wa-client-protocol";
export const clientHash = (s: string) =>
  createHash("sha256").update(s).digest("hex");
export const clientColumns =
  "id,name,contact_name,email,phone,responsible,plan,monthly_cents,monthly_limit,instructions,knowledge,hours,tone,timezone,status,config_version,tested_version,tested_at,created_at,updated_at";
export async function getClient(id: string) {
  const c = (
    await db().query(
      `SELECT ${clientColumns} FROM oktae.wa_clients WHERE id=$1`,
      [id],
    )
  ).rows[0];
  if (!c) throw new HttpError(404, "Cliente no encontrado.");
  return c;
}
export async function saveClient(
  b: Record<string, unknown>,
  user: string,
  id?: string,
) {
  const input = clientInput(b),
    values = Object.values(input),
    keys = Object.keys(input);
  const c = await db().connect();
  try {
    await c.query("BEGIN");
    const result = id
      ? await c.query(
          `UPDATE oktae.wa_clients SET ${keys.map((k, i) => k + "=$" + (i + 1)).join(",")},config_version=config_version+1,status=CASE WHEN status='pending' THEN 'pending' ELSE 'configuration' END,updated_at=now() WHERE id=$${values.length + 1} RETURNING ${clientColumns}`,
          [...values, id],
        )
      : await c.query(
          `INSERT INTO oktae.wa_clients(${keys.join(",")},created_by) VALUES(${values.map((_, i) => "$" + (i + 1)).join(",")},$${values.length + 1}) RETURNING ${clientColumns}`,
          [...values, user],
        );
    if (!result.rowCount) throw new HttpError(404, "Cliente no encontrado.");
    await c.query(
      "INSERT INTO oktae.wa_client_audit(client_id,user_id,action) VALUES($1,$2,$3)",
      [result.rows[0].id, user, id ? "configuration_saved" : "created"],
    );
    await c.query("COMMIT");
    return result.rows[0];
  } catch (e) {
    await c.query("ROLLBACK");
    throw e;
  } finally {
    c.release();
  }
}
export async function inviteClient(id: string, user: string) {
  await getClient(id);
  const token = randomBytes(32).toString("hex");
  const c = await db().connect();
  try {
    await c.query("BEGIN");
    await c.query("SELECT id FROM oktae.wa_clients WHERE id=$1 FOR UPDATE", [
      id,
    ]);
    await c.query(
      "UPDATE oktae.wa_client_invites SET revoked_at=now() WHERE client_id=$1 AND consumed_at IS NULL",
      [id],
    );
    await c.query(
      "INSERT INTO oktae.wa_client_invites(token_hash,client_id,expires_at) VALUES($1,$2,now()+interval '30 minutes')",
      [clientHash(token), id],
    );
    await c.query(
      "INSERT INTO oktae.wa_client_audit(client_id,user_id,action) VALUES($1,$2,'connection_link_created')",
      [id, user],
    );
    await c.query("COMMIT");
  } catch (e) {
    await c.query("ROLLBACK");
    throw e;
  } finally {
    c.release();
  }
  return {
    url: "https://www.oktae.tech/connect/whatsapp/" + token,
    expiresInMinutes: 30,
  };
}
export async function clientDetail(id: string) {
  const client = await getClient(id);
  const connection =
    (
      await db().query(
        "SELECT waba_id,phone_number_id,display_phone_number,token_expires_at,status,connected_at FROM oktae.wa_client_connections WHERE client_id=$1",
        [id],
      )
    ).rows[0] ?? null;
  const conversations = (
    await db().query(
      `SELECT c.*, (SELECT body FROM oktae.wa_client_messages m WHERE m.client_id=c.client_id AND m.conversation_id=c.id ORDER BY received_at DESC LIMIT 1) AS last_message FROM oktae.wa_client_conversations c WHERE client_id=$1 ORDER BY last_customer_at DESC LIMIT 100`,
      [id],
    )
  ).rows;
  const usage = (
    await db().query(
      "SELECT sent,reserved,tests,month FROM oktae.wa_client_usage WHERE client_id=$1 AND month=date_trunc('month',now() AT TIME ZONE 'UTC')::date",
      [id],
    )
  ).rows[0] ?? { sent: 0, reserved: 0, tests: 0 };
  const review = (
    await db().query(
      "SELECT count(*)::integer AS count FROM oktae.wa_client_messages WHERE client_id=$1 AND status IN ('failed','send_uncertain')",
      [id],
    )
  ).rows[0].count;
  return { client, connection, conversations, usage, review };
}
