import {normalizeContactPhone,phoneCountry} from "./contact-phone";
import { timingSafeEqual, createHash } from "node:crypto";
import type { PoolClient } from "pg";
import { HttpError } from "./errors";
export const messengerPageId = "1248689791655149";
export type MessengerLead = {
  psid: string;
  page_id: string;
  name: string;
  phone: string;
  email: string;
  interest: string;
  stage: string;
  last_contact_at: string | null;
  created_at: string | null;
};
export type MessengerBatch = { observed_at: string; leads: MessengerLead[] };
export function validSyncToken(
  header: string | null,
  expected: string | undefined,
) {
  if (!expected || expected.length < 32 || !header?.startsWith("Bearer "))
    return false;
  const hash = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(hash(header.slice(7)), hash(expected));
}
function clean(value: unknown, max: number) {
  if (value == null) return "";
  if (typeof value !== "string" || value.length > max)
    throw new HttpError(400, "Campo de lead inválido.");
  const s = value.trim();
  return ["null", "undefined"].includes(s.toLowerCase()) ? "" : s;
}
function timestamp(value: unknown) {
  if (value == null || value === "") return null;
  if (
    typeof value !== "string" ||
    value.length > 64 ||
    !Number.isFinite(Date.parse(value))
  )
    throw new HttpError(400, "Fecha de lead inválida.");
  return new Date(value).toISOString();
}
export function parseMessengerBatch(
  input: unknown,
  now = Date.now(),
): MessengerBatch {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new HttpError(400, "Lote inválido.");
  const b = input as Record<string, unknown>;
  const observed = timestamp(b.observed_at);
  if (!observed || Date.parse(observed) > now + 300000)
    throw new HttpError(400, "Fecha de sincronización inválida.");
  if (!Array.isArray(b.leads) || b.leads.length > 100)
    throw new HttpError(400, "El lote admite hasta 100 leads.");
  const seen = new Set<string>();
  const leads = b.leads.map((raw) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw))
      throw new HttpError(400, "Lead inválido.");
    const l = raw as Record<string, unknown>;
    const psid = clean(l.psid, 64),
      page_id = clean(l.page_id, 64);
    if (
      !/^\d{1,64}$/.test(psid) ||
      page_id !== messengerPageId ||
      seen.has(psid)
    )
      throw new HttpError(
        400,
        "Identificador de Messenger inválido o duplicado.",
      );
    if (l.channel && l.channel !== "messenger")
      throw new HttpError(400, "Canal inválido.");
    seen.add(psid);
    return {
      psid,
      page_id,
      name: clean(l.name, 500),
      phone: normalizeContactPhone(clean(l.phone, 100),phoneCountry(l)),
      email: clean(l.email, 500),
      interest: clean(l.interest, 10000),
      stage: clean(l.stage, 80) || "new",
      last_contact_at: timestamp(l.last_contact_at),
      created_at: timestamp(l.created_at),
    };
  });
  return { observed_at: observed, leads };
}
function fallbackName(psid: string) {
  return "Prospecto de Messenger · " + psid.slice(-6);
}
function crmStage(stage: string) {
  return ["qualifying", "qualified", "handoff_wa"].includes(stage)
    ? "contactado"
    : "nuevo";
}
export async function syncMessengerBatch(
  client: PoolClient,
  batch: MessengerBatch,
) {
  const result = {
    received: batch.leads.length,
    created: 0,
    updated: 0,
    ignored: 0,
  };
  await client.query("BEGIN");
  try {
    // Orden consistente de bloqueos evita interbloqueos entre lotes simultáneos.
    for (const lead of [...batch.leads].sort((a, b) =>
      a.psid.localeCompare(b.psid),
    )) {
      await client.query(
        "SELECT pg_advisory_xact_lock(hashtextextended($1,0))",
        [lead.page_id + ":" + lead.psid],
      );
      const previous = (
        await client.query(
          "SELECT * FROM oktae.messenger_leads WHERE page_id=$1 AND psid=$2 FOR UPDATE",
          [lead.page_id, lead.psid],
        )
      ).rows[0];
      if (
        previous &&
        new Date(previous.observed_at).getTime() >=
          Date.parse(batch.observed_at)
      ) {
        result.ignored++;
        continue;
      }
      let contactId = previous?.contact_id;
      if (!previous) {
        contactId = (
          await client.query(
            `INSERT INTO oktae.contacts(name,phone,email,stage,source,created_at,updated_at)
 VALUES($1,$2,$3,$4,'messenger',COALESCE($5::timestamptz,now()),COALESCE($6::timestamptz,now())) RETURNING id`,
            [
              lead.name || fallbackName(lead.psid),
              lead.phone,
              lead.email,
              crmStage(lead.stage),
              lead.created_at,
              lead.last_contact_at,
            ],
          )
        ).rows[0].id;
        result.created++;
      } else {
        const changed =
          ["name", "phone", "email", "interest", "stage"].some((k) => {
            const key = k as "name" | "phone" | "email" | "interest" | "stage";
            return Boolean(lead[key]) && lead[key] !== previous[key];
          }) ||
          (lead.last_contact_at &&
            (!previous.last_contact_at ||
              Date.parse(lead.last_contact_at) !==
                new Date(previous.last_contact_at).getTime()));
        if (changed) {
          await client.query(
            `UPDATE oktae.contacts SET
 name=CASE WHEN name=$2 OR name=$3 OR name='' THEN COALESCE(NULLIF($4,''),name) ELSE name END,
 phone=CASE WHEN phone=$5 OR phone='' THEN COALESCE(NULLIF($6,''),phone) ELSE phone END,
 email=CASE WHEN email=$7 OR email='' THEN COALESCE(NULLIF($8,''),email) ELSE email END,
 updated_at=GREATEST(updated_at,COALESCE($9::timestamptz,$10::timestamptz)) WHERE id=$1`,
            [
              contactId,
              previous.name,
              fallbackName(lead.psid),
              lead.name,
              previous.phone,
              lead.phone,
              previous.email,
              lead.email,
              lead.last_contact_at,
              batch.observed_at,
            ],
          );
          result.updated++;
        } else result.ignored++;
      }
      await client.query(
        `INSERT INTO oktae.messenger_leads(page_id,psid,contact_id,name,phone,email,interest,stage,last_contact_at,observed_at)
 VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
 ON CONFLICT(page_id,psid) DO UPDATE SET name=COALESCE(NULLIF(EXCLUDED.name,''),oktae.messenger_leads.name),
 phone=COALESCE(NULLIF(EXCLUDED.phone,''),oktae.messenger_leads.phone),email=COALESCE(NULLIF(EXCLUDED.email,''),oktae.messenger_leads.email),
 interest=COALESCE(NULLIF(EXCLUDED.interest,''),oktae.messenger_leads.interest),stage=EXCLUDED.stage,
 last_contact_at=COALESCE(EXCLUDED.last_contact_at,oktae.messenger_leads.last_contact_at),observed_at=EXCLUDED.observed_at`,
        [
          lead.page_id,
          lead.psid,
          contactId,
          lead.name,
          lead.phone,
          lead.email,
          lead.interest,
          lead.stage,
          lead.last_contact_at,
          batch.observed_at,
        ],
      );
    }
    await client.query("COMMIT");
    return result;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  }
}
