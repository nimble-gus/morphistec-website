import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}
export function verifyPassword(password: string, hash: string) {
  const [salt, value] = hash.split(":");
  if (!salt || !value || value.length !== 128) return false;
  const candidate = scryptSync(password, salt, 64);
  return timingSafeEqual(candidate, Buffer.from(value, "hex"));
}
