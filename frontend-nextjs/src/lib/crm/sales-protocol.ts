export const handoffPattern=/\bOKTAE-([a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12})\b/i;
export function handoffCode(text:string){return text.match(handoffPattern)?.[1].toLowerCase()??null;}
export function transferOutput(output:string,code:string){
 const url='https://wa.me/50231174640?text='+encodeURIComponent(`Hola, vengo de Messenger y quiero continuar con Oktae. Referencia OKTAE-${code}`);
 return output.replace(/https:\/\/wa\.me\/50231174640(?:\?[^\s<>]*)?/g,url);
}
export function salesDetails(value:Record<string,unknown>){
 const demo=value.demo&&typeof value.demo==='object'?value.demo as Record<string,unknown>:{};
 return {summary:typeof value.summary==='string'?value.summary.trim().slice(0,1000):'',demoRequested:demo.requested===true,preferredTime:typeof demo.preferred_time==='string'?demo.preferred_time.trim().slice(0,300):''};
}
export function supportedDemoTime(preferred:string,customerTexts:string[]){
 return Boolean(preferred)&&customerTexts.some(t=>t.toLocaleLowerCase().includes(preferred.toLocaleLowerCase()));
}
