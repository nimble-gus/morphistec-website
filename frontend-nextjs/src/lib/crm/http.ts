import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { session } from "./auth";
import { isAllowedOrigin } from "./origin";
import { HttpError } from "./errors";
export { HttpError } from "./errors";
export function checkOrigin(req: NextRequest) {
  if (
    !isAllowedOrigin(req.headers.get("origin"), {
      production: process.env.NODE_ENV === "production",
      appUrl: process.env.APP_URL,
      developmentOrigin: req.nextUrl.origin,
    })
  )
    throw new HttpError(403, "Origen no permitido. Recarga el portal.");
}
export async function authorized(
  req: NextRequest,
  mutation = false,
  allowPasswordChange = false,
) {
  if (mutation) checkOrigin(req);
  const user = await session();
  if (!user)
    throw new HttpError(401, "Tu sesión terminó. Inicia sesión de nuevo.");
  if (user.must_change_password && !allowPasswordChange)
    throw new HttpError(
      403,
      "Debes cambiar tu contraseña antes de usar el CRM.",
    );
  return user;
}
export function failure(e: unknown) {
  if (e instanceof HttpError)
    return NextResponse.json({ error: e.message }, { status: e.status });
  console.error(
    "CRM request failed",
    e && typeof e === "object" && "code" in e ? e.code : "internal",
  );
  return NextResponse.json(
    { error: "No se pudo completar la operación. Intenta nuevamente." },
    { status: 500 },
  );
}
export function text(value: unknown, max = 200, required = false) {
  if (
    typeof value !== "string" ||
    value.trim().length > max ||
    (required && !value.trim())
  )
    throw new HttpError(400, "Revisa los campos del formulario.");
  return value.trim();
}
export function uuid(value: unknown) {
  if (
    typeof value !== "string" ||
    !/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(value)
  )
    throw new HttpError(400, "Referencia inválida.");
  return value;
}

export async function jsonBody(req: NextRequest) {
  const raw = await req.text();
  if (raw.length > 32768)
    throw new HttpError(413, "Solicitud demasiado grande.");
  try {
    const b = JSON.parse(raw);
    if (!b || typeof b !== "object" || Array.isArray(b)) throw new Error();
    return b;
  } catch {
    throw new HttpError(400, "Solicitud inválida.");
  }
}
