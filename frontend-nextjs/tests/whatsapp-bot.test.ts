import {test} from "node:test";
import assert from "node:assert/strict";
import {allowedAgentUrl,incomingTexts,humanEchoPeers,parseAgentAnswer} from "../src/lib/crm/whatsapp-bot-protocol";
const now=Date.now(),timestamp=String(Math.floor(now/1000));
test("WhatsApp worker only calls its configured private n8n endpoint",()=>{
 assert.equal(allowedAgentUrl("https://n8n-production-2af53.up.railway.app/webhook/oktae-whatsapp-ai"),true);
 for(const url of [undefined,"http://n8n-production-2af53.up.railway.app/webhook/oktae-whatsapp-ai","https://attacker.invalid/webhook/oktae-whatsapp-ai","https://n8n-production-2af53.up.railway.app/webhook/other","https://n8n-production-2af53.up.railway.app/webhook/oktae-whatsapp-ai?token=secret","https://user:pass@n8n-production-2af53.up.railway.app/webhook/oktae-whatsapp-ai"])assert.equal(allowedAgentUrl(url),false);
});
test("only fresh incoming text messages become AI work",()=>{
 const m={id:"wamid.test",from:"50255555555",timestamp,type:"text",text:{body:"Una consulta"}};
 assert.equal(incomingTexts({messages:[m]},now).length,1);
 for(const message of [{...m,type:"image"},{...m,from:"malformed"},{...m,timestamp:"1504902988"},{...m,timestamp:String(Math.floor(now/1000)+600)},{...m,text:{body:""}}])assert.equal(incomingTexts({messages:[message]},now).length,0);
 assert.equal(incomingTexts({messages:[],contacts:[]},now).length,0);
 assert.deepEqual(humanEchoPeers({message_echoes:[{to:m.from,timestamp}]},now),[m.from]);
 assert.deepEqual(humanEchoPeers({message_echoes:[{to:m.from,timestamp:"1504902988"}]},now),[]);
});
test("qualification requires both fit and clear commercial intent; self-transfer links are refused",()=>{
 const base={reply:"La instalación cuesta US$399.",qualification:{businessFit:true,commercialIntent:false,interest:"Tienda óptica"}};
 assert.equal(parseAgentAnswer(base).qualified,false);
 assert.equal(parseAgentAnswer({...base,qualification:{...base.qualification,commercialIntent:true}}).qualified,true);
 assert.equal(parseAgentAnswer({...base,qualification:{businessFit:true,commercialIntent:true,interest:""}}).qualified,false);
 assert.throws(()=>parseAgentAnswer({reply:"Continúa en https://wa.me/50231174640"}));
 assert.throws(()=>parseAgentAnswer({reply:""}));
 assert.throws(()=>parseAgentAnswer("fake object"));
});
