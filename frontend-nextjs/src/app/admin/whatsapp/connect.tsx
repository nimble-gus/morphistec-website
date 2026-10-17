"use client";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { COEXISTENCE_EVENT, GRAPH_VERSION, parseCoexistenceEvent } from "@/lib/crm/whatsapp-shared";
type MetaSDK = {
  init(options: Record<string, unknown>): void;
  login(callback: (response: { authResponse?: { code?: string } }) => void, options: Record<string, unknown>): void;
};
const sdk = () => (window as typeof window & { FB?: MetaSDK }).FB;
async function post(path: string, body: unknown) {
  const response = await fetch(`/api/admin/whatsapp/${path}`, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)});
  const data = await response.json();
  if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "No se pudo completar la conexión.");
  return data;
}
export default function WhatsAppConnect({ready, appId, configId, connected}: {ready:boolean; appId:string; configId:string; connected:boolean}) {
  const [loaded, setLoaded] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [stage, setStage] = useState<"idle"|"preparing"|"prepared"|"meta"|"saving"|"done">("idle");
  const [error, setError] = useState("");
  const pending = useRef<{nonce:string; code?:string; wabaId?:string; saving?:boolean} | null>(null);
  const deadline = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completeRef = useRef<() => void>(() => {});
  completeRef.current = () => {
    const current = pending.current;
    if (!current?.code || !current.wabaId || current.saving) return;
    current.saving = true;
    if (deadline.current) clearTimeout(deadline.current);
    setStage("saving");
    void post("finish", {nonce:current.nonce, code:current.code, wabaId:current.wabaId, event:COEXISTENCE_EVENT,syncConsent:true}).then(() => {
      pending.current = null; setStage("done"); window.location.reload();
    }).catch((e: Error) => {pending.current = null; setStage("idle"); setError(e.message);});
  };
  useEffect(() => {
    const listener = (event: MessageEvent) => {
      const result = parseCoexistenceEvent(event.origin, event.data);
      if (!result || !pending.current) return;
      pending.current.wabaId = result.wabaId;
      completeRef.current();
    };
    window.addEventListener("message", listener);
    return () => {window.removeEventListener("message", listener); if (deadline.current) clearTimeout(deadline.current);};
  }, []);
  async function prepare() {
    setError(""); setStage("preparing");
    try { const result = await post("start", {}); pending.current = {nonce:result.nonce}; setStage("prepared"); }
    catch (e) {setStage("idle"); setError(e instanceof Error ? e.message : "No se pudo preparar la conexión.");}
  }
  function launch() {
    const fb = sdk();
    if (!fb || !pending.current) {setStage("idle"); setError("Recarga la página para preparar la conexión de nuevo."); return;}
    setError(""); setStage("meta");
    // Keep FB.login synchronous with this click so the browser can open its popup.
    fb.login((response) => {
      if (!response.authResponse?.code) {pending.current=null; setStage("idle"); setError("La conexión se cerró sin autorizar. Puedes volver a intentarlo."); return;}
      if (!pending.current) return;
      pending.current.code=response.authResponse.code;
      completeRef.current();
      if (!pending.current?.saving) deadline.current=setTimeout(() => {
        pending.current=null; setStage("idle"); setError("Meta no confirmó el flujo de coexistencia. No registres el número por otra ruta; vuelve a intentar desde aquí.");
      },10000);
    }, {config_id:configId, response_type:"code", override_default_response_type:true, extras:{setup:{},featureType:"whatsapp_business_app_onboarding",sessionInfoVersion:"3"}});
  }
  const busy=["preparing","meta","saving","done"].includes(stage);
  return <div className="wa-connect">
    {ready && <Script id="oktae-meta-sdk" src="https://connect.facebook.net/es_LA/sdk.js" strategy="afterInteractive" onReady={() => {
      sdk()?.init({appId,version:GRAPH_VERSION,xfbml:false,cookie:false}); setLoaded(Boolean(sdk()));
    }} onError={() => setError("No se pudo cargar Meta. Revisa los bloqueadores del navegador y recarga la página.")} />}
    <p>Usaremos la opción de conectar tu cuenta existente de WhatsApp Business. Meta puede desvincular dispositivos asociados y cambiar funciones como las listas de difusión. Solicitaremos la sincronización de contactos y del historial que decidas compartir en Meta. Se guardan de forma privada y no se convierten en prospectos ni se envían a la IA. Mantén abierta la aplicación durante la sincronización.</p>
    <label className="wa-consent"><input type="checkbox" checked={accepted} disabled={busy || !ready} onChange={event=>setAccepted(event.target.checked)} /><span>Quiero conectar +502 3117 4640 conservando WhatsApp Business en el teléfono. Autorizo recibir en el portal privado mis contactos y el historial que elija compartir en Meta. Revisaré los cambios que indique Meta.</span></label>
    <button type="button" className="primary" disabled={!ready || !loaded || !accepted || busy} onClick={stage === "prepared" ? launch : prepare}>
      {stage === "preparing" ? "Preparando conexión…" : stage === "meta" ? "Completa los pasos en Meta…" : stage === "saving" ? "Verificando coexistencia…" : stage === "done" ? "Número vinculado" : stage === "prepared" ? "Continuar con Meta" : connected ? "Renovar conexión con Meta" : "Preparar conexión"}
    </button>
    {error && <p className="crm-error" role="alert">{error}</p>}
    {stage === "prepared" && <p role="status">La conexión está preparada. Continúa con Meta y elige conectar tu cuenta existente. No elimines la cuenta del teléfono.</p>}
  </div>;
}
