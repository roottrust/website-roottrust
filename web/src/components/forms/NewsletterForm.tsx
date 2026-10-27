"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { validateEmail, type ContactFormConfig } from "@/lib/forms";
import { DemoControls, FormStatus } from "./FormStatus";
import { TurnstileWidget } from "./TurnstileWidget";
import { useLocalSubmission } from "./useLocalSubmission";
import styles from "./forms.module.css";

export function NewsletterForm({ config, editionSlug, variant, cta, support, help }: {
  config: ContactFormConfig; editionSlug?: string; variant?: "home" | "inline"; cta?: string; support?: string; help?: string;
}) {
  const { mode, siteKey } = config;
  const id = useId();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [token, setToken] = useState<string | null>(null);
  const [challengeRound, setChallengeRound] = useState(0);
  const [near, setNear] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const submission = useLocalSubmission(mode);
  const busy = submission.status === "submitting";
  const pilot = mode === "pilot" && Boolean(siteKey);
  const challengeStatusId = `${id}-challenge`;
  const label = cta ?? (editionSlug ? "Receber esta edição completa" : "Assinar");
  useEffect(() => {
    const form = formRef.current;
    if (!pilot || near || !form || typeof IntersectionObserver === "undefined") return;
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
    void submission.submit({ kind: "newsletter", email: email.trim(), editionSlug }, token ?? undefined);
    if (pilot) {
      setToken(null);
      setChallengeRound((round) => round + 1);
    }
  }
  return (
    <form ref={formRef} onFocusCapture={pilot ? () => setNear(true) : undefined} className={`${styles.form} ${variant === "home" ? styles.homeNewsletter : variant === "inline" ? styles.inlineNewsletter : ""}`} noValidate onSubmit={handleSubmit} aria-label="Assinar newsletter" aria-busy={busy}>
      <div className={styles.field}>
        <label htmlFor={`${id}-email`}>Seu e-mail</label>
        <input id={`${id}-email`} name="email" type="email" autoComplete="email" placeholder="Seu e-mail" required value={email} readOnly={busy}
          aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-email-error` : `${id}-help`}
          onChange={(event) => setEmail(event.target.value)} />
        {error ? <p className={styles.error} id={`${id}-email-error`}>{error}</p> : null}
      </div>
      <p className={styles.notice} id={`${id}-help`}>{support ?? "Conteúdo completo por e-mail após confirmação, com próximos envios em dias úteis."} {mode === "unavailable" ? "O envio ainda não está disponível nesta versão." : null}</p>
      {help ? <p className={styles.notice}>{help}</p> : null}
      {mode === "demo" ? <DemoControls id={id} outcome={submission.outcome} onChange={submission.setOutcome} disabled={busy} /> : null}
      {pilot && siteKey ? <TurnstileWidget siteKey={siteKey} action="newsletter-inscricao" active={near} statusId={challengeStatusId} resetKey={challengeRound} onToken={setToken} /> : null}
      <button className="button" type="submit" aria-describedby={pilot && !token ? challengeStatusId : undefined} aria-label={busy ? "Solicitando confirmação…" : label} disabled={!submission.ready || busy || (pilot && !token)}>{variant === "home" ? <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg> : busy ? "Solicitando confirmação…" : variant === "inline" ? <>{label}<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></> : label}</button>
      <FormStatus mode={mode} status={submission.status} kind="newsletter" />
    </form>
  );
}
