import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const RATE_WINDOW_MS = 60 * 60 * 1000; // 1h
const RATE_LIMIT_MAX = 5; // max 5 solicitudes por IP / hora
const TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
];

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
const bookedSlotsByDate = new Map<string, Set<string>>();

function getClientIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return "unknown";
}

function isLimited(ip: string) {
  const now = Date.now();
  const bucket = buckets.get(ip);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  if (bucket.count >= RATE_LIMIT_MAX) return true;
  bucket.count += 1;
  return false;
}

export async function GET(req: NextRequest) {
  const date = (req.nextUrl.searchParams.get("date") ?? "").trim();
  if (!date) return NextResponse.json({ takenSlots: [] });
  const taken = Array.from(bookedSlotsByDate.get(date) ?? []);
  return NextResponse.json({ takenSlots: taken, availableSlots: TIME_SLOTS });
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    if (isLimited(ip)) {
      return NextResponse.json(
        { message: "Demasiadas solicitudes. Intenta más tarde." },
        { status: 429 }
      );
    }

    const body = (await req.json()) as {
      name?: string;
      company?: string;
      phone?: string;
      email?: string;
      date?: string;
      time?: string;
      website?: string;
    };

    const name = (body.name ?? "").trim();
    const company = (body.company ?? "").trim();
    const phone = (body.phone ?? "").trim();
    const email = (body.email ?? "").trim();
    const date = (body.date ?? "").trim();
    const time = (body.time ?? "").trim();
    const website = (body.website ?? "").trim();

    // Honeypot anti-bot: si viene lleno, simulamos éxito sin enviar correo.
    if (website.length > 0) {
      return NextResponse.json({ ok: true });
    }

    if (!name || !company || !phone || !email || !date || !time) {
      return NextResponse.json({ message: "Faltan campos requeridos." }, { status: 400 });
    }
    if (!TIME_SLOTS.includes(time)) {
      return NextResponse.json({ message: "Horario inválido." }, { status: 400 });
    }

    const taken = bookedSlotsByDate.get(date) ?? new Set<string>();
    if (taken.has(time)) {
      return NextResponse.json({ message: "Ese horario ya fue reservado." }, { status: 409 });
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      return NextResponse.json({ message: "Correo inválido." }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { message: "Falta configurar RESEND_API_KEY." },
        { status: 500 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

    await resend.emails.send({
      from,
      to: ["gus@oktae.tech"],
      subject: `Nueva solicitud de llamada · ${company}`,
      html: `
        <h2>Nueva solicitud de llamada</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Empresa:</strong> ${company}</p>
        <p><strong>Teléfono:</strong> ${phone}</p>
        <p><strong>Correo:</strong> ${email}</p>
        <p><strong>Fecha seleccionada:</strong> ${date}</p>
        <p><strong>Hora seleccionada:</strong> ${time}</p>
        <hr />
        <p style="color:#777;">Enviado desde oktae.tech</p>
      `,
    });

    taken.add(time);
    bookedSlotsByDate.set(date, taken);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "No se pudo procesar la solicitud." }, { status: 500 });
  }
}
