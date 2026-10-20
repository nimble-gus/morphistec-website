import type { Metadata } from "next";
import { clientInvite } from "@/lib/crm/wa-client-connect";
import { META_APP_ID, WHATSAPP_CONFIG_ID } from "@/lib/crm/whatsapp-shared";
import OwnerConnect from "./owner-connect";
import "../../../admin/admin.css";
import "../../../admin/whatsapp-clients/clients.css";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Autorizar WhatsApp · Oktae",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export default async function Page({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  let invite;
  try {
    invite = await clientInvite(token);
  } catch {
    return (
      <main className="ok-admin">
        <div className="wc-owner-page">
          <h1>Este enlace ya no está disponible</h1>
          <p>
            Solicita un enlace nuevo al equipo de Oktae. No necesitas crear una
            cuenta.
          </p>
        </div>
      </main>
    );
  }
  return (
    <main className="ok-admin">
      <div className="wc-owner-page">
        <strong>oktae.</strong>
        <h1>Conecta el WhatsApp de {invite.name}</h1>
        <p>
          Autoriza a Oktae a recibir y responder los mensajes del número{" "}
          <strong>{invite.phone}</strong> con el agente que configurará nuestro
          equipo.
        </p>
        <p>
          No necesitas registrarte ni compartir tu contraseña. La autorización
          se realiza directamente en Meta. La conservación de WhatsApp Business
          en el teléfono depende de la elegibilidad que confirme Meta.
        </p>
        <OwnerConnect
          token={token}
          appId={META_APP_ID}
          configId={WHATSAPP_CONFIG_ID}
        />
      </div>
    </main>
  );
}
