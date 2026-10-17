import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac, randomBytes } from "node:crypto";
import { encryptionKey, sealToken, openToken, validMetaSignature, equalSecret, expectedCoexistencePhone, parseCoexistenceEvent } from "../src/lib/crm/whatsapp-protocol";

test("WhatsApp tokens are authenticated ciphertext bound to the WhatsApp account", () => {
  const key = randomBytes(32), token = "test-token-do-not-use";
  const encrypted = sealToken(token,key,"1786565612453704");
  assert.equal(encrypted.includes(token), false);
  assert.equal(openToken(encrypted,key,"1786565612453704"),token);
  assert.notEqual(encrypted,sealToken(token,key,"1786565612453704"));
  assert.throws(()=>openToken(encrypted,key,"9999999999999999"));
  assert.throws(()=>openToken(encrypted,randomBytes(32),"1786565612453704"));
  const segments=encrypted.split(".");
  const bytes=Buffer.from(segments[3],"base64url"); bytes[0]^=1; segments[3]=bytes.toString("base64url");
  assert.throws(()=>openToken(segments.join("."),key,"1786565612453704"));
  for (const value of [undefined,"", "secret", "00".repeat(31),"gg".repeat(32)]) assert.throws(()=>encryptionKey(value));
});
test("webhook rejects missing, malformed and tampered signatures", () => {
  const raw='{"object":"whatsapp_business_account"}', secret="test-secret";
  const signature="sha256="+createHmac("sha256",secret).update(raw).digest("hex");
  assert.equal(validMetaSignature(raw,signature,secret),true);
  assert.equal(validMetaSignature(raw+" ",signature,secret),false);
  assert.equal(validMetaSignature(raw,signature,"other"),false);
  for (const value of [null,"", "sha256=1", "sha256="+"g".repeat(64)]) assert.equal(validMetaSignature(raw,value,secret),false);
  assert.equal(equalSecret("same","same"),true);
  assert.equal(equalSecret("same","same-longer"),false);
});
test("only the authorized number in confirmed coexistence can be saved",()=>{
  const phone={display_phone_number:"+502 3117 4640",is_on_biz_app:true,platform_type:"CLOUD_API"};
  assert.equal(expectedCoexistencePhone(phone),true);
  assert.equal(expectedCoexistencePhone({...phone,display_phone_number:"+502 5555 5555"}),false);
  assert.equal(expectedCoexistencePhone({...phone,is_on_biz_app:false}),false);
  assert.equal(expectedCoexistencePhone({...phone,platform_type:"ON_PREMISE"}),false);
});
test("popup events reject lookalike domains and conventional migration flows",()=>{
  const event={type:"WA_EMBEDDED_SIGNUP", event:"FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING", data:{waba_id:"1786565612453704"}};
  assert.deepEqual(parseCoexistenceEvent("https://www.facebook.com",JSON.stringify(event)),{wabaId:event.data.waba_id});
  for (const origin of ["https://evilfacebook.com","https://facebook.com.attacker.invalid","http://www.facebook.com","https://attacker.invalid"]) assert.equal(parseCoexistenceEvent(origin,event),null);
  assert.equal(parseCoexistenceEvent("https://www.facebook.com",{...event,event:"FINISH"}),null);
  assert.equal(parseCoexistenceEvent("https://www.facebook.com","not-json"),null);
  assert.equal(parseCoexistenceEvent("https://www.facebook.com",{...event,data:{waba_id:"../../oauth"}}),null);
});
