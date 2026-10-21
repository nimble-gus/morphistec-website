"use client";
import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  Users,
  Bot,
  Menu,
  ReceiptText,
  Settings,
  LogOut,
  Plus,
  Search,
  ArrowUpRight,
  Copy,
  RefreshCw,
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
type NotePage = {items: Note[]; page: number; page_size: number; total: number; total_pages: number};
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
  charge_type: "one_time" | "recurring";
  store_url: string | null;
  subscription_status: string | null;
  next_billing_at: string | null;
  next_payment_attempt_at: string | null;
  last_synced_at: string | null;
  billing_history: {amount_in_cents: number; currency: string; paid_at: string}[];
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
const subscriptionStatuses: Record<string,string> = {
  awaiting_authorization: "Por activar", active: "Activa", past_due: "Pago pendiente",
  paused: "Pausada", cancelled: "Cancelada", expired: "Enlace vencido",
};
function PaymentForm({contacts, contactId, busy, environment, onSubmit}: {
  contacts: Contact[]; contactId?: string; busy: boolean; environment: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  const [recurring, setRecurring] = useState(false);
  return <form onSubmit={onSubmit} className="crm-payment-form">
    <fieldset disabled={busy}>
      {contactId ? <input type="hidden" name="contact_id" value={contactId}/> : <label>Cliente
        <select name="contact_id" required defaultValue=""><option value="" disabled>Selecciona un cliente</option>
          {contacts.map(c=><option key={c.id} value={c.id}>{c.name}{c.company ? ` · ${c.company}` : ""}</option>)}
        </select></label>}
      <label>Tipo de cobro<select name="charge_type" value={recurring ? "recurring" : "one_time"} onChange={e=>setRecurring(e.target.value === "recurring")}>
        <option value="one_time">Pago único</option><option value="recurring">Suscripción de tienda · US$49/mes</option>
      </select></label>
      {recurring ? <>
        <label>Dirección de la tienda<input name="store_url" type="url" required maxLength={500} placeholder="https://tienda.com"/></label>
        <p className="form-hint">US$49 al activar la suscripción y luego cada mes. La instalación se cobra por separado. El cliente autoriza los cobros en Recurrente.</p>
      </> : <>
        <label>Concepto<input name="concept" required maxLength={160} placeholder="Anticipo · Asistente de IA"/></label>
        <div className="amount-fields"><label>Importe<input name="amount" type="number" step="0.01" min="1" required inputMode="decimal"/></label>
          <label>Moneda<select name="currency" defaultValue="USD"><option value="USD">USD</option><option value="GTQ">GTQ</option></select></label></div>
      </>}
      <p className="form-hint">{environment === "test" ? "Modo de prueba: no se mueve dinero." : "Generar el enlace no cobra ni envía mensajes al cliente."}</p>
      <button className="primary" disabled={busy}>{busy ? "Generando…" : recurring ? "Generar enlace de suscripción" : "Generar link de pago"}<ArrowUpRight size={16}/></button>
    </fieldset>
  </form>;
}
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
  const [notesView, setNotesView] = useState({contactId: "", page: 1});
  const [notesInfo, setNotesInfo] = useState({page:1,total:0,total_pages:1});
  const [notesRevision, setNotesRevision] = useState(0);
  const notesPage = notesView.contactId === selected ? notesView.page : 1;
  const [paymentFormOpen, setPaymentFormOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const navToggle = useRef<HTMLButtonElement>(null);
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
    setNotesInfo({page:1,total:0,total_pages:1});
    if (!selected) { setNotesLoading(false); return; }
    setNotesLoading(true);
    api<NotePage>("notes?contact_id=" + selected + "&page=" + notesPage)
      .then((n) => {
        if (version === notesVersion.current) {
          setNotes(n.items);
          setNotesInfo({page:n.page,total:n.total,total_pages:n.total_pages});
        }
      })
      .catch((e) => {
        if (version === notesVersion.current) setError(e.message);
      })
      .finally(() => {
        if (version === notesVersion.current) setNotesLoading(false);
      });
  }, [selected, notesPage, notesRevision]);
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
      await api<Note>("notes", { contact_id: selected, body });
      if (noteVersion === notesVersion.current) {
        setNotesView({contactId:selected!,page:1});
        setNotesRevision(v=>v+1);
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
    const recurring = b.charge_type === "recurring";
    const raw = recurring ? "49" : String(b.amount);
    if (!/^\d+(\.\d{1,2})?$/.test(raw)) {
      setError("Usa un importe con hasta dos decimales.");
      return;
    }
    const cents = Math.round(Number(raw) * 100);
    requestKey.current ??= crypto.randomUUID();
    await action(async () => {
      await api("payments", {
        contact_id: b.contact_id,
        charge_type: b.charge_type,
        store_url: b.store_url,
        concept: b.concept,
        currency: b.currency,
        amount_in_cents: cents,
        request_key: requestKey.current,
      });
      requestKey.current = null;
      await refresh();
      f.reset();
      setPaymentFormOpen(false);
      setNotice(recurring ? "Enlace de suscripción creado. Compártelo para que el cliente lo active." : "Link de pago creado. Puedes copiarlo o preparar el WhatsApp.");
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
    const message = p.charge_type === "recurring"
      ? `Hola ${p.name}, tu tienda ya está lista. Activa aquí su licenciamiento por US$49 al mes: ${p.checkout_url}. El primer cobro se realiza al completar la activación y después cada mes. La instalación se cobra por separado.`
      : `Hola ${p.name}, te comparto el enlace de pago de ${p.concept} por ${money(p.amount_in_cents, p.currency)}: ${p.checkout_url}`;
    return "https://wa.me/" + phone + "?text=" + encodeURIComponent(message);
  }
  function paymentRow(p: Payment) {
    return (
      <article className="payment-row" key={p.id}>
        <div>
          <strong>{p.concept}</strong>
          {p.store_url && <span>{p.store_url}</span>}
          <span>
            {p.name} · {date(p.created_at)}
            {p.environment === "test" ? " · Prueba" : ""}
          </span>
        </div>
        <div className="payment-amount">
          <strong>{money(p.amount_in_cents, p.currency)}{p.charge_type === "recurring" ? "/mes" : ""}</strong>
          <span className={"status " + (p.subscription_status ?? p.status)}>{p.status === "review" ? statuses.review : p.charge_type === "recurring" ? subscriptionStatuses[p.subscription_status || "awaiting_authorization"] : statuses[p.status]}</span>
        </div>
        {p.checkout_url && !(p.charge_type === "recurring" && ["active","paused","past_due","cancelled","expired"].includes(p.subscription_status || "")) && (
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
        {p.charge_type === "recurring" && <div className="subscription-detail">
          <p>{p.subscription_status === "active" && p.next_billing_at ? `Próximo cobro: ${date(p.next_billing_at)}` : p.subscription_status === "past_due" && p.next_payment_attempt_at ? `Próximo intento: ${date(p.next_payment_attempt_at)}` : p.subscription_status === "awaiting_authorization" ? "Esperando la activación del cliente." : ""}</p>
          <button disabled={busy} onClick={()=>action(async()=>{await api("payments/sync",{id:p.id}); await refresh(); setNotice("Estado consultado en Recurrente.");})}><RefreshCw size={14}/>Consultar estado</button>
          {p.last_synced_at && <span>Actualizado: {date(p.last_synced_at)}</span>}
          {!!p.billing_history?.length && <details><summary>Últimos cobros ({p.billing_history.length})</summary><ul>{p.billing_history.map((h,i)=><li key={i}>{date(h.paid_at)} · {money(h.amount_in_cents,h.currency)} · Pagado</li>)}</ul></details>}
          {["active","paused","past_due"].includes(p.subscription_status || "") && <p>Los cambios de tarjeta y la cancelación se gestionan en Recurrente.</p>}
        </div>}
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
        <button
          className="crm-nav-toggle"
          ref={navToggle}
          aria-expanded={navOpen}
          aria-controls="crm-primary-nav"
          onClick={() => setNavOpen(!navOpen)}
        ><Menu size={18} aria-hidden="true" />Menú</button>
        <nav id="crm-primary-nav" aria-label="Administración" data-open={navOpen}
          onKeyDown={(event) => { if(event.key === 'Escape') { setNavOpen(false); navToggle.current?.focus(); } }}>
          <section className="crm-nav-group" aria-labelledby="crm-nav-sales">
            <h2 id="crm-nav-sales">Gestión comercial</h2>
            <button
              className={tab === "contacts" ? "active" : ""}
              aria-current={tab === "contacts" ? "page" : undefined}
              onClick={() => { setTab("contacts"); setSelected(null); setNavOpen(false); }}
            ><Users size={18} aria-hidden="true" /><span>Prospectos</span></button>
            <button
              className={tab === "payments" ? "active" : ""}
              aria-current={tab === "payments" ? "page" : undefined}
              onClick={() => { setTab("payments"); setNavOpen(false); }}
            ><ReceiptText size={18} aria-hidden="true" /><span>Cobros</span></button>
          </section>
          <section className="crm-nav-group" aria-labelledby="crm-nav-chat">
            <h2 id="crm-nav-chat">Oktae Chat</h2>
            <Link href="/admin/whatsapp-clients" className="crm-nav-link">
              <Bot size={18} aria-hidden="true" /><span>Agentes de clientes</span>
            </Link>
          </section>
          <section className="crm-nav-group" aria-labelledby="crm-nav-admin">
            <h2 id="crm-nav-admin">Administración</h2>
            <Link href="/admin/whatsapp" className="crm-nav-link">
              <MessageCircle size={18} aria-hidden="true" /><span>WhatsApp de Oktae</span>
            </Link>
            <button
              className={tab === "settings" ? "active" : ""}
              aria-current={tab === "settings" ? "page" : undefined}
              onClick={() => { setTab("settings"); setNavOpen(false); }}
            ><Settings size={18} aria-hidden="true" /><span>Configuración</span></button>
          </section>
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
              <button className="primary" disabled={!paymentReady || busy} onClick={()=>setPaymentFormOpen(!paymentFormOpen)}><Plus size={17}/>{paymentFormOpen ? "Cerrar formulario" : "Nuevo cobro"}</button>
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
                        <option value="instagram">Instagram</option>
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
                    {["messenger","instagram"].includes(contact.source) && (
                      <div className="messenger-context">
                        <h3>Conversación de {contact.source === "instagram" ? "Instagram" : "Messenger"}</h3>
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
                      <h3>Historial y notas</h3>
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
                      {!notesLoading && notesInfo.total_pages > 1 && <nav className="crm-history-pagination" aria-label="Páginas del historial">
                        <span>{(notesInfo.page-1)*10+1}–{Math.min(notesInfo.page*10,notesInfo.total)} de {notesInfo.total} registros</span>
                        <div><button type="button" disabled={busy || notesInfo.page<=1} onClick={()=>setNotesView({contactId:contact.id,page:notesInfo.page-1})}>Anterior</button>
                        <span aria-live="polite">Página {notesInfo.page} de {notesInfo.total_pages}</span>
                        <button type="button" disabled={busy || notesInfo.page>=notesInfo.total_pages} onClick={()=>setNotesView({contactId:contact.id,page:notesInfo.page+1})}>Siguiente</button></div>
                      </nav>}
                    </section>
                    <section>
                      <h3>Crear link de pago</h3>
                      {!paymentReady ? (
                        <p className="setup-note">
                          Falta conectar Recurrente. Revisa Configuración.
                        </p>
                      ) : (
                        <PaymentForm key={contact.id} contacts={contacts} contactId={contact.id} busy={busy} environment={environment} onSubmit={createPayment}/>
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
              {paymentFormOpen && <section className="crm-new-payment"><h2>Nuevo cobro</h2><PaymentForm contacts={contacts} busy={busy} environment={environment} onSubmit={createPayment}/></section>}
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
