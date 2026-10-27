"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "@/features/newsletter/newsletter.module.css";

type State = "ready" | "invalid" | "sending" | "cancelled" | "unavailable" | "error";

export function CancelNewsletter() {
  const [token, setToken] = useState("");
  const [state, setState] = useState<State>("ready");
  const captured = useRef<string | null>(null);

  useEffect(() => {
    if (captured.current !== null) return;
    const value = new URLSearchParams(window.location.hash.slice(1)).get("token") ?? "";
    captured.current = value;
    window.history.replaceState(null, "", window.location.pathname);
    queueMicrotask(() => { setToken(value); if (!value) setState("invalid"); });
  }, []);

  async function cancel() {
    if (!token || state === "sending") return;
    setState("sending");
    try {
      const response = await fetch("/api/newsletter/cancelar", {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token }), cache: "no-store", credentials: "same-origin",
      });
      if (response.ok) { setState("cancelled"); setToken(""); }
      else { setState(response.status === 503 ? "unavailable" : "invalid"); if (response.status !== 503) setToken(""); }
    } catch { setState("error"); }
  }

  const message = state === "cancelled" ? "Os próximos envios da newsletter foram cancelados. Isso não altera uma autorização separada para contato comercial ou relatórios."
    : state === "sending" ? "Cancelando os próximos envios…"
      : state === "invalid" ? "Este link não é mais válido. Responda ao e-mail da newsletter para pedir ajuda."
        : state === "unavailable" || state === "error" ? "Não foi possível cancelar agora. Tente novamente ou responda ao e-mail da newsletter."
          : "Cancele os próximos envios da newsletter. Relatórios e eventual autorização comercial são independentes.";

  return <main id="conteudo" className={styles.root}>
    <section className={`${styles.wrap} ${styles.hero}`} aria-labelledby="titulo">
      <div className={styles.inner}><div className={styles.requestCard}>
        <h1 id="titulo" className={styles.h1}>Cancelar newsletter</h1>
        <p role="status" aria-live="polite" className={styles.body}>{message}</p>
        {state === "ready" && token ? <button className="button" type="button" onClick={() => void cancel()}>Cancelar próximos envios</button> : null}
        {state === "error" || state === "unavailable" ? <button className="button" type="button" onClick={() => void cancel()} disabled={!token}>Tentar novamente</button> : null}
        <Link href="/newsletter" className={styles.back}>Voltar à newsletter</Link>
      </div></div>
    </section>
  </main>;
}
