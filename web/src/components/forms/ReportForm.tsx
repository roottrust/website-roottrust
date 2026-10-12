"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { validateEmail, type ContactFormConfig } from "@/lib/forms";
import { DemoControls, FormStatus } from "./FormStatus";
import { TurnstileWidget } from "./TurnstileWidget";
import { useLocalSubmission } from "./useLocalSubmission";
import styles from "./forms.module.css";

/** Relatório padrão por tema: envia apenas e-mail e ID da ferramenta; independente da newsletter. */
export function ReportForm({ config, toolId, topic, variant }: { config: ContactFormConfig; toolId: string; topic: string; variant?: "inline" }) {
  const { mode, siteKey } = config;
  const id = useId();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const submission = useLocalSubmission(mode);
  const busy = submission.status === "submitting";
  const pilot = mode === "pilot" && Boolean(siteKey);
  const [commercial, setCommercial] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [challengeRound, setChallengeRound] = useState(0);
  const [near, setNear] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const challengeStatusId = `${id}-challenge`;

  useEffect(() => {
    const form = formRef.current;
    if (!pilot || near || !form) return;
    if (typeof IntersectionObserver === "undefined") return; // without it, focus (onFocusCapture) still activates the challenge
    const observer = new IntersectionObserver((entries) => { if (entries.some((entry) => entry.isIntersecting)) setNear(true); }, { rootMargin: "200px" });
    observer.observe(form);
    return () => observer.disconnect();
  }, [pilot, near]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextError = validateEmail(email);
    setError(nextError);
    if (nextError) { document.getElementById(`${id}-email`)?.focus(); return; }
    if (pilot && !token) return;
    void submission.submit({ kind: "report", email: email.trim(), toolId, ...(pilot ? { commercialConsent: commercial } : {}) }, token ?? undefined);
    if (pilot) {
      // Tokens are single-use: a fresh challenge is required after every attempt; field values stay untouched.
      setToken(null);
      setChallengeRound((round) => round + 1);
    }
  }
  return (
    <form ref={formRef} onFocusCapture={pilot ? () => setNear(true) : undefined} className={`${styles.form} ${variant === "inline" ? styles.inlineReport : ""}`} noValidate autoComplete="on" onSubmit={handleSubmit} aria-label={`Receber relatório de ${topic}`} aria-busy={busy}>
      <div className={styles.field}>
        <label htmlFor={`${id}-email`}>Seu e-mail</label>
        <input id={`${id}-email`} name="email" type="email" autoComplete="email" placeholder={variant === "inline" ? "Seu e-mail" : undefined} required value={email} readOnly={busy}
          aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-email-error` : `${id}-help`}
          onChange={(event) => setEmail(event.target.value)} />
        {error ? <p className={styles.error} id={`${id}-email-error`}>{error}</p> : null}
      </div>
      <p className={styles.notice} id={`${id}-help`}>Este pedido não inscreve você na newsletter. Suas respostas nunca são associadas ao e-mail.</p>
      {pilot ? (
        <label className={styles.consent}>
          <input type="checkbox" name="commercialConsent" checked={commercial} disabled={busy} onChange={(event) => setCommercial(event.target.checked)} />
          <span>Também quero receber comunicações comerciais da Root Trust neste e-mail (opcional; o relatório chega mesmo sem marcar).</span>
        </label>
      ) : null}
      {mode === "demo" ? <DemoControls id={id} outcome={submission.outcome} onChange={submission.setOutcome} disabled={busy} /> : null}
      {pilot && siteKey ? <TurnstileWidget siteKey={siteKey} action="relatorio" active={near} statusId={challengeStatusId} resetKey={challengeRound} onToken={setToken} /> : null}
      <button className="button" type="submit" aria-describedby={pilot && !token ? challengeStatusId : undefined} disabled={!submission.ready || busy || (pilot && !token)}>{busy ? "Solicitando…" : "Receber relatório"}</button>
      <FormStatus mode={mode} status={submission.status} kind="report" />
    </form>
  );
}
