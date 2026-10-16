import "server-only";
import { HttpError } from "./errors";
export function paymentEnvironment() {
  return process.env.RECURRENTE_SECRET_KEY?.startsWith("sk_test_")
    ? "test"
    : "live";
}
export async function recurrente(path: string, body?: unknown) {
  const key = process.env.RECURRENTE_SECRET_KEY;
  if (!key || !/^sk_(test|live)_/.test(key))
    throw new HttpError(
      503,
      "Configura RECURRENTE_SECRET_KEY en el servidor para generar links.",
    );
  const result = await fetch(`https://app.recurrente.com/api${path}`, {
    method: body ? "POST" : "GET",
    headers: { "X-SECRET-KEY": key, "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
  if (!result.ok)
    throw new HttpError(
      502,
      `Recurrente no pudo completar la solicitud (${result.status}). Verifica la configuración en tu cuenta antes de volver a intentar.`,
    );
  return result.json();
}
