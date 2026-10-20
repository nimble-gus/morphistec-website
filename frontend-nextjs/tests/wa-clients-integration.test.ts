import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID, randomBytes } from "node:crypto";
import pg from "pg";
import { saveClient, inviteClient } from "../src/lib/crm/wa-clients";
import {
  testClientAgent,
  setClientState,
  clientAgentUrl,
} from "../src/lib/crm/wa-client-agent";
import {
  runClientBots,
  recordClientEchoes,
} from "../src/lib/crm/wa-client-worker";
import { sealToken } from "../src/lib/crm/whatsapp-protocol";
import { clientInvite } from "../src/lib/crm/wa-client-connect";
try {
  process.loadEnvFile(".env");
} catch {}
test("managed clients isolate context, reject untested activation, deduplicate, limit usage and pause human attention", async () => {
  const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  let sp = 0,
    sends = 0,
    aiCalls = 0,
    timeout = false;
  const fetchBefore = globalThis.fetch,
    key = randomBytes(32);
  const env = { ...process.env };
  process.env.WHATSAPP_N8N_WEBHOOK_URL =
    "https://n8n-production-2af53.up.railway.app/webhook/oktae-whatsapp-ai";
  process.env.WHATSAPP_N8N_TOKEN = randomBytes(32).toString("hex");
  process.env.WHATSAPP_BOT_ENABLED = "true";
  process.env.WHATSAPP_ENCRYPTION_KEY = key.toString("hex");
  (globalThis as unknown as { oktaePool: unknown }).oktaePool = {
    query: c.query.bind(c),
    connect: async () => {
      const s = "tenant_" + ++sp;
      return {
        query: (q: string, v?: unknown[]) =>
          c.query(
            q === "BEGIN"
              ? "SAVEPOINT " + s
              : q === "COMMIT"
                ? "RELEASE SAVEPOINT " + s
                : q === "ROLLBACK"
                  ? "ROLLBACK TO SAVEPOINT " + s
                  : q,
            v,
          ),
        release: () => {},
      };
    },
  };
  const users = randomUUID(),
    a = randomUUID(),
    b = randomUUID(),
    sender = "50255555555",
    waba = "987654321234567",
    phone = "876543212345678",
    wabaB = "987654321234568",
    phoneB = "876543212345679";
  const form = (name: string) => ({
    name,
    contact_name: "QA",
    email: "qa@example.invalid",
    phone: "+50255555555",
    responsible: "QA",
    plan: "Prueba",
    monthly_cents: 4900,
    monthly_limit: 2,
    instructions: "Resolver consultas y derivar al equipo",
    knowledge: "Solo vendemos " + name,
    hours: "Lunes a viernes",
    tone: "Profesional",
    timezone: "America/Guatemala",
  });
  const event = async (
    clientWaba: string,
    clientPhone: string,
    text: string,
    id = randomUUID(),
    field = "messages",
  ) => {
    await c.query(
      "INSERT INTO oktae.whatsapp_events(event_key,waba_id,field,payload) VALUES($1,$2,$3,$4)",
      [
        randomUUID(),
        clientWaba,
        field,
        {
          metadata: { phone_number_id: clientPhone },
          contacts: [{ wa_id: sender, profile: { name: "QA temporal" } }],
          messages: [
            {
              id,
              from: sender,
              type: "text",
              timestamp: String(Math.floor(Date.now() / 1000)),
              text: { body: text },
            },
          ],
        },
      ],
    );
    return id;
  };
  globalThis.fetch = async (input, init) => {
    if (String(input) === clientAgentUrl) {
      aiCalls++;
      const body = JSON.parse(String(init?.body));
      if (body.client_id === a) {
        assert.match(body.system_prompt, /Negocio A/);
        assert.doesNotMatch(JSON.stringify(body.history), /SECRETO_B/);
      } else if (body.client_id === b) {
        assert.match(body.system_prompt, /Negocio B/);
        assert.doesNotMatch(JSON.stringify(body.history), /SECRETO_A/);
      } else throw Error("Unexpected tenant");
      return Response.json({
        protocol: "oktae_clients_v1",
        reply: "Respuesta de tu negocio.",
        qualification: {
          businessFit: true,
          commercialIntent: true,
          interest: "Consulta real",
        },
        summary: "Interés expresado",
      });
    }
    assert.match(
      String(input),
      new RegExp("/(" + phone + "|" + phoneB + ")/messages$"),
    );
    sends++;
    if (timeout) {
      timeout = false;
      throw Error("timeout after dispatch");
    }
    return Response.json({ messages: [{ id: "out-" + randomUUID() }] });
  };
  try {
    await c.query("BEGIN");
    await c.query(
      "INSERT INTO oktae.users(id,email,password_hash) VALUES($1,$2,'invalid')",
      [users, users + "@example.invalid"],
    );
    await c.query(
      "INSERT INTO oktae.wa_clients(id,name,created_by,instructions,knowledge,monthly_limit,phone) VALUES($1,'Negocio A',$3,'Atender','SECRETO_A',2,'+50255555555'),($2,'Negocio B',$3,'Atender','SECRETO_B',2,'+50255555555')",
      [a, b, users],
    );
    for (const [id, w, p] of [
      [a, waba, phone],
      [b, wabaB, phoneB],
    ])
      await c.query(
        "INSERT INTO oktae.wa_client_connections(client_id,waba_id,phone_number_id,display_phone_number,token_encrypted,token_expires_at,status) VALUES($1,$2,$3,'+50255555555',$4,now()+interval '1 hour','connected')",
        [id, w, p, sealToken("fake", key, "client:" + id + ":" + w)],
      );
    await assert.rejects(
      setClientState(a, true, users),
      /Prueba la configuración/,
    );
    await testClientAgent(a, "Prueba A");
    await testClientAgent(b, "Prueba B");
    await setClientState(a, true, users);
    await setClientState(b, true, users);
    const first = await event(waba, phone, "SECRETO_A");
    await runClientBots();
    assert.equal(sends, 1);
    await event(waba, phone, "SECRETO_A", first);
    await runClientBots();
    assert.equal(sends, 1, "duplicate must not send");
    await event(wabaB, phoneB, "SECRETO_B");
    await runClientBots();
    assert.equal(sends, 2);
    assert.equal(
      (
        await c.query(
          "SELECT count(*)::integer AS n FROM oktae.wa_client_conversations WHERE sender_id=$1 AND client_id IN ($2,$3)",
          [sender, a, b],
        )
      ).rows[0].n,
      2,
      "same sender remains separated by client",
    );
    await event(waba, phone, "Segunda consulta");
    await runClientBots();
    assert.equal(sends, 3);
    await event(waba, phone, "Excede límite");
    await runClientBots();
    assert.equal(sends, 3, "quota must stop third response for A");
    await recordClientEchoes(c, wabaB, {
      metadata: { phone_number_id: phoneB },
      message_echoes: [
        {
          id: "human-" + randomUUID(),
          to: sender,
          timestamp: String(Math.floor(Date.now() / 1000)),
          text: { body: "Atención humana" },
        },
      ],
    });
    await event(wabaB, phoneB, "Consulta durante pausa");
    await runClientBots();
    assert.equal(sends, 3);
    await c.query(
      "UPDATE oktae.wa_client_conversations SET paused_until=NULL WHERE client_id=$1",
      [b],
    );
    timeout = true;
    await event(wabaB, phoneB, "Intento ambiguo");
    await runClientBots();
    assert.equal(sends, 4);
    await runClientBots();
    assert.equal(sends, 4, "uncertain sends cannot retry");
    await saveClient(form("Negocio A"), users, a);
    await assert.rejects(
      setClientState(a, true, users),
      /Prueba la configuración/,
    );
    const l1 = await inviteClient(a, users),
      token1 = l1.url.split("/").at(-1)!;
    assert.equal((await clientInvite(token1)).client_id, a);
    await inviteClient(a, users);
    await assert.rejects(clientInvite(token1), /expiró/);
    const counts = (
      await c.query(
        "SELECT count(*)::integer AS n FROM oktae.contacts WHERE phone=$1",
        [sender],
      )
    ).rows[0].n;
    assert.equal(counts, 0, "client prospects must not become Oktae contacts");
    assert.ok(aiCalls >= 6);
  } finally {
    globalThis.fetch = fetchBefore;
    for (const k of Object.keys(process.env))
      if (!(k in env)) delete process.env[k];
    Object.assign(process.env, env);
    await c.query("ROLLBACK");
    await c.end();
    delete (globalThis as unknown as { oktaePool?: unknown }).oktaePool;
  }
});
