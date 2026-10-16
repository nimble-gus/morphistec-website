import { test } from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "../src/lib/crm/password";
import { Webhook } from "svix";
import { randomBytes } from "node:crypto";
test("Las contraseñas usan sal distinta y rechazan otra contraseña", () => {
  const a = hashPassword("example-long-test-password"),
    b = hashPassword("example-long-test-password");
  assert.notEqual(a, b);
  assert.equal(verifyPassword("example-long-test-password", a), true);
  assert.equal(verifyPassword("wrong", a), false);
  assert.equal(verifyPassword("wrong", "broken"), false);
});
test("El webhook rechaza firmas falsas, expiradas y contenido alterado", () => {
  const wh = new Webhook("whsec_" + randomBytes(32).toString("base64"));
  const body = JSON.stringify({ event_type: "intent.succeeded" }),
    id = "msg_test";
  const now = new Date();
  const signature = wh.sign(id, now, body);
  const headers = {
    "svix-id": id,
    "svix-timestamp": String(Math.floor(now.getTime() / 1000)),
    "svix-signature": signature,
  };
  assert.doesNotThrow(() => wh.verify(body, headers));
  assert.throws(() => wh.verify(body + " ", headers));
  assert.throws(() =>
    wh.verify(body, { ...headers, "svix-signature": "v1,fake" }),
  );
  assert.throws(() => wh.verify(body, { ...headers, "svix-timestamp": "1" }));
});

import { isAllowedOrigin } from "../src/lib/crm/origin";
test("Producción acepta los dominios exactos de Oktae incluso con configuración local heredada", () => {
  for (const appUrl of [
    undefined,
    "https://oktae.tech",
    "https://www.oktae.tech",
    "http://127.0.0.1:3000",
    "not a url",
  ]) {
    for (const origin of ["https://oktae.tech", "https://www.oktae.tech"])
      assert.equal(isAllowedOrigin(origin, { production: true, appUrl }), true);
  }
});
test("La validación de origen sigue rechazando sitios externos, HTTP, localhost y encabezados falsificados", () => {
  for (const origin of [
    null,
    "null",
    "https://attacker.invalid",
    "https://oktae.tech.attacker.invalid",
    "https://www.oktae.tech:8443",
    "http://www.oktae.tech",
    "http://127.0.0.1:3000",
  ])
    assert.equal(
      isAllowedOrigin(origin, {
        production: true,
        appUrl: "http://127.0.0.1:3000",
        developmentOrigin: "https://attacker.invalid",
      }),
      false,
    );
  assert.equal(
    isAllowedOrigin("http://127.0.0.1:3000", {
      production: false,
      appUrl: "http://127.0.0.1:3000",
    }),
    true,
  );
  assert.equal(
    isAllowedOrigin("https://attacker.invalid", {
      production: false,
      appUrl: "http://127.0.0.1:3000",
      developmentOrigin: "https://attacker.invalid",
    }),
    false,
  );
});
