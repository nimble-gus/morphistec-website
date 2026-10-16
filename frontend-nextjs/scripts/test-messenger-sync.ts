import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import pg from "pg";
import {
  parseMessengerBatch,
  syncMessengerBatch,
  messengerPageId,
} from "../src/lib/crm/messenger";
try {
  process.loadEnvFile(".env");
} catch {}
async function main() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
  });
  const client = await pool.connect();
  const psid = "999" + BigInt("0x" + randomBytes(7).toString("hex")).toString();
  let contactId;
  const time = Date.now() - 300000,
    iso = (step: number) => new Date(time + step * 1000).toISOString();
  const lead = {
    psid,
    page_id: messengerPageId,
    name: "QA Messenger temporal",
    phone: "+50255550000",
    email: "source@example.invalid",
    interest: "Bot de prueba",
    stage: "new",
    last_contact_at: iso(0),
    created_at: iso(0),
  };
  const batch = (step: number, patch = {}) =>
    parseMessengerBatch({
      observed_at: iso(step),
      leads: [{ ...lead, ...patch }],
    });
  try {
    assert.equal(
      (
        await client.query(
          "SELECT 1 FROM oktae.messenger_leads WHERE page_id=$1 AND psid=$2",
          [messengerPageId, psid],
        )
      ).rowCount,
      0,
    );
    const a = await syncMessengerBatch(client, batch(0));
    assert.equal(a.created, 1);
    contactId = (
      await client.query(
        "SELECT contact_id FROM oktae.messenger_leads WHERE page_id=$1 AND psid=$2",
        [messengerPageId, psid],
      )
    ).rows[0].contact_id;
    assert.equal((await syncMessengerBatch(client, batch(0))).ignored, 1);
    await syncMessengerBatch(
      client,
      batch(1, {
        name: "Nombre actualizado por bot",
        phone: "+50255551111",
        interest: "Tienda en línea",
        stage: "qualified",
        last_contact_at: iso(1),
      }),
    );
    const updated = (
      await client.query("SELECT * FROM oktae.contacts WHERE id=$1", [
        contactId,
      ])
    ).rows[0];
    assert.equal(updated.name, "Nombre actualizado por bot");
    assert.equal(updated.phone, "+50255551111");
    await client.query(
      "UPDATE oktae.contacts SET name='Nombre editado manualmente',phone='+50255552222',email='manual@example.invalid',company='Empresa manual',stage='ganado',next_follow_up='2026-11-01' WHERE id=$1",
      [contactId],
    );
    await syncMessengerBatch(
      client,
      batch(2, {
        name: "Otra actualización del bot",
        phone: "+50255553333",
        email: "new-source@example.invalid",
        interest: "Asistente IA",
        stage: "handoff_wa",
        last_contact_at: iso(2),
      }),
    );
    await syncMessengerBatch(client, batch(0));
    await syncMessengerBatch(
      client,
      batch(3, {
        name: "",
        phone: "",
        email: "",
        interest: "",
        stage: "handoff_wa",
        last_contact_at: iso(2),
      }),
    );
    const kept = (
      await client.query(
        "SELECT c.*,m.interest,m.stage AS bot_stage FROM oktae.contacts c JOIN oktae.messenger_leads m ON m.contact_id=c.id WHERE c.id=$1",
        [contactId],
      )
    ).rows[0];
    assert.equal(kept.name, "Nombre editado manualmente");
    assert.equal(kept.phone, "+50255552222");
    assert.equal(kept.email, "manual@example.invalid");
    assert.equal(kept.company, "Empresa manual");
    assert.equal(kept.stage, "ganado");
    assert.equal(kept.interest, "Asistente IA");
    assert.equal(kept.bot_stage, "handoff_wa");
    assert.equal(
      (
        await client.query(
          "SELECT count(*) FROM oktae.messenger_leads WHERE page_id=$1 AND psid=$2",
          [messengerPageId, psid],
        )
      ).rows[0].count,
      "1",
    );
    console.log(
      "PASS: alta, reintentos sin duplicados, actualización del bot, preservación de cambios manuales y rechazo de snapshots antiguos.",
    );
  } finally {
    await client.query(
      "DELETE FROM oktae.messenger_leads WHERE page_id=$1 AND psid=$2",
      [messengerPageId, psid],
    );
    if (contactId)
      await client.query("DELETE FROM oktae.contacts WHERE id=$1", [contactId]);
    client.release();
    await pool.end();
  }
}
main().catch((e) => {
  console.error("Prueba de sincronización fallida:", e.code || e.name);
  process.exitCode = 1;
});
