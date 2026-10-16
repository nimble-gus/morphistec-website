import { jsonBody } from "@/lib/crm/http";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/crm/db";
import { authorized, failure, text, uuid, HttpError } from "@/lib/crm/http";
import { recurrente, paymentEnvironment } from "@/lib/crm/recurrente";
export async function GET(req: NextRequest) {
  try {
    await authorized(req);
    return NextResponse.json(
      (
        await db().query(
          "SELECT p.*,c.name,c.phone FROM oktae.payment_links p JOIN oktae.contacts c ON c.id=p.contact_id ORDER BY p.created_at DESC LIMIT 1000",
        )
      ).rows,
    );
  } catch (e) {
    return failure(e);
  }
}
export async function POST(req: NextRequest) {
  try {
    const user = await authorized(req, true),
      b = await jsonBody(req);
    const contact = uuid(b.contact_id),
      key = uuid(b.request_key),
      concept = text(b.concept, 160, true),
      currency = b.currency;
    const amount = b.amount_in_cents;
    if (
      !["GTQ", "USD"].includes(currency) ||
      !Number.isSafeInteger(amount) ||
      amount < (currency === "GTQ" ? 500 : 100) ||
      amount > 100000000
    )
      throw new HttpError(400, "Importe inválido. Mínimo Q5 o US$1.");
    if (!process.env.RECURRENTE_SECRET_KEY)
      throw new HttpError(
        503,
        "Configura RECURRENTE_SECRET_KEY en el servidor para generar links.",
      );
    const customer = await db().query(
      "SELECT id FROM oktae.contacts WHERE id=$1",
      [contact],
    );
    if (!customer.rowCount) throw new HttpError(404, "Contacto no encontrado.");
    const inserted = await db().query(
      `INSERT INTO oktae.payment_links(contact_id,concept,amount_in_cents,currency,request_key,environment,created_by)
 VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(request_key) DO NOTHING RETURNING *`,
      [contact, concept, amount, currency, key, paymentEnvironment(), user.id],
    );
    if (!inserted.rowCount) {
      const prior = (
        await db().query(
          "SELECT * FROM oktae.payment_links WHERE request_key=$1",
          [key],
        )
      ).rows[0];
      if (
        prior &&
        (prior.contact_id !== contact ||
          prior.concept !== concept ||
          prior.amount_in_cents !== amount ||
          prior.currency !== currency)
      )
        throw new HttpError(
          409,
          "Esta solicitud pertenece a otro cobro. Recarga para empezar uno nuevo.",
        );
      if (prior?.checkout_url) return NextResponse.json(prior);
      throw new HttpError(
        409,
        "Esta solicitud ya fue enviada. Revisa el listado de cobros; no la repitas.",
      );
    }
    const id = inserted.rows[0].id;
    try {
      const checkout = await recurrente("/checkouts", {
        items: [
          {
            name: concept,
            amount_in_cents: amount,
            currency,
            quantity: 1,
            charge_type: "one_time",
          },
        ],
        metadata: id,
      });
      if (
        typeof checkout.id !== "string" ||
        typeof checkout.checkout_url !== "string" ||
        !checkout.checkout_url.startsWith("https://app.recurrente.com/")
      )
        throw new Error("invalid_response");
      const { rows } = await db().query(
        "UPDATE oktae.payment_links SET checkout_id=$2,checkout_url=$3,status=CASE WHEN status='paid' THEN 'paid' ELSE 'pending' END WHERE id=$1 RETURNING *",
        [id, checkout.id, checkout.checkout_url],
      );
      return NextResponse.json(rows[0], { status: 201 });
    } catch (e) {
      await db().query(
        "UPDATE oktae.payment_links SET status='review' WHERE id=$1 AND status='creating'",
        [id],
      );
      throw e;
    }
  } catch (e) {
    return failure(e);
  }
}
