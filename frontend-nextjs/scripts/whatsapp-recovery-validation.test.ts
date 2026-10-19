import {test} from "node:test";
import assert from "node:assert/strict";
import {validateRecovery,RECOVERY_APP,RECOVERY_PHONE} from "./whatsapp-recovery-validation";
const now=Date.now();
const debug={is_valid:true,app_id:RECOVERY_APP,scopes:["whatsapp_business_management","whatsapp_business_messaging"],expires_at:Math.floor(now/1000)+3600};
const phones=[{id:RECOVERY_PHONE,display_phone_number:"+502 3117 4640",platform_type:"CLOUD_API",is_on_biz_app:true}];
const apps=[{whatsapp_business_api_data:{id:RECOVERY_APP}}];
test("requires the expected app, number, coexistence and subscription",()=>{
 assert.equal(validateRecovery(debug,phones,apps,now).displayNumber,"+502 3117 4640");
 assert.throws(()=>validateRecovery({...debug,app_id:"other"},phones,apps,now));
 assert.throws(()=>validateRecovery({...debug,scopes:["whatsapp_business_management"]},phones,apps,now));
 assert.throws(()=>validateRecovery(debug,[{...phones[0],is_on_biz_app:false}],apps,now));
 assert.throws(()=>validateRecovery(debug,[{...phones[0],display_phone_number:"+502 0000 0000"}],apps,now));
 assert.throws(()=>validateRecovery(debug,phones,[],now));
});
test("uses the earliest expiration and rejects absent or near-expired credentials",()=>{
 assert.equal(validateRecovery({...debug,data_access_expires_at:Math.floor(now/1000)+600},phones,apps,now).expiresAt.getTime(),(Math.floor(now/1000)+600)*1000);
 assert.throws(()=>validateRecovery({...debug,expires_at:0},phones,apps,now));
 assert.throws(()=>validateRecovery({...debug,expires_at:Math.floor(now/1000)+60},phones,apps,now));
});
