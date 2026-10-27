"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "@/features/newsletter/newsletter.module.css";

type State = "ready" | "invalid" | "sending" | "confirmed" | "unavailable" | "expired" | "used" | "error";

export function ConfirmNewsletter() {
  const [token, setToken] = useState("");
  const [state, setState] = useState<State>("ready");
  const [editionUnavailable, setEditionUnavailable] = useState(false);
  const captured = useRef<string | null>(null);

  useEffect(() => {
    if (captured.current !== null) return;
    const value = new URLSearchParams(window.location.hash.slice(1)).get("token") ?? "";
    captured.current = value;
    window.history.replaceState(null, "", window.location.pathname);
    queueMicrotask(() => { setToken(value); if (!value) setState("invalid"); });
  }, []);

  async function confirm() {
    if (!token || state === "sending") return;
    setState("sending");
    try {
      const response = await fetch("/api/newsletter/confirmar", {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token }), cache: "no-store", credentials: "same-origin",
      });
      if (response.ok) {
        const data: unknown = await response.json();
        setEditionUnavailable(typeof data === "object" && data !== null && (data as Record<string, unknown>).selectedEditionUnavailable === true);
        setState("confirmed");
        setToken("");
      } else {
        setState(response.status === 410 ? "expired" : response.status === 409 ? "used" : response.status === 503 ? "unavailable" : "invalid");
        if (response.status !== 503) setToken("");
      }
    } catch { setState("error"); }
  }

  const message = state === "confirmed"
    ? editionUnavailable ? "Endereço confirmado. A edição escolhida não está disponível para envio; você receberá as próximas edições." : "Endereço confirmado. Se houver uma edição disponível, o envio foi colocado na fila; a entrega ainda depende do provedor de e-mail."
    : state === "sending" ? "Confirmando seu endereço…"
      : state === "expired" ? "Este link expirou. Solicite um novo na página da newsletter."
        : state === "used" ? "Este link já foi usado ou substituído. Se necessário, solicite outro na página da newsletter."
          : state === "unavailable" || state === "error" ? "Não foi possível confirmar agora. Tente novamente mais tarde ou solicite outro link."
            : state === "invalid" ? "O link não contém um token válido. Solicite outro na página da newsletter."
              : "Confirme seu endereço para receber a edição completa e os próximos envios em dias úteis.";

  return <main id="conteudo" className={styles.root}>
    <section className={`${styles.wrap} ${styles.hero}`} aria-labelledby="titulo">
      <div className={styles.inner}><div className={styles.requestCard}>
        <h1 id="titulo" className={styles.h1}>Confirmar newsletter</h1>
        <p role="status" aria-live="polite" className={styles.body}>{message}</p>
        {state === "ready" && token ? <button className="button" type="button" onClick={() => void confirm()}>Confirmar endereço</button> : null}
        {state === "error" || state === "unavailable" ? <button className="button" type="button" onClick={() => void confirm()} disabled={!token}>Tentar novamente</button> : null}
        <Link href="/newsletter" className={styles.back}>Voltar à newsletter</Link>
      </div></div>
    </section>
  </main>;
}
