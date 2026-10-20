import "server-only";
import type { PoolClient } from "pg";
import { db } from "./db";
import { botEnabled } from "./whatsapp-bot";
import {
  incomingTexts,
  humanEchoPeers,
  freshTimestamp,
} from "./whatsapp-bot-protocol";
import { askClientAgent, newClientLease } from "./wa-client-agent";
import { openToken, encryptionKey, GRAPH_VERSION } from "./whatsapp-protocol";
export async function recordClientEchoes(
  c: Pick<PoolClient, "query">,
  waba: string,
  value: Record<string, unknown>,
) {
  const metadata = value.metadata as { phone_number_id?: string } | undefined;
  const n = (
    await c.query(
      "SELECT client_id FROM oktae.wa_client_connections WHERE waba_id=$1 AND phone_number_id=$2",
      [waba, metadata?.phone_number_id ?? ""],
    )
  ).rows[0];
  if (!n) return;
  for (const sender of humanEchoPeers(value)) {
    await c.query(
      "UPDATE oktae.wa_client_conversations SET paused_until=now()+interval '6 hours',pause_reason='human' WHERE client_id=$1 AND sender_id=$2",
      [n.client_id, sender],
    );
    const echoes = (
      Array.isArray(value.message_echoes) ? value.message_echoes : []
    ) as Array<{
      id?: string;
      to?: string;
      timestamp?: string;
      text?: { body?: string };
    }>;
    for (const e of echoes)
      if (
        e.to === sender &&
        typeof e.id === "string" &&
        e.id.length <= 512 &&
        freshTimestamp(e.timestamp)
      )
        await c.query(
          `INSERT INTO oktae.wa_client_messages(client_id,message_id,conversation_id,direction,body,received_at,status) SELECT $1,$2,id,'human',$4,$5,'recorded' FROM oktae.wa_client_conversations WHERE client_id=$1 AND sender_id=$3 ON CONFLICT DO NOTHING`,
          [
            n.client_id,
            "human:" + e.id,
            sender,
            e.text?.body?.slice(0, 5000) || "[Mensaje multimedia]",
            new Date(Number(e.timestamp) * 1000),
          ],
        );
  }
}
export async function ingestClientEvents() {
  const c = await db().connect();
  try {
    await c.query("BEGIN");
    const events = (
      await c.query(
        `SELECT e.*,n.client_id,n.phone_number_id FROM oktae.whatsapp_events e JOIN oktae.wa_client_connections n ON n.waba_id=e.waba_id WHERE e.processed_at IS NULL AND NOT e.is_test ORDER BY e.received_at LIMIT 40 FOR UPDATE OF e SKIP LOCKED`,
      )
    ).rows;
    for (const e of events) {
      if (e.payload?.metadata?.phone_number_id === e.phone_number_id) {
        if (e.field === "smb_message_echoes")
          await recordClientEchoes(c, e.waba_id, e.payload);
        if (e.field === "messages")
          for (const m of incomingTexts(e.payload)) {
            const conv = (
              await c.query(
                `INSERT INTO oktae.wa_client_conversations(client_id,sender_id,profile_name,last_customer_at) VALUES($1,$2,$3,$4) ON CONFLICT(client_id,sender_id) DO UPDATE SET profile_name=CASE WHEN EXCLUDED.profile_name<>'' THEN EXCLUDED.profile_name ELSE oktae.wa_client_conversations.profile_name END,last_customer_at=GREATEST(oktae.wa_client_conversations.last_customer_at,EXCLUDED.last_customer_at) RETURNING id`,
                [e.client_id, m.sender, m.profile, m.date],
              )
            ).rows[0];
            await c.query(
              `INSERT INTO oktae.wa_client_messages(client_id,message_id,conversation_id,direction,body,received_at) VALUES($1,$2,$3,'customer',$4,$5) ON CONFLICT DO NOTHING`,
              [e.client_id, m.id, conv.id, m.text, m.date],
            );
          }
      }
      await c.query(
        "UPDATE oktae.whatsapp_events SET processed_at=now() WHERE event_key=$1",
        [e.event_key],
      );
    }
    await c.query("COMMIT");
  } catch (e) {
    await c.query("ROLLBACK");
    throw e;
  } finally {
    c.release();
  }
}
async function claim() {
  const c = await db().connect();
  try {
    await c.query("BEGIN");
    // An expired pre-send lease can retry without reserving a second quota unit.
    await c.query(
      "UPDATE oktae.wa_client_messages SET status='queued',lease=NULL,lease_until=NULL WHERE status='processing' AND lease_until<now()",
    );
    const m = (
      await c.query(
        `SELECT m.*,v.sender_id,v.paused_until,v.last_customer_at FROM oktae.wa_client_messages m JOIN oktae.wa_client_conversations v ON v.client_id=m.client_id AND v.id=m.conversation_id WHERE m.status='queued' AND NOT EXISTS(SELECT 1 FROM oktae.wa_client_messages other WHERE other.client_id=m.client_id AND other.conversation_id=m.conversation_id AND (other.status='processing' OR (other.status='send_uncertain' AND other.updated_at>now()-interval '2 minutes'))) AND (m.attempts=0 OR m.updated_at<now()-interval '30 seconds') ORDER BY m.received_at LIMIT 1 FOR UPDATE OF m SKIP LOCKED`,
      )
    ).rows[0];
    if (!m) {
      await c.query("COMMIT");
      return null;
    }
    const owner = (
      await c.query("SELECT * FROM oktae.wa_clients WHERE id=$1 FOR UPDATE", [
        m.client_id,
      ])
    ).rows[0];
    const conv = (
      await c.query(
        "SELECT paused_until FROM oktae.wa_client_conversations WHERE client_id=$1 AND id=$2 FOR UPDATE",
        [m.client_id, m.conversation_id],
      )
    ).rows[0];
    const n = (
      await c.query(
        "SELECT * FROM oktae.wa_client_connections WHERE client_id=$1 AND status='connected' AND token_expires_at>now()",
        [m.client_id],
      )
    ).rows[0];
    const overlap = (
      await c.query(
        "SELECT 1 FROM oktae.wa_client_messages WHERE client_id=$1 AND conversation_id=$2 AND (status='processing' OR (status='send_uncertain' AND updated_at>now()-interval '2 minutes'))",
        [m.client_id, m.conversation_id],
      )
    ).rowCount;
    if (overlap) {
      await c.query("ROLLBACK");
      return null;
    }
    const skip =
      !n ||
      owner.status !== "active" ||
      owner.config_version !== owner.tested_version ||
      (conv.paused_until && new Date(conv.paused_until) > new Date()) ||
      new Date(m.received_at).getTime() < Date.now() - 86400000;
    if (skip || m.attempts >= 3) {
      await c.query(
        "UPDATE oktae.wa_client_messages SET status=$3,updated_at=now() WHERE client_id=$1 AND message_id=$2",
        [m.client_id, m.message_id, m.attempts >= 3 ? "failed" : "skipped"],
      );
      await c.query("COMMIT");
      return { skipped: true } as const;
    }
    // Repeated attempts of the same message use the original reservation. Month is fixed by received_at.
    const month = m.quota_month
      ? new Date(m.quota_month).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 7) + "-01";
    if (!m.quota_held) {
      const quota = await c.query(
        `INSERT INTO oktae.wa_client_usage(client_id,month,reserved) VALUES($1,$2,1) ON CONFLICT(client_id,month) DO UPDATE SET reserved=oktae.wa_client_usage.reserved+1 WHERE oktae.wa_client_usage.sent+oktae.wa_client_usage.reserved<$3 RETURNING reserved`,
        [m.client_id, month, owner.monthly_limit],
      );
      if (!quota.rowCount) {
        await c.query(
          "UPDATE oktae.wa_client_messages SET status='skipped',updated_at=now() WHERE client_id=$1 AND message_id=$2",
          [m.client_id, m.message_id],
        );
        await c.query("COMMIT");
        return { skipped: true } as const;
      }
    }
    const lease = newClientLease();
    await c.query(
      "UPDATE oktae.wa_client_messages SET status='processing',attempts=attempts+1,lease=$3,lease_until=now()+interval '90 seconds',quota_month=$4,quota_held=true,updated_at=now() WHERE client_id=$1 AND message_id=$2",
      [m.client_id, m.message_id, lease, month],
    );
    await c.query("COMMIT");
    return { ...m, owner, connection: n, month, lease, skipped: false };
  } catch (e) {
    await c.query("ROLLBACK");
    throw e;
  } finally {
    c.release();
  }
}
export async function processClientMessage() {
  const m = await claim();
  if (!m) return false;
  if (m.skipped) return true;
  try {
    const history = (
      await db().query(
        "SELECT direction,body FROM oktae.wa_client_messages WHERE client_id=$1 AND conversation_id=$2 AND message_id<>$3 ORDER BY received_at DESC LIMIT 10",
        [m.client_id, m.conversation_id, m.message_id],
      )
    ).rows.reverse();
    const answer = await askClientAgent(m.owner, m.body, history);
    const token = openToken(
      m.connection.token_encrypted,
      encryptionKey(process.env.WHATSAPP_ENCRYPTION_KEY),
      "client:" + m.client_id + ":" + m.connection.waba_id,
    );
    const ready = await db().query(
      `UPDATE oktae.wa_client_messages m SET status='send_uncertain',updated_at=now() FROM oktae.wa_clients c,oktae.wa_client_conversations v,oktae.wa_client_connections n WHERE m.client_id=$1 AND m.message_id=$2 AND m.lease=$3 AND m.status='processing' AND c.id=m.client_id AND c.status='active' AND c.config_version=$4 AND c.tested_version=$4 AND n.client_id=c.id AND n.status='connected' AND n.phone_number_id=$5 AND n.token_expires_at>now() AND v.client_id=m.client_id AND v.id=m.conversation_id AND (v.paused_until IS NULL OR v.paused_until<=now()) AND v.last_customer_at>now()-interval '24 hours' RETURNING m.message_id`,
      [
        m.client_id,
        m.message_id,
        m.lease,
        m.owner.config_version,
        m.connection.phone_number_id,
      ],
    );
    if (!ready.rowCount) {
      await db().query(
        "UPDATE oktae.wa_client_messages SET status='skipped',updated_at=now() WHERE client_id=$1 AND message_id=$2 AND lease=$3 AND status='processing'",
        [m.client_id, m.message_id, m.lease],
      );
      return true;
    }
    const r = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${m.connection.phone_number_id}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: m.sender_id,
          type: "text",
          text: { body: answer.reply },
        }),
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(10000),
      },
    );
    const receipt = await r.json().catch(() => null);
    if (!r.ok || typeof receipt?.messages?.[0]?.id !== "string") {
      if (r.status >= 400 && r.status < 500)
        await db().query(
          "UPDATE oktae.wa_client_messages SET status='failed',updated_at=now() WHERE client_id=$1 AND message_id=$2 AND lease=$3",
          [m.client_id, m.message_id, m.lease],
        );
      return true;
    }
    const c = await db().connect();
    try {
      await c.query("BEGIN");
      await c.query(
        "UPDATE oktae.wa_client_messages SET status='answered',quota_held=false,receipt=$4,updated_at=now() WHERE client_id=$1 AND message_id=$2 AND lease=$3",
        [m.client_id, m.message_id, m.lease, receipt.messages[0].id],
      );
      await c.query(
        "INSERT INTO oktae.wa_client_messages(client_id,message_id,conversation_id,direction,body,status,receipt) VALUES($1,$2,$3,'assistant',$4,'recorded',$5) ON CONFLICT DO NOTHING",
        [
          m.client_id,
          "out:" + m.message_id,
          m.conversation_id,
          answer.reply,
          receipt.messages[0].id,
        ],
      );
      await c.query(
        "UPDATE oktae.wa_client_usage SET sent=sent+1,reserved=GREATEST(0,reserved-1) WHERE client_id=$1 AND month=$2",
        [m.client_id, m.month],
      );
      await c.query(
        `UPDATE oktae.wa_client_conversations SET qualified=qualified OR $3,interest=CASE WHEN $3 THEN $4 ELSE interest END,summary=$5,paused_until=CASE WHEN $6 THEN now()+interval '24 hours' ELSE paused_until END,pause_reason=CASE WHEN $6 THEN 'handoff' ELSE pause_reason END WHERE client_id=$1 AND id=$2`,
        [
          m.client_id,
          m.conversation_id,
          answer.qualified,
          answer.interest,
          answer.summary,
          answer.handoff,
        ],
      );
      await c.query("COMMIT");
    } catch (e) {
      await c.query("ROLLBACK");
      throw e;
    } finally {
      c.release();
    }
  } catch {
    await db().query(
      "UPDATE oktae.wa_client_messages SET status=CASE WHEN attempts<3 THEN 'queued' ELSE 'failed' END,lease=NULL,lease_until=NULL,updated_at=now() WHERE client_id=$1 AND message_id=$2 AND lease=$3 AND status='processing'",
      [m.client_id, m.message_id, m.lease],
    );
  }
  return true;
}
export async function releaseClientQuota() {
  const c = await db().connect();
  try {
    await c.query("BEGIN");
    const released = await c.query(
      "UPDATE oktae.wa_client_messages SET quota_held=false WHERE quota_held AND status IN ('failed','skipped') RETURNING client_id,quota_month",
    );
    for (const m of released.rows)
      await c.query(
        "UPDATE oktae.wa_client_usage SET reserved=GREATEST(0,reserved-1) WHERE client_id=$1 AND month=$2",
        [m.client_id, m.quota_month],
      );
    await c.query("COMMIT");
  } catch (e) {
    await c.query("ROLLBACK");
    throw e;
  } finally {
    c.release();
  }
}
export async function runClientBots() {
  if (!botEnabled()) return;
  await ingestClientEvents();
  const start = Date.now();
  for (let i = 0; i < 2 && Date.now() - start < 20000; i++)
    if (!(await processClientMessage())) break;
  await releaseClientQuota();
}
