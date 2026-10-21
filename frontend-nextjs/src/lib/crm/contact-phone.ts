/** Local contact numbers default to Guatemala; explicit international numbers stay international. */
export function phoneCountry(lead:Record<string,unknown>){
 const meta=lead.metadata&&typeof lead.metadata==='object'?lead.metadata as Record<string,unknown>:{};
 return String(lead.phone_country??meta.phone_country??'GT');
}
export function normalizeContactPhone(value:string,country='GT'){
 const raw=value.trim();if(!raw||['null','undefined'].includes(raw.toLowerCase()))return '';
 if(!/^\+?[0-9 ()-]+$/.test(raw))return raw;
 let digits=raw.replace(/\D/g,'');const international=raw.startsWith('+')||raw.startsWith('00');
 if(raw.startsWith('00'))digits=digits.slice(2);
 const guatemala=['GT','GUATEMALA','502',''].includes(country.trim().toUpperCase());
 return digits.length===8&&!international&&guatemala?'502'+digits:digits;
}
