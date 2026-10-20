"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import {
  ArrowLeft,
  Plus,
  Search,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  MessageCircle,
  Pause,
  Play,
} from "lucide-react";
import { clientStates, type ClientState } from "@/lib/crm/wa-client-protocol";
type Form = {
  name: string;
  contact_name: string;
  email: string;
  phone: string;
  responsible: string;
  plan: string;
  monthly_cents: number;
  monthly_limit: number;
  instructions: string;
  knowledge: string;
  hours: string;
  tone: string;
  timezone: string;
};
type Client = Form & {
  id: string;
  status: ClientState;
  config_version: number;
  tested_version: number | null;
  tested_at: string | null;
};
type Row = Pick<
  Client,
  "id" | "name" | "status" | "responsible" | "plan" | "monthly_limit"
> & { display_phone_number: string | null; sent: number };
type Conversation = {
  id: string;
  sender_id: string;
  profile_name: string;
  qualified: boolean;
  interest: string;
  summary: string;
  paused_until: string | null;
  last_customer_at: string;
  last_message: string;
};
type Detail = {
  client: Client;
  connection: null | {
    status: string;
    display_phone_number: string;
    token_expires_at: string;
  };
  conversations: Conversation[];
  usage: { sent: number; reserved: number; tests: number };
  review: number;
};
type Message = {
  direction: string;
  body: string;
  received_at: string;
  status: string;
};
const empty: Form = {
  name: "",
  contact_name: "",
  email: "",
  phone: "",
  responsible: "",
  plan: "",
  monthly_cents: 0,
  monthly_limit: 1000,
  instructions: "",
  knowledge: "",
  hours: "",
  tone: "Cercano y profesional",
  timezone: "America/Guatemala",
};
const tabs = ["Agente", "WhatsApp", "Conversaciones", "Consumo"] as const;
async function api(path = "", method = "GET", body?: unknown) {
  const r = await fetch("/api/admin/whatsapp-clients" + path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const b = await r.json();
  if (!r.ok) throw new Error(b.error || "No se pudo completar la operación.");
  return b;
}
const date = (s: string) =>
  new Intl.DateTimeFormat("es-GT", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Guatemala",
  }).format(new Date(s));
export default function Clients({ email }: { email: string }) {
  const [rows, setRows] = useState<Row[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  const [id, setId] = useState(""),
    [creating, setCreating] = useState(false),
    [detail, setDetail] = useState<Detail | null>(null),
    [form, setForm] = useState<Form>(empty),
    [tab, setTab] = useState<(typeof tabs)[number]>("Agente"),
    [query, setQuery] = useState("");
  const [invite, setInvite] = useState(""),
    [copied, setCopied] = useState(false),
    [testText, setTestText] = useState("Hola, ¿qué ofrecen?"),
    [reply, setReply] = useState(""),
    [conv, setConv] = useState<Conversation | null>(null),
    [messages, setMessages] = useState<Message[]>([]),
    [chatLoading, setChatLoading] = useState(false),
    [dirty, setDirty] = useState(false);
  const chatRequest = useRef(0);
  const [workingAction, setWorkingAction] = useState("");
  async function refresh() {
    setLoading(true);
    try {
      setRows(await api());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void refresh();
  }, []);
  useEffect(() => {
    const before = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", before);
    return () => window.removeEventListener("beforeunload", before);
  }, [dirty]);
  function mayLeave() {
    return (
      !dirty ||
      window.confirm("Hay cambios sin guardar. ¿Quieres descartarlos?")
    );
  }
  async function open(clientId: string) {
    if (!mayLeave()) return;
    chatRequest.current++;
    setBusy(true);
    setError("");
    try {
      const d: Detail = await api("/" + clientId);
      setDetail(d);
      setForm(d.client);
      setId(clientId);
      setCreating(false);
      setDirty(false);
      setTab("Agente");
      setReply("");
      setInvite("");
      setConv(null);
      setMessages([]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function reloadDetail() {
    if (id) setDetail(await api("/" + id));
  }
  async function action(name: string, extra: Record<string, unknown> = {}) {
    setWorkingAction(name);
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await api("/" + id, "POST", { action: name, ...extra });
      await reloadDetail();
      await refresh();
      return result;
    } catch (e) {
      setError((e as Error).message);
      return null;
    } finally {
      setBusy(false);
      setWorkingAction("");
    }
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const c: Client = await api(
        id ? "/" + id : "",
        id ? "PATCH" : "POST",
        form,
      );
      setId(c.id);
      setCreating(false);
      setForm(c);
      setDirty(false);
      setDetail(await api("/" + c.id));
      setNotice("Configuración guardada. Prueba el agente antes de activarlo.");
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function change(key: keyof Form, value: string | number) {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  }
  function field(
    label: string,
    key: keyof Form,
    options: { required?: boolean; type?: string; max?: number } = {},
  ) {
    return (
      <label>
        {label}
        <input
          value={form[key]}
          required={options.required}
          type={options.type || "text"}
          maxLength={options.max || 160}
          min={options.type === "number" ? 0 : undefined}
          onChange={(e) =>
            change(
              key,
              options.type === "number"
                ? Number(e.target.value)
                : e.target.value,
            )
          }
        />
      </label>
    );
  }
  async function viewConversation(c: Conversation) {
    const request = ++chatRequest.current;
    setConv(c);
    setMessages([]);
    setChatLoading(true);
    setError("");
    try {
      const m = await api("/" + id + "?conversation=" + c.id);
      if (request === chatRequest.current) setMessages(m);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      if (request === chatRequest.current) setChatLoading(false);
    }
  }
  const activationIssue =
    !detail?.connection || detail.connection.status !== "connected"
      ? "Conecta el número del cliente antes de activar."
      : detail.connection.display_phone_number.replace(/\D/g, "") !== detail.client.phone.replace(/\D/g, "")
        ? "Conecta el número que está registrado en esta ficha."
      : new Date(detail.connection.token_expires_at) <= new Date()
        ? "Renueva la autorización de Meta antes de activar."
        : detail.client.tested_version !== detail.client.config_version ||
            !detail.client.tested_at
          ? "Prueba la configuración actual antes de activar."
          : "";
  const selected = Boolean(id || creating),
    filtered = rows.filter((r) =>
      (r.name + " " + (r.display_phone_number || "") + " " + r.responsible)
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
  return (
    <main className="wc-page">
      <Link
        href="/admin"
        className="wc-back"
        onClick={(e) => {
          if (!mayLeave()) e.preventDefault();
        }}
      >
        <ArrowLeft size={17} /> Volver al CRM
      </Link>
      <header className="wc-header">
        <div>
          <h1>Clientes de WhatsApp IA</h1>
          <p>Altas, agentes y atención de los negocios que administra Oktae.</p>
        </div>
        <button
          className="primary"
          disabled={busy}
          onClick={() => {
            if (!mayLeave()) return;
            setCreating(true);
            setId("");
            setDetail(null);
            setForm({ ...empty, responsible: email });
            setDirty(false);
            setTab("Agente");
            setError("");
            setNotice("");
          }}
        >
          <Plus size={17} /> Dar de alta
        </button>
      </header>
      {error && (
        <p className="crm-error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="crm-notice" role="status">
          {notice}
        </p>
      )}
      {!selected ? (
        <section className="wc-directory" aria-label="Clientes administrados">
          <div className="wc-toolbar">
            <label className="wc-search">
              <Search size={17} />
              <input
                aria-label="Buscar cliente"
                placeholder="Buscar negocio, número o responsable"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <button
              disabled={loading}
              onClick={() => void refresh()}
              aria-label="Actualizar clientes"
            >
              <RefreshCw size={16} />
            </button>
          </div>
          {loading ? (
            <p className="wc-empty" role="status">
              Cargando clientes…
            </p>
          ) : filtered.length ? (
            <div className="wc-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Negocio</th>
                    <th>WhatsApp</th>
                    <th>Estado</th>
                    <th>Respuestas del mes</th>
                    <th>
                      <span className="sr-only">Abrir</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <strong>{r.name}</strong>
                        <span>
                          {r.responsible || "Sin responsable"}
                          {r.plan ? " · " + r.plan : ""}
                        </span>
                      </td>
                      <td>{r.display_phone_number || "Sin conectar"}</td>
                      <td>
                        <span className={"wc-state wc-" + r.status}>
                          {clientStates[r.status]}
                        </span>
                      </td>
                      <td>
                        {r.sent.toLocaleString("es-GT")} /{" "}
                        {r.monthly_limit.toLocaleString("es-GT")}
                      </td>
                      <td>
                        <button
                          disabled={busy}
                          onClick={() => void open(r.id)}
                          aria-label={"Abrir " + r.name}
                        >
                          <ArrowRight size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="wc-empty">
              <MessageCircle size={30} />
              <h2>
                {query
                  ? "No hay coincidencias"
                  : "Tu primer cliente comienza aquí"}
              </h2>
              <p>
                {query
                  ? "Prueba con otro nombre o número."
                  : "Registra el negocio, configura su agente y solicita la autorización de su WhatsApp."}
              </p>
              {!query && (
                <button
                  className="primary"
                  onClick={() => {
                    setCreating(true);
                    setForm({ ...empty, responsible: email });
                  }}
                >
                  Dar de alta un cliente
                </button>
              )}
            </div>
          )}
        </section>
      ) : (
        <>
          <button
            className="wc-list-back"
            disabled={busy}
            onClick={() => {
              if (!mayLeave()) return;
              setId("");
              setCreating(false);
              setDetail(null);
              setDirty(false);
              setError("");
              setNotice("");
            }}
          >
            <ArrowLeft size={15} /> Todos los clientes
          </button>
          <section className="wc-workspace">
            <header className="wc-client-header">
              <div>
                <h2>{creating ? "Nuevo cliente" : detail?.client.name}</h2>
                <p>
                  {creating
                    ? "Solo el equipo de Oktae tiene acceso a esta ficha."
                    : detail?.connection?.display_phone_number ||
                      "Número pendiente de conexión"}
                </p>
              </div>
              {detail && (
                <span className={"wc-state wc-" + detail.client.status}>
                  {clientStates[detail.client.status]}
                </span>
              )}
            </header>
            <nav className="wc-tabs" aria-label="Ficha del cliente">
              {tabs.map((t) => (
                <button
                  key={t}
                  aria-current={t === tab ? "page" : undefined}
                  disabled={creating && t !== "Agente"}
                  onClick={() => {
                    if (dirty && t !== "Agente") {
                      setError(
                        "Guarda los cambios del agente antes de cambiar de apartado.",
                      );
                      return;
                    }
                    setTab(t);
                  }}
                >
                  {t}
                </button>
              ))}
            </nav>
            {tab === "Agente" && (
              <form className="wc-form" onSubmit={save}>
                <div className="wc-form-section">
                  <div>
                    <h3>Negocio y servicio</h3>
                    <p>
                      Información para el equipo de Oktae. El precio es un
                      registro interno; no genera cobros.
                    </p>
                  </div>
                  <div className="wc-fields">
                    {field("Nombre del negocio", "name", { required: true })}
                    {field("Persona de contacto", "contact_name")}
                    {field("Correo de contacto", "email", {
                      type: "email",
                      max: 254,
                    })}
                    {field("WhatsApp del negocio con código de país", "phone", {
                      max: 30,
                    })}
                    {field("Responsable de Oktae", "responsible")}
                    {field("Plan contratado", "plan")}
                    <label>
                      Mensualidad USD
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.monthly_cents / 100}
                        onChange={(e) =>
                          change(
                            "monthly_cents",
                            Math.round(Number(e.target.value) * 100),
                          )
                        }
                      />
                    </label>
                    {field(
                      "Límite mensual de respuestas automáticas",
                      "monthly_limit",
                      { type: "number" },
                    )}
                  </div>
                </div>
                <div className="wc-form-section">
                  <div>
                    <h3>Configuración del agente</h3>
                    <p>
                      Solo utiliza la información de este negocio. Guardar
                      cambios pausa la atención hasta probar y activar de nuevo.
                    </p>
                  </div>
                  <div className="wc-fields">
                    <label className="wc-wide">
                      Objetivo e instrucciones
                      <textarea
                        rows={4}
                        maxLength={6000}
                        value={form.instructions}
                        placeholder="Qué debe resolver, qué datos necesita y cuándo debe pasar la conversación a una persona."
                        onChange={(e) => change("instructions", e.target.value)}
                      />
                    </label>
                    <label className="wc-wide">
                      Productos, precios y preguntas frecuentes
                      <textarea
                        rows={7}
                        maxLength={10000}
                        value={form.knowledge}
                        placeholder="Información aprobada por el negocio. Incluye condiciones y respuestas que sí puede comunicar."
                        onChange={(e) => change("knowledge", e.target.value)}
                      />
                    </label>
                    {field("Tono", "tone", { required: true })}
                    {field("Zona horaria", "timezone", {
                      required: true,
                      max: 80,
                    })}
                    <label className="wc-wide">
                      Horarios y reglas de atención
                      <textarea
                        rows={2}
                        maxLength={1000}
                        value={form.hours}
                        onChange={(e) => change("hours", e.target.value)}
                      />
                    </label>
                  </div>
                </div>
                <div className="wc-save">
                  <span>
                    {dirty
                      ? "Tienes cambios sin guardar."
                      : detail?.client.tested_version ===
                            detail?.client.config_version &&
                          detail?.client.tested_at
                        ? "Configuración probada."
                        : "La activación requiere una prueba."}
                  </span>
                  <button className="primary" disabled={busy}>
                    {busy && !workingAction
                      ? "Guardando…"
                      : creating
                        ? "Crear cliente"
                        : "Guardar configuración"}
                  </button>
                </div>
                {id && (
                  <section className="wc-test">
                    <h3>Probar antes de activar</h3>
                    <p>
                      Prueba interna con IA. No envía mensajes a WhatsApp ni
                      contacta al cliente.
                    </p>
                    <label>
                      Mensaje de prueba
                      <textarea
                        rows={2}
                        maxLength={2000}
                        value={testText}
                        onChange={(e) => setTestText(e.target.value)}
                      />
                    </label>
                    <button
                      type="button"
                      disabled={
                        busy ||
                        dirty ||
                        !testText.trim() ||
                        !form.instructions.trim() ||
                        !form.knowledge.trim()
                      }
                      onClick={async () => {
                        const r = await action("test", { message: testText });
                        if (r) setReply(r.reply);
                      }}
                    >
                      {workingAction === "test"
                        ? "Probando agente…"
                        : "Probar agente"}
                    </button>
                    {reply && (
                      <div className="wc-test-reply" role="status">
                        <strong>Respuesta de prueba</strong>
                        <p>{reply}</p>
                      </div>
                    )}
                  </section>
                )}
              </form>
            )}
            {tab === "WhatsApp" && detail && (
              <div className="wc-tab-content">
                <h3>Conexión autorizada por el cliente</h3>
                <p>
                  El dueño autoriza su número en Meta mediante un enlace
                  temporal. No necesita registrarse en Oktae. Este flujo
                  conserva WhatsApp Business en el teléfono cuando Meta permite
                  coexistencia.
                </p>
                <dl className="wc-facts">
                  <div>
                    <dt>Número registrado en la ficha</dt>
                    <dd>{detail.client.phone || "Falta completar"}</dd>
                  </div>
                  <div>
                    <dt>Conexión con Meta</dt>
                    <dd>
                      {detail.connection
                        ? new Date(detail.connection.token_expires_at) <=
                          new Date()
                          ? "Autorización vencida"
                          : detail.connection.status === "connected"
                            ? "Conectada"
                            : "Requiere revisión"
                        : "Pendiente"}
                    </dd>
                  </div>
                  {detail.connection && (
                    <div>
                      <dt>Vigencia de la autorización</dt>
                      <dd>{date(detail.connection.token_expires_at)}</dd>
                    </div>
                  )}
                  <div>
                    <dt>Prueba del agente</dt>
                    <dd>
                      {detail.client.tested_version ===
                        detail.client.config_version && detail.client.tested_at
                        ? "Configuración actual probada"
                        : "Pendiente"}
                    </dd>
                  </div>
                </dl>
                <button
                  disabled={busy}
                  onClick={async () => {
                    const r = await action("invite");
                    if (r) {
                      setInvite(r.url);
                      setCopied(false);
                    }
                  }}
                >
                  Generar enlace de conexión
                </button>
                <p className="wc-muted">
                  Vence en 30 minutos. Generar otro invalida el anterior.
                  Compártelo únicamente con el dueño del negocio.
                </p>
                {invite && (
                  <div className="wc-invite">
                    <label>
                      Enlace privado para el cliente
                      <input
                        value={invite}
                        readOnly
                        onFocus={(e) => e.target.select()}
                      />
                    </label>
                    <button
                      disabled={busy}
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(invite);
                          setCopied(true);
                        } catch {
                          setError(
                            "Selecciona el enlace y cópialo manualmente.",
                          );
                        }
                      }}
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}{" "}
                      {copied ? "Copiado" : "Copiar enlace"}
                    </button>
                  </div>
                )}
                <div className="wc-activation">
                  <h3>Respuestas automáticas</h3>
                  <p>
                    Activar requiere conexión vigente y prueba de la
                    configuración actual. Al pausar, se siguen registrando los
                    mensajes nuevos. Los mensajes omitidos no se reenvían al
                    reactivar.
                  </p>
                  <button
                    className={
                      detail.client.status === "active" ? "" : "primary"
                    }
                    disabled={
                      busy ||
                      (detail.client.status !== "active" &&
                        Boolean(activationIssue))
                    }
                    onClick={() =>
                      void action(
                        detail.client.status === "active"
                          ? "pause"
                          : "activate",
                      )
                    }
                  >
                    {detail.client.status === "active" ? (
                      <Pause size={16} />
                    ) : (
                      <Play size={16} />
                    )}{" "}
                    {detail.client.status === "active"
                      ? "Pausar agente"
                      : "Activar agente"}
                  </button>
                  {detail.client.status !== "active" && activationIssue && (
                    <p className="wc-muted">{activationIssue}</p>
                  )}
                </div>
              </div>
            )}
            {tab === "Conversaciones" && detail && (
              <div className="wc-tab-content">
                <div className="wc-conversation-heading">
                  <div>
                    <h3>Conversaciones y prospectos</h3>
                    <p>
                      Datos del cliente, separados del funnel comercial de
                      Oktae.
                    </p>
                  </div>
                  <button
                    disabled={busy}
                    onClick={() => void reloadDetail()}
                    aria-label="Actualizar conversaciones"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
                {!detail.conversations.length ? (
                  <p className="wc-empty">
                    Todavía no se han recibido conversaciones de este negocio.
                  </p>
                ) : (
                  <div className="wc-chat-grid">
                    <div className="wc-chat-list">
                      {detail.conversations.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => void viewConversation(c)}
                          aria-pressed={conv?.id === c.id}
                        >
                          <strong>{c.profile_name || c.sender_id}</strong>
                          <span>
                            {c.qualified ? "Oportunidad comercial" : "Consulta"}
                            {c.paused_until &&
                            new Date(c.paused_until) > new Date()
                              ? " · Atención humana"
                              : ""}
                          </span>
                          <span>{c.last_message}</span>
                        </button>
                      ))}
                    </div>
                    <div className="wc-chat-detail">
                      {!conv ? (
                        <p>Selecciona una conversación.</p>
                      ) : (
                        <>
                          <h3>{conv.profile_name || conv.sender_id}</h3>
                          <p>
                            {conv.summary || "Sin resumen comercial todavía."}
                          </p>
                          <button
                            disabled={busy}
                            onClick={async () => {
                              const paused =
                                conv.paused_until &&
                                new Date(conv.paused_until) > new Date();
                              const r = await action(
                                paused ? "resume" : "pause_conversation",
                                { conversation: conv.id },
                              );
                              if (r) {
                                const d: Detail = await api("/" + id);
                                setDetail(d);
                                setConv(
                                  d.conversations.find(
                                    (c) => c.id === conv.id,
                                  ) ?? null,
                                );
                              }
                            }}
                          >
                            {conv.paused_until &&
                            new Date(conv.paused_until) > new Date()
                              ? "Reactivar para mensajes nuevos"
                              : "Pausar 24 horas para atención humana"}
                          </button>
                          {chatLoading ? (
                            <p role="status">Cargando mensajes…</p>
                          ) : (
                            messages.map((m, i) => (
                              <article
                                className={
                                  "wc-message wc-message-" + m.direction
                                }
                                key={i}
                              >
                                <header>
                                  <strong>
                                    {m.direction === "customer"
                                      ? "Cliente"
                                      : m.direction === "human"
                                        ? "Equipo humano"
                                        : "Agente IA"}
                                  </strong>
                                  <time dateTime={m.received_at}>
                                    {date(m.received_at)}
                                  </time>
                                </header>
                                <p>{m.body}</p>
                                {[
                                  "skipped",
                                  "failed",
                                  "send_uncertain",
                                ].includes(m.status) && (
                                  <span>
                                    {m.status === "skipped"
                                      ? "Sin respuesta automática"
                                      : m.status === "send_uncertain"
                                        ? "Envío por revisar"
                                        : "Error de respuesta"}
                                  </span>
                                )}
                              </article>
                            ))
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            {tab === "Consumo" && detail && (
              <div className="wc-tab-content">
                <h3>Uso de este mes · UTC</h3>
                <p>
                  El límite cuenta respuestas automáticas enviadas. Las
                  consultas recibidas no se cobran aquí.
                </p>
                <dl className="wc-facts">
                  <div>
                    <dt>Respuestas enviadas</dt>
                    <dd>
                      {detail.usage.sent} / {detail.client.monthly_limit}
                    </dd>
                  </div>
                  <div>
                    <dt>Respuestas reservadas o en revisión</dt>
                    <dd>{detail.usage.reserved}</dd>
                  </div>
                  <div>
                    <dt>Pruebas internas</dt>
                    <dd>{detail.usage.tests} / 100</dd>
                  </div>
                  <div>
                    <dt>Mensajes que requieren revisión</dt>
                    <dd>{detail.review}</dd>
                  </div>
                  <div>
                    <dt>Mensualidad registrada</dt>
                    <dd>
                      {new Intl.NumberFormat("es-GT", {
                        style: "currency",
                        currency: "USD",
                      }).format(detail.client.monthly_cents / 100)}
                    </dd>
                  </div>
                </dl>
                <p>
                  Al llegar al límite, el agente omite nuevas respuestas. No se
                  generan cobros automáticos ni se aplican excedentes. Este
                  registro no calcula los cargos de Meta, Anthropic o
                  infraestructura.
                </p>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
