"use client";
import { useState } from "react";
import { LockKeyhole, ArrowRight, LogOut } from "lucide-react";
export default function ChangePassword({
  firstLogin,
}: {
  firstLogin: boolean;
}) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      const r = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(f)),
      });
      const b = await r.json();
      if (!r.ok) throw new Error(b.error);
      window.location.assign("/admin");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudo cambiar la contraseña. Intenta otra vez.",
      );
      setBusy(false);
    }
  }
  async function logout() {
    setBusy(true);
    try {
      const r = await fetch("/api/admin/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      if (!r.ok) throw new Error();
      window.location.assign("/admin/login");
    } catch {
      setError("No pudimos cerrar sesión. Intenta nuevamente.");
      setBusy(false);
    }
  }
  return (
    <main className="login-shell">
      <div className="login-intro">
        <span className="crm-brand">
          oktae<span>.</span>
        </span>
        <h1>
          Tu cuenta.
          <br />
          Tu contraseña.
        </h1>
        <p>
          {firstLogin
            ? "Antes de entrar al CRM, reemplaza la contraseña inicial por una que solo tú conozcas."
            : "Actualiza tu contraseña para proteger el acceso al CRM."}
        </p>
        <span className="private-tag">
          <LockKeyhole size={15} />
          Acceso privado
        </span>
      </div>
      <section className="login-form">
        <LockKeyhole size={28} />
        <h2>{firstLogin ? "Crea tu contraseña" : "Cambiar contraseña"}</h2>
        <p>
          Usa al menos 14 caracteres. Al guardar cerraremos las otras sesiones
          de tu cuenta.
        </p>
        <form onSubmit={submit}>
          <label>
            {firstLogin ? "Contraseña inicial" : "Contraseña actual"}
            <input
              name="current_password"
              type="password"
              autoComplete="current-password"
              required
              maxLength={512}
            />
          </label>
          <label>
            Nueva contraseña
            <input
              name="new_password"
              type="password"
              autoComplete="new-password"
              minLength={14}
              maxLength={512}
              required
            />
          </label>
          <label>
            Confirmar nueva contraseña
            <input
              name="confirm_password"
              type="password"
              autoComplete="new-password"
              minLength={14}
              maxLength={512}
              required
            />
          </label>
          {error && (
            <p role="alert" className="crm-error">
              {error}
            </p>
          )}
          <button className="primary" disabled={busy}>
            {busy ? "Guardando…" : "Guardar y entrar al CRM"}
            <ArrowRight size={17} />
          </button>
        </form>
        <button style={{ marginTop: 20 }} disabled={busy} onClick={logout}>
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </section>
    </main>
  );
}
