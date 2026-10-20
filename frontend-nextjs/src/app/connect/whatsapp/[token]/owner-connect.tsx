"use client";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import {
  COEXISTENCE_EVENT,
  GRAPH_VERSION,
  parseEmbeddedSignupEvent,
} from "@/lib/crm/whatsapp-shared";
type SDK = {
  init(b: unknown): void;
  login(
    cb: (b: { authResponse?: { code?: string } }) => void,
    b: unknown,
  ): void;
};
const fb = () => (window as typeof window & { FB?: SDK }).FB;
export default function OwnerConnect({
  token,
  appId,
  configId,
}: {
  token: string;
  appId: string;
  configId: string;
}) {
  const [ready, setReady] = useState(false),
    [accepted, setAccepted] = useState(false),
    [stage, setStage] = useState("idle"),
    [error, setError] = useState("");
  const pending = useRef<{
      code?: string;
      wabaId?: string;
      saving?: boolean;
    } | null>(null),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const complete = useRef(() => {});
  async function post(b: unknown) {
    const r = await fetch("/api/whatsapp-client/connect/" + token, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(b),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "No se pudo conectar.");
    return data;
  }
  complete.current = () => {
    const p = pending.current;
    if (!p?.code || !p.wabaId || p.saving) return;
    p.saving = true;
    if (timer.current) clearTimeout(timer.current);
    setStage("saving");
    void post({
      code: p.code,
      wabaId: p.wabaId,
      event: COEXISTENCE_EVENT,
      consent: true,
    })
      .then(() => {
        pending.current = null;
        setStage("done");
      })
      .catch((e) => {
        pending.current = null;
        setError(e.message);
        setStage("idle");
      });
  };
  useEffect(() => {
    const listener = (e: MessageEvent) => {
      const r = parseEmbeddedSignupEvent(e.origin, e.data);
      if (!r || !pending.current || pending.current.saving) return;
      if (r.kind === "connected") {
        pending.current.wabaId = r.wabaId;
        complete.current();
      } else {
        pending.current = null;
        if (timer.current) clearTimeout(timer.current);
        setStage("idle");
        setError(
          "Meta no completó la conexión de WhatsApp Business. Revisa el aviso de su ventana y solicita ayuda a Oktae.",
        );
      }
    };
    window.addEventListener("message", listener);
    return () => {
      window.removeEventListener("message", listener);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  async function prepare() {
    setError("");
    setStage("preparing");
    try {
      await post({ action: "prepare" });
      pending.current = {};
      setStage("prepared");
    } catch (e) {
      setError((e as Error).message);
      setStage("idle");
    }
  }
  function launch() {
    const sdk = fb(),
      attempt = pending.current;
    if (!sdk || !attempt) return;
    setStage("meta");
    setError("");
    timer.current = setTimeout(
      () => {
        if (pending.current === attempt && !attempt.saving) {
          pending.current = null;
          setStage("idle");
          setError(
            "No recibimos confirmación. Permite ventanas emergentes y vuelve a preparar la conexión.",
          );
        }
      },
      8 * 60 * 1000,
    );
    try {
      sdk.login(
        (b) => {
          if (pending.current !== attempt) return;
          if (!b.authResponse?.code) {
            if (timer.current) clearTimeout(timer.current);
            pending.current = null;
            setStage("idle");
            setError(
              "Se cerró la autorización sin completar. Puedes reintentar.",
            );
            return;
          }
          attempt.code = b.authResponse.code;
          complete.current();
        },
        {
          config_id: configId,
          response_type: "code",
          override_default_response_type: true,
          extras: {
            setup: {},
            featureType: "whatsapp_business_app_onboarding",
            sessionInfoVersion: "3",
          },
        },
      );
    } catch {
      if (timer.current) clearTimeout(timer.current);
      pending.current = null;
      setStage("idle");
      setError(
        "No se pudo abrir Meta. Permite las ventanas emergentes de este sitio.",
      );
    }
  }
  const busy = ["preparing", "meta", "saving"].includes(stage);
  return (
    <>
      <Script
        src="https://connect.facebook.net/es_LA/sdk.js"
        strategy="afterInteractive"
        onReady={() => {
          fb()?.init({
            appId,
            version: GRAPH_VERSION,
            xfbml: false,
            cookie: false,
          });
          setReady(Boolean(fb()));
        }}
        onError={() =>
          setError(
            "No se pudo cargar Meta. Revisa el bloqueador del navegador y recarga.",
          )
        }
      />
      {stage === "done" ? (
        <p role="status">
          Número conectado. El equipo de Oktae revisará y probará el agente
          antes de activarlo. Puedes cerrar esta página.
        </p>
      ) : (
        <>
          <label className="wc-owner-consent">
            <input
              type="checkbox"
              checked={accepted}
              disabled={busy}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            <span>
              Soy responsable autorizado de este negocio y quiero conectar su
              WhatsApp Business con Oktae. Revisaré los permisos y cambios que
              indique Meta. El agente permanecerá pausado hasta que el equipo de
              Oktae lo pruebe y active.
            </span>
          </label>
          <button
            className="primary"
            disabled={!ready || !accepted || busy}
            onClick={stage === "prepared" ? launch : prepare}
          >
            {stage === "prepared"
              ? "Continuar con Meta"
              : stage === "preparing"
                ? "Preparando…"
                : stage === "meta"
                  ? "Completa los pasos en Meta…"
                  : stage === "saving"
                    ? "Verificando número…"
                    : "Preparar conexión"}
          </button>
          {stage === "meta" && (
            <p role="status">
              Completa los pasos en la ventana de Meta. No elimines tu cuenta de
              WhatsApp del teléfono.
            </p>
          )}
        </>
      )}
      {error && (
        <p className="crm-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
