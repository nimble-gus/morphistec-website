import "server-only";
import {db} from "./db";
import {encryptionKey,openToken,GRAPH_VERSION} from "./whatsapp-protocol";

// Meta permits one request per type per onboarding. Never repeat a request whose
// outcome is uncertain, even if an invocation ends before recording the receipt.
export async function runWhatsappSync() {
 await db().query("UPDATE oktae.whatsapp_sync_requests SET status='uncertain' WHERE status='sending' AND attempted_at<now()-interval '2 minutes'");
 await db().query(`UPDATE oktae.whatsapp_connections c SET status='sync_review' WHERE c.status='sync_pending' AND EXISTS(SELECT 1 FROM oktae.whatsapp_sync_requests r WHERE r.phone_number_id=c.phone_number_id AND r.status IN ('rejected','uncertain'))`);
 let didWork=false;
 for(let step=0;step<2;step++) {
  const connection=(await db().query("SELECT waba_id,phone_number_id,token_encrypted,token_expires_at FROM oktae.whatsapp_connections WHERE id=1 AND status='sync_pending'")).rows[0];
  if(!connection || new Date(connection.token_expires_at).getTime()<=Date.now()) return didWork;
  const token=openToken(connection.token_encrypted,encryptionKey(process.env.WHATSAPP_ENCRYPTION_KEY),connection.waba_id);
  const claim=await db().query(`UPDATE oktae.whatsapp_sync_requests r SET status='sending',attempted_at=now()
   WHERE (r.phone_number_id,r.sync_type) IN (SELECT phone_number_id,sync_type FROM oktae.whatsapp_sync_requests
   WHERE phone_number_id=$1 AND status='pending' AND (sync_type='smb_app_state_sync' OR EXISTS(SELECT 1 FROM oktae.whatsapp_sync_requests p WHERE p.phone_number_id=$1 AND p.sync_type='smb_app_state_sync' AND p.status='accepted'))
   ORDER BY CASE WHEN sync_type='smb_app_state_sync' THEN 0 ELSE 1 END LIMIT 1 FOR UPDATE SKIP LOCKED)
   AND r.status='pending' RETURNING r.sync_type`,[connection.phone_number_id]);
  if(!claim.rowCount)break;
  didWork=true;
  const type=claim.rows[0].sync_type;
  try {
   const response=await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${connection.phone_number_id}/smb_app_data`,{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify({messaging_product:"whatsapp",sync_type:type}),cache:"no-store",redirect:"error",signal:AbortSignal.timeout(12000)});
   const data=await response.json().catch(()=>null);
   if(response.ok && typeof data?.request_id==="string" && data.request_id.length>0 && data.request_id.length<=512) {
    await db().query("UPDATE oktae.whatsapp_sync_requests SET status='accepted',request_id=$3 WHERE phone_number_id=$1 AND sync_type=$2 AND status='sending'",[connection.phone_number_id,type,data.request_id]);
   } else {
    await db().query("UPDATE oktae.whatsapp_sync_requests SET status=$3 WHERE phone_number_id=$1 AND sync_type=$2 AND status='sending'",[connection.phone_number_id,type,response.status>=400&&response.status<500?'rejected':'uncertain']);
    await db().query("UPDATE oktae.whatsapp_connections SET status='sync_review' WHERE id=1 AND phone_number_id=$1",[connection.phone_number_id]);
    return true;
   }
  } catch {
   await db().query("UPDATE oktae.whatsapp_sync_requests SET status='uncertain' WHERE phone_number_id=$1 AND sync_type=$2 AND status='sending'",[connection.phone_number_id,type]);
   await db().query("UPDATE oktae.whatsapp_connections SET status='sync_review' WHERE id=1 AND phone_number_id=$1",[connection.phone_number_id]);
   return true;
  }
 }
 await db().query(`UPDATE oktae.whatsapp_connections c SET status='linked_bot_paused' WHERE id=1 AND status='sync_pending' AND (SELECT count(*) FROM oktae.whatsapp_sync_requests r WHERE r.phone_number_id=c.phone_number_id AND r.status='accepted')=2`);
 return didWork;
}
