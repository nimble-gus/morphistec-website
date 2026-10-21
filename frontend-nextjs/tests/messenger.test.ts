import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseMessengerBatch,
  validSyncToken,
  messengerPageId,
} from "../src/lib/crm/messenger";
const observed_at = "2026-10-16T12:00:00Z";
const lead = {
  page_id: messengerPageId,
  psid: "999123456789012345",
  channel: "messenger",
  name: "Prueba",
};
test("La integración requiere su clave exclusiva y rechaza credenciales incompletas", () => {
  const token = "test-secret-0123456789-0123456789-0123456789";
  assert.equal(validSyncToken("Bearer " + token, token), true);
  assert.equal(validSyncToken("Bearer bad", token), false);
  assert.equal(validSyncToken(null, token), false);
  assert.equal(validSyncToken("Bearer " + token, undefined), false);
  assert.equal(validSyncToken("Bearer tiny", "tiny"), false);
});
test("Solo importa la página de Oktae y rechaza duplicados, fechas e identificadores inválidos", () => {
  assert.equal(
    parseMessengerBatch({ observed_at, leads: [lead] }, Date.parse(observed_at))
      .leads.length,
    1,
  );
  for (const l of [
    { ...lead, page_id: "other" },
    { ...lead, psid: "sql injection" },
    { ...lead, channel: "instagram" },
    { ...lead, last_contact_at: "invalid" },
  ])
    assert.throws(() =>
      parseMessengerBatch({ observed_at, leads: [l] }, Date.parse(observed_at)),
    );
  assert.throws(() =>
    parseMessengerBatch(
      { observed_at, leads: [lead, lead] },
      Date.parse(observed_at),
    ),
  );
  assert.throws(() =>
    parseMessengerBatch(
      { observed_at: "2099-01-01", leads: [lead] },
      Date.parse(observed_at),
    ),
  );
  assert.throws(() =>
    parseMessengerBatch(
      { observed_at, leads: Array(101).fill(lead) },
      Date.parse(observed_at),
    ),
  );
});

test('Messenger defaults local phone numbers to Guatemala and respects explicit foreign context',()=>{
 const parse=(phone:string,metadata={})=>parseMessengerBatch({observed_at,leads:[{...lead,phone,metadata}]},Date.parse(observed_at)).leads[0].phone;
 assert.equal(parse('54164264'),'50254164264');
 assert.equal(parse('+52 5512345678'),'525512345678');
 assert.equal(parse('54164264',{phone_country:'foreign'}),'54164264');
});
