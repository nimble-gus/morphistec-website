"use client";
import Link from "next/link";
import { useState } from "react";
import { LockKeyhole, ArrowRight } from "lucide-react";
export default function Login() {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(e.currentTarget);
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          password: data.get("password"),
        }),
      });
      const b = await r.json();
      if (!r.ok) throw new Error(b.error);
      window.location.assign("/admin");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudo conectar. Intenta nuevamente.",
      );
      setBusy(false);
    }
  }
  return (
    <main className="login-shell">
      <div className="login-intro">
        <Link href="/" className="crm-brand">
          oktae<span>.</span>
        </Link>
        <h1>
          Del primer contacto
          <br />
          al próximo cierre.
        </h1>
        <p>
          Tu espacio de trabajo para dar seguimiento a prospectos y gestionar
          cobros.
        </p>
        <span className="private-tag">
          <LockKeyhole size={15} /> Portal privado
        </span>
      </div>
      <section className="login-form">
        <LockKeyhole size={28} />
        <h2>Accede a tu CRM</h2>
        <p>Solo para administradores autorizados de Oktae.</p>
        <form onSubmit={submit}>
          <label>
            Correo
            <input
              name="email"
              type="email"
              autoComplete="username"
              required
              maxLength={254}
            />
          </label>
          <label>
            Contraseña
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              maxLength={512}
            />
          </label>
          {error && (
            <p role="alert" className="crm-error">
              {error}
            </p>
          )}
          <button className="primary" disabled={busy}>
            {busy ? "Ingresando…" : "Iniciar sesión"}
            <ArrowRight size={17} />
          </button>
        </form>
        <small>
          El acceso se habilita de forma privada. No hay registro público.
        </small>
      </section>
    </main>
  );
}
