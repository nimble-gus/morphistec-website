import Link from "next/link";
import { ArrowLeft, LockKeyhole, MessageCircle } from "lucide-react";
import { requireUser } from "@/lib/crm/auth";
import { whatsappStatus } from "@/lib/crm/whatsapp";
import WhatsAppConnect from "./connect";
export const runtime = "nodejs";
export default async function WhatsAppPage() {
  await requireUser();
  const status = await whatsappStatus();
  const connection = status.connection;
  return <main className="wa-page">
    <Link href="/admin" className="wa-back"><ArrowLeft size={17} /> Volver al CRM</Link>
    <header className="wa-heading"><div><h1>WhatsApp de Oktae</h1><p>Conecta +502 3117 4640 y conserva la aplicación de tu teléfono.</p></div><span className="private-tag"><LockKeyhole size={14} /> Acceso privado</span></header>
    <section className="wa-panel" aria-labelledby="wa-connection-title">
      <div className="wa-panel-title"><MessageCircle size={22} /><h2 id="wa-connection-title">Conexión con Meta</h2></div>
      <dl className="wa-checklist">
        <div><dt>Claves del servidor</dt><dd>{status.ready ? "Configuradas" : "Pendientes"}</dd></div>
        <div><dt>Recepción de eventos</dt><dd>{status.webhookVerified ? "Webhook verificado" : "Pendiente de verificar en Meta"}</dd></div>
        <div><dt>Finalización de coexistencia</dt><dd>{status.onboardingEnabled ? "Habilitada" : "Pendiente de preparar sincronización y n8n"}</dd></div>
        <div><dt>Número de WhatsApp</dt><dd>{connection ? `${connection.display_phone_number} · coexistencia verificada` : "Pendiente de vincular"}</dd></div>
        <div><dt>Respuestas automáticas</dt><dd>Pendientes de conectar y probar en n8n</dd></div>
      </dl>
      {connection && <p className="crm-notice">Número guardado. {connection.status === "subscription_pending" ? "Falta suscribir los eventos en Meta. " : "Los eventos que entregue Meta se guardan en el portal. "}El bot todavía no responde en WhatsApp. La autorización vence el {new Intl.DateTimeFormat("es-GT", {dateStyle:"long", timeZone:"America/Guatemala"}).format(new Date(connection.token_expires_at))}.</p>}
      <WhatsAppConnect ready={status.ready && status.webhookVerified && status.onboardingEnabled} appId={status.appId} configId={status.configId} connected={Boolean(connection)} />
    </section>
    {(!status.ready || !status.webhookVerified) && <section className="wa-panel" aria-labelledby="wa-setup-title">
      <h2 id="wa-setup-title">Completar la configuración</h2>
      <p>Guarda las claves en las variables del servidor de Vercel y vuelve a desplegar. No las pegues en el chat.</p>
      {status.missing.length > 0 && <ul className="wa-missing">{status.missing.map(name => <li key={name}><code>{name}</code></li>)}</ul>}
      <p>En Meta, usa esta dirección como callback de WhatsApp y el valor de <code>WHATSAPP_VERIFY_TOKEN</code> como token de verificación:</p>
      <p className="wa-endpoint">https://www.oktae.tech/api/webhooks/whatsapp</p>
      <p>Habilita los eventos <code>messages</code>, <code>smb_message_echoes</code>, <code>history</code> y <code>smb_app_state_sync</code>. El portal valida la firma de Meta y guarda cada evento antes de confirmar su recepción.</p>
      <p>Para finalizar el alta habrá que atender la sincronización de coexistencia dentro del plazo de Meta. Esta pantalla no importa tu historial ni activa el bot por sí sola.</p>
    </section>}
    <section className="wa-next"><h2>Después de vincular el número</h2><p>Conectaremos los mensajes nuevos al agente de n8n, probaremos una respuesta y la pausa al atender tú, y validaremos qué conversaciones pasan al CRM. Los eventos recibidos no se convierten automáticamente en prospectos calificados.</p><p>Eventos recibidos por el portal: <strong>{status.receivedEvents}</strong></p></section>
  </main>;
}
