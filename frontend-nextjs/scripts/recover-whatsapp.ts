// Run from frontend-nextjs with node --import tsx scripts/recover-whatsapp.ts.
// Default is verification only; --save stores an encrypted token with the bot blocked.
import pg from "pg";
import { encryptionKey, sealToken, GRAPH_VERSION } from "../src/lib/crm/whatsapp-protocol";
import { RECOVERY_APP, RECOVERY_WABA, RECOVERY_PHONE, validateRecovery } from "./whatsapp-recovery-validation";
try { process.loadEnvFile(".env"); } catch {}

async function main() {
  const token = process.env.WHATSAPP_RECOVERY_TOKEN?.trim();
  const secret = process.env.META_APP_SECRET?.trim();
  if (!token || !process.env.DATABASE_URL) throw new Error("Completa WHATSAPP_RECOVERY_TOKEN en el .env privado. También se requiere DATABASE_URL.");
  const key = encryptionKey(process.env.WHATSAPP_ENCRYPTION_KEY);
  async function graph(path: string, credential = token!) {
    let response: Response;
    try { response = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${path}`, {headers:{Authorization:`Bearer ${credential}`}, redirect:"error", signal:AbortSignal.timeout(15000)}); }
    catch { throw new Error("No se pudo consultar Meta. No se modificó la conexión."); }
    const data = await response.json().catch(() => null);
    if (!response.ok || !data || data.error) throw new Error("Meta rechazó una comprobación. Revisa cuenta, permisos y vigencia del token; no se modificó la conexión.");
    return data;
  }
  const [debug, phones, apps] = await Promise.all([
    // Meta also accepts the app developer's user token for token inspection.
    graph(`debug_token?input_token=${encodeURIComponent(token)}`, secret ? `${RECOVERY_APP}|${secret}` : token),
    graph(`${RECOVERY_WABA}/phone_numbers?fields=id,display_phone_number,platform_type,is_on_biz_app`),
    graph(`${RECOVERY_WABA}/subscribed_apps`),
  ]);
  const verified = validateRecovery(debug.data, phones.data, apps.data);
  console.log(`Meta confirmó ${verified.displayNumber}, coexistencia y ChatOktae suscrita. Token válido hasta ${verified.expiresAt.toISOString()}.`);
  if (!process.argv.includes("--save")) { console.log("Solo verificación. Usa --save para guardar cifrado y mantener el bot bloqueado."); return; }
  const client = new pg.Client({connectionString:process.env.DATABASE_URL, connectionTimeoutMillis:10000, statement_timeout:15000});
  try {
    await client.connect();
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(528194117)");
    const user = await client.query("SELECT id FROM oktae.users WHERE lower(email)='gus@oktae.tech'");
    if (user.rowCount !== 1) throw new Error("No se encontró el administrador de Oktae.");
    const setup = await client.query("SELECT webhook_verified_at FROM oktae.whatsapp_setup WHERE id=1");
    if (!setup.rows[0]?.webhook_verified_at) throw new Error("Primero debe verificarse el webhook.");
    const existing = await client.query("SELECT waba_id,phone_number_id FROM oktae.whatsapp_connections WHERE id=1 FOR UPDATE");
    if (existing.rowCount && (existing.rows[0].waba_id !== RECOVERY_WABA || existing.rows[0].phone_number_id !== RECOVERY_PHONE)) throw new Error("Hay otra cuenta guardada. No se reemplazó.");
    await client.query(`INSERT INTO oktae.whatsapp_connections(id,waba_id,phone_number_id,display_phone_number,token_encrypted,token_expires_at,status,connected_by)
      VALUES(1,$1,$2,$3,$4,$5,'sync_review',$6)
      ON CONFLICT(id) DO UPDATE SET token_encrypted=EXCLUDED.token_encrypted,token_expires_at=EXCLUDED.token_expires_at,status='sync_review',connected_by=EXCLUDED.connected_by,connected_at=now()`,
      [RECOVERY_WABA,RECOVERY_PHONE,verified.displayNumber,sealToken(token,key,RECOVERY_WABA),verified.expiresAt,user.rows[0].id]);
    await client.query("COMMIT");
    console.log("Conexión recuperada y token cifrado. Estado sync_review: el bot sigue bloqueado. No se solicitaron contactos/historial ni se enviaron mensajes. Verifica la recepción de un mensaje nuevo antes de habilitar respuestas.");
  } catch(error) { await client.query("ROLLBACK").catch(()=>{}); throw error; }
  finally { await client.end(); }
}
void main().catch(error => {
  // Never print SDK errors, Graph bodies, connection strings or credentials.
  console.error(error instanceof Error && !('code' in error) && !('cause' in error) ? error.message : "No se pudo guardar la recuperación. No se habilitó el bot.");
  process.exitCode=1;
});
