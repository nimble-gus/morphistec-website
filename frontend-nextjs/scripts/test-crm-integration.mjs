import assert from "node:assert/strict";
import { randomBytes, createHash, scryptSync, randomUUID } from "node:crypto";
import pg from "pg";
try {
  process.loadEnvFile(".env");
} catch {}
const base = process.env.CRM_TEST_URL || "http://localhost:3000";
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname))
  throw new Error("Solo se prueba contra localhost");
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
const email = `crm-test-${randomUUID()}@example.invalid`,
  password = randomBytes(24).toString("hex");
const salt = randomBytes(16).toString("hex"),
  hash = salt + ":" + scryptSync(password, salt, 64).toString("hex");
let uid, cid;
try {
  await db.connect();
  uid = (
    await db.query(
      "INSERT INTO oktae.users(email,password_hash) VALUES($1,$2) RETURNING id",
      [email, hash],
    )
  ).rows[0].id;
  const unauth = await fetch(base + "/api/admin/contacts");
  assert.equal(unauth.status, 401);
  const privatePage = await fetch(base + "/admin", { redirect: "manual" });
  if(privatePage.status===307) assert.equal(privatePage.headers.get("location"),"/admin/login");
  else {const html=await privatePage.text();assert.match(html,/NEXT_REDIRECT/);assert.match(html,/admin\/login/);assert.ok(!html.includes(email));}
  const login = await fetch(base + "/api/admin/login", {
    method: "POST",
    headers: { origin: base, "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  assert.equal(login.status, 200);
  const cookie = login.headers.get("set-cookie").split(";")[0];
  assert.match(login.headers.get("set-cookie"), /httponly/i);
  const headers = { cookie, origin: base, "content-type": "application/json" };
  const attack = await fetch(base + "/api/admin/contacts", {
    method: "POST",
    headers: { ...headers, origin: "https://attacker.invalid" },
    body: "{}",
  });
  assert.equal(attack.status, 403);
  const created = await fetch(base + "/api/admin/contacts", {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: "QA prospecto temporal",
      company: "QA",
      email: "test@example.invalid",
      phone: "+50231174640",
      source: "manual",
    }),
  });
  assert.equal(created.status, 201);
  const c = await created.json();
  cid = c.id;
  const changed = await fetch(base + "/api/admin/contacts", {
    method: "PATCH",
    headers,
    body: JSON.stringify({ ...c, stage: "demo", next_follow_up: "2026-10-20" }),
  });
  assert.equal(changed.status, 200);
  assert.equal((await changed.json()).stage, "demo");
  const note = await fetch(base + "/api/admin/notes", {
    method: "POST",
    headers,
    body: JSON.stringify({ contact_id: cid, body: "Nota temporal de prueba" }),
  });
  assert.equal(note.status, 201);
  const notes = await fetch(base + "/api/admin/notes?contact_id=" + cid, {
    headers,
  });
  assert.equal((await notes.json()).length, 1);
  const invalid = await fetch(base + "/api/admin/payments", {
    method: "POST",
    headers,
    body: JSON.stringify({
      contact_id: cid,
      concept: "Prueba",
      currency: "USD",
      amount_in_cents: 0,
      request_key: randomUUID(),
    }),
  });
  assert.equal(invalid.status, 400);
  const csrfLogout = await fetch(base + "/api/admin/logout", {
    method: "POST",
    headers: { ...headers, origin: "https://attacker.invalid" },
    body: "{}",
  });
  assert.equal(csrfLogout.status, 403);
  const logout = await fetch(base + "/api/admin/logout", {
    method: "POST",
    headers,
    body: "{}",
  });
  assert.equal(logout.status, 200);
  assert.equal(
    (await fetch(base + "/api/admin/payments", { headers: { cookie } })).status,
    401,
  );
  const badLogin = await fetch(base + "/api/admin/login", {
    method: "POST",
    headers: { origin: base, "content-type": "application/json" },
    body: JSON.stringify({ email, password: "wrong" }),
  });
  assert.equal(badLogin.status, 401);
  for (let i = 0; i < 5; i++)
    await fetch(base + "/api/admin/login", {
      method: "POST",
      headers: { origin: base, "content-type": "application/json" },
      body: JSON.stringify({ email, password: "wrong" }),
    });
  const limited = await fetch(base + "/api/admin/login", {
    method: "POST",
    headers: { origin: base, "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  assert.equal(limited.status, 429);
  console.log(
    "PASS: sesión, rutas privadas, CSRF, prospectos, seguimiento, notas, validación de cobros, cierre de sesión y límite de intentos.",
  );
} finally {
  if (cid) {
    await db.query("DELETE FROM oktae.notes WHERE contact_id=$1", [cid]);
    await db.query("DELETE FROM oktae.contacts WHERE id=$1", [cid]);
  }
  if (uid) await db.query("DELETE FROM oktae.users WHERE id=$1", [uid]);
  await db.query("DELETE FROM oktae.login_attempts WHERE identity_hash=$1", [
    createHash("sha256").update(email).digest("hex"),
  ]);
  await db.end();
}
