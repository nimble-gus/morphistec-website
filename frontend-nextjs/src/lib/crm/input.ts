import { HttpError } from "./errors";
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

