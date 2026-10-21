import "server-only";
import { db } from "./db";
import { text, uuid } from "./input";
import { HttpError } from "./errors";
import { recurrente, paymentEnvironment } from "./recurrente";

export const STORE_LICENSE = { name: "Licenciamiento de tienda online", amount: 4900, currency: "USD" };
export function paymentInput(b: Record<string, unknown>) {
  const contact = uuid(b.contact_id), key = uuid(b.request_key);
  const type = b.charge_type ?? "one_time";
  if (type !== "one_time" && type !== "recurring") throw new HttpError(400, "Tipo de cobro inválido.");
  let store: string | null = null;
  if (type === "recurring") {
    try {
      const url = new URL(text(b.store_url, 500, true));
      if (url.protocol !== "https:" || url.username || url.password) throw new Error();
      url.search = ""; url.hash = "";
      store = url.toString().replace(/\/$/, "");
    } catch { throw new HttpError(400, "Escribe la dirección HTTPS de la tienda."); }
  }
  const concept = type === "recurring" ? STORE_LICENSE.name : text(b.concept, 160, true);
  const currency = type === "recurring" ? STORE_LICENSE.currency : b.currency;
  const amount = type === "recurring" ? STORE_LICENSE.amount : b.amount_in_cents;
  if (!["GTQ", "USD"].includes(String(currency)) || !Number.isSafeInteger(amount) ||
      Number(amount) < (currency === "GTQ" ? 500 : 100) || Number(amount) > 100000000)
    throw new HttpError(400, "Importe inválido. Mínimo Q5 o US$1.");
  return { contact, key, type, store, concept, currency: currency as string, amount: amount as number };
}
export async function createPayment(b: Record<string, unknown>, userId: string) {
  const p = paymentInput(b);
  if (!process.env.RECURRENTE_SECRET_KEY) throw new HttpError(503, "Falta conectar Recurrente.");
  const customer = await db().query("SELECT id FROM oktae.contacts WHERE id=$1", [p.contact]);
  if (!customer.rowCount) throw new HttpError(404, "Contacto no encontrado.");
  // Both the request key and the store constraint are enforced before contacting the provider.
  const inserted = await db().query(`INSERT INTO oktae.payment_links
    (contact_id,concept,amount_in_cents,currency,request_key,environment,created_by,charge_type,store_url,subscription_status)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT DO NOTHING RETURNING *`,
    [p.contact,p.concept,p.amount,p.currency,p.key,paymentEnvironment(),userId,p.type,p.store,p.type === "recurring" ? "awaiting_authorization" : null]);
  if (!inserted.rowCount) {
    const prior = (await db().query("SELECT * FROM oktae.payment_links WHERE request_key=$1", [p.key])).rows[0];
    if (!prior) throw new HttpError(409, "Esta tienda ya tiene una suscripción o un enlace pendiente. Revisa sus cobros antes de crear otro.");
    if (prior.contact_id !== p.contact || prior.concept !== p.concept || prior.amount_in_cents !== p.amount ||
        prior.currency !== p.currency || prior.charge_type !== p.type || prior.store_url !== p.store)
      throw new HttpError(409, "Esta solicitud pertenece a otro cobro. Recarga para empezar uno nuevo.");
    if (prior.checkout_url) return prior;
    throw new HttpError(409, "La solicitud ya fue enviada. Revisa el cobro en Recurrente antes de repetirla.");
  }
  const id = inserted.rows[0].id;
  try {
    const checkout = await recurrente("/checkouts", {
      items: [{name:p.concept,amount_in_cents:p.amount,currency:p.currency,quantity:1,charge_type:p.type,
        ...(p.type === "recurring" ? {billing_interval:"month",billing_interval_count:1,payment_method_types:["card"]} : {})}],
      metadata:id,
    });
    if (!/^ch_[a-zA-Z0-9]+$/.test(checkout.id) || typeof checkout.checkout_url !== "string" ||
        !checkout.checkout_url.startsWith("https://app.recurrente.com/")) throw new Error("invalid_response");
    return (await db().query(`UPDATE oktae.payment_links SET checkout_id=$2,checkout_url=$3,
      status=CASE WHEN status='paid' THEN 'paid' ELSE 'pending' END WHERE id=$1 RETURNING *`, [id,checkout.id,checkout.checkout_url])).rows[0];
  } catch (e) {
    await db().query("UPDATE oktae.payment_links SET status='review' WHERE id=$1 AND status='creating'", [id]);
    throw e;
  }
}
