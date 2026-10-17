import { test } from "node:test";
import { parseEmbeddedSignupEvent } from "../src/lib/crm/whatsapp-shared";
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

test("Meta failure diagnostics never accept another flow as coexistence or expose raw details",()=>{
  const origin="https://www.facebook.com";
  const payload={type:"WA_EMBEDDED_SIGNUP",event:"ERROR",data:{error_id:12345,error_message:"private token and account details",waba_id:"1786565612453704"}};
  assert.deepEqual(parseEmbeddedSignupEvent(origin,JSON.stringify(payload)),{kind:"error",code:"12345"});
  for(const code of ["EAA_PRIVATE_TOKEN","12345 token",-1,1.5,NaN,"1234567890123",{},null]) {
    assert.deepEqual(parseEmbeddedSignupEvent(origin,{...payload,data:{...payload.data,error_id:code}}),{kind:"error"});
  }
  assert.deepEqual(parseEmbeddedSignupEvent(origin,{type:"WA_EMBEDDED_SIGNUP",event:"CANCEL",data:{current_step:"PHONE_NUMBER_SETUP"}}),{kind:"cancelled"});
  assert.deepEqual(parseEmbeddedSignupEvent(origin,{type:"WA_EMBEDDED_SIGNUP",event:"CANCEL",data:{error_code:"524126",error_message:"private account data",session_id:"private-session"}}),{kind:"error",code:"524126"});
  assert.deepEqual(parseEmbeddedSignupEvent(origin,{type:"WA_EMBEDDED_SIGNUP",event:"CANCEL",data:{error_code:"secret",error_message:"private account data"}}),{kind:"error"});
  for(const event of ["FINISH","FINISH_ONLY_WABA","FINISH_OBO_MIGRATION","FINISH_GRANT_ONLY_API_ACCESS"]) {
    assert.deepEqual(parseEmbeddedSignupEvent(origin,{...payload,event}),{kind:"different_flow"});
    assert.equal(parseCoexistenceEvent(origin,{...payload,event}),null);
  }
  for(const badOrigin of ["https://evilfacebook.com","https://facebook.com.attacker.invalid","http://www.facebook.com"]) {
    assert.equal(parseEmbeddedSignupEvent(badOrigin,payload),null);
  }
  assert.equal(parseEmbeddedSignupEvent(origin,{...payload,type:"OTHER"}),null);
  assert.equal(parseEmbeddedSignupEvent(origin,{...payload,event:"UNRECOGNIZED"}),null);
  assert.equal(parseEmbeddedSignupEvent(origin,{...payload,event:"FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING",data:{waba_id:"invalid"}}),null);
});
