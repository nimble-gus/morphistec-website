import "server-only";
import type { PoolClient } from "pg";
import { db } from "./db";
import { HttpError } from "./errors";
import { recurrente, paymentEnvironment } from "./recurrente";

const subscriptionEvents = new Set(["subscription.create","subscription.update","subscription.past_due","subscription.pause","subscription.cancel","subscription.reactivate","subscription.unpause","subscription.item_added","subscription.item_removed"]);
const successfulPayments = new Set(["intent.succeeded","payment_intent.succeeded"]);
type ProviderRecord = Record<string, any>;
const validId = (id: unknown, prefix: string): id is string => typeof id === "string" && new RegExp(`^${prefix}_[a-zA-Z0-9]+$`).test(id);
function subscriptionId(event: ProviderRecord): string | null {
  const paymentable = event.payment?.paymentable ?? event.checkout?.payment?.paymentable;
  const candidate = event.subscription?.id ?? (paymentable?.type === "Subscription" ? paymentable.id : null);
  return validId(candidate,"su") ? candidate : null;
}
function timestamp(value: unknown) {
  return typeof value === "string" && Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : null;
}
async function readSubscription(id: string) {
  const remote = await recurrente(`/subscriptions/${encodeURIComponent(id)}`);
  if (remote.id !== id || !["active","paused","past_due","cancelled"].includes(remote.status))
    throw new HttpError(502,"No se pudo verificar el estado de la suscripción.");
  return remote;
}
async function saveSubscription(client: PoolClient, link: ProviderRecord, remote: ProviderRecord) {
  const alreadyLinked = link.subscription_id === remote.id;
  if (link.environment !== paymentEnvironment() || (link.subscription_id && !alreadyLinked) ||
      (!alreadyLinked && remote.checkout?.id !== link.checkout_id) ||
      (alreadyLinked && remote.checkout?.id && remote.checkout.id !== link.checkout_id))
    throw new HttpError(422,"La suscripción no corresponde al enlace registrado.");
  await client.query(`UPDATE oktae.payment_links SET subscription_id=$2,subscription_status=$3,
    next_billing_at=$4,next_payment_attempt_at=$5,last_synced_at=now() WHERE id=$1`,
    [link.id,remote.id,remote.status,timestamp(remote.current_period_end),timestamp(remote.next_payment_attempt_at)]);
}

// Re-fetch inside the per-link lock: delayed webhooks never overwrite a newer provider state.
export async function syncSubscription(id: string) {
  const client = await db().connect();
  try {
    await client.query("BEGIN");
    const link = (await client.query("SELECT * FROM oktae.payment_links WHERE id=$1 AND charge_type='recurring' FOR UPDATE",[id])).rows[0];
    if (!link) throw new HttpError(404,"Suscripción no encontrada.");
    if (link.environment !== paymentEnvironment()) throw new HttpError(409,"Cambia al ambiente correspondiente antes de actualizar.");
    if (!link.checkout_id) throw new HttpError(409,"Revisa este enlace en Recurrente; su creación no se confirmó.");
    let sid = link.subscription_id;
    if (!sid) {
      const checkout = await recurrente(`/checkouts/${encodeURIComponent(link.checkout_id)}`);
      if (checkout.id !== link.checkout_id) throw new HttpError(502,"Respuesta de Recurrente inválida.");
      sid = subscriptionId(checkout);
      if (!sid && checkout.status === "expired") {
        await client.query("UPDATE oktae.payment_links SET subscription_status='expired',last_synced_at=now() WHERE id=$1",[id]);
      } else if (!sid) {
        await client.query("UPDATE oktae.payment_links SET last_synced_at=now() WHERE id=$1",[id]);
      }
    }
    if (sid) await saveSubscription(client,link,await readSubscription(sid));
    await client.query("COMMIT");
  } catch(e) { await client.query("ROLLBACK"); throw e; }
  finally { client.release(); }
}

// Called only after Svix has verified the raw webhook signature.
export async function handleSubscriptionEvent(event: ProviderRecord, eventId: string): Promise<boolean> {
  const kind = String(event.event_type || "");
  const lifecycle = subscriptionEvents.has(kind), payment = successfulPayments.has(kind);
  if (!lifecycle && !payment) return false;
  let sid = lifecycle && validId(event.id,"su") ? event.id : subscriptionId(event);
  let checkoutId = validId(event.checkout?.id,"ch") ? event.checkout.id : null;
  if (sid) {
    const remote = await readSubscription(sid);
    checkoutId = remote.checkout?.id ?? checkoutId;
  }
  if (!checkoutId && !sid) return lifecycle;
  let lookup = await db().query(`SELECT id FROM oktae.payment_links WHERE charge_type='recurring'
    AND (checkout_id=$1 OR subscription_id=$2)`,[checkoutId,sid]);
  if (!lookup.rowCount && lifecycle && validId(checkoutId,"ch")) {
    // The first webhook can arrive before POST /checkouts has returned to us.
    const checkout = await recurrente(`/checkouts/${encodeURIComponent(checkoutId)}`);
    if (checkout.id === checkoutId && typeof checkout.metadata === "string" && /^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(checkout.metadata)) {
      lookup = await db().query(`UPDATE oktae.payment_links SET checkout_id=$2
        WHERE id=$1 AND charge_type='recurring' AND checkout_id IS NULL AND environment=$3 RETURNING id`,
        [checkout.metadata,checkoutId,paymentEnvironment()]);
    }
  }
  if (!lookup.rowCount) return lifecycle; // Leave existing one-time payment processing intact.
  const client = await db().connect();
  try {
    await client.query("BEGIN");
    const link = (await client.query("SELECT * FROM oktae.payment_links WHERE id=$1 FOR UPDATE",[lookup.rows[0].id])).rows[0];
    if (link.environment !== paymentEnvironment()) throw new HttpError(422,"Ambiente de cobro incorrecto.");
    const seen = await client.query("INSERT INTO oktae.webhook_events(event_id,event_type) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING event_id",[eventId,kind]);
    if (!seen.rowCount) { await client.query("COMMIT"); return true; }
    if (payment) {
      if (Number(event.amount_in_cents) !== link.amount_in_cents || event.currency !== link.currency)
        throw new HttpError(422,"El importe no coincide con la mensualidad.");
      if (kind === "intent.succeeded") {
        if (!validId(event.id,"in")) throw new HttpError(422,"Intent inválido.");
        const intent = await recurrente(`/intents/${encodeURIComponent(event.id)}`);
        if (intent.id !== event.id || intent.status !== "succeeded" || Number(intent.amount_in_cents) !== link.amount_in_cents || intent.currency !== link.currency ||
            (intent.subscription?.id !== (sid ?? link.subscription_id) && intent.checkout?.id !== link.checkout_id))
          throw new HttpError(422,"No se pudo verificar el cobro con Recurrente.");
        sid ??= subscriptionId(intent);
      } else {
        // Legacy success is signed by Recurrente. Verify its checkout/subscription association too.
        if (!sid) {
          const checkout = await recurrente(`/checkouts/${encodeURIComponent(link.checkout_id)}`);
          if (checkout.id !== link.checkout_id || checkout.status !== "paid") throw new HttpError(409,"Pago pendiente de confirmación.");
          sid = subscriptionId(checkout);
        }
      }
      const paymentId = event.legacy_id ?? event.payment?.id ?? event.id;
      if (typeof paymentId !== "string" || !/^(pa|in)_[a-zA-Z0-9]+$/.test(paymentId)) throw new HttpError(422,"Referencia de pago inválida.");
      const existingCharge = (await client.query("SELECT payment_link_id FROM oktae.subscription_charges WHERE provider_payment_id=$1",[paymentId])).rows[0];
      if (existingCharge && existingCharge.payment_link_id !== link.id) throw new HttpError(422,"El pago ya está asociado a otra tienda.");
      await client.query(`INSERT INTO oktae.subscription_charges(payment_link_id,provider_payment_id,amount_in_cents,currency,paid_at)
        VALUES($1,$2,$3,$4,$5) ON CONFLICT(provider_payment_id) DO NOTHING`,
        [link.id,paymentId,link.amount_in_cents,link.currency,timestamp(event.created_at) ?? new Date().toISOString()]);
      await client.query("UPDATE oktae.payment_links SET status='paid',paid_at=COALESCE(paid_at,$2) WHERE id=$1",[link.id,timestamp(event.created_at) ?? new Date().toISOString()]);
    }
    sid ??= link.subscription_id;
    if (sid) await saveSubscription(client,link,await readSubscription(sid));
    await client.query("COMMIT");
    return true;
  } catch(e) { await client.query("ROLLBACK"); throw e; }
  finally { client.release(); }
}
