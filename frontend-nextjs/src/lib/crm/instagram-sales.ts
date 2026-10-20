import 'server-only';
import type {PoolClient} from 'pg';
import {createHash} from 'node:crypto';
import {transferOutput} from './sales-protocol';
import {HttpError} from './errors';
const clean=(v:unknown,max:number)=>{const s=typeof v==='string'?v.trim().slice(0,max):'';return ['null','undefined'].includes(s.toLowerCase())?'':s;};
export function instagramInput(b:Record<string,unknown>){
 if(!b||typeof b!=='object'||Array.isArray(b))throw new HttpError(400,'Solicitud inválida.');
 if(b.account_id!=='17841473350351714'||typeof b.psid!=='string'||!/^\d{5,30}$/.test(b.psid)||typeof b.source_message_id!=='string'||!b.source_message_id||b.source_message_id.length>512)throw new HttpError(400,'Identidad de Instagram inválida.');
 const source=createHash('sha256').update(b.account_id+':'+b.psid+':'+b.source_message_id).digest('hex');
 return {account:b.account_id,sender:b.psid,source};
}
export async function saveInstagramSales(c:PoolClient,b:Record<string,unknown>){
 const {account,sender,source}=instagramInput(b);
 if(b.action==='ack'){
  if(typeof b.message_id!=='string'||!b.message_id||b.message_id.length>512)throw new HttpError(400,'Falta el recibo de Meta.');
  const ack=await c.query("UPDATE oktae.conversation_messages SET delivery='accepted' WHERE id=$1 AND channel='instagram' RETURNING body",['ig:out:'+source]);if(!ack.rowCount)throw new HttpError(404,'Mensaje no registrado.');
  if(/https:\/\/(?:www[.]oktae[.]tech\/w\/|wa[.]me\/50231174640)/.test(ack.rows[0].body))await c.query("UPDATE oktae.instagram_leads SET stage='handoff_wa',observed_at=now() WHERE account_id=$1 AND sender_id=$2 AND contact_id IS NOT NULL",[account,sender]);return {message_id:b.message_id};
 }
 if(typeof b.text!=='string'||!b.text.trim()||b.text.length>5000||typeof b.output!=='string'||!b.output.trim()||b.output.length>10000)throw new HttpError(400,'Mensaje inválido.');
 const l=(b.lead&&typeof b.lead==='object'?b.lead:{}) as Record<string,unknown>;
 const name=clean(l.name,200),phone=clean(l.phone,100),email=clean(l.email,254),interest=clean(l.interest,1500),stage=clean(l.stage,80)||'new';
 const transfer=/https:\/\/wa\.me\/50231174640(?:\?|\b)/.test(b.output);
 await c.query('BEGIN');try{
  await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',['instagram:'+account+':'+sender]);
  const prev=(await c.query('SELECT * FROM oktae.instagram_leads WHERE account_id=$1 AND sender_id=$2 FOR UPDATE',[account,sender])).rows[0];
  const knownInterest=interest||prev?.interest||'';
  // A greeting/name alone is not a lead. Need + commercial progression or accepted transfer are required.
  const qualified=Boolean(knownInterest)&&(['qualified','handoff_wa'].includes(stage)||transfer);
  let contact=prev?.contact_id??null;
  if(!contact&&qualified){contact=(await c.query("INSERT INTO oktae.contacts(name,phone,email,stage,source) VALUES($1,$2,$3,'contactado','instagram') RETURNING id",[name||prev?.name||'Prospecto de Instagram · '+sender.slice(-6),phone||prev?.phone||'',email||prev?.email||''])).rows[0].id;}
  if(contact&&prev?.contact_id)await c.query(`UPDATE oktae.contacts SET name=CASE WHEN name=$2 OR name=$3 THEN COALESCE(NULLIF($4,''),name) ELSE name END,phone=CASE WHEN phone='' THEN $5 ELSE phone END,email=CASE WHEN email='' THEN $6 ELSE email END,updated_at=now() WHERE id=$1`,[contact,prev.name,'Prospecto de Instagram · '+sender.slice(-6),name,phone,email]);
  await c.query(`INSERT INTO oktae.instagram_leads(account_id,sender_id,contact_id,name,phone,email,interest,stage) VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT(account_id,sender_id) DO UPDATE SET contact_id=EXCLUDED.contact_id,name=COALESCE(NULLIF(EXCLUDED.name,''),oktae.instagram_leads.name),phone=COALESCE(NULLIF(EXCLUDED.phone,''),oktae.instagram_leads.phone),email=COALESCE(NULLIF(EXCLUDED.email,''),oktae.instagram_leads.email),interest=COALESCE(NULLIF(EXCLUDED.interest,''),oktae.instagram_leads.interest),stage=EXCLUDED.stage,observed_at=now()`,[account,sender,contact,name,phone,email,knownInterest,stage]);
  let output=b.output;
  // Every handoff carries context, even before the conversation qualifies as a CRM opportunity.
  if(transfer){const h=(await c.query("INSERT INTO oktae.messenger_handoffs(contact_id,source_message_id,source_channel,social_account_id,social_sender_id) VALUES($1,$2,'instagram',$3,$4) ON CONFLICT(source_message_id) DO UPDATE SET source_message_id=EXCLUDED.source_message_id RETURNING code",[contact,'ig:'+source,account,sender])).rows[0];output=transferOutput(output,h.code);}
  for(const [direction,body,delivery,key] of [['customer',b.text,'received','ig:in:'],['assistant',output,'prepared','ig:out:']])await c.query('INSERT INTO oktae.conversation_messages(id,contact_id,channel,direction,body,delivery,social_account_id,social_sender_id) VALUES($1,$2,\'instagram\',$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING',[key+source,contact,direction,body,delivery,account,sender]);
  if(contact)await c.query("UPDATE oktae.conversation_messages SET contact_id=$3 WHERE channel='instagram' AND social_account_id=$1 AND social_sender_id=$2 AND contact_id IS NULL",[account,sender,contact]);
  output=(await c.query('SELECT body FROM oktae.conversation_messages WHERE id=$1',['ig:out:'+source])).rows[0].body;
  await c.query('COMMIT');return {output,qualified:Boolean(contact)};
 }catch(e){await c.query('ROLLBACK');throw e;}
}
