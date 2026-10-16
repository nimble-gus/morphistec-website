import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { db } from "@/lib/crm/db";
import { recurrente, paymentEnvironment } from "@/lib/crm/recurrente";
export async function POST(req: NextRequest) {
  const secret = process.env.RECURRENTE_WEBHOOK_SECRET;
  if (!secret)
    return NextResponse.json(
      { error: "Webhook no configurado" },
      { status: 503 },
    );
  const raw = await req.text();
  if (raw.length > 1000000) return new NextResponse(null, { status: 413 });
  let event: Record<string, unknown>;
  const eventId = req.headers.get("svix-id") || "";
  try {
    new Webhook(secret).verify(raw, {
      "svix-id": eventId,
      "svix-timestamp": req.headers.get("svix-timestamp") || "",
      "svix-signature": req.headers.get("svix-signature") || "",
    });
    event = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }
  const kind = String(event.event_type || "");
  const recognized = ["intent.succeeded", "payment_intent.succeeded"];
  if (!recognized.includes(kind))
    return NextResponse.json({ received: true, ignored: true });
  const checkout = event.checkout as { id?: string } | undefined;
  if (!checkout?.id || !/^ch_[a-zA-Z0-9]+$/.test(checkout.id))
    return NextResponse.json({ error: "Checkout ausente" }, { status: 422 });
  const client = await db().connect();
  try {
    // Confirmar estado y total con la API evita marcar como pagado un importe diferente.
    const remote = await recurrente(
      `/checkouts/${encodeURIComponent(checkout.id)}`,
    );
    if (remote.status !== "paid")
      return NextResponse.json(
        { error: "Pago todavía no confirmado" },
        { status: 409 },
      );
    await client.query("BEGIN");
    const dedup = await client.query(
      "INSERT INTO oktae.webhook_events(event_id,event_type) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING event_id",
      [eventId, kind],
    );
    if (!dedup.rowCount) {
      await client.query("COMMIT");
      return NextResponse.json({ received: true, duplicate: true });
    }
    const link = (
      await client.query(
        "SELECT * FROM oktae.payment_links WHERE checkout_id=$1 FOR UPDATE",
        [checkout.id],
      )
    ).rows[0];
    if (!link) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "Link aún no registrado" },
        { status: 409 },
      );
    }
    if (
      link.environment !== paymentEnvironment() ||
      Number(event.amount_in_cents) !== link.amount_in_cents ||
      event.currency !== link.currency
    ) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "El importe o ambiente no coincide" },
        { status: 422 },
      );
    }
    await client.query(
      "UPDATE oktae.payment_links SET status='paid',paid_at=COALESCE(paid_at,now()) WHERE id=$1",
      [link.id],
    );
    await client.query("COMMIT");
    return NextResponse.json({ received: true });
  } catch {
    try {
      await client.query("ROLLBACK");
    } catch {}
    return NextResponse.json(
      { error: "No se pudo registrar. Se requiere reintento." },
      { status: 503 },
    );
  } finally {
    client.release();
  }
}
