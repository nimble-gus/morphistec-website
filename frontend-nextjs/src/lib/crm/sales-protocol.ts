export const handoffPattern=/\bOKTAE-([a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12})\b/i;
export function handoffCode(text:string){return text.match(handoffPattern)?.[1].toLowerCase()??null;}
export const handoffUuid=/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
export function whatsappLaunchUrls(code:string|null,source:'messenger'|'instagram'='messenger'){
 const reference=code&&handoffUuid.test(code)?` OKTAE-${code.toLowerCase()}`:'';
 const message=`Hola, vengo de ${source==='instagram'?'Instagram':'Messenger'}.${reference}`;
 const query=`phone=50231174640&text=${encodeURIComponent(message)}`;
 return {message,phone:'+502 3117 4640',nativeUrl:`whatsapp://send?${query}`,webUrl:`https://web.whatsapp.com/send?${query}`};
}
export function transferOutput(output:string,code:string){
 if(!handoffUuid.test(code))throw new Error('Referencia inválida');
 return output.replace(/https:\/\/wa\.me\/50231174640(?:\?[^\s<>]*)?/g,`https://www.oktae.tech/w/${code.toLowerCase()}`);
}
export function salesDetails(value:Record<string,unknown>){
 const demo=value.demo&&typeof value.demo==='object'?value.demo as Record<string,unknown>:{};
 return {summary:typeof value.summary==='string'?value.summary.trim().slice(0,1000):'',demoRequested:demo.requested===true,preferredTime:typeof demo.preferred_time==='string'?demo.preferred_time.trim().slice(0,300):''};
}
export function supportedDemoTime(preferred:string,customerTexts:string[]){
 return Boolean(preferred)&&customerTexts.some(t=>t.toLocaleLowerCase().includes(preferred.toLocaleLowerCase()));
}

export function contactCaptureOutput(output:string,lead:{name?:unknown;phone?:unknown;email?:unknown}){
 if(!/https:\/\/(?:wa\.me\/50231174640|(?:www\.)?oktae\.tech\/w\/)/i.test(output))return output;
 const value=(v:unknown)=>typeof v==='string'&&!['null','undefined'].includes(v.trim().toLowerCase())?v.trim():'';
 const name=value(lead.name),phone=value(lead.phone),email=value(lead.email);
 if(!name)return 'Para continuar por WhatsApp y retomar tu consulta, ¿cuál es tu nombre?';
 if(!/^\+?[\d\s()-]{8,25}$/.test(phone)||phone.replace(/\D/g,'').length<8)return '¿Qué número de teléfono usamos para dar seguimiento a tu consulta?';
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return '¿Cuál es tu correo electrónico para el seguimiento de tu consulta?';
 return output;
}
