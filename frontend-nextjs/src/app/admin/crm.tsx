"use client";
import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  Users,
  ReceiptText,
  Settings,
  LogOut,
  Plus,
  Search,
  ArrowUpRight,
  Copy,
  Check,
  MessageCircle,
  ChevronLeft,
  CalendarDays,
  LockKeyhole,
} from "lucide-react";
type Contact = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  stage: string;
  source: string;
  next_follow_up: string | null;
  messenger_interest?: string | null;
  messenger_stage?: string | null;
  messenger_last_contact_at?: string | null;
};
type Note = { id: string; body: string; created_at: string };
type Payment = {
  id: string;
  contact_id: string;
  name: string;
  phone: string;
  concept: string;
  amount_in_cents: number;
  currency: string;
  status: string;
  checkout_url: string | null;
  created_at: string;
  environment: string;
};
const stages: Record<string, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  demo: "Demostración",
  propuesta: "Propuesta",
  ganado: "Cliente",
  perdido: "Descartado",
};
const statuses: Record<string, string> = {
  creating: "Generando",
  pending: "Pendiente",
  paid: "Pagado",
  failed: "Fallido",
  review: "Revisar en Recurrente",
};
const money = (n: number, c: string) =>
  new Intl.NumberFormat("es-GT", { style: "currency", currency: c }).format(
    n / 100,
  );
const date = (s: string) =>
  new Intl.DateTimeFormat("es-GT", { dateStyle: "medium" }).format(new Date(s));
async function api<T>(
  url: string,
  body?: unknown,
  method = "POST",
): Promise<T> {
  const r = await fetch("/api/admin/" + url, {
    cache: "no-store",
    ...(body
      ? {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      : {}),
  });
  if (r.status === 401) {
    window.location.assign("/admin/login");
    throw new Error("Inicia sesión de nuevo.");
  }
  const b = await r.json();
  if (!r.ok) throw new Error(b.error || "No se pudo guardar.");
  return b;
}
export default function Crm({
  email,
  paymentReady,
  webhookReady,
  environment,
}: {
  email: string;
  paymentReady: boolean;
  webhookReady: boolean;
  environment: string;
}) {
  const [tab, setTab] = useState("contacts"),
    [contacts, setContacts] = useState<Contact[]>([]),
    [payments, setPayments] = useState<Payment[]>([]),
    [selected, setSelected] = useState<string | null>(null),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState(""),
    [newContact, setNewContact] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true),
    [notes, setNotes] = useState<Note[]>([]),
    [notesLoading, setNotesLoading] = useState(false),
    [copied, setCopied] = useState(""),
    [notice, setNotice] = useState("");
  const requestKey = useRef<string | null>(null),
    notesVersion = useRef(0);
  const contact = contacts.find((c) => c.id === selected);
  const refresh = useCallback(async () => {
    const [c, p] = await Promise.all([
      api<Contact[]>("contacts"),
      api<Payment[]>("payments"),
    ]);
    setContacts(c);
    setPayments(p);
  }, []);
  useEffect(() => {
    refresh()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [refresh]);
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (
        document.hidden ||
        busy ||
        newContact ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(
          document.activeElement?.tagName || "",
        )
      )
        return;
      refresh().catch(() => {});
    }, 30000);
    return () => window.clearInterval(timer);
  }, [refresh, busy, newContact]);
  useEffect(() => {
    const version = ++notesVersion.current;
    setNotes([]);
    if (!selected) return;
    setNotesLoading(true);
    api<Note[]>("notes?contact_id=" + selected)
      .then((n) => {
        if (version === notesVersion.current) setNotes(n);
      })
      .catch((e) => {
        if (version === notesVersion.current) setError(e.message);
      })
      .finally(() => {
        if (version === notesVersion.current) setNotesLoading(false);
      });
  }, [selected]);
  async function action(fn: () => Promise<void>) {
    setError("");
    setNotice("");
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo completar la operación.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function addContact(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const b = Object.fromEntries(new FormData(form));
    await action(async () => {
      const c = await api<Contact>("contacts", b);
      await refresh();
      setSelected(c.id);
      setNewContact(false);
      setNotice("Prospecto guardado.");
    });
  }
  async function addNote(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const body = new FormData(form).get("body");
    const noteVersion = notesVersion.current;
    await action(async () => {
      const n = await api<Note>("notes", { contact_id: selected, body });
      if (noteVersion === notesVersion.current) {
        setNotes((old) => [n, ...old]);
        form.reset();
      }
      setNotice("Nota guardada.");
    });
  }
  async function updateContact(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const b = Object.fromEntries(new FormData(e.currentTarget));
    await action(async () => {
      await api("contacts", { ...b, id: selected }, "PATCH");
      await refresh();
      setNotice("Seguimiento actualizado.");
    });
  }
  async function createPayment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget,
      b = Object.fromEntries(new FormData(f));
    const raw = String(b.amount);
    if (!/^\d+(\.\d{1,2})?$/.test(raw)) {
      setError("Usa un importe con hasta dos decimales.");
      return;
    }
    const cents = Math.round(Number(raw) * 100);
    requestKey.current ??= crypto.randomUUID();
    await action(async () => {
      await api("payments", {
        contact_id: selected,
        concept: b.concept,
        currency: b.currency,
        amount_in_cents: cents,
        request_key: requestKey.current,
      });
      requestKey.current = null;
      await refresh();
      f.reset();
      setNotice("Link de pago creado. Puedes copiarlo o preparar el WhatsApp.");
    });
  }
  async function copy(p: Payment) {
    try {
      await navigator.clipboard.writeText(p.checkout_url!);
      setCopied(p.id);
      setTimeout(() => setCopied(""), 2500);
    } catch {
      setError("No se pudo copiar. Abre el link y cópialo desde el navegador.");
    }
  }
  function wa(p: Payment) {
    const phone = p.phone.replace(/\D/g, "");
    const message = `Hola ${p.name}, te comparto el enlace de pago de ${p.concept} por ${money(p.amount_in_cents, p.currency)}: ${p.checkout_url}`;
    return "https://wa.me/" + phone + "?text=" + encodeURIComponent(message);
  }
  function paymentRow(p: Payment) {
    return (
      <article className="payment-row" key={p.id}>
        <div>
          <strong>{p.concept}</strong>
          <span>
            {p.name} · {date(p.created_at)}
            {p.environment === "test" ? " · Prueba" : ""}
          </span>
        </div>
        <div className="payment-amount">
          <strong>{money(p.amount_in_cents, p.currency)}</strong>
          <span className={"status " + p.status}>{statuses[p.status]}</span>
        </div>
        {p.checkout_url && (
          <div className="payment-actions">
            <button
              title="Copiar link"
              aria-label={"Copiar link de " + p.concept}
              onClick={() => copy(p)}
            >
              {copied === p.id ? <Check size={16} /> : <Copy size={16} />}
            </button>
            <a
              href={p.checkout_url}
              target="_blank"
              rel="noreferrer"
              aria-label={"Abrir pago " + p.concept}
            >
              <ArrowUpRight size={16} />
            </a>
            {p.phone.replace(/\D/g, "").length >= 8 && (
              <a
                href={wa(p)}
                target="_blank"
                rel="noreferrer"
                aria-label={"Preparar WhatsApp para " + p.name}
              >
                <MessageCircle size={16} />
              </a>
            )}
          </div>
        )}
        {p.status === "review" && (
          <small>Revisa el checkout en Recurrente antes de crear otro.</small>
        )}
      </article>
    );
  }
  const filtered = contacts.filter(
    (c) =>
      (!filter || c.stage === filter) &&
      [c.name, c.company, c.phone, c.email]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <div className="crm-shell">
      <aside className="crm-sidebar">
        <Link href="/admin" className="crm-brand">
          oktae<span>.</span>
        </Link>
        <nav aria-label="Administración">
          <button
            className={tab === "contacts" ? "active" : ""}
            onClick={() => {
              setTab("contacts");
              setSelected(null);
            }}
          >
            <Users size={18} />
            Prospectos
          </button>
          <button
            className={tab === "payments" ? "active" : ""}
            onClick={() => setTab("payments")}
          >
            <ReceiptText size={18} />
            Cobros
          </button>
          <button
            className={tab === "settings" ? "active" : ""}
            onClick={() => setTab("settings")}
          >
            <Settings size={18} />
            Configuración
          </button>
        </nav>
        <div className="crm-account">
          <span className="private-tag">
            <LockKeyhole size={14} />
            Acceso privado
          </span>
          <small>{email}</small>
          <button
            disabled={busy}
            onClick={() =>
              action(async () => {
                await api("logout", {});
                window.location.assign("/admin/login");
              })
            }
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="crm-main">
        <header className="crm-top">
          <span>Espacio comercial</span>
          <span>Oktae.Tech</span>
        </header>
        <div className="crm-content">
          <div className="crm-title">
            <div>
              <h1>
                {tab === "contacts"
                  ? "Prospectos"
                  : tab === "payments"
                    ? "Cobros"
                    : "Configuración"}
              </h1>
              <p>
                {tab === "contacts"
                  ? "Cada conversación, con un siguiente paso."
                  : tab === "payments"
                    ? "Links de pago y estado de tus cobros."
                    : "Conexiones y acceso del portal."}
              </p>
            </div>
            {tab === "contacts" && (
              <button
                className="primary"
                onClick={() => {
                  setNewContact(!newContact);
                  setSelected(null);
                }}
              >
                <Plus size={17} />
                {newContact ? "Cerrar formulario" : "Nuevo prospecto"}
              </button>
            )}
            {tab === "payments" && (
              <button onClick={() => action(refresh)} disabled={busy}>
                Actualizar estados
              </button>
            )}
          </div>
          {error && (
            <div className="crm-error" role="alert">
              {error}
              <button onClick={() => setError("")} aria-label="Cerrar aviso">
                Cerrar
              </button>
            </div>
          )}
          {notice && (
            <p className="crm-notice" role="status">
              <Check size={16} />
              {notice}
            </p>
          )}
          {tab === "contacts" && (
            <>
              {newContact && (
                <section className="crm-new">
                  <h2>Nuevo prospecto</h2>
                  <form onSubmit={addContact} className="crm-form-grid">
                    <label>
                      Nombre
                      <input name="name" required maxLength={120} />
                    </label>
                    <label>
                      Empresa
                      <input name="company" maxLength={160} />
                    </label>
                    <label>
                      Correo
                      <input name="email" type="email" maxLength={254} />
                    </label>
                    <label>
                      WhatsApp con código de país
                      <input
                        name="phone"
                        type="tel"
                        placeholder="+502 3117 4640"
                        maxLength={30}
                      />
                    </label>
                    <label>
                      Origen
                      <select name="source">
                        <option value="manual">Manual</option>
                        <option value="messenger">Messenger</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="web">Página web</option>
                        <option value="referido">Referido</option>
                      </select>
                    </label>
                    <div className="form-footer">
                      <button className="primary" disabled={busy}>
                        {busy ? "Guardando…" : "Guardar prospecto"}
                      </button>
                    </div>
                  </form>
                </section>
              )}
              <div className={"crm-workspace " + (contact ? "has-detail" : "")}>
                <section className="crm-list">
                  <div className="crm-filters">
                    <label className="crm-search">
                      <Search size={17} />
                      <input
                        aria-label="Buscar prospectos"
                        placeholder="Buscar nombre, empresa o teléfono"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </label>
                    <select
                      aria-label="Filtrar por etapa"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      <option value="">Todas las etapas</option>
                      {Object.entries(stages).map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="list-caption">
                    <span>
                      {filtered.length} prospectos
                      {contacts.length >= 1000
                        ? " · Se muestran los últimos 1,000"
                        : ""}
                    </span>
                    <span>Etapa comercial</span>
                  </div>
                  {loading ? (
                    <div className="crm-empty" aria-busy="true">
                      Cargando prospectos…
                    </div>
                  ) : !filtered.length ? (
                    <div className="crm-empty">
                      <Users size={30} />
                      <h2>
                        {contacts.length
                          ? "Sin coincidencias"
                          : "Tu próxima venta empieza aquí"}
                      </h2>
                      <p>
                        {contacts.length
                          ? "Prueba otro nombre o cambia el filtro."
                          : "Registra tu primer prospecto para organizar el seguimiento y generar su link de pago."}
                      </p>
                      {!contacts.length && (
                        <button onClick={() => setNewContact(true)}>
                          Agregar primer prospecto
                          <Plus size={16} />
                        </button>
                      )}
                    </div>
                  ) : (
                    filtered.map((c) => (
                      <button
                        key={c.id}
                        className={
                          "contact-row " + (selected === c.id ? "selected" : "")
                        }
                        onClick={() => {
                          setSelected(c.id);
                          setNewContact(false);
                          requestKey.current = null;
                          setError("");
                        }}
                      >
                        <span className="contact-avatar">
                          {c.name.slice(0, 1).toUpperCase()}
                        </span>
                        <span className="contact-info">
                          <strong>{c.name}</strong>
                          <span>
                            {c.company ||
                              c.email ||
                              c.phone ||
                              "Sin datos de contacto"}
                          </span>
                          {c.next_follow_up && (
                            <small>
                              <CalendarDays size={12} />{" "}
                              {date(
                                c.next_follow_up.slice(0, 10) + "T12:00:00",
                              )}
                            </small>
                          )}
                        </span>
                        <span className={"stage " + c.stage}>
                          {stages[c.stage]}
                        </span>
                      </button>
                    ))
                  )}
                </section>
                {contact && (
                  <aside className="crm-detail" key={contact.id}>
                    <button
                      className="detail-back"
                      onClick={() => setSelected(null)}
                    >
                      <ChevronLeft size={16} />
                      Volver a prospectos
                    </button>
                    <h2>{contact.name}</h2>
                    <p>{contact.company || "Prospecto individual"}</p>
                    <dl className="contact-data">
                      <dt>Correo</dt>
                      <dd>
                        {contact.email ? (
                          <a href={"mailto:" + contact.email}>
                            {contact.email}
                          </a>
                        ) : (
                          "Sin registrar"
                        )}
                      </dd>
                      <dt>WhatsApp</dt>
                      <dd>{contact.phone || "Sin registrar"}</dd>
                      <dt>Origen</dt>
                      <dd>{contact.source}</dd>
                    </dl>
                    {contact.source === "messenger" && (
                      <div className="messenger-context">
                        <h3>Conversación de Messenger</h3>
                        {contact.messenger_interest && (
                          <p>{contact.messenger_interest}</p>
                        )}
                        <dl className="contact-data">
                          <dt>Calificación</dt>
                          <dd>
                            {{
                              new: "Nuevo",
                              qualifying: "En evaluación",
                              qualified: "Calificado",
                              handoff_wa: "Derivado a WhatsApp",
                            }[contact.messenger_stage || "new"] ||
                              contact.messenger_stage}
                          </dd>
                          {contact.messenger_last_contact_at && (
                            <>
                              <dt>Último contacto</dt>
                              <dd>
                                {new Intl.DateTimeFormat("es-GT", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                }).format(
                                  new Date(contact.messenger_last_contact_at),
                                )}
                              </dd>
                            </>
                          )}
                        </dl>
                      </div>
                    )}
                    <form className="followup-form" onSubmit={updateContact}>
                      <label>
                        Nombre
                        <input
                          name="name"
                          defaultValue={contact.name}
                          required
                          maxLength={120}
                        />
                      </label>
                      <label>
                        Empresa
                        <input
                          name="company"
                          defaultValue={contact.company}
                          maxLength={160}
                        />
                      </label>
                      <label>
                        Correo
                        <input
                          name="email"
                          type="email"
                          defaultValue={contact.email}
                          maxLength={254}
                        />
                      </label>
                      <label>
                        WhatsApp con código de país
                        <input
                          name="phone"
                          defaultValue={contact.phone}
                          maxLength={30}
                        />
                      </label>
                      <label>
                        Etapa
                        <select name="stage" defaultValue={contact.stage}>
                          {Object.entries(stages).map(([v, l]) => (
                            <option key={v} value={v}>
                              {l}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Próximo seguimiento
                        <input
                          type="date"
                          name="next_follow_up"
                          defaultValue={
                            contact.next_follow_up?.slice(0, 10) || ""
                          }
                        />
                      </label>
                      <button disabled={busy}>Guardar seguimiento</button>
                    </form>
                    <section>
                      <h3>Notas de seguimiento</h3>
                      <form onSubmit={addNote}>
                        <label className="sr-only" htmlFor="note">
                          Nueva nota
                        </label>
                        <textarea
                          id="note"
                          name="body"
                          required
                          maxLength={5000}
                          placeholder="Qué necesita y cuál es el siguiente paso…"
                        />
                        <button disabled={busy}>Agregar nota</button>
                      </form>
                      {notesLoading ? (
                        <p>Cargando notas…</p>
                      ) : (
                        notes.map((n) => (
                          <div className="crm-note" key={n.id}>
                            <p>{n.body}</p>
                            <time>{date(n.created_at)}</time>
                          </div>
                        ))
                      )}
                    </section>
                    <section>
                      <h3>Crear link de pago</h3>
                      {!paymentReady ? (
                        <p className="setup-note">
                          Falta conectar Recurrente. Revisa Configuración.
                        </p>
                      ) : (
                        <form onSubmit={createPayment}>
                          <label>
                            Concepto
                            <input
                              name="concept"
                              required
                              maxLength={160}
                              placeholder="Anticipo · Asistente de IA"
                            />
                          </label>
                          <div className="amount-fields">
                            <label>
                              Importe
                              <input
                                name="amount"
                                type="number"
                                step="0.01"
                                min="1"
                                required
                                inputMode="decimal"
                              />
                            </label>
                            <label>
                              Moneda
                              <select name="currency" defaultValue="USD">
                                <option value="USD">USD</option>
                                <option value="GTQ">GTQ</option>
                              </select>
                            </label>
                          </div>
                          <p className="form-hint">
                            {environment === "test"
                              ? "Modo de prueba: no se mueve dinero."
                              : "Crearás un link real de pago único. El cliente decide cuándo pagarlo."}
                          </p>
                          <button className="primary" disabled={busy}>
                            {busy ? "Procesando…" : "Generar link de pago"}
                            <ArrowUpRight size={16} />
                          </button>
                        </form>
                      )}
                      {payments
                        .filter((p) => p.contact_id === contact.id)
                        .map(paymentRow)}
                    </section>
                  </aside>
                )}
              </div>
            </>
          )}
          {tab === "payments" && (
            <section className="crm-payments">
              {!webhookReady && (
                <p className="setup-note">
                  Las confirmaciones automáticas requieren configurar el webhook
                  de Recurrente. Un link creado no equivale a un pago recibido.
                </p>
              )}
              {loading ? (
                <p>Cargando cobros…</p>
              ) : payments.length ? (
                payments.map(paymentRow)
              ) : (
                <div className="crm-empty">
                  <ReceiptText size={32} />
                  <h2>Aún no hay cobros</h2>
                  <p>
                    Selecciona un prospecto y crea su primer link de pago. Aquí
                    verás su estado.
                  </p>
                  <button onClick={() => setTab("contacts")}>
                    Ir a prospectos
                    <ArrowUpRight size={16} />
                  </button>
                </div>
              )}
            </section>
          )}
          {tab === "settings" && (
            <section className="crm-settings">
              <h2>Recurrente</h2>
              <div className="settings-line">
                <span>Generación de links</span>
                <strong>
                  {paymentReady ? "Configurada" : "Pendiente de clave"}
                </strong>
              </div>
              <div className="settings-line">
                <span>Confirmación de pagos</span>
                <strong>
                  {webhookReady ? "Webhook configurado" : "Pendiente de firma"}
                </strong>
              </div>
              <div className="settings-line">
                <span>Ambiente</span>
                <strong>
                  {!paymentReady
                    ? "Sin conectar"
                    : environment === "test"
                      ? "Pruebas"
                      : "Producción"}
                </strong>
              </div>
              <p>
                Las claves se configuran en el servidor y nunca se muestran en
                el navegador. Primero valida un pago de prueba antes de
                habilitar cobros reales.
              </p>
              <h2>Acceso del equipo</h2>
              <p>
                <Link href="/admin/change-password">Cambiar mi contraseña</Link>
              </p>
              <p>
                El portal no permite crear cuentas públicamente. Las cuentas
                autorizadas se habilitan desde la administración del servidor.
                Las sesiones vencen después de ocho horas.
              </p>
              <h2>Mensajes y prospectos</h2>
              <p>
                Los prospectos de Messenger aparecen aquí cuando la conexión
                está activa. Conservamos el interés identificado y el último
                contacto; tus cambios manuales de seguimiento tienen prioridad.
                También puedes registrar prospectos manualmente.
              </p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
