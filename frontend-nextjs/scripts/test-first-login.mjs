import assert from "node:assert/strict";
import { randomBytes, randomUUID, scryptSync, createHash } from "node:crypto";
import pg from "pg";
try {
  process.loadEnvFile(".env");
} catch {}
const base = process.env.CRM_TEST_URL || "http://127.0.0.1:3011";
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname))
  throw new Error("Solo localhost");
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
const email = "first-login-" + randomUUID() + "@example.invalid",
  initial = randomBytes(24).toString("hex"),
  password = randomBytes(24).toString("hex"),
  salt = randomBytes(16).toString("hex");
let uid;
const headers = { origin: base, "content-type": "application/json" };
async function post(path, body, cookie) {
  return fetch(base + "/api/admin/" + path, {
    method: "POST",
    headers: { ...headers, ...(cookie ? { cookie } : {}) },
    body: JSON.stringify(body),
  });
}
try {
  await db.connect();
  uid = (
    await db.query(
      "INSERT INTO oktae.users(email,password_hash,must_change_password) VALUES($1,$2,true) RETURNING id",
      [email, salt + ":" + scryptSync(initial, salt, 64).toString("hex")],
    )
  ).rows[0].id;
  assert.equal((await post("password", {})).status, 401);
  const login = await post("login", { email, password: initial });
  assert.equal(login.status, 200);
  assert.equal((await login.json()).redirect, "/admin/change-password");
  const cookie = login.headers.get("set-cookie").split(";")[0];
  assert.equal(
    (await fetch(base + "/api/admin/contacts", { headers: { cookie } })).status,
    403,
  );
  assert.equal(
    (await fetch(base + "/api/admin/payments", { headers: { cookie } })).status,
    403,
  );
  assert.equal((await post("contacts", {}, cookie)).status, 403);
  const forced = await fetch(base + "/admin", {
    headers: { cookie },
    redirect: "manual",
  });
  if (forced.status === 307)
    assert.equal(forced.headers.get("location"), "/admin/change-password");
  else assert.match(await forced.text(), /admin\/change-password/);
  assert.equal(
    (
      await post(
        "password",
        {
          current_password: initial,
          new_password: "short",
          confirm_password: "short",
        },
        cookie,
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await post(
        "password",
        {
          current_password: initial,
          new_password: initial,
          confirm_password: initial,
        },
        cookie,
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await post(
        "password",
        {
          current_password: initial,
          new_password: password,
          confirm_password: "different",
        },
        cookie,
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await post(
        "password",
        {
          current_password: "wrong",
          new_password: password,
          confirm_password: password,
        },
        cookie,
      )
    ).status,
    401,
  );
  const changed = await post(
    "password",
    {
      current_password: initial,
      new_password: password,
      confirm_password: password,
    },
    cookie,
  );
  assert.equal(changed.status, 200);
  const newCookie = changed.headers.get("set-cookie").split(";")[0];
  assert.notEqual(cookie, newCookie);
  assert.equal(
    (await fetch(base + "/api/admin/contacts", { headers: { cookie } })).status,
    401,
  );
  assert.equal(
    (
      await fetch(base + "/api/admin/contacts", {
        headers: { cookie: newCookie },
      })
    ).status,
    200,
  );
  const flags = (
    await db.query("SELECT must_change_password FROM oktae.users WHERE id=$1", [
      uid,
    ])
  ).rows[0];
  assert.equal(flags.must_change_password, false);
  assert.equal((await post("login", { email, password: initial })).status, 401);
  const next = await post("login", { email, password });
  assert.equal(next.status, 200);
  assert.equal((await next.json()).redirect, "/admin");
  console.log(
    "PASS: primer ingreso obligatorio, bloqueo de APIs, validación de contraseña, rotación de sesión y contraseña temporal revocada.",
  );
} finally {
  if (uid) {
    await db.query("DELETE FROM oktae.users WHERE id=$1", [uid]);
    await db.query("DELETE FROM oktae.login_attempts WHERE identity_hash=$1", [
      createHash("sha256")
        .update("password-change:" + uid)
        .digest("hex"),
    ]);
  }
  await db.query("DELETE FROM oktae.login_attempts WHERE identity_hash=$1", [
    createHash("sha256").update(email).digest("hex"),
  ]);
  await db.end();
}
