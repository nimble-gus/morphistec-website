export const AGENT_ORIGIN = "https://n8n-production-2af53.up.railway.app";
export const AGENT_PATH = "/webhook/oktae-whatsapp-ai";
export function allowedAgentUrl(value: string | undefined) {
  if (!value) return false;
  try { const u=new URL(value); return u.origin===AGENT_ORIGIN && u.pathname===AGENT_PATH && !u.username && !u.password && !u.search && !u.hash; } catch {return false;}
}
export function phoneId(value: unknown): value is string { return typeof value === "string" && /^[1-9][0-9]{7,19}$/.test(value); }
export function freshTimestamp(value: unknown, now = Date.now()) {
  if(typeof value!=="string" || !/^\d{9,12}$/.test(value)) return null;
  const time=Number(value)*1000;
  return time>now-24*3600*1000 && time<now+5*60*1000 ? new Date(time) : null;
}
type MetaValue={metadata?:{phone_number_id?:string};contacts?:Array<{wa_id?:string;profile?:{name?:string}}>;
 messages?:Array<{id?:string;from?:string;to?:string;timestamp?:string;type?:string;text?:{body?:string}}>;
 message_echoes?:Array<{to?:string;timestamp?:string}>};
export function incomingTexts(value: MetaValue, now=Date.now()) {
  if(!value || !Array.isArray(value.messages)) return [];
  return value.messages.slice(0,100).flatMap(message=>{
    const date=freshTimestamp(message.timestamp,now);
    if(!date || message.type!=="text" || !phoneId(message.from) || typeof message.id!=="string" || !message.id || message.id.length>512 || typeof message.text?.body!=="string" || !message.text.body.trim() || message.text.body.length>5000) return [];
    const name=value.contacts?.find(c=>c.wa_id===message.from)?.profile?.name;
    return [{id:message.id,sender:message.from,text:message.text.body.trim(),date,profile:typeof name==="string"?name.trim().slice(0,200):""}];
  });
}
export function humanEchoPeers(value:MetaValue,now=Date.now()) {
  const messages=Array.isArray(value?.message_echoes)?value.message_echoes:Array.isArray(value?.messages)?value.messages:[];
  return [...new Set(messages.filter(m=>phoneId(m.to)&&freshTimestamp(m.timestamp,now)).map(m=>m.to!))];
}
const bounded=(value:unknown,max:number)=>typeof value==="string"?value.trim().slice(0,max):"";
export function parseAgentAnswer(value:unknown) {
  if(!value || typeof value!=="object" || Array.isArray(value)) throw new Error("Invalid agent response");
  const answer=value as Record<string,unknown>;
  if(typeof answer.reply!=="string" || !answer.reply.trim() || answer.reply.length>1500 || /wa\.me\/\+?50231174640/i.test(answer.reply)) throw new Error("Invalid reply");
  const q=(answer.qualification&&typeof answer.qualification==="object"?answer.qualification:{}) as Record<string,unknown>;
  return {reply:answer.reply.trim(),qualified:q.businessFit===true&&q.commercialIntent===true&&Boolean(bounded(q.interest,500)),interest:bounded(q.interest,500),name:bounded(q.name,200),company:bounded(q.company,200),handoff:q.handoff===true};
}
